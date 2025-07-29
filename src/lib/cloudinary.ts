import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadStream(buffer: Buffer, folderPath: string, display_name: string, fileType?: string) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    // Determine resource type based on file type
    let resourceType: 'auto' | 'raw' | 'image' | 'video' = 'auto';
    if (fileType && fileType.toLowerCase() === 'application/pdf') {
      resourceType = 'raw';
    }

    const stream = cloudinary.uploader.upload_stream({
      folder: folderPath,
      resource_type: resourceType,
      display_name: display_name,
    },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

export default cloudinary;