import { NextRequest, NextResponse } from 'next/server';
import { getCsvUploadStatus } from '@/lib/csv-processor';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const uploadId = params.id;

    if (!uploadId) {
      return NextResponse.json(
        { error: 'Upload ID is required' },
        { status: 400 }
      );
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
