import Papa from 'papaparse';
import { parse } from 'csv-parse/sync';
import { db } from './db';
import { CsvUpload, CsvRow } from './db';

export interface ParseResult {
  data: Record<string, string | number>[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export async function processCsvFile(blobUrl: string, uploadId: string): Promise<{
  success: boolean;
  rowCount?: number;
  error?: string;
}> {
  try {
    // For development, we need to handle both local and production blob URLs
    let fetchUrl = blobUrl;

    // In development, if the blob URL is from Vercel Blob, we need to use the full URL
    if (blobUrl.includes('vercel-storage.com') && !blobUrl.startsWith('http')) {
      fetchUrl = `https://${blobUrl}`;
    }

    // Fetch the CSV file from blob storage
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const csvText = await response.text();

    // Parse CSV using csv-parse library
    let parseResult: ParseResult;
    try {
      const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        from_line: 1, // Skip header row as columns are already defined
      }) as Record<string, string | number>[];

      // Transform headers to clean format
      const headers = Object.keys(records[0] || {}).map(header =>
        header.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
      );

      // Transform data with cleaned headers
      const transformedData = records.map((record: Record<string, string | number>) => {
        const transformedRecord: Record<string, string | number> = {};
        headers.forEach((header, i) => {
          const originalHeader = Object.keys(records[0] || {})[i];
          if (originalHeader && record[originalHeader] !== undefined) {
            transformedRecord[header] = record[originalHeader];
          }
        });
        return transformedRecord;
      });

      parseResult = {
        data: transformedData,
        errors: [],
        meta: { fields: headers } as Papa.ParseMeta,
      };
    } catch (error) {
      parseResult = {
        data: [],
        errors: [{ type: 'Delimiter', code: 'MissingQuotes', message: error instanceof Error ? error.message : 'Parse error', row: 0 }],
        meta: {} as Papa.ParseMeta,
      };
    }

    if (parseResult.errors.length > 0) {
      throw new Error(`CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`);
    }

    if (parseResult.data.length === 0) {
      throw new Error('CSV file appears to be empty or has no valid data rows');
    }

    // Update upload status to processing
    await db`
      UPDATE csv_uploads
      SET status = 'processing', updated_at = NOW()
      WHERE id = ${uploadId}
    `;

    // Save CSV rows to database
    const csvRows: Omit<CsvRow, 'id' | 'createdAt'>[] = parseResult.data.map((row, index) => ({
      uploadId,
      rowIndex: index,
      data: row,
    }));

    // Insert rows in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < csvRows.length; i += batchSize) {
      const batch = csvRows.slice(i, i + batchSize);

      await db`
        INSERT INTO csv_rows (upload_id, row_index, data)
        VALUES ${batch.map(row => [row.uploadId, row.rowIndex, JSON.stringify(row.data)])}
      `;
    }

    // Update upload status to completed
    await db`
      UPDATE csv_uploads
      SET status = 'completed', row_count = ${csvRows.length}, updated_at = NOW()
      WHERE id = ${uploadId}
    `;

    return {
      success: true,
      rowCount: csvRows.length,
    };

  } catch (error) {
    // Update upload status to failed
    await db`
      UPDATE csv_uploads
      SET status = 'failed', error_message = ${error instanceof Error ? error.message : 'Unknown error'}, updated_at = NOW()
      WHERE id = ${uploadId}
    `;

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function createCsvUploadRecord(
  filename: string,
  originalName: string,
  fileSize: number,
  blobUrl: string
): Promise<string> {
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db`
    INSERT INTO csv_uploads (id, filename, original_name, file_size, blob_url, status)
    VALUES (${uploadId}, ${filename}, ${originalName}, ${fileSize}, ${blobUrl}, 'pending')
  `;

  return uploadId;
}

export async function getCsvUploadStatus(uploadId: string): Promise<CsvUpload | null> {
  const result = await db`
    SELECT * FROM csv_uploads WHERE id = ${uploadId}
  ` as CsvUpload[];

  return result[0] || null;
}
