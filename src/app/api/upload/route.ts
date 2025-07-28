// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { uploadStream } from '@/lib/cloudinary';
import path from 'path';
import { FileUploadResponse } from '@/types/apis';

// export const runtime = 'nodejs';  // ensure Node runtime (so Buffer is available)
export async function POST(request: Request) {
  try {
    // parse the incoming multipart/form-data
    const formData = await request.formData();
    // TODO: replace with your real auth/session lookup
    const userId = '1';  
    const folderPath = `Printing/user_${userId}`;

    // grab all "files" fields
    const fileFields = formData.getAll('files');
    const uploadResults = await Promise.all(
      fileFields.map(async (fileField) => {
        // each fileField is a Web File object
        const webFile = fileField as File;
        const arrayBuffer = await webFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return uploadStream(buffer, folderPath, path.parse(webFile.name).name);
      })
    );

    // return just the data your UI needs
    return NextResponse.json<FileUploadResponse>({
      success: true,
      data: {
        files: uploadResults.map(r => ({
          url:        r.secure_url,
          public_id:  r.public_id,
          format:     r.format,
          bytes:      r.bytes,
        })),
      }
    })
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json<FileUploadResponse>(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}
