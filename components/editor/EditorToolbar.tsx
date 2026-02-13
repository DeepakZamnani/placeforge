'use client';

import Link from 'next/link';
import { useState } from 'react';

interface EditorToolbarProps {
  projectId: string;
  onToggleFurnitureLibrary: () => void;
  onToggleProperties: () => void;
}

export default function EditorToolbar({ 
  projectId, 
  onToggleFurnitureLibrary,
  onToggleProperties 
}: EditorToolbarProps) {
  const [projectName, setProjectName] = useState('Untitled Project');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save logic
    setTimeout(() => {
      setIsSaving(false);
      console.log('Project saved');
    }, 1000);
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Back button */}
        <Link 
          href="/projects"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Back to projects"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Project name */}
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          placeholder="Project name"
        />

        {/* Save status */}
        <span className="text-xs text-gray-500">
          {isSaving ? 'Saving...' : 'All changes saved'}
        </span>
      </div>

      {/* Center Section - Tools */}
      <div className="flex items-center gap-2">
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Select tool"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </button>

        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Move tool"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Rotate tool"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Undo"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Redo"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Toggle panels */}
        <button
          onClick={onToggleFurnitureLibrary}
          className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
          title="Toggle furniture library"
        >
          Library
        </button>

        <button
          onClick={onToggleProperties}
          className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
          title="Toggle properties panel"
        >
          Properties
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}