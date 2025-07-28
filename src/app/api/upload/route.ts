// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { uploadStream } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import path from 'path';
import { FileUploadResponse } from '@/types/apis';

// export const runtime = 'nodejs';  // ensure Node runtime (so Buffer is available)
export async function POST(request: Request) {
  try {
    // parse the incoming multipart/form-data
    const formData = await request.formData();
    
    // grab all "files" fields
    const fileFields = formData.getAll('files');
    const userId = formData.get("userId");
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    const folderPath = `PrintMate/user_${userId}`;

    const uploadResults = await Promise.all(
      fileFields.map(async (fileField) => {
        // each fileField is a Web File object
        const webFile = fileField as File;
        const arrayBuffer = await webFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return uploadStream(buffer, folderPath, path.parse(webFile.name).name);
      })
    );

    // Save file information to database
    const savedFiles = await Promise.all(
      uploadResults.map(async (result) => {
        return await prisma.file.create({
          data: {
            name: path.parse(result.public_id.split('/').pop() || result.public_id).name,
            publicId: result.public_id,
            url: result.secure_url,
            size: result.bytes,
            type: getFileType(result.resource_type, result.format),
            format: result.format,
            resourceType: result.resource_type,
            width: result.width,
            height: result.height,
            userId: userId,
          },
        });
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

function getFileType(resourceType: string, format: string): string {
  if (resourceType === 'image') return 'image';
  if (resourceType === 'video') return 'video';
  if (resourceType === 'raw') {
    const docFormats = ['pdf', 'doc', 'docx', 'txt'];
    const spreadsheetFormats = ['xls', 'xlsx', 'csv'];
    const presentationFormats = ['ppt', 'pptx'];
    
    if (docFormats.includes(format?.toLowerCase())) return 'document';
    if (spreadsheetFormats.includes(format?.toLowerCase())) return 'spreadsheet';
    if (presentationFormats.includes(format?.toLowerCase())) return 'presentation';
  }
  return format || 'file';
}
