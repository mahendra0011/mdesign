import { analyzeImage, chatText, extractJson } from './modelRouter.service.js';
import { logger } from '../utils/logger.js';

const REGISTRY = [
  'navbar',
  'headline',
  'subheadline',
  'paragraph',
  'button',
  'image',
  'card',
  'input',
  'list',
  'icon_grid',
  'divider',
  'spacer',
  'link',
  'badge',
  'chart',
  'stats_tile',
  'step_card',
  'accordion',
  'pricing_card',
  'testimonial_card',
  'avatar_row',
  'footer_columns',
].join(', ');

const RECON_OUTPUT_SHAPE = `{"section_id":"<id>","layout":{"type":"grid-2col|flex-col|flex-row|stack","align":"<...>","ratio":"<...>"},
"components":[{"id":"<unique>","type":"<from registry>","position":{"x_pct":0-100,"y_pct":0-100,"w_pct":0-100,"h_pct":0-100},
"props":{"text":"<visible copy>","src":null,"items":[],"placeholder":""},"style":{"<css property>":"<value>"}}]}`;

function imagePrompt() {
  return `You are a UI reconstruction engine. Look at this FULL-SECTION UI mockup image and its spec, then produce a structured component sub-tree.
Return ONLY JSON matching this shape:
${RECON_OUTPUT_SHAPE}

Component registry: ${REGISTRY}.

Rules:
- positions are percentages of the section frame (x_pct/y_pct = top-left of the element, w_pct/h_pct = size)
- use ONLY the verbatim copy given in the spec's content where the same text is visible in the image
- extract approximate colors/spacing as style values
- skip decorative noise, max 14 components, every component gets a unique id.`;
}

function specPrompt() {
  return `You are a UI reconstruction engine working WITHOUT an image. From this section spec alone, build a reasonable component sub-tree.
Return ONLY JSON matching this shape:
${RECON_OUTPUT_SHAPE}

Component registry: ${REGISTRY}.

Rules:
- positions are percentages of the section frame, following layout_intent
- use ONLY verbatim copy from the spec content
- map plan components to registry types, max 12 components, unique ids.`;
}

function applyContentCopy(section, components) {
  const c = section.content || {};
  for (let i = 0; i < components.length; i += 1) {
    const comp = components[i];
    comp.props = comp.props || {};
    switch (comp.type) {
      case 'headline':
        if (c.headline) comp.props.text = c.headline;
        break;
      case 'subheadline':
      case 'paragraph':
        if (c.subtext) comp.props.text = c.subtext;
        break;
      case 'button':
        if (Array.isArray(c.cta_buttons) && c.cta_buttons.length) {
          const used = components.slice(0, i).filter((x) => x.type === 'button').length;
          comp.props.text = c.cta_buttons[used % c.cta_buttons.length];
        }
        break;
      case 'step_card':
        if (Array.isArray(c.steps) && c.steps.length) comp.props.text = c.steps[i % c.steps.length];
        break;
      case 'testimonial_card':
        if (Array.isArray(c.testimonials) && c.testimonials.length) comp.props.text = c.testimonials[i % c.testimonials.length];
        break;
      case 'pricing_card':
        if (Array.isArray(c.plans) && c.plans.length) comp.props.text = c.plans[i % c.plans.length];
        break;
      case 'accordion':
        if (Array.isArray(c.faqs) && c.faqs.length) comp.props.text = c.faqs[i % c.faqs.length];
        break;
      case 'card':
      case 'feature-card':
        if (Array.isArray(c.features) && c.features.length) comp.props.text = c.features[i % c.features.length];
        break;
      default:
        break;
    }
  }
}

function buildTree(parsed, sectionId) {
  if (!parsed || !Array.isArray(parsed.components)) return null;
  return {
    section_id: sectionId,
    layout: parsed.layout || { type: 'flex-col', align: 'center' },
    components: parsed.components.slice(0, 14).map((comp) => ({
      id: comp.id || `comp_${sectionId}_${comp.type}_${Math.floor(Math.random() * 100000)}`,
      type: comp.type,
      position: comp.position || { x_pct: 0, y_pct: 0, w_pct: 100, h_pct: 100 },
      props: comp.props || {},
      style: comp.style || {},
    })),
  };
}

export async function reconstructSection({ imageUrl, section, plan, projectId }) {
  const spec = JSON.stringify({
    section_id: section.id,
    section_name: section.name,
    layout_intent: section.layout_intent,
    content: section.content,
    components_in_frame: section.components_in_frame,
    style_mood: plan.style_mood,
    color_direction: plan.color_direction,
    font_direction: plan.font_direction,
  });

  let tree = null;
  let source = 'none';

  if (imageUrl) {
    try {
      const { content } = await analyzeImage({
        imageUrl,
        prompt: `${imagePrompt()}\n\nSection spec:\n${spec}`,
        projectId,
      });
      const parsed = extractJson(content);
      tree = buildTree(parsed, section.id);
      source = 'vision';
    } catch (err) {
      logger.warn(`vision reconstruction failed for ${section.id}: ${err.message} — falling back to spec`);
    }
  }

  if (!tree) {
    const { content } = await chatText({
      kind: 'design',
      system: specPrompt(),
      user: `Plan context:\n${JSON.stringify({
        style_mood: plan.style_mood,
        color_direction: plan.color_direction,
        font_direction: plan.font_direction,
        platform: plan.platform,
      })}\n\nSection spec:\n${spec}`,
      projectId,
    });
    const parsed = extractJson(content);
    tree = buildTree(parsed, section.id);
    source = 'spec';
    if (!tree) throw new Error(`reconstruction produced no tree for ${section.id}`);
  }

  if (tree.components.length) applyContentCopy(section, tree.components);

  logger.info(`reconstructed section ${section.id} via ${source} (${tree.components.length} components)`);
  return { tree, source };
}