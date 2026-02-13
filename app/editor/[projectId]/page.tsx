'use client';

import { useState, use } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import EditorToolbar from '@/components/editor/EditorToolbar';
import FurnitureLibrary from '@/components/editor/FurnitureLibrary';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import ViewportCanvas from '@/components/editor/ViewportCanvas';
import { FurnitureItem } from '@/lib/furnitureLibrary';

interface EditorPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const { projectId } = use(params);
  
  console.log('🎨 Editor page loaded for project:', projectId);
  
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [showFurnitureLibrary, setShowFurnitureLibrary] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [pendingFurniture, setPendingFurniture] = useState<FurnitureItem | null>(null);

  const handlePlaceFurniture = (furniture: FurnitureItem) => {
    console.log('🪑 Placing furniture:', furniture.name);
    setPendingFurniture(furniture);
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="h-full flex flex-col">
        <EditorToolbar 
          projectId={projectId}
          onToggleFurnitureLibrary={() => setShowFurnitureLibrary(!showFurnitureLibrary)}
          onToggleProperties={() => setShowProperties(!showProperties)}
        />

        <div className="flex-1 flex overflow-hidden">
          {showFurnitureLibrary && (
            <FurnitureLibrary onPlaceFurniture={handlePlaceFurniture} />
          )}

          <div className="flex-1 bg-gray-100 relative">
            <ViewportCanvas 
              projectId={projectId}
              onSelectObject={setSelectedObject}
              onPlaceFurniture={handlePlaceFurniture}
            />
          </div>

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