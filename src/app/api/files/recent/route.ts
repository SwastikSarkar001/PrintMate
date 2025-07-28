// app/api/files/recent/route.ts (for App Router)
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary'; // Ensure you have cloudinary configured

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const folder = searchParams.get('folder') || '';
    const resourceType = searchParams.get('resource_type') || 'auto';

    const searchParamsCloudinary: any = {
      type: 'upload',
      max_results: limit,
      resource_type: resourceType,
    };

    if (folder) {
      searchParamsCloudinary.prefix = folder;
    }

    if (cursor) {
      searchParamsCloudinary.next_cursor = cursor;
    }

    const result = await cloudinary.api.resources(searchParamsCloudinary);

    const transformedFiles = result.resources.map((file: any, index: number) => ({
      id: `${file.public_id}_${index}`,
      name: file.public_id.split('/').pop() || file.public_id,
      publicId: file.public_id,
      type: getFileType(file.resource_type, file.format),
      size: formatFileSize(file.bytes),
      modified: file.created_at,
      url: file.secure_url,
      resourceType: file.resource_type,
      format: file.format,
      width: file.width,
      height: file.height,
    }));

    transformedFiles.sort((a: any, b: any) => 
      new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );

    return NextResponse.json({
      files: transformedFiles,
      nextCursor: result.next_cursor || null,
      hasMore: !!result.next_cursor,
      total: result.total_count || transformedFiles.length,
    });

  } catch (error) {
    console.error('Error fetching files from Cloudinary:', error);
    return NextResponse.json(
      { message: 'Failed to fetch files' },
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

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}