import Papa from 'papaparse';
import { db } from './db';
import { CsvUpload, CsvRow } from './db';

export interface ParseResult {
  data: Record<string, any>[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export async function processCsvFile(blobUrl: string, uploadId: string): Promise<{
  success: boolean;
  rowCount?: number;
  error?: string;
}> {
  try {
    // Fetch the CSV file from blob storage
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const csvText = await response.text();

    // Parse CSV using Papa Parser
    const parseResult: ParseResult = await new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Clean header names (remove spaces, special characters, make lowercase)
          return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        },
        complete: (results) => {
          resolve(results as ParseResult);
        },
        error: (error) => {
          resolve({
            data: [],
            errors: [error],
            meta: {} as Papa.ParseMeta,
          });
        },
      });
    });

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
        VALUES ${db(batch.map(row => [row.uploadId, row.rowIndex, JSON.stringify(row.data)]))}
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
  `;

  return result[0] || null;
}
