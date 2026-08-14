import { UploadedDesign } from '../models/UploadedDesign.js';
import { Project } from '../models/Project.js';
import { DesignVersion } from '../models/DesignVersion.js';
import { CustomiseSession } from '../models/CustomiseSession.js';
import { uploadToCloudinary } from '../services/upload.service.js';
import {
  detectElements,
  renderComposite,
  removeBackgroundViaCloudinary,
  inpaintRegionViaCloudinary,
  buildSolidBackgroundUrl,
  overlayImages,
  runElementGeneration,
  emitSessionUpdate,
  recordHistory,
  extractPublicId,
} from '../services/customise.service.js';
import { publishUserEvent } from '../config/redis.js';
import { cloudinary } from '../config/cloudinary.js';
import { ApiError, badRequest } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createSession = asyncHandler(async (req, res) => {
  const { uploadedDesignId } = req.body || {};
  if (!uploadedDesignId) throw badRequest('uploadedDesignId is required');

  const design = await UploadedDesign.findOne({ _id: uploadedDesignId, user: req.user._id });
  if (!design) throw new ApiError(404, 'Uploaded design not found');

  let session = await CustomiseSession.findOne({ uploadedDesign: design._id, user: req.user._id });
  if (session) {
    session = session.toObject();
    session.elements = session.elements || [];
    return res.json({ success: true, session });
  }

  let width = 1600;
  let height = 1200;
  const publicId = extractPublicId(design.originalFileUrl);
  if (publicId) {
    try {
      const resource = await cloudinary.api.resource(publicId);
      width = resource.width || width;
      height = resource.height || height;
    } catch {
      /* fallback to defaults */
    }
  }

  session = await CustomiseSession.create({
    user: req.user._id,
    uploadedDesign: design._id,
    baseImageUrl: design.originalFileUrl,
    currentCompositeUrl: design.originalFileUrl,
    canvasSize: { width, height },
    status: 'editing',
  });

  const detected = await detectElements(design.originalFileUrl, req.user._id);
  if (detected.length) {
    session.elements = detected;
    await session.save();
  }
  await recordHistory(session, 'session_created', { uploadedDesignId });

  res.status(201).json({ success: true, session });
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await CustomiseSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) throw new ApiError(404, 'Session not found');
  res.json({ success: true, session });
});

export const addElement = asyncHandler(async (req, res) => {
  const session = await CustomiseSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) throw new ApiError(404, 'Session not found');
  if (!req.file) throw badRequest('elementImage file is required');

  const result = await uploadToCloudinary(req.file.buffer, { folder: 'mdesign/elements' });
  const { x = 40, y = 40, width = 20, height = 20 } = req.body || {};
  const element = {
    elementId: `el_user_${Date.now()}`,
    type: req.body?.elementType || 'image',
    sourceUrl: result.secure_url,
    bbox: {
      x: Math.max(0, Math.min(100, Number(x) || 40)),
      y: Math.max(0, Math.min(100, Number(y) || 40)),
      width: Math.max(2, Math.min(100, Number(width) || 20)),
      height: Math.max(2, Math.min(100, Number(height) || 20)),
    },
    zIndex: (session.elements.length + 1) * 10,
  };
  session.elements.push(element);
  await session.save();
  session.currentCompositeUrl = renderComposite(session);
  await session.save();
  await recordHistory(session, 'element_added', { elementId: element.elementId });
  await emitSessionUpdate(session, 'element_added', { element });

  res.json({ success: true, session });
});

export const removeElement = asyncHandler(async (req, res) => {
  const session = await CustomiseSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) throw new ApiError(404, 'Session not found');

  const idx = session.elements.findIndex((el) => el.elementId === req.params.elementId);
  if (idx === -1) throw new ApiError(404, 'Element not found');
  const removed = session.elements.splice(idx, 1)[0];

  if (removed.isPartOfBaseImage && session.elements.length === 0) {
    const newBase = inpaintRegionViaCloudinary(session.baseImageUrl, removed.bbox, session.canvasSize);
    if (newBase) {
      const result = await cloudinary.uploader.upload(newBase, { folder: 'mdesign/composites' });
      session.currentCompositeUrl = result.secure_url;
      session.background = { type: 'original', value: null };
    }
  } else {
    session.currentCompositeUrl = renderComposite(session);
  }
  await session.save();
  await recordHistory(session, 'element_removed', { elementId: removed.elementId });
  await emitSessionUpdate(session, 'element_removed', { elementId: removed.elementId });

  res.json({ success: true, session });
});

export const removeBackground = asyncHandler(async (req, res) => {
  const session = await CustomiseSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) throw new ApiError(404, 'Session not found');

  const source = session.background?.type === 'original' ? session.baseImageUrl : session.currentCompositeUrl;
  const removedUrl = await removeBackgroundViaCloudinary(source);
  session.background = { type: 'removed', value: removedUrl };
  session.currentCompositeUrl = removedUrl;
  await session.save();
  await recordHistory(session, 'background_removed', { url: removedUrl });
  await emitSessionUpdate(session, 'background_removed', { url: removedUrl });

  res.json({ success: true, session });
});

export const changeBackground = asyncHandler(async (req, res) => {
  const session = await CustomiseSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) throw new ApiError(404, 'Session not found');

  const { mode, color, imageUrl } = req.body || {};
  let newBgUrl = null;

  if (mode === 'color') {
    newBgUrl = await buildSolidBackgroundUrl(color || '#ffffff', session.canvasSize);
  } else if (mode === 'image') {
    if (!imageUrl) throw badRequest('imageUrl is required for image background');
    const result = await cloudinary.uploader.upload(imageUrl, { folder: 'mdesign/backgrounds' });
    newBgUrl = result.secure_url;
  } else {
    throw badRequest('mode must be "color" or "image"');
  }

  const fgSource = session.background?.type === 'original' ? session.baseImageUrl : session.currentCompositeUrl;
  const overlaid = overlayImages(newBgUrl, fgSource);
  if (overlaid) {
    session.background = { type: mode, value: overlaid };
    session.currentCompositeUrl = overlaid;
  } else {
    session.background = { type: mode, value: newBgUrl };
    session.currentCompositeUrl = newBgUrl;
  }
  await session.save();
  await recordHistory(session, 'background_changed', { mode, color, imageUrl });
  await emitSessionUpdate(session, 'background_changed', { url: session.currentCompositeUrl });

  res.json({ success: true, session });
});

export const generateElement = asyncHandler(async (req, res) => {
  const session = await CustomiseSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) throw new ApiError(404, 'Session not found');

  const { prompt, elementType = 'image' } = req.body || {};
  if (!prompt) throw badRequest('prompt is required');
  await publishUserEvent(req.user._id, 'customise:generating', {
    sessionId: session._id,
    prompt,
    elementType,
  });

  try {
    const element = await runElementGeneration(session, { prompt, elementType });
    session.elements.push(element);
    await session.save();
    session.currentCompositeUrl = renderComposite(session);
    await session.save();
    await recordHistory(session, 'element_generated', {
      elementId: element.elementId,
      prompt,
      elementType,
    });
    await emitSessionUpdate(session, 'element_generated', { element });
    await publishUserEvent(req.user._id, 'customise:generated', {
      sessionId: session._id,
      element,
    });
    res.json({ success: true, session });
  } catch (err) {
    await publishUserEvent(req.user._id, 'customise:generate_failed', {
      sessionId: session._id,
      error: err.message,
    });
    throw err;
  }
});

export const saveAsTemplate = asyncHandler(async (req, res) => {
  const session = await CustomiseSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) throw new ApiError(404, 'Session not found');

  const project = await Project.create({
    user: req.user._id,
    prompt: 'Customised template from upload',
    platform: 'web',
    status: 'ready',
  });

  await DesignVersion.create({
    project: project._id,
    versionNo: 1,
    createdBy: 'ai',
    designJson: {
      name: 'Customised template',
      platform: 'web',
      colors: {},
      fonts: {},
      spacing: {},
      tokens: {
        customise: {
          baseImageUrl: session.baseImageUrl,
          compositeUrl: session.currentCompositeUrl,
          canvasSize: session.canvasSize,
          background: session.background,
          elements: session.elements.map((el) => ({
            elementId: el.elementId,
            type: el.type,
            sourceUrl: el.sourceUrl,
            bbox: el.bbox,
            zIndex: el.zIndex,
            isAiGenerated: el.isAiGenerated,
            isPartOfBaseImage: el.isPartOfBaseImage,
          })),
        },
      },
      sections: [],
    },
  });

  session.status = 'saved';
  await session.save();
  await recordHistory(session, 'saved_as_template', { projectId: project._id });
  await emitSessionUpdate(session, 'saved_as_template', { projectId: project._id });

  res.status(201).json({ success: true, project });
});