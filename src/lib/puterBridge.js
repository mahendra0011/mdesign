import { api } from './api.js';

let jobCount = 0;

async function extractContent(response) {
  const message = response?.message;
  const content =
    (typeof message === 'string' && message) ||
    (message && typeof message.content === 'string' && message.content) ||
    (typeof response?.content === 'string' && response.content) ||
    (typeof response?.text === 'string' && response.text) ||
    null;
  if (content === null) {
    throw new Error('Puter returned an empty response');
  }
  return content;
}

async function blobToDataUrl(blob) {
  if (typeof blob?.arrayBuffer !== 'function') throw new Error('Puter returned no image blob');
  const buffer = await blob.arrayBuffer();
  const mimeType = blob.type || 'image/png';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

async function handlePlanJob({ payload, model }) {
  const response = await window.puter.ai.chat(
    [
      { role: 'system', content: payload.systemPrompt },
      { role: 'user', content: payload.userPrompt },
    ],
    { model }
  );
  return { success: true, content: await extractContent(response) };
}

async function handleVisionJob({ payload, model }) {
  const response = await window.puter.ai.chat(payload.prompt, payload.imageUrl, { model });
  return { success: true, content: await extractContent(response) };
}

async function handleImageJob({ payload, model }) {
  const result = await window.puter.ai.txt2img(payload.prompt, {
    model,
    ...(payload.aspectRatio ? { aspect_ratio: payload.aspectRatio } : {}),
  });
  const blob = typeof result?.blob === 'function' ? await result.blob() : result;
  return { success: true, imageDataUrl: await blobToDataUrl(blob) };
}

const HANDLERS = { plan: handlePlanJob, vision: handleVisionJob, image: handleImageJob };

function postResult(jobId, body) {
  return api.post(`/ai-jobs/${jobId}/result`, body);
}

export function attachPuterBridge(socket) {
  if (!socket || window.__puterBridgeAttached) return;
  window.__puterBridgeAttached = true;

  socket.on('ai_job_request', async ({ jobId, kind, payload, model }) => {
    jobCount += 1;
    console.log(`[puterBridge] job ${jobCount}: ${kind} (${jobId})`);
    const handler = HANDLERS[kind];
    if (!handler) {
      postResult(jobId, { success: false, error: `unknown job kind: ${kind}` }).catch(() => {});
      return;
    }
    try {
      if (!window.puter?.ai) throw new Error('Puter not loaded on this page — refresh the tab');
      const body = await handler({ jobId, payload, model });
      await postResult(jobId, body);
      console.log(`[puterBridge] job ${jobId} done`);
    } catch (err) {
      console.error(`[puterBridge] job ${jobId} failed:`, err);
      await postResult(jobId, { success: false, error: err.message || 'browser AI call failed' }).catch(() => {});
    }
  });
}
