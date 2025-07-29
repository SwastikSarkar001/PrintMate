// app/api/files/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('Fetching files for user:', userId);

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Build query parameters
    const queryParams: {
      where: {
      userId: string;
      };
      orderBy: {
      uploadedAt: 'desc';
      };
      take: number;
      cursor?: {
      id: string;
      };
      skip?: number;
    } = {
      where: {
      userId: userId,
      },
      orderBy: {
      uploadedAt: 'desc',
      },
      take: 10, // Only take the 10 most recent files
    };

    console.log('Query parameters:', JSON.stringify(queryParams, null, 2));

    const result = await prisma.file.findMany(queryParams);

    // Log all files for debugging
    result.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        id: file.id,
        name: file.name,
        type: file.type,
        format: file.format,
        resourceType: file.resourceType,
        publicId: file.publicId
      });
    });

    // Get total count for this user
    const totalCount = await prisma.file.count({
      where: { userId: userId },
    });

    console.log('Total files for user:', totalCount);

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

    // --- CHANGE: Simplified response without pagination cursors ---
    return NextResponse.json({
      files: transformedFiles,
      total: totalCount,
    });

  } catch (error) {
    console.error('Error fetching files from database:', error);
    return NextResponse.json({ message: 'Failed to fetch files' }, { status: 500 });
  }
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}