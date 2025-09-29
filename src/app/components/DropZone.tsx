'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection, ErrorCode } from 'react-dropzone';

interface DropZoneProps {
  onFileUpload: (file: File) => void;
  isUploading?: boolean;
}

export default function DropZone({ onFileUpload, isUploading = false }: DropZoneProps) {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      console.log('=== DropZone onDrop called ===');
      console.log('Accepted files:', acceptedFiles.length, acceptedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
      console.log('Rejected files:', rejectedFiles.length, rejectedFiles.map(f => ({ name: f.file.name, errors: f.errors })));
      setError('');

      // Check for rejected files
      if (rejectedFiles.length > 0) {
        const rejectionReasons = rejectedFiles.map(fileRejection => {
          if (fileRejection.errors.some((error) => error.code === ErrorCode.FileTooLarge)) {
            return 'File is too large. Please select a file smaller than 10MB.';
          }
          if (fileRejection.errors.some((error) => error.code === ErrorCode.FileInvalidType)) {
            return 'Please select only CSV files.';
          }
          return 'File was rejected.';
        });
        setError(rejectionReasons[0]);
        return;
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        console.log('File accepted by DropZone:', file.name, file.size, file.type);
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/csv': ['.csv'],
      'text/comma-separated-values': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
    onDropAccepted: (files) => {
      console.log('=== onDropAccepted called ===');
      console.log('Files accepted:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    },
    onDropRejected: (files) => {
      console.log('=== onDropRejected called ===');
      console.log('Files rejected:', files.map(f => ({ name: f.file.name, errors: f.errors })));
    },
    onError: (error) => {
      console.error('=== DropZone error ===', error);
    },
  });

  console.log('DropZone props:', { getRootProps: typeof getRootProps, getInputProps: typeof getInputProps });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Uploading...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-blue-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-blue-600 font-medium">Drop your CSV file here</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag & drop your CSV file here, or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Only CSV files up to 10MB are supported
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
