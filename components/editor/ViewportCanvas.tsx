'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState, useEffect, useRef } from 'react';
import ModelLoader from './ModelLoader';
import PlacedFurniture from './PlaceFurniture';
import { getProject } from '@/lib/storage';
import { PlacedObject, createPlacedObject } from '@/lib/sceneState';
import { FurnitureItem } from '@/lib/furnitureLibrary';
import * as THREE from 'three';

interface ViewportCanvasProps {
  projectId: string;
  onSelectObject: (objectId: string | null) => void;
  onPlaceFurniture: (furniture: FurnitureItem) => void;
}

export default function ViewportCanvas({ 
  projectId, 
  onSelectObject,
  onPlaceFurniture 
}: ViewportCanvasProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const orbitControlsRef = useRef<any>(null);
  
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  // Scene state
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [pendingFurniture, setPendingFurniture] = useState<FurnitureItem | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [isTransforming, setIsTransforming] = useState(false);

  // Load project from IndexedDB
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId || projectId === 'undefined' || projectId === 'null') {
        console.error('❌ Invalid project ID:', projectId);
        setLoadError(true);
        setLoading(false);
        return;
      }

      try {
        console.log('📂 Loading project from IndexedDB:', projectId);
        
        const project = await getProject(projectId);
        
        if (!project) {
          console.error('❌ Project not found:', projectId);
          setLoadError(true);
          setLoading(false);
          return;
        }

        console.log('✅ Project loaded:', project.name);
        setProjectName(project.name);

        const blob = new Blob([project.fileData], { 
          type: project.fileType || 'model/gltf-binary' 
        });
        const url = URL.createObjectURL(blob);
        
        console.log('✅ Blob URL created');
        setModelUrl(url);
        setLoading(false);

      } catch (error) {
        console.error('❌ Error loading project:', error);
        setLoadError(true);
        setLoading(false);
      }
    };

    loadProject();

    return () => {
      if (modelUrl) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [projectId]);

  // Handle drag over canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  // Handle drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const furnitureData = e.dataTransfer.getData('furniture');
    if (!furnitureData) {
      console.log('❌ No furniture data in drop');
      return;
    }

    try {
      const furniture: FurnitureItem = JSON.parse(furnitureData);
      console.log('📦 Dropped furniture:', furniture.name);
      
      const randomX = (Math.random() - 0.5) * 10;
      const randomZ = (Math.random() - 0.5) * 10;

      const newObject = createPlacedObject(
        furniture.id,
        furniture.name,
        furniture.modelUrl,
        [randomX, 0.5, randomZ]
      );

      setPlacedObjects([...placedObjects, newObject]);
      console.log('✅ Furniture placed:', newObject.name, 'at', newObject.position);
      
    } catch (error) {
      console.error('❌ Error parsing furniture data:', error);
    }
  };

  const handleObjectClick = (objectId: string) => {
    setSelectedObjectId(objectId);
    onSelectObject(objectId);
    console.log('🎯 Selected object:', objectId);
  };

  const handleTransformChange = (
    objectId: string, 
    position: [number, number, number],
    rotation: [number, number, number],
    scale: [number, number, number]
  ) => {
    setPlacedObjects(placedObjects.map(obj => 
      obj.id === objectId ? { ...obj, position, rotation, scale } : obj
    ));
  };

  const handleDeleteObject = (objectId: string) => {
    console.log('🗑️ Deleting object:', objectId);
    setPlacedObjects(placedObjects.filter(obj => obj.id !== objectId));
    if (selectedObjectId === objectId) {
      setSelectedObjectId(null);
      onSelectObject(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected object
      if (e.key === 'Delete' && selectedObjectId) {
        handleDeleteObject(selectedObjectId);
      }
      
      // Switch transform modes
      if (e.key === 'g' || e.key === 'G') {
        setTransformMode('translate');
        console.log('🔵 Transform mode: Move (Translate)');
      }
      if (e.key === 'r' || e.key === 'R') {
        setTransformMode('rotate');
        console.log('🔵 Transform mode: Rotate');
      }
      if (e.key === 's' || e.key === 'S') {
        setTransformMode('scale');
        console.log('🔵 Transform mode: Scale');
      }
      
      // Deselect on Escape
      if (e.key === 'Escape') {
        setSelectedObjectId(null);
        onSelectObject(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId]);

  return (
    <div 
      ref={canvasContainerRef}
      className={`w-full h-full relative ${isDraggingOver ? 'ring-4 ring-blue-400 ring-inset' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag over indicator */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-blue-600 text-white px-8 py-4 rounded-lg shadow-xl">
            <p className="text-lg font-semibold">Drop to place furniture</p>
          </div>
        </div>
      )}

      {/* Transform Mode Indicator */}
      {selectedObjectId && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTransformMode('translate')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                transformMode === 'translate' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="mr-1">↔️</span> Move (G)
            </button>
            <button
              onClick={() => setTransformMode('rotate')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                transformMode === 'rotate' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="mr-1">🔄</span> Rotate (R)
            </button>
            <button
              onClick={() => setTransformMode('scale')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                transformMode === 'scale' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="mr-1">⇔</span> Scale (S)
            </button>
          </div>
        </div>
      )}

      <Canvas
        shadows
        className="bg-gradient-to-b from-gray-100 to-gray-200"
      >
        <PerspectiveCamera 
          makeDefault 
          position={[10, 10, 10]} 
          fov={50}
        />

        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
        />
        <directionalLight 
          position={[-10, 10, -5]} 
          intensity={0.3}
        />

        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#374151"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />

        {/* Floor plan model */}
        <Suspense fallback={<LoadingIndicator />}>
          {loadError ? (
            <ErrorCube />
          ) : modelUrl ? (
            <ModelLoader 
              url={modelUrl}
              position={[0, 0, 0]}
              scale={1}
              onLoad={() => {
                console.log('✅ 3D model rendered successfully');
                setModelLoaded(true);
              }}
              onError={() => {
                console.error('❌ Failed to render 3D model');
                setLoadError(true);
              }}
            />
          ) : (
            <LoadingIndicator />
          )}
        </Suspense>

        {/* Placed furniture objects */}
        {placedObjects.map(obj => (
          <PlacedFurniture
            key={obj.id}
            id={obj.id}
            name={obj.name}
            modelUrl={obj.modelUrl}
            position={obj.position}
            rotation={obj.rotation}
            scale={obj.scale}
            isSelected={obj.id === selectedObjectId}
            transformMode={transformMode}
            onClick={() => handleObjectClick(obj.id)}
            onTransformChange={(pos, rot, scl) => handleTransformChange(obj.id, pos, rot, scl)}
            onTransformStart={() => {
              setIsTransforming(true);
              if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = false;
              }
            }}
            onTransformEnd={() => {
              setIsTransforming(false);
              if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = true;
              }
            }}
          />
        ))}

        <OrbitControls 
          ref={orbitControlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
          enabled={!isTransforming}
        />
      </Canvas>

      {/* Loading/Error states */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
          <div className="bg-white px-6 py-4 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm font-medium text-gray-700">Loading from database...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white px-8 py-6 rounded-lg shadow-xl text-center max-w-md mx-4">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h3>
            <p className="text-sm text-gray-600 mb-6">
              This project doesn't exist. It may have been deleted or the link is invalid.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                ← Back to Projects
              </button>
              <button
                onClick={() => window.location.href = '/upload'}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Upload New File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-3 rounded-lg shadow-lg text-xs text-gray-700 space-y-1 z-20">
        <div className="font-semibold mb-2 text-gray-900">Controls</div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Click</kbd>
          <span>Select object</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">G</kbd>
          <span>Move mode</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">R</kbd>
          <span>Rotate mode</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">S</kbd>
          <span>Scale mode</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Delete</kbd>
          <span>Remove object</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Esc</kbd>
          <span>Deselect</span>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-xs z-20 space-y-1">
        <div className="flex items-center gap-2">
          {modelLoaded ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">{projectName}</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Loading...</span>
            </>
          )}
        </div>
        <div className="text-gray-500">
          Objects: {placedObjects.length}
        </div>
        {selectedObjectId && (
          <div className="text-blue-600 font-medium">
            Mode: {transformMode}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <mesh position={[0, 2, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#fbbf24" />
    </mesh>
  );
}

function ErrorCube() {
  return (
    <mesh position={[0, 1, 0]} castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
  );
}