import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.js';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new ApiError(400, 'Only image files are allowed'));
  },
});

export function uploadToCloudinary(buffer, { folder = 'mdesign', publicId } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, ...(publicId ? { public_id: publicId } : {}) },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}