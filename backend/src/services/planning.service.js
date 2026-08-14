import { Project } from '../models/Project.js';
import { chatText, extractJson, resolveModelOverride } from './modelRouter.service.js';
import { publishSocketEvent } from '../config/redis.js';
import { enqueue } from './queue.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const PLAN_SCHEMA = `{
  "app_type": string,
  "platform": "web" | "android" | "windows",
  "style_mood": string,
  "color_direction": string,
  "font_direction": string,
  "sections": [
    {
      "id": string,
      "name": string,
      "order": number,
      "layout_intent": string,
      "content": object,
      "components_in_frame": string[],
      "components": [
        {
          "type": string,
          "count": number,
          "notes": string
        }
      ],
      "animations": [
        {
          "trigger": "on_load" | "on_scroll" | "on_hover" | "cursor_build",
          "type": string,
          "target_component": string
        }
      ],
      "images_required": [
        {
          "id": string,
          "purpose": "full-section-mockup",
          "description": string,
          "aspect_ratio": "16:9" | "1:1" | "4:3"
        }
      ]
    }
  ]
}`;

const PLAN_SYSTEM_PROMPT = `You are MDesign's UX Planning Engine.
Given a user's app idea and target platform, output ONLY valid JSON matching this schema:

${PLAN_SCHEMA}

Rules:
- Do not include markdown, only raw JSON.
- Every section MUST specify at least the components it needs.
- layout_intent: describe the spatial arrangement of this section in ONE frame.
- content: concrete, on-brand copy values (headline, subtext, buttons, nav items, prices, steps, faq) — no placeholders.
- components_in_frame: every UI element that must be visible inside the section's mockup image.
- images_required: EXACTLY ONE "full-section-mockup" entry per section — the image is a complete realistic mockup screenshot of that whole section, not a small decorative illustration.
- animations must be realistic and implementable in a web/mobile UI (no impossible physics).
- ids must be unique (section ids like "sec_hero", image ids like "img_hero_1").`;

const PLATFORM_VOCABULARY = {
  android:
    'Use Material Design component vocabulary for android (TopAppBar, Card, FAB, BottomNavigation, Snackbar, NavigationRail).',
  windows:
    'Use Fluent/WinUI component vocabulary for windows (NavigationView, CommandBar, Cards, InfoBar, ContentDialog, TabView).',
  web: 'Use modern web component vocabulary (navbar, hero, cards, forms, grids, sticky headers, modals).',
};

export function validatePlan(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.sections)) {
    errors.push('sections array missing or invalid');
    return errors;
  }
  if (raw.sections.length === 0) errors.push('at least one section is required');
  if (raw.sections.length > env.planning.maxSections) {
    raw.sections = raw.sections.slice(0, env.planning.maxSections);
    logger.warn(`plan capped at ${env.planning.maxSections} sections`);
  }
  const seenSectionIds = new Set();
  const seenImageIds = new Set();
  for (const section of raw.sections) {
    if (!section.id || seenSectionIds.has(section.id)) {
      errors.push(`duplicate or missing section id "${section.id}"`);
    } else {
      seenSectionIds.add(section.id);
    }
    if (!section.name) errors.push(`section ${section.id}: name is required`);
    if (!Array.isArray(section.components) || section.components.length === 0) {
      errors.push(`section ${section.id}: components must be a non-empty array`);
    }
    for (const component of section.components || []) {
      if (!component.type) errors.push(`section ${section.id}: component missing "type"`);
    }
    if (!Array.isArray(section.images_required) || section.images_required.length === 0) {
      errors.push(`section ${section.id}: exactly one full-section-mockup image is required`);
    }
    for (const image of section.images_required || []) {
      if (image.id && seenImageIds.has(image.id)) errors.push(`duplicate image id "${image.id}"`);
      if (image.id) seenImageIds.add(image.id);
      if (!image.description) errors.push(`image ${section.id}: description is required`);
      if (!image.aspect_ratio) errors.push(`image ${section.id}: aspect_ratio is required`);
    }
  }
  return errors;
}

export function templatePlan(prompt, platform) {
  const mockup = (sectionId, description) => ({
    id: `img_${sectionId}`,
    purpose: 'full-section-mockup',
    description: description || `Complete high-fidelity UI mockup of this section for: ${prompt}`,
    aspect_ratio: '16:9',
  });
  const product = prompt.slice(0, 120);
  const sections = [
    {
      id: 'sec_hero',
      name: 'Hero',
      order: 1,
      layout_intent: 'sticky top navbar; left column with headline, subtext and two CTA buttons; right column with a product dashboard preview card',
      content: {
        headline: 'Work smarter, faster',
        subtext: 'Plan, collaborate, and get things done in one place.',
        cta_buttons: ['Get Started Free', 'Watch Demo'],
        nav_items: ['Product', 'Features', 'Pricing', 'About'],
      },
      components_in_frame: ['navbar', 'headline block', 'primary + secondary CTA buttons', 'dashboard preview card with stat tiles'],
      components: [
        { type: 'navbar', count: 1, notes: 'brand logo left, nav links center, CTA right' },
        { type: 'headline+subtext', count: 1, notes: 'big bold claim' },
        { type: 'cta-button-group', count: 2, notes: 'primary + secondary action' },
      ],
      animations: [
        { trigger: 'on_load', type: 'fade-up-stagger', target_component: 'headline+subtext' },
        { trigger: 'cursor_build', type: 'cursor-draw', target_component: 'navbar' },
      ],
      images_required: [mockup('sec_hero', `Hero section mockup for "${product}": navbar, bold headline, subtext, two CTAs, dashboard preview card, indigo/mint palette, 16:9`)],
    },
    {
      id: 'sec_features',
      name: 'Features',
      order: 2,
      layout_intent: 'section heading on top, 3-column grid of feature cards below',
      content: {
        heading: 'Everything you need to stay on track',
        features: [
          ['Smart Lists', 'Auto-organize tasks by priority and due date'],
          ['Team Boards', 'Shared kanban boards with live updates'],
          ['Deep Focus', 'Block distractions with focus-mode timers'],
          ['Insights', 'Weekly productivity reports'],
          ['Integrations', 'Slack, GitHub and 40+ apps'],
          ['Offline First', 'Works on any device, offline-ready'],
        ],
      },
      components_in_frame: ['section heading', '6 feature cards in a 3-column grid', 'icons inside cards'],
      components: [{ type: 'feature-card-grid', count: 6, notes: 'icon, title, short description each' }],
      animations: [{ trigger: 'on_scroll', type: 'stagger', target_component: 'feature-card-grid' }],
      images_required: [mockup('sec_features', `Features section mockup for "${product}": heading on top + 3x2 grid of icon feature cards, consistent cards and shadows`)],
    },
    {
      id: 'sec_howitworks',
      name: 'How It Works',
      order: 3,
      layout_intent: 'heading on top, horizontal 4-step card row with connector arrows',
      content: {
        heading: 'From prompt to perfect design in 4 simple steps',
        steps: ['Describe Your Idea', 'AI Generates', 'Customize & Refine', 'Export & Ship'],
      },
      components_in_frame: ['section heading', '4 step cards in a row', 'connector arrows between cards'],
      components: [{ type: 'step-card', count: 4, notes: 'numbered step + label' }],
      animations: [{ trigger: 'on_scroll', type: 'slide-in', target_component: 'step-card' }],
      images_required: [mockup('sec_howitworks', `How It Works section mockup: heading + 4 step cards connected by arrows, numbered 1-4`)],
    },
    {
      id: 'sec_testimonials',
      name: 'Testimonials',
      order: 4,
      layout_intent: 'heading centered, 3 testimonial cards in a row with avatars and 5-star ratings',
      content: {
        heading: 'Loved by thousands of teams',
        testimonials: [
          ['Priya Sharma', 'Product Lead', 'Cut our planning time by 70%.'],
          ['James Carter', 'Founder', 'The AI mockups feel like real designs.'],
          ['Ana Lopez', 'Designer', 'Export straight to Figma is magic.'],
        ],
      },
      components_in_frame: ['section heading', '3 testimonial cards', 'circular avatars', '5-star ratings'],
      components: [{ type: 'testimonial-card', count: 3, notes: 'quote + avatar + name + role' }],
      animations: [{ trigger: 'on_scroll', type: 'slide-in', target_component: 'testimonial-card' }],
      images_required: [mockup('sec_testimonials', `Testimonials section mockup: heading + 3 cards with avatar, quote, 5-star rating`)],
    },
    {
      id: 'sec_pricing',
      name: 'Pricing',
      order: 5,
      layout_intent: 'heading on top, 3 pricing cards in a row, middle card highlighted as most popular',
      content: {
        heading: 'Simple pricing that scales',
        plans: [
          ['Starter', '$0', ['1 project', '20 images', 'Community support']],
          ['Pro', '$19/mo', ['Unlimited projects', 'All export targets', 'Priority support'], 'Most popular'],
          ['Team', '$49/mo', ['Everything in Pro', 'SSO & roles', 'Dedicated manager']],
        ],
      },
      components_in_frame: ['section heading', '3 pricing cards', 'feature lists with checkmarks', 'CTA buttons', 'highlighted middle card'],
      components: [{ type: 'pricing-card', count: 3, notes: 'tier name, price, feature list, CTA' }],
      animations: [{ trigger: 'on_scroll', type: 'fade-up', target_component: 'pricing-card' }],
      images_required: [mockup('sec_pricing', `Pricing section mockup: 3 tier cards with prices and checkmark feature lists, middle card highlighted`)],
    },
    {
      id: 'sec_faq',
      name: 'FAQ',
      order: 6,
      layout_intent: 'heading centered, stacked accordion list below',
      content: {
        heading: 'Frequently asked questions',
        faqs: [
          ['How does AI design work?', 'Describe your idea and our pipeline plans, generates images, and builds the design.'],
          ['Can I edit the result?', 'Yes, every element is editable before export.'],
          ['Which platforms are supported?', 'Web, Android and Windows design systems.'],
        ],
      },
      components_in_frame: ['section heading', 'accordion items with expand icons'],
      components: [{ type: 'accordion', count: 6, notes: 'question / answer pairs' }],
      animations: [{ trigger: 'on_hover', type: 'expand', target_component: 'accordion' }],
      images_required: [mockup('sec_faq', `FAQ section mockup: centered heading + stacked accordion rows with chevron icons`)],
    },
    {
      id: 'sec_cta',
      name: 'Call to action',
      order: 7,
      layout_intent: 'full-width centered banner with headline, subtext and two buttons on a gradient background',
      content: {
        headline: 'Ready to design something amazing?',
        subtext: 'Join 12,000+ makers shipping faster with AI.',
        cta_buttons: ['Start Free', 'Book a Demo'],
      },
      components_in_frame: ['centered headline', 'subtext', 'two CTA buttons', 'gradient banner background'],
      components: [
        { type: 'headline+subtext', count: 1, notes: 'closing pitch' },
        { type: 'cta-button-group', count: 2, notes: 'start free trial' },
      ],
      animations: [{ trigger: 'on_scroll', type: 'fade-up', target_component: 'cta-button-group' }],
      images_required: [mockup('sec_cta', `CTA banner section mockup: centered headline, subtext and two buttons on an indigo-mint gradient`)],
    },
    {
      id: 'sec_footer',
      name: 'Footer',
      order: 8,
      layout_intent: '4-column link list row on top, copyright bar with social icons at the bottom',
      content: {
        columns: [['Product', 'Features', 'Pricing', 'Changelog'], ['Company', 'About', 'Careers', 'Press'], ['Resources', 'Docs', 'Blog', 'Support'], ['Legal', 'Privacy', 'Terms']],
        copyright: '© 2026 MDesign Inc.',
      },
      components_in_frame: ['footer columns with links', 'copyright bar', 'social media icons'],
      components: [
        { type: 'footer-columns', count: 4, notes: 'product, company, resources, legal' },
        { type: 'link', count: 1, notes: 'copyright + social icons' },
      ],
      animations: [],
      images_required: [mockup('sec_footer', `Footer section mockup: 4 columns of links, copyright bar and social icons`)],
    },
  ];
  return {
    app_type: prompt.slice(0, 80),
    platform,
    style_mood: 'modern minimal, professional',
    color_direction: 'indigo primary, mint accent, white background',
    font_direction: 'Inter, extrabold headings, medium body',
    sections,
  };
}

export async function processPlanJob({ projectId, instruction }) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  await Project.findByIdAndUpdate(projectId, { status: 'planning', planStatus: 'awaiting_approval' });
  await publishSocketEvent(projectId, 'pipeline_status', { status: 'planning' });

  const modelOverride = await resolveModelOverride(project.user, 'text', project._id);
  const vocabulary = PLATFORM_VOCABULARY[project.platform] || PLATFORM_VOCABULARY.web;
  const userPrompt = `Platform: ${project.platform}\n${vocabulary}\nProduct description:\n${project.prompt}\n\nProduce the structured plan JSON.${
    instruction ? `\n\nThe user reviewed a previous plan and requested these changes — incorporate ALL of them:\n${instruction}` : ''
  }`;

  let plan = null;
  let errors = [];
  let apiError = null;
  for (let attempt = 0; attempt <= env.planning.repairRetries; attempt += 1) {
    const system =
      attempt === 0
        ? PLAN_SYSTEM_PROMPT
        : `${PLAN_SYSTEM_PROMPT}\n\nYour previous response was invalid. Fix ALL of these errors and reply with valid JSON only:
${errors.join('\n')}`;
    try {
      const { content } = await chatText({
        kind: 'text',
        modelOverride,
        system,
        user: userPrompt,
        projectId,
      });
      plan = extractJson(content);
      errors = validatePlan(plan);
      if (errors.length === 0) break;
      logger.warn(`plan validation failed (attempt ${attempt + 1}): ${errors.join('; ')}`);
    } catch (err) {
      apiError = err;
      logger.warn(`planning LLM call failed (attempt ${attempt + 1}): ${err.message}`);
    }
  }

  if (errors.length > 0 || !plan) {
    if (apiError) {
      logger.warn(`planning LLM API failed — falling back to template plan. Error: ${apiError.message}`);
    } else {
      logger.warn('planning LLM exhausted retries (validation) — falling back to template plan');
    }
    plan = templatePlan(project.prompt, project.platform);
  }

  await Project.findByIdAndUpdate(projectId, { plan });
  await publishSocketEvent(projectId, 'plan_ready', { plan });
  logger.info(`plan ready for project ${projectId} — awaiting user approval`);
}

export function extractImageRequirements(plan) {
  const requirements = [];
  for (const section of plan?.sections || []) {
    for (const req of section.images_required || []) {
      requirements.push({
        id: req.id,
        section_id: section.id,
        section_name: section.name,
        purpose: req.purpose,
        prompt: req.description,
        aspect_ratio: req.aspect_ratio,
      });
    }
  }
  return requirements;
}

export function createPlanFromAnalysis(analysis, { platform = 'web', prompt = 'Uploaded template' } = {}) {
  const used = new Set();
  const sections = (analysis?.detectedSections || []).map((s, i) => {
    const base = `sec_${String(s?.name || `section_${i + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')}`.slice(0, 40);
    const uniqueBase = base === 'sec_' ? `sec_section_${i + 1}` : base;
    let id = uniqueBase;
    let n = 2;
    while (used.has(id)) id = `${uniqueBase}_${n += 1}`;
    used.add(id);
    const components = Array.isArray(s?.components) ? s.components.slice(0, 10).map(String) : [];
    return {
      id,
      name: s?.name || `Section ${i + 1}`,
      order: Number.isFinite(s?.order) ? s.order : i + 1,
      layout_intent: s?.layoutIntent || '',
      content: {},
      components_in_frame: components,
      components: components.map((type) => ({ type, count: 1, notes: '' })),
      animations: components[0]
        ? [{ trigger: 'cursor_build', type: 'cursor-draw', target_component: components[0] }]
        : [],
      images_required: [
        {
          id: `img_${id}`,
          purpose: 'full-section-mockup',
          description: `Recreate a high-fidelity UI mockup for the "${s?.name || id}" section, inspired by the uploaded reference design${
            s?.colorsUsed?.length ? `, using these colors: ${s.colorsUsed.join(', ')}` : ''
          }`,
          aspect_ratio: '16:9',
        },
      ],
    };
  });
  return {
    app_type: prompt.slice(0, 80),
    platform,
    style_mood: analysis?.styleMood || 'modern',
    color_direction: (analysis?.colorPalette || []).join(', '),
    font_direction: analysis?.fontGuess || 'Inter',
    sections,
  };
}

export async function startImagePhase(projectId, plan) {
  const requirements = extractImageRequirements(plan);
  await Project.findByIdAndUpdate(projectId, {
    status: 'images_generating',
    progress: { totalImages: requirements.length, doneImages: 0, failedImages: 0 },
  });
  await publishSocketEvent(projectId, 'pipeline_status', {
    status: 'images_generating',
    totalImages: requirements.length,
  });

  const enqueueAll = env.imageGenMode === 'parallel';
  for (let i = 0; i < requirements.length; i += 1) {
    if (!enqueueAll && i > 0) break;
    await enqueue('image-gen', {
      projectId,
      requirement: requirements[i],
      index: i,
      total: requirements.length,
      modelOverride: null,
    });
  }

  if (requirements.length === 0) {
    logger.info(`no images required for project ${projectId} — straight to design-gen`);
    await enqueue('design-gen', { projectId });
  }
  logger.info(
    `image phase started for project ${projectId} (${requirements.length} mockups, mode: ${env.imageGenMode})`
  );
}