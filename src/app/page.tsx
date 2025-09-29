'use client';

import { useState } from 'react';
import DropZone from './components/DropZone';

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    console.log('File received in handleFileUpload:', file.name, file.size, file.type);
    setIsUploading(true);
    setUploadStatus('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('FormData created, keys:', Array.from(formData.keys()));
      console.log('File in FormData:', formData.get('file'));

      console.log('Making upload request...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it for FormData
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', Object.fromEntries(response.headers));

      if (response.ok) {
        const result = await response.json();
        setUploadStatus(`✅ File uploaded successfully! Processing with ID: ${result.id}`);

        // Start polling for status updates
        pollUploadStatus(result.id);
      } else {
        try {
          const error = await response.json();
          setUploadStatus(`❌ Upload failed: ${error.error || 'Server error'}`);
        } catch (parseError) {
          setUploadStatus(`❌ Upload failed: Server error (${response.status})`);
        }
      }
    } catch (error) {
      setUploadStatus('❌ Upload failed: Network error');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const pollUploadStatus = async (uploadId: string) => {
    try {
      const response = await fetch(`/api/upload/${uploadId}`);
      if (response.ok) {
        const status = await response.json();

        if (status.status === 'completed') {
          setUploadStatus(`✅ CSV processing completed! ${status.rowCount} rows imported successfully.`);
        } else if (status.status === 'failed') {
          setUploadStatus(`❌ Processing failed: ${status.errorMessage}`);
        } else if (status.status === 'processing') {
          setUploadStatus(`🔄 Processing CSV file... ${status.rowCount || 0} rows processed so far.`);

          // Continue polling if still processing
          setTimeout(() => pollUploadStatus(uploadId), 2000);
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            CSV File Uploader
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Upload your CSV files and let us process them in the background
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <DropZone
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
            />
          </div>

          {uploadStatus && (
            <div className={`p-4 rounded-lg mb-6 ${
              uploadStatus.includes('✅')
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {uploadStatus}
            </div>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              <strong>Supported format:</strong> CSV files only
            </p>
            <p>
              <strong>Max size:</strong> 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
