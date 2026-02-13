'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveProject } from '@/lib/storage';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    
    const validExtensions = ['.glb', '.gltf'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Please upload a GLB or GLTF file');
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      console.log('📤 Starting upload...', file.name);
      
      // Generate unique project ID
      const projectId = `project-${Date.now()}`;
      
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ File read:', arrayBuffer.byteLength, 'bytes');
      
      // Create project object
      const project = {
        id: projectId,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'model/gltf-binary',
        createdAt: new Date().toISOString(),
        fileData: arrayBuffer,
      };
      
      // Save to IndexedDB
      await saveProject(project);
      console.log('✅ Project saved to IndexedDB');
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to editor
      console.log('✅ Navigating to editor:', projectId);
      router.push(`/editor/${projectId}`);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError('Failed to save project. Please try again.');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Projects</span>
          </button>
          
          <h1 className="text-xl font-bold text-gray-900">Interior3D</h1>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <div className="h-[calc(100vh-73px)] flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Floor Plan
            </h2>
            <p className="text-gray-600">
              Upload a 3D floor plan file (GLB or GLTF format) to get started
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-colors
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
              ${file ? 'border-green-500 bg-green-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf"
              onChange={handleChange}
              className="hidden"
            />

            {!file ? (
              <>
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Browse Files
                </button>

                <p className="text-xs text-gray-400 mt-4">
                  Supports: GLB, GLTF (Max 50MB)
                </p>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <p className="text-lg font-medium text-gray-900 mb-1">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {formatFileSize(file.size)}
                </p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setFile(null);
                      setError(null);
                    }}
                    disabled={uploading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span>Open in Editor</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Info Cards */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">File Format</p>
              <p className="text-sm font-semibold text-gray-900">GLB / GLTF</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Max File Size</p>
              <p className="text-sm font-semibold text-gray-900">50 MB</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Storage</p>
              <p className="text-sm font-semibold text-gray-900">IndexedDB</p>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Need a test file?</h3>
            <p className="text-xs text-blue-700 mb-3">
              Download free GLB models from these sites:
            </p>
            <div className="flex flex-wrap gap-2">
              <a 
                href="https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1 bg-white text-blue-700 rounded-full hover:bg-blue-100 transition"
              >
                Sketchfab ↗
              </a>
              <a 
                href="https://poly.pizza/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1 bg-white text-blue-700 rounded-full hover:bg-blue-100 transition"
              >
                Poly Pizza ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}