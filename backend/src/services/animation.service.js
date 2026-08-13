import { env } from '../config/env.js';
import { publishSocketEvent } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const PACES = {
  fast: { step: 120, hold: 60 },
  normal: { step: 260, hold: 130 },
  cinematic: { step: 540, hold: 260 },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function paceFor(component) {
  const complexity = (component.type?.length || 4) + JSON.stringify(component.props || {}).length;
  return complexity > 90 ? 1.4 : complexity > 30 ? 1.15 : 1;
}

export function componentPosition(component, sectionIndex, componentIndex) {
  const pos = component.position || {};
  if (Number.isFinite(pos.x_pct) && Number.isFinite(pos.y_pct)) {
    return { x_pct: pos.x_pct, y_pct: pos.y_pct };
  }
  return {
    x_pct: (componentIndex % 2) * 50 + 25,
    y_pct: Math.min(85, 12 + sectionIndex * 8 + componentIndex * 6),
  };
}

export async function streamDesignBuild(projectId, designJson, designVersionId) {
  const preset = PACES[env.buildPace] || PACES.normal;
  logger.info(`streaming design build for project ${projectId} (pace: ${env.buildPace})`);

  for (let s = 0; s < (designJson.sections || []).length; s += 1) {
    const section = designJson.sections[s];
    await publishSocketEvent(projectId, 'section_start', { section_id: section.id });
    await sleep(preset.hold);

    const components = section.components || [];
    const ordered = [...components].sort(
      (a, b) => (a.animation?.order ?? 0) - (b.animation?.order ?? 0)
    );
    for (let i = 0; i < ordered.length; i += 1) {
      const component = ordered[i];
      const position = componentPosition(component, s, i);
      await publishSocketEvent(projectId, 'cursor_move', {
        component_id: component.id,
        x_pct: position.x_pct,
        y_pct: position.y_pct,
      });
      await sleep(preset.step * 0.6);

      await publishSocketEvent(projectId, 'component_build_start', {
        component_id: component.id,
        type: component.type,
      });
      await sleep(Math.round(preset.step * paceFor(component)));

      await publishSocketEvent(projectId, 'component_build_done', {
        component_id: component.id,
        props: component.props || {},
        style: component.style || {},
      });
      await sleep(preset.hold);
    }

    await publishSocketEvent(projectId, 'section_done', { section_id: section.id });
    await sleep(preset.hold);
  }

  await publishSocketEvent(projectId, 'design_complete', { design_version_id: designVersionId });
  logger.info(`design build stream finished for project ${projectId}`);
}