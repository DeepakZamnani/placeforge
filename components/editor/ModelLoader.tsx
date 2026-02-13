'use client';

import { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Group } from 'three';

interface ModelLoaderProps {
  url: string;
  position?: [number, number, number];
  scale?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function ModelLoader({ 
  url, 
  position = [0, 0, 0], 
  scale = 1,
  onLoad,
  onError 
}: ModelLoaderProps) {
  const [scene, setScene] = useState<Group | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadModel = async () => {
      try {
        console.log('🔄 Loading GLTF from:', url);
        
        const loader = new GLTFLoader();
        
        loader.load(
          url,
          (gltf) => {
            if (cancelled) return;
            
            console.log('✅ GLTF loaded successfully');
            setScene(gltf.scene);
            
            if (onLoad) {
              onLoad();
            }
          },
          (progress) => {
            // Loading progress
            const percent = (progress.loaded / progress.total) * 100;
            console.log(`📊 Loading: ${percent.toFixed(0)}%`);
          },
          (error) => {
            if (cancelled) return;
            
            console.error('❌ GLTF load error:', error);
            if (onError) {
              onError();
            }
          }
        );
      } catch (error) {
        console.error('❌ Error in loadModel:', error);
        if (onError) {
          onError();
        }
      }
    };

    loadModel();

    return () => {
      cancelled = true;
    };
  }, [url, onLoad, onError]);

  if (!scene) {
    return null;
  }

  return (
    <primitive 
      object={scene.clone()} 
      position={position} 
      scale={scale}
    />
  );
}