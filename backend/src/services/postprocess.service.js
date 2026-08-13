import { env } from '../config/env.js';
import { uploadToCloudinary } from './upload.service.js';
import { logger } from '../utils/logger.js';

const ASPECT_BOXES = { '16:9': [1600, 900], '4:3': [1440, 1080], '1:1': [1080, 1080] };

let sharpLib = null;
try {
  const module = await import('sharp');
  sharpLib = module.default;
} catch {
  logger.warn('sharp unavailable — image post-processing disabled');
}

async function fetchBuffer(url) {
  if (url.startsWith('data:image')) {
    const base64 = url.includes(',') ? url.split(',')[1] : url;
    return Buffer.from(base64, 'base64');
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`image fetch failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function postprocessImage(imageUrl, aspectRatio) {
  if (!env.imagePostprocess || !sharpLib) return { url: imageUrl, width: null, height: null, processed: false };
  try {
    const [targetWidth, targetHeight] = ASPECT_BOXES[aspectRatio] || ASPECT_BOXES['16:9'];
    const source = await fetchBuffer(imageUrl);
    const output = await sharpLib(source)
      .resize(targetWidth, targetHeight, { fit: 'cover', position: 'attention' })
      .webp({ quality: 82 })
      .toBuffer();
    const { width, height } = await sharpLib(output).metadata();

    if (env.cloudinary.cloudName) {
      const result = await uploadToCloudinary(output, { folder: 'mdesign/mockups' });
      return { url: result.secure_url, width, height, processed: true };
    }
    return { url: `data:image/webp;base64,${output.toString('base64')}`, width, height, processed: true };
  } catch (err) {
    logger.warn(`postprocess skipped (${err.message})`);
    return { url: imageUrl, width: null, height: null, processed: false };
  }
}

export const postprocessEnabled = () => env.imagePostprocess && Boolean(sharpLib);