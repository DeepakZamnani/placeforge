export interface PlacedObject {
  id: string; // Unique instance ID
  furnitureId: string; // Reference to furniture library
  name: string;
  modelUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SceneState {
  projectId: string;
  objects: PlacedObject[];
  selectedObjectId: string | null;
}

// Generate unique ID
export const generateObjectId = () => `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create a new placed object
export const createPlacedObject = (
  furnitureId: string,
  name: string,
  modelUrl: string,
  position: [number, number, number] = [0, 0, 0]
): PlacedObject => ({
  id: generateObjectId(),
  furnitureId,
  name,
  modelUrl,
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
});