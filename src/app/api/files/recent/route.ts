// app/api/files/recent/route.ts (for App Router)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build query parameters
    const queryParams: any = {
      where: {
        userId: userId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      take: limit,
    };

    // Add cursor for pagination
    if (cursor) {
      queryParams.cursor = {
        id: cursor,
      };
      queryParams.skip = 1; // Skip the cursor item
    }

    const result = await prisma.file.findMany(queryParams);

    // Get total count for this user
    const totalCount = await prisma.file.count({
      where: {
        userId: userId,
      },
    });

    // Transform files to match the expected format
    const transformedFiles = result.map((file) => ({
      id: file.id,
      name: file.name,
      publicId: file.publicId,
      type: file.type,
      size: formatFileSize(file.size),
      modified: file.uploadedAt.toISOString(),
      url: file.url,
      resourceType: file.resourceType,
      format: file.format,
      width: file.width,
      height: file.height,
    }));

    // Get the next cursor (ID of the last item)
    const nextCursor = result.length === limit ? result[result.length - 1]?.id : null;

    return NextResponse.json({
      files: transformedFiles,
      nextCursor: nextCursor,
      hasMore: !!nextCursor,
      total: totalCount,
    });

  } catch (error) {
    console.error('Error fetching files from database:', error);
    return NextResponse.json(
      { message: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}