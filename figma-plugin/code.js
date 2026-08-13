// MDesign Import — Figma Plugin
// Consumes the transfer payload produced by the MDesign export pipeline
// (POST /api/projects/:id/export with target "figma" → GET /api/exports/:id/figma-payload)
// and recreates the design as real, editable Figma nodes.

figma.showUI(__html__, { width: 440, height: 560 });

function toRgb01(color) {
  if (!color || typeof color !== 'object') return { r: 0.2, g: 0.2, b: 0.2 };
  const clamp = (v) => Math.min(1, Math.max(0, v ?? 0));
  return { r: clamp(color.r), g: clamp(color.g), b: clamp(color.b) };
}

async function ensureFont(family) {
  const candidates = [family, 'Inter', 'Roboto', 'Arial'].filter(Boolean);
  for (const f of candidates) {
    for (const style of ['Regular', 'Bold']) {
      try {
        await figma.loadFontAsync({ family: f, style });
        return { family: f, style };
      } catch {
        /* try next */
      }
    }
  }
  return null;
}

function applyFills(node, fills) {
  if (!Array.isArray(fills) || fills.length === 0) return;
  node.fills = fills.map((f) => {
    if (f.type === 'SOLID') {
      return { type: 'SOLID', color: toRgb01(f.color), opacity: f.opacity ?? 1 };
    }
    return f;
  });
}

async function createImageNode(node, mdesign) {
  const rect = figma.createRectangle();
  rect.name = node.name || 'image';
  rect.resize(node.width || 400, node.height || 260);
  rect.cornerRadius = node.cornerRadius ?? 0;
  if (mdesign?.imageUrl) {
    try {
      const image = await figma.createImageAsync(mdesign.imageUrl);
      rect.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' }];
    } catch {
      rect.fills = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.92 } }];
    }
  } else {
    applyFills(rect, node.fills);
  }
  return rect;
}

async function createTextNode(node, parent, mdesign) {
  const font = await ensureFont(mdesign?.fontFamily);
  const text = figma.createText();
  text.name = node.name || 'text';
  text.characters = node.characters ?? '';
  text.textAlignHorizontal = node.textAlignHorizontal || 'LEFT';
  text.textAlignVertical = node.textAlignVertical || 'CENTER';
  text.fontSize = node.fontSize || 18;
  if (font) text.fontName = font;
  applyFills(text, node.fills);
  parent.appendChild(text);
  return text;
}

async function createFrameNode(node, parent) {
  const frame = figma.createFrame();
  frame.name = node.name || 'frame';
  frame.resize(node.width || 1080, node.height || 900);
  if (node.layoutMode) frame.layoutMode = node.layoutMode === 'HORIZONTAL' ? 'HORIZONTAL' : 'VERTICAL';
  frame.primaryAxisSizingMode = node.primaryAxisSizingMode === 'AUTO' ? 'AUTO' : 'FIXED';
  frame.counterAxisSizingMode = node.counterAxisSizingMode === 'FIXED' ? 'FIXED' : 'AUTO';
  if (node.counterAxisAlignItems) {
    const map = { MIN: 'MIN', CENTER: 'CENTER', MAX: 'MAX', 'SPACE BETWEEN': 'SPACE_BETWEEN' };
    frame.counterAxisAlignItems = map[node.counterAxisAlignItems] || 'CENTER';
  }
  frame.primaryAxisAlignItems = node.primaryAxisAlignItems || 'MIN';
  frame.itemSpacing = node.itemSpacing ?? 24;
  frame.paddingTop = node.paddingTop ?? 0;
  frame.paddingRight = node.paddingRight ?? 0;
  frame.paddingBottom = node.paddingBottom ?? 0;
  frame.paddingLeft = node.paddingLeft ?? 0;
  if (node.cornerRadius) frame.cornerRadius = node.cornerRadius;
  applyFills(frame, node.fills);
  parent.appendChild(frame);
  return frame;
}

async function createNode(node, parent) {
  const mdesign = node.pluginData?.mdesign || {};
  switch (node.type) {
    case 'FRAME': {
      const frame = await createFrameNode(node, parent);
      for (const child of node.children || []) await createNode(child, frame);
      return frame;
    }
    case 'RECTANGLE':
      return createImageNode(node, mdesign);
    case 'TEXT':
      return createTextNode(node, parent, mdesign);
    default: {
      const frame = await createFrameNode({ ...node, name: node.name || 'node' }, parent);
      for (const child of node.children || []) await createNode(child, frame);
      return frame;
    }
  }
}

async function createDesign(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Payload is empty');
  if (payload.schemaVersion !== 1) throw new Error('Unsupported payload schema version');

  const page = figma.createPage();
  page.name = payload.name || 'MDesign export';
  figma.root.appendChild(page);
  figma.currentPage = page;

  let nodes = 0;
  for (const section of payload.children || []) {
    await createNode(section, page);
    nodes += 1 + (section.children?.length || 0);
  }
  figma.viewport.scrollAndZoomIntoView(page.children);
  return { page, nodes };
}

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === 'create-json') {
      let payload;
      try {
        payload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;
      } catch (err) {
        figma.ui.postMessage({ type: 'error', message: `Invalid JSON: ${err.message}` });
        return;
      }
      const { page, nodes } = await createDesign(payload);
      figma.ui.postMessage({
        type: 'done',
        message: `Created page "${page.name}" with ${nodes} nodes.`,
      });
    } else if (msg.type === 'create-url') {
      const headers = msg.token ? { Authorization: `Bearer ${msg.token}` } : {};
      const res = await fetch(msg.url, { headers });
      if (!res.ok) throw new Error(`Fetch failed (${res.status}) — is the API running and the token valid?`);
      const data = await res.json();
      const payload = data.payload || data;
      const { page, nodes } = await createDesign(payload);
      figma.ui.postMessage({
        type: 'done',
        message: `Created page "${page.name}" with ${nodes} nodes.`,
      });
    }
  } catch (err) {
    figma.ui.postMessage({ type: 'error', message: err.message });
  }
};