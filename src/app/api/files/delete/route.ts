// app/api/files/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary'; // Assuming your cloudinary config is exported from here

export async function DELETE(request: NextRequest) {
  try {
    const { fileId, publicId, resourceType } = await request.json();

    if (!fileId || !publicId || !resourceType) {
      return NextResponse.json(
        { success: false, message: 'Missing required file information for deletion' },
        { status: 400 }
      );
    }

    // Step 1: Delete the file from Cloudinary.
    // The resource_type is crucial for deleting non-image files like PDFs.
    try {
      console.log(`Deleting from Cloudinary: ${publicId}, type: ${resourceType}`);
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch (cloudinaryError) {
      // Log the error but continue, as the file might already be deleted on Cloudinary
      console.warn(`Could not delete file ${publicId} from Cloudinary. It may have already been removed.`, cloudinaryError);
    }
    
    // Step 2: Delete the file record from your database.
    await prisma.file.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true, message: 'File deleted successfully' });

  } catch (error) {
    console.error('Error deleting file:', error);
    // Check if it's a Prisma error for a record not found (already deleted)
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
       return NextResponse.json({ success: true, message: 'File already deleted from database.' });
    }
    return NextResponse.json({ success: false, message: 'Failed to delete file' }, { status: 500 });
  }
}