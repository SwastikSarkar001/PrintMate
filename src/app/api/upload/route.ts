// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { uploadStream } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import path from 'path';
import { FileUploadResponse } from '@/types/apis';

export async function POST(request: Request) {
  try {
    console.log('Upload request received');

    // Check database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json<FileUploadResponse>(
        { success: false, message: 'Database connection failed' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const fileFields: File[] = formData.getAll('files') as File[];
    const userId = formData.get("userId");

    console.log('Upload request details:', {
      fileCount: fileFields.length,
      userId: userId,
      fileTypes: fileFields.map((f) => f.type)
    });

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const folderPath = `PrintMate/user_${userId}`;
    console.log('Starting file uploads to folder:', folderPath);

    const uploadResults = await Promise.all(
      fileFields.map(async (fileField, index) => {
        try {
          const webFile = fileField as File;
          const arrayBuffer = await webFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          console.log(`Uploading file ${index + 1}:`, {
            name: webFile.name,
            type: webFile.type,
            size: webFile.size
          });

          const result = await uploadStream(buffer, folderPath, path.parse(webFile.name).name);
          console.log(`File ${index + 1} uploaded successfully:`, {
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format
          });

          return result;
        } catch (error) {
          console.error(`Error uploading file ${index + 1}:`, error);
          throw error;
        }
      })
    );

    console.log('All files uploaded successfully');

    // Save file metadata to database
    await Promise.all(
      uploadResults.map(async (result, index) => {
        try {
          const webFile = fileFields[index] as File;
          const originalName = webFile.name;

          const fileType = getFileType(result.resource_type, result.format, result.public_id, originalName);

          const fileData = {
            name: originalName, // ✅ CHANGE: Use original file name
            publicId: result.public_id,
            url: result.secure_url,
            size: result.bytes,
            type: fileType,
            format: result.format || 'unknown',
            resourceType: result.resource_type,
            width: result.width || null,
            height: result.height || null,
            userId: userId,
          };

          console.log('Saving file to database:', fileData);

          const savedFile = await prisma.file.create({
            data: fileData,
          });

          console.log(`File ${index + 1} saved with ID:`, savedFile.id);
          return savedFile;
        } catch (error) {
          console.error(`Error saving file ${index + 1} to database:`, error);
          throw error;
        }
      })
    );

    console.log('All files saved to database');

    return NextResponse.json<FileUploadResponse>({
      success: true,
      data: {
        files: uploadResults.map(r => ({
          url: r.secure_url,
          public_id: r.public_id,
          format: r.format,
          bytes: r.bytes,
        })),
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json<FileUploadResponse>(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}

// ✅ REPLACED getFileType with more robust version
function getFileType(resourceType: string, format: string, publicId?: string, originalFileName?: string): string {
  console.log('getFileType called with:', { resourceType, format, publicId, originalFileName });

  // Priority: Filename check
  if (originalFileName?.toLowerCase().endsWith('.pdf')) {
    console.log('Detected PDF file by original filename.');
    return 'document';
  }

  // Cloudinary format fallback
  if (format?.toLowerCase() === 'pdf') {
    console.log('Detected PDF file from Cloudinary format');
    return 'document';
  }

  // Use Cloudinary resource type
  if (resourceType === 'image') return 'image';
  if (resourceType === 'video') return 'video';

  if (resourceType === 'raw') {
    const docFormats = ['doc', 'docx', 'txt'];
    const spreadsheetFormats = ['xls', 'xlsx', 'csv'];
    const presentationFormats = ['ppt', 'pptx'];

    if (docFormats.includes(format?.toLowerCase())) return 'document';
    if (spreadsheetFormats.includes(format?.toLowerCase())) return 'spreadsheet';
    if (presentationFormats.includes(format?.toLowerCase())) return 'presentation';
  }

  return format || 'file';
}