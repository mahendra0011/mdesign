import { Project } from '../models/Project.js';
import { DesignVersion } from '../models/DesignVersion.js';
import { ExportJob } from '../models/ExportJob.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError, badRequest } from '../utils/apiError.js';
import { componentPosition } from './animation.service.js';
import sharp from 'sharp';

const TAG_MAP = {
  heading: 'h2',
  subheading: 'h3',
  paragraph: 'p',
  button: 'button',
  image: 'img',
  card: 'div',
  input: 'input',
  list: 'ul',
  link: 'a',
  badge: 'span',
  divider: 'hr',
  spacer: 'div',
  icon_grid: 'div',
};

function toCssRules(style = {}) {
  return Object.entries(style)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

function buildHtmlBody(tree) {
  const parts = [];
  for (const section of tree.sections || []) {
    parts.push(`<section id="${section.id}" class="md-section" style="padding:${tree.spacing?.section || 64}px 0;">`);
    for (const component of section.components || []) {
      const tag = TAG_MAP[component.type] || 'div';
      const css = [`padding: ${tree.spacing?.base || 8}px`, `font-family: ${tree.fonts?.body || 'sans-serif'}`]
        .concat(toCssRules(component.style))
        .join('; ');
      let inner = escapeHtml(component.props?.text || '');
      if (component.type === 'image') inner = `<img src="${escapeHtml(component.props?.src || '')}" alt="${escapeHtml(component.props?.alt || '')}" style="max-width:100%;">`;
      if (component.type === 'button') inner = `<span style="padding:10px 20px;background:${tree.colors?.primary || '#333'};color:#fff;border-radius:8px;display:inline-block;">${inner}</span>`;
      if (component.type === 'list') {
        inner = (component.props?.items || [])
          .map((item) => `<li>${escapeHtml(String(item))}</li>`)
          .join('');
      }
      parts.push(`<${tag} style="${css}" ${component.type === 'input' ? `placeholder="${escapeHtml(component.props?.placeholder || '')}"` : ''}>${inner}</${tag}>`);
    }
    parts.push('</section>');
  }
  return parts.join('\n');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportToHtml(tree) {
  const colors = tree.colors || {};
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(tree.name || 'MDesign')}</title>
<style>
:root { --m-primary: ${colors.primary || '#333'}; --m-secondary: ${colors.secondary || '#666'}; --m-bg: ${colors.bg || '#fff'}; --m-text: ${colors.text || '#111'}; }
body { margin: 0; background: var(--m-bg); color: var(--m-text); font-family: ${tree.fonts?.body || 'sans-serif'}; }
h2, h3 { font-family: ${tree.fonts?.heading || 'sans-serif'}; }
.md-section { max-width: 1080px; margin: 0 auto; box-sizing: border-box; }
img { display: block; }
</style>
</head>
<body>
${buildHtmlBody(tree)}
</body>
</html>`;
}

const REACT_TAG_MAP = {
  heading: 'h2',
  subheading: 'h3',
  paragraph: 'p',
  button: 'button',
  image: 'img',
  card: 'div',
  input: 'input',
  list: 'ul',
  link: 'a',
  badge: 'span',
  divider: 'hr',
  spacer: 'div',
  icon_grid: 'div',
};

function toJsxStyle(style = {}) {
  const entries = Object.entries(style).map(([k, v]) => {
    let key = k;
    if (k.includes('-')) key = k.replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
    const value = v.startsWith('var(') ? `var(${v.slice(4, -1)})` : v;
    return `${key}: "${value}"`;
  });
  return `{ ${entries.join(', ')} }`;
}

export function exportToReact(tree) {
  const rows = [];
  for (const section of tree.sections || []) {
    rows.push(`    <section id="${section.id}" style={{ padding: '${tree.spacing?.section || 64}px 0' }}>`);
    for (const component of section.components || []) {
      const tag = REACT_TAG_MAP[component.type] || 'div';
      const style = toJsxStyle(component.style);
      let inner;
      if (component.type === 'image') {
        inner = `<img src="${escapeHtml(component.props?.src || '')}" alt="${escapeHtml(component.props?.alt || '')}" style={{ maxWidth: '100%' }} />`;
      } else if (component.type === 'list') {
        inner = `{(props.items || []).map((item, i) => (<li key={i}>{item}</li>))}`;
      } else if (component.type === 'input') {
        inner = component.props?.placeholder ? `placeholder="${escapeHtml(component.props.placeholder)}"` : '';
        rows.push(`      <${tag} style=${style} ${inner} />`);
        continue;
      } else {
        inner = `"${escapeHtml(component.props?.text || '')}"`;
      }
      rows.push(`      <${tag} style=${style}>${inner}</${tag}>`);
    }
    rows.push('    </section>');
  }
  const body = rows.join('\n');
  return `const Theme = ${JSON.stringify({
    colors: tree.colors,
    fonts: tree.fonts,
    spacing: tree.spacing,
  }, null, 2)};

const props = { title: "Your project name", items: ["One", "Two", "Three"] };

export default function Design() {
  return (
    <div style={{ background: "var(--m-bg, #fff)", color: "var(--m-text, #111)", fontFamily: Theme.fonts?.body }}>
${body}
    </div>
  );
}`;
}

export async function createFigmaFile(tree, accessToken) {
  try {
    const me = await fetch('https://api.figma.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!me.ok) throw new Error('Figma token invalid');
    const res = await fetch('https://api.figma.com/v1/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${tree.name || 'MDesign'} — ${new Date().toISOString().slice(0, 10)}` }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Figma create failed: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    return { fileKey: data.key, url: `https://www.figma.com/design/${data.key}` };
  } catch (err) {
    throw new ApiError(502, `Figma export failed: ${err.message}`);
  }
}

export function createExportJob(projectId, userId, target) {
  if (!['figma', 'react', 'html', 'svg', 'png'].includes(target)) {
    throw badRequest('target must be figma, react, html, svg or png');
  }
  return ExportJob.create({ project: projectId, user: userId, target });
}

function resolveToken(tree, value) {
  if (typeof value !== 'string') return value;
  const match = /^var\(--m-([a-z]+)\)$/.exec(value);
  if (!match) return value;
  const tokens = tree.tokens || {};
  return tokens.colors?.[match[1]] || value;
}

function hexToRgba(hex, alpha = 1) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!match) return hex || '#333333';
  const r = parseInt(match[1].slice(0, 2), 16);
  const g = parseInt(match[1].slice(2, 4), 16);
  const b = parseInt(match[1].slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const SVG_WIDTH = 1600;
const SVG_SECTION_H = 900;

function buildSvgSection(tree, section, sectionIndex) {
  const rows = [];
  const bg = resolveToken(tree, tree.tokens?.colors?.bg) || '#ffffff';
  rows.push(`<g transform="translate(0,${sectionIndex * SVG_SECTION_H})">`);
  rows.push(`<rect width="${SVG_WIDTH}" height="${SVG_SECTION_H}" fill="${hexToRgba(bg)}"/>`);
  const components = (section.components || []).slice().sort((a, b) => (a.animation?.order ?? 0) - (b.animation?.order ?? 0));
  components.forEach((component, index) => {
    const position = componentPosition(component, sectionIndex, index);
    const wPct = component.position?.w_pct ?? 80;
    const hPct = component.position?.h_pct ?? 8;
    const x = (position.x_pct - wPct / 2) * (SVG_WIDTH / 100);
    const y = (position.y_pct - hPct / 2) * (SVG_SECTION_H / 100);
    const width = (wPct / 100) * SVG_WIDTH;
    const height = (hPct / 100) * SVG_SECTION_H;
    const type = component.type;
    const style = component.style || {};
    const text = component.props?.text || '';
    const color = resolveToken(tree, style.color) || '#111111';
    const fontSize = style['font-size'] ? parseInt(style['font-size'], 10) : type === 'heading' ? 44 : type === 'subheading' ? 30 : 20;

    if (type === 'image' && component.props?.src) {
      rows.push(`<image href="${escapeXml(component.props.src)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>`);
    } else if (type === 'button' || type === 'card' || type === 'badge') {
      const fill = resolveToken(tree, style['background-color'] || 'var(--m-primary)');
      rows.push(
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${style.borderRadius || 10}" fill="${hexToRgba(fill)}"/>`,
        `<text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="${tree.tokens?.fonts?.heading || 'sans-serif'}" font-size="${fontSize * 0.7}" fill="#ffffff">${escapeXml(text)}</text>`
      );
    } else if (type === 'list') {
      rows.push(
        ...(component.props?.items || []).slice(0, 8).map((item, i) =>
          `<text x="${x}" y="${y + 30 + i * 26}" font-family="${tree.tokens?.fonts?.body || 'sans-serif'}" font-size="${fontSize * 0.6}" fill="${hexToRgba(color)}">• ${escapeXml(String(item))}</text>`
        )
      );
    } else if (type === 'divider') {
      rows.push(`<line x1="${x}" y1="${y + height / 2}" x2="${x + width}" y2="${y + height / 2}" stroke="${hexToRgba(color, 0.3)}" stroke-width="1"/>`);
    } else if (type === 'spacer') {
      rows.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="transparent"/>`);
    } else if (type === 'input') {
      rows.push(
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="#ffffff" stroke="${hexToRgba(color, 0.4)}" stroke-width="1"/>`,
        `<text x="${x + 16}" y="${y + height / 2}" dominant-baseline="middle" font-family="${tree.tokens?.fonts?.body || 'sans-serif'}" font-size="${fontSize * 0.6}" fill="${hexToRgba(color, 0.5)}">${escapeXml(component.props?.placeholder || '')}</text>`
      );
    } else {
      rows.push(`<text x="${x}" y="${y + height / 2}" dominant-baseline="middle" font-family="${tree.tokens?.fonts?.heading || 'sans-serif'}" font-size="${fontSize}" fill="${hexToRgba(color)}">${escapeXml(text)}</text>`);
    }
  });
  rows.push('</g>');
  return rows.join('\n');
}

export function exportToSvg(tree) {
  const sections = (tree.sections || []).map((s, i) => buildSvgSection(tree, s, i)).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${Math.max(1, sections.length) * SVG_SECTION_H}" viewBox="0 0 ${SVG_WIDTH} ${sections.length * SVG_SECTION_H}">
${sections}
</svg>`;
}

export async function svgToPngDataUrl(svg) {
  const buffer = await sharp(Buffer.from(svg), { density: 144 })
    .png({ compressionLevel: 6 })
    .toBuffer();
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

function figmaNodeFor(component, tree, position) {
  if (component.type === 'image') {
    return {
      type: 'RECTANGLE',
      name: component.id,
      x: 0,
      y: 0,
      width: 400,
      height: 260,
      pluginData: { mdesign: { position, imageUrl: component.props?.src || null, alt: component.props?.alt || '' } },
    };
  }
  if (component.type === 'button' || component.type === 'card' || component.type === 'badge') {
    return {
      type: 'FRAME',
      name: component.id,
      layoutMode: 'HORIZONTAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      width: 220,
      height: 56,
      fills: [{ type: 'SOLID', color: { r: 0.26, g: 0.24, b: 0.8 } }],
      cornerRadius: 10,
      children: [{
        type: 'TEXT',
        name: `${component.id}_label`,
        characters: component.props?.text || '',
        textAlignHorizontal: 'CENTER',
        fontSize: 16,
        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
      }],
      pluginData: { mdesign: { position, type: component.type } },
    };
  }
  return {
    type: 'TEXT',
    name: component.id,
    characters: component.type === 'list' ? (component.props?.items || []).join('\n') : component.props?.text || '',
    fontSize: parseInt(component.style?.['font-size'], 10) || 18,
    textAlignHorizontal: 'LEFT',
    pluginData: { mdesign: { position, type: component.type } },
  };
}

export function buildFigmaPayload(tree) {
  return {
    schemaVersion: 1,
    name: tree.name || 'MDesign export',
    type: 'CANVAS',
    children: (tree.sections || []).map((section, sectionIndex) => ({
      type: 'FRAME',
      name: section.name || section.id || `section_${sectionIndex}`,
      layoutMode: 'VERTICAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      counterAxisAlignItems: 'CENTER',
      paddingTop: tree.tokens?.spacing?.section || 64,
      paddingBottom: tree.tokens?.spacing?.section || 64,
      children: (section.components || [])
        .slice()
        .sort((a, b) => (a.animation?.order ?? 0) - (b.animation?.order ?? 0))
        .map((component, index) => figmaNodeFor(component, tree, componentPosition(component, sectionIndex, index))),
    })),
  };
}

export async function processExportJob({ jobId }) {
  const job = await ExportJob.findById(jobId);
  if (!job) throw new ApiError(404, 'Export job not found');

  await ExportJob.findByIdAndUpdate(jobId, { status: 'processing' });

  try {
    const project = await Project.findById(job.project);
    const version = await DesignVersion.findOne({ project: job.project }).sort({ versionNo: -1 }).lean();
    if (!project || !version) throw new ApiError(404, 'Project or design version not found');
    const tree = version.designJson;

    let update = {};
    if (job.target === 'html') {
      update = { output: exportToHtml(tree) };
    } else if (job.target === 'react') {
      update = { output: exportToReact(tree) };
    } else if (job.target === 'svg') {
      update = { output: exportToSvg(tree) };
    } else if (job.target === 'png') {
      const svg = exportToSvg(tree);
      update = { output: await svgToPngDataUrl(svg) };
    } else {
      const user = await User.findById(job.user).select('figmaAccessToken');
      const accessToken = user?.figmaAccessToken || env.figmaAccessToken;
      if (!accessToken) {
        throw new ApiError(409, 'Figma account not connected — connect it in Settings > Integrations');
      }
      const { fileKey, url } = await createFigmaFile(tree, accessToken);
      update = {
        figmaFileKey: fileKey,
        outputUrl: url,
        figmaPayload: buildFigmaPayload(tree),
        requiresPlugin: true,
      };
    }

    const shell = {
      ...update,
      status: 'done',
      project: job.project,
      user: job.user,
      target: job.target,
    };
    await ExportJob.findByIdAndUpdate(jobId, shell);
  } catch (err) {
    await ExportJob.findByIdAndUpdate(jobId, { status: 'failed', error: err.message });
    throw err;
  }
}