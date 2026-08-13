import { Project } from '../models/Project.js';
import { GeneratedImage } from '../models/GeneratedImage.js';
import { DesignVersion } from '../models/DesignVersion.js';
import { User } from '../models/User.js';
import { chatText, extractJson, resolveModelOverride } from './modelRouter.service.js';
import { reconstructSection } from './reconstruction.service.js';
import { streamDesignBuild } from './animation.service.js';
import { publishSocketEvent } from '../config/redis.js';
import { sendDesignReadyEmail } from './email.service.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

const PLATFORM_CONSTRAINTS = {
  android: 'Material Design 3: touch targets >= 48dp, density-independent pixel values, navigation handled by TopAppBar and BottomNavigation.',
  windows: 'Fluent/WinUI: Acrylic/Mica surfaces, window-size classes, CommandBar toolbars.',
  web: 'Responsive breakpoints (mobile/tablet/desktop), 12-column grid, Figma-style auto layout.',
};

const ASSEMBLY_PROMPT = `You are MDesign's design assembly engine. Merge the given per-section reconstructed
component trees (LAYER 1) into ONE final design_json. Return ONLY JSON matching this shape:
{"tokens":{"colors":{"primary":"#hex","secondary":"#hex","bg":"#hex","text":"#hex","accent":"#hex"},
"fonts":{"heading":"<font>","body":"<font>"},"radius":{"sm":<px>,"md":<px>,"lg":<px>},"spacing":{"base":<px>,"section":<px>}},
"sections":[{"id":"<section id>","layout":{"type":"grid-2col|flex-col|flex-row|stack","align":"<...>","ratio":"<...>"},
"components":[{"id":"<unique>","type":"<type>","props":{},"style":{},"animation":{"trigger":"on_load|on_scroll|on_hover|cursor_build","order":<0-based order>}}]}]}
Rules:
- sections appear in plan order; reuse types/props/positions from reconstructed trees
- STYLE UNIFICATION: snap every color to tokens via var(--m-primary|secondary|bg|text|accent) and fonts/radius/spacing to tokens
- animation.order sequential 0..n per section; animation.trigger taken from the plan spec where available
- one image component per section mockup reference (props.src given)
- consistent spacing scale, no overlapping layouts
- platform constraints: {platform_constraints}`;

function tokensFromPlan() {
  return {
    colors: {
      primary: '#4338ca',
      secondary: '#14b8a6',
      bg: '#ffffff',
      text: '#0f172a',
      accent: '#f59e0b',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    radius: { sm: 6, md: 12, lg: 20 },
    spacing: { base: 8, section: 64 },
  };
}

function planTriggerFor(sectionId, plan) {
  const section = plan?.sections?.find((s) => s.id === sectionId);
  return section?.animations?.[0]?.trigger || 'cursor_build';
}

const COLOR_KEYS = ['background', 'color', 'border-color', 'background-color', 'fill'];

function normalizeDesignJson(tree, plan) {
  if (!tree || typeof tree !== 'object') throw new Error('design assembly returned no object');
  tree.tokens = tree.tokens || tokensFromPlan();
  if (!Array.isArray(tree.sections) || tree.sections.length === 0) throw new Error('design assembly returned no sections');

  const tokenColors = Object.values(tree.tokens.colors || {});
  let counter = 0;
  for (const section of tree.sections) {
    section.layout = section.layout || { type: 'flex-col', align: 'center' };
    if (!Array.isArray(section.components)) section.components = [];
    const trigger = planTriggerFor(section.id, plan);
    section.components.forEach((component, index) => {
      component.id = component.id || `comp_${section.id}_${counter}`;
      component.animation = {
        trigger: component.animation?.trigger || trigger,
        order: index,
      };
      component.style = component.style || {};
      for (const key of COLOR_KEYS) {
        const value = component.style[key];
        if (typeof value === 'string' && value.startsWith('var(')) continue;
        if (typeof value === 'string' && value.startsWith('#')) {
          if (!tokenColors.includes(value.toLowerCase())) {
            component.style[key] = key === 'color' || key === 'fill' ? 'var(--m-text)' : 'var(--m-primary)';
          } else {
            const tokenName = Object.keys(tree.tokens.colors).find((k) => tree.tokens.colors[k].toLowerCase() === value.toLowerCase());
            component.style[key] = `var(--m-${tokenName})`;
          }
        }
      }
      counter += 1;
    });
  }
  tree.sections.forEach((s) => {
    s.components.sort((a, b) => a.animation.order - b.animation.order);
  });
  return tree;
}

function assembleFallback(plan, trees) {
  return normalizeDesignJson(
    {
      tokens: tokensFromPlan(),
      sections: trees.map((t) => ({
        id: t.section_id,
        layout: t.layout || { type: 'flex-col', align: 'center' },
        components: t.components.map((c) => ({ ...c, animation: { trigger: 'cursor_build', order: 0 } })),
      })),
    },
    plan
  );
}

export async function processDesignJob({ projectId }) {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  if (!project.plan) throw new ApiError(400, 'Project has no plan');

  await Project.findByIdAndUpdate(projectId, { status: 'designing' });
  await publishSocketEvent(projectId, 'pipeline_status', { status: 'designing' });
  logger.info(`design phase started for project ${projectId}`);

  const images = await GeneratedImage.find({ project: projectId });
  const imageBySection = {};
  const doneImages = [];
  const failedImages = [];
  for (const img of images) {
    if (img.status === 'done') {
      imageBySection[img.sectionId] = img;
      doneImages.push(img);
    } else if (img.status === 'failed') {
      failedImages.push(img);
    }
  }

  const trees = [];
  for (const section of project.plan.sections || []) {
    const image = imageBySection[section.id];
    let tree = null;
    try {
      const result = await reconstructSection({
        imageUrl: image?.url || null,
        section,
        plan: project.plan,
      });
      tree = result.tree;
    } catch (err) {
      logger.warn(`reconstruction failed for ${section.id}: ${err.message}`);
      tree = {
        section_id: section.id,
        layout: { type: 'flex-col', align: 'center' },
        components: (section.components || []).map((c, i) => ({
          id: `comp_${section.id}_${i}`,
          type: c.type,
          position: { x_pct: 0, y_pct: i * 12, w_pct: 100, h_pct: 10 },
          props: {},
          style: {},
        })),
      };
    }
    trees.push(tree);
  }

  let designJson;
  try {
    const { content } = await chatText({
      kind: 'design',
      modelOverride: await resolveModelOverride(project.user, 'design', project._id),
      system: ASSEMBLY_PROMPT.replace('{platform_constraints}', PLATFORM_CONSTRAINTS[project.platform] || PLATFORM_CONSTRAINTS.web),
      user: JSON.stringify({
        platform: project.platform,
        plan: project.plan,
        sectionTrees: trees,
        images: doneImages.map((img) => ({ section_id: img.sectionId, url: img.url })),
      }),
    });
    designJson = normalizeDesignJson(extractJson(content), project.plan);
  } catch (err) {
    logger.warn(`design assembly LLM failed (${err.message}) — using deterministic assembly`);
    designJson = assembleFallback(project.plan, trees);
  }

  const nextNo = (project.latestVersionNo || 0) + 1;
  await DesignVersion.create({
    project: projectId,
    versionNo: nextNo,
    createdBy: 'ai',
    designJson,
  });
  await Project.findByIdAndUpdate(projectId, { status: 'ready', latestVersionNo: nextNo });

  await streamDesignBuild(projectId, designJson, nextNo);

  await publishSocketEvent(projectId, 'design_ready', {
    versionNo: nextNo,
    designJson,
    images: doneImages.map((img) => ({ sectionId: img.sectionId, url: img.url })),
    failedSections: failedImages.map((img) => img.sectionId),
  });
  await publishSocketEvent(projectId, 'pipeline_status', { status: 'ready' });

  const user = await User.findById(project.user).select('-password');
  if (user) sendDesignReadyEmail(user, project).catch(() => {});
}