'use client';

import { useRef, useState, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface PlacedFurnitureProps {
  id: string;
  name: string;
  modelUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  transformMode: 'translate' | 'rotate' | 'scale';
  onClick: () => void;
  onTransformChange: (position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  onTransformStart: () => void;
  onTransformEnd: () => void;
}

export default function PlacedFurniture({
  id,
  name,
  modelUrl,
  position,
  rotation,
  scale,
  isSelected,
  transformMode,
  onClick,
  onTransformChange,
  onTransformStart,
  onTransformEnd,
}: PlacedFurnitureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Load the GLB model
  useEffect(() => {
    const loader = new GLTFLoader();
    
    console.log('🔄 Loading furniture model:', name, 'from:', modelUrl);
    setLoading(true);
    setError(false);
    
    loader.load(
      modelUrl,
      (gltf) => {
        console.log('✅ Furniture model loaded successfully:', name);
        
        // Store the model
        modelRef.current = gltf.scene;
        
        // Enable shadows on all meshes
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        setLoading(false);
      },
      (progress) => {
        // Log loading progress
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`📊 Loading ${name}: ${percent.toFixed(0)}%`);
        }
      },
      (error) => {
        console.error('❌ Error loading furniture model:', name);
        console.error('URL:', modelUrl);
        console.error('Error details:', error);
        setError(true);
        setLoading(false);
      }
    );

    // Cleanup
    return () => {
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
    };
  }, [modelUrl, name]);

  // Handle transform change
  const handleTransform = () => {
    if (groupRef.current) {
      const pos = groupRef.current.position;
      const rot = groupRef.current.rotation;
      const scl = groupRef.current.scale;
      
      onTransformChange(
        [pos.x, pos.y, pos.z],
        [rot.x, rot.y, rot.z],
        [scl.x, scl.y, scl.z]
      );
    }
  };

  return (
    <>
      {/* Transform Controls */}
      {isSelected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          onMouseDown={onTransformStart}
          onMouseUp={onTransformEnd}
          onChange={handleTransform}
        />
      )}
      
      <group
        ref={groupRef}
        position={position}
        rotation={[rotation[0], rotation[1], rotation[2]]}
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Show loading state */}
        {loading && (
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#fbbf24" wireframe />
          </mesh>
        )}

        {/* Show error state */}
        {error && (
          <group>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            {/* Error label */}
            <mesh position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]}>
              <planeGeometry args={[2, 0.4]} />
              <meshBasicMaterial color="#7f1d1d" transparent opacity={0.9} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}

        {/* Show the actual loaded model */}
        {!loading && !error && modelRef.current && (
          <primitive object={modelRef.current.clone()} />
        )}

        {/* Selection outline */}
        {isSelected && !loading && (
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(2, 2, 2)]} />
            <lineBasicMaterial color="#3b82f6" linewidth={3} />
          </lineSegments>
        )}

        {/* Hover/Selection indicator */}
        {(isSelected || hovered) && !loading && (
          <group position={[0, 1.5, 0]}>
            {/* Background */}
            <mesh>
              <planeGeometry args={[Math.max(2, name.length * 0.15), 0.3]} />
              <meshBasicMaterial 
                color={isSelected ? "#1e40af" : "#3b82f6"} 
                transparent 
                opacity={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}
      </group>
    </>
  );
}