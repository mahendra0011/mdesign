export function buildStyleDna(plan) {
  return [
    `Style mood: ${plan.style_mood || 'modern minimal, professional'}`,
    `Color direction: ${plan.color_direction || 'indigo primary, mint accent, white background'}`,
    `Font direction: ${plan.font_direction || 'Inter, extrabold headings, medium body'}`,
  ].join(' | ');
}

const NEGATIVE = [
  'blurry or garbled text',
  'misspelled words',
  'distorted UI elements',
  'watermark',
  'logo',
  'random icons outside the described layout',
  'cropped content',
  'low fidelity',
  'extra elements not listed',
  'photos of people as decorative stock',
].join(', ');

export function buildSectionMockupPrompt({ plan, section, requirement }) {
  const dna = buildStyleDna(plan);
  const content = JSON.stringify(section.content || {}, null, 2);
  const components = Array.isArray(section.components_in_frame)
    ? section.components_in_frame.join(', ')
    : (section.components || []).map((c) => `${c.type}${c.count > 1 ? ` x${c.count}` : ''}`).join(', ');
  const layout = section.layout_intent || `standard ${section.name} section layout`;
  const extra = requirement.prompt || requirement.description || requirement.purpose || '';
  const ratio = requirement.aspect_ratio || '16:9';

  return [
    `You are generating a FULL-SECTION UI MOCKUP — one complete, self-contained, realistic, high-fidelity screenshot of a single website section. Everything must appear inside ONE frame exactly as a designer would mock it up in Figma:`,
    '',
    `Section: ${section.name || section.id}`,
    `Layout intention: ${layout}`,
    `Components visible in this frame: ${components}.`,
    '',
    'Exact content to render (use this copy verbatim, no paraphrasing):',
    content,
    '',
    'Design system to follow consistently:',
    dna,
    '',
    extra ? `Additional guidance: ${extra}` : '',
    '',
    `Requirements: crisp readable UI text, correct typography hierarchy, realistic buttons/cards/navbar spacing, cohesive color usage, professional visual design. Aspect ratio ${ratio}. No external apps or multiple preview phones unless the layout calls for it.`,
  ]
    .filter(Boolean)
    .join('\n');
}

const SANITIZER_SYSTEM = `You are a UI-mockup prompt sanitizer. Rewrite the given image prompt so it complies with
content safety policies while keeping the same section, layout, copy and design intent.
Remove anything that could be flagged (explicit, violent, copyrighted, personal-data content).
Replace unsafe subject matter with safe equivalents. Return ONLY a JSON object: {"prompt":"<rewritten prompt>"}`;

export async function sanitizeMockupPrompt(prompt) {
  const { chatText, extractJson } = await import('./modelRouter.service.js');
  const { content } = await chatText({
    kind: 'text',
    system: SANITIZER_SYSTEM,
    user: prompt,
  });
  try {
    const parsed = extractJson(content);
    return typeof parsed.prompt === 'string' && parsed.prompt.trim() ? parsed.prompt : null;
  } catch {
    return null;
  }
}

export function buildNegativePrompt() {
  return NEGATIVE;
}