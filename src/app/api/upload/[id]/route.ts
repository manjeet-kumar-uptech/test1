import { NextRequest, NextResponse } from 'next/server';
import { getCsvUploadStatus } from '@/lib/csv-processor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: uploadId } = await params;

    if (!uploadId) {
      return NextResponse.json(
        { error: 'Upload ID is required' },
        { status: 400 }
      );
    }

    // Handle mock upload IDs (for testing)
    if (uploadId.startsWith('mock_')) {
      return NextResponse.json({
        id: uploadId,
        filename: 'test-file.csv',
        originalName: 'test-file.csv',
        fileSize: 1024,
        status: 'completed',
        rowCount: 10,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const uploadStatus = await getCsvUploadStatus(uploadId);

    if (!uploadStatus) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: uploadStatus.id,
      filename: uploadStatus.filename,
      originalName: uploadStatus.originalName,
      fileSize: uploadStatus.fileSize,
      status: uploadStatus.status,
      rowCount: uploadStatus.rowCount,
      errorMessage: uploadStatus.errorMessage,
      createdAt: uploadStatus.createdAt,
      updatedAt: uploadStatus.updatedAt,
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
