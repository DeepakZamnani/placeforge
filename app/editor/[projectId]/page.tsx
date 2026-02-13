'use client';

import { useState, use } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import EditorToolbar from '@/components/editor/EditorToolbar';
import FurnitureLibrary from '@/components/editor/FurnitureLibrary';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import ViewportCanvas from '@/components/editor/ViewportCanvas';

interface EditorPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  // Unwrap the params Promise
  const { projectId } = use(params);
  
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [showFurnitureLibrary, setShowFurnitureLibrary] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

  return (
    <MainLayout showSidebar={false}>
      <div className="h-full flex flex-col">
        {/* Top Toolbar */}
        <EditorToolbar 
          projectId={projectId}
          onToggleFurnitureLibrary={() => setShowFurnitureLibrary(!showFurnitureLibrary)}
          onToggleProperties={() => setShowProperties(!showProperties)}
        />

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Furniture Library */}
          {showFurnitureLibrary && (
            <FurnitureLibrary />
          )}

          {/* Center - 3D Canvas */}
          <div className="flex-1 bg-gray-100 relative">
            <ViewportCanvas 
              projectId={projectId}
              onSelectObject={setSelectedObject}
            />
          </div>

          {/* Right Sidebar - Properties Panel */}
          {showProperties && (
            <PropertiesPanel 
              selectedObjectId={selectedObject}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}