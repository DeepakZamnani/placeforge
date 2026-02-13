'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import ModelLoader from './ModelLoader';
import { getProject } from '@/lib/storage';

interface ViewportCanvasProps {
  projectId: string;
  onSelectObject: (objectId: string | null) => void;
}

export default function ViewportCanvas({ projectId, onSelectObject }: ViewportCanvasProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  // Load project from IndexedDB
  useEffect(() => {
    const loadProject = async () => {
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

        // Convert ArrayBuffer to Blob URL
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

    // Cleanup
    return () => {
      if (modelUrl) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [projectId]);

  return (
    <div className="w-full h-full relative">
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

        <OrbitControls 
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
          <div className="bg-white px-6 py-4 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm font-medium text-gray-700">
                Loading from database...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Model Rendering Overlay */}
      {!loading && !modelLoaded && !loadError && modelUrl && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
          <div className="bg-white px-6 py-4 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm font-medium text-gray-700">
                Rendering {projectName}...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white px-6 py-4 rounded-lg shadow-xl text-center max-w-md mx-4">
            <div className="text-red-500 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Model</h3>
            <p className="text-sm text-gray-600 mb-4">
              The 3D model could not be loaded. The file might be corrupted or in an unsupported format.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Go Home
              </button>
              <button
                onClick={() => window.location.href = '/upload'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Left Click</kbd>
          <span>Rotate</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Right Click</kbd>
          <span>Pan</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Scroll</kbd>
          <span>Zoom</span>
        </div>
      </div>

      {/* Model Status */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-xs z-20">
        <div className="flex items-center gap-2">
          {modelLoaded ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">{projectName}</span>
            </>
          ) : loadError ? (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Load failed</span>
            </>
          ) : loading ? (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Loading...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Rendering...</span>
            </>
          )}
        </div>
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