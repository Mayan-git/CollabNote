import { cloudinary } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

interface UploadResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
}

export const uploadService = {
  uploadBuffer(buffer: Buffer, folder: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `collabnote/${folder}`, resource_type: 'auto' },
        (error, result) => {
          if (error || !result) {
            reject(ApiError.internal(`File upload failed: ${error?.message ?? 'unknown error'}`));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id, bytes: result.bytes, format: result.format });
        },
      );
      stream.end(buffer);
    });
  },

  async deleteByPublicId(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  },
};
