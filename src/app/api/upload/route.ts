import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createCsvUploadRecord, processCsvFile } from '@/lib/csv-processor';

// Ensure the blob token is available for the SDK
if (typeof process !== 'undefined' && process.env?.BLOB_READ_WRITE_TOKEN) {
  // The Vercel Blob SDK should automatically read this environment variable
}


export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/upload called');

    // Check environment variables
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.error('BLOB_READ_WRITE_TOKEN not loaded from environment');
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('File received:', file ? file.name : 'No file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload the actual file to Vercel Blob Storage
    let blob;
    try {
      console.log('Uploading file to blob storage:', file.name, file.size, file.type);
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${file.name}`;
      blob = await put(uniqueFileName, file, {
        access: 'public',
        contentType: 'text/csv',
      });
      console.log('Blob upload successful:', blob.url);
    } catch (blobError) {
      console.error('Blob upload failed:', blobError);
      const errorMessage = blobError instanceof Error ? blobError.message : 'Unknown blob upload error';
      console.error('Error type:', blobError instanceof Error ? blobError.constructor.name : 'Unknown');
      return NextResponse.json(
        { error: `Blob upload failed: ${errorMessage}` },
        { status: 500 }
      );
    }

    // Create database record for this upload
    console.log('About to create database record');
    let uploadId;
    try {
      uploadId = await createCsvUploadRecord(
        blob!.pathname.split('/').pop() || file.name, // filename from blob path
        file.name, // original filename
        file.size,
        blob!.url
      );
      console.log('Database record created successfully:', uploadId);
    } catch (dbError) {
      console.error('Database error creating upload record:', dbError);
      return NextResponse.json(
        { error: `Failed to create upload record: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Process the CSV file asynchronously (don't await to avoid timeout)
    processCsvFile(blob!.url, uploadId).catch(error => {
      console.error(`Failed to process CSV file ${uploadId}:`, error);
    });

    return NextResponse.json({
      id: uploadId,
      filename: file.name,
      size: file.size,
      url: blob.url,
      message: 'File uploaded successfully. CSV processing has started.',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
