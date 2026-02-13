export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  modelUrl: string;
  thumbnail: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

export const FURNITURE_CATEGORIES = [
  { id: 'all', name: 'All', icon: '🏠' },
  { id: 'seating', name: 'Seating', icon: '🪑' },
  { id: 'tables', name: 'Tables', icon: '🪑' },
  { id: 'storage', name: 'Storage', icon: '📦' },
  { id: 'beds', name: 'Beds', icon: '🛏️' },
  { id: 'lighting', name: 'Lighting', icon: '💡' },
  { id: 'decor', name: 'Decor', icon: '🖼️' },
];

// Default furniture library
export const DEFAULT_FURNITURE: FurnitureItem[] = [
  {
    id: 'sofa-1',
    name: 'Modern Sofa',
    category: 'seating',
    modelUrl: '/models/sofa.glb',
    thumbnail: '🛋️',
    dimensions: { width: 2, height: 0.8, depth: 0.9 }
  },
  {
    id: 'chair-1',
    name: 'Dining Chair',
    category: 'seating',
    modelUrl: '/models/chair.glb',
    thumbnail: '🪑',
    dimensions: { width: 0.5, height: 1, depth: 0.5 }
  },
  {
    id: 'table-1',
    name: 'Dining Table',
    category: 'tables',
    modelUrl: '/models/dinning.glb',
    thumbnail: '🍽️',
    dimensions: { width: 1.5, height: 0.75, depth: 0.9 }
  },
  {
    id: 'bed-1',
    name: 'Double Bed',
    category: 'beds',
    modelUrl: '/models/bed.glb',
    thumbnail: '🛏️',
    dimensions: { width: 2, height: 0.6, depth: 1.4 }
  },
  {
    id: 'bookshelf-1',
    name: 'Bookshelf',
    category: 'storage',
    modelUrl: '/furniture/bookshelf.glb',
    thumbnail: '📚',
    dimensions: { width: 1, height: 2, depth: 0.4 }
  },
  {
    id: 'lamp-1',
    name: 'Floor Lamp',
    category: 'lighting',
    modelUrl: '/furniture/lamp.glb',
    thumbnail: '💡',
    dimensions: { width: 0.3, height: 1.8, depth: 0.3 }
  },
];

// LocalStorage keys
const LIBRARY_KEY = 'interior3d_furniture_library';

// Get furniture library
export const getFurnitureLibrary = (): FurnitureItem[] => {
  if (typeof window === 'undefined') return DEFAULT_FURNITURE;
  
  const stored = localStorage.getItem(LIBRARY_KEY);
  if (!stored) {
    // Initialize with defaults
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(DEFAULT_FURNITURE));
    return DEFAULT_FURNITURE;
  }
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing furniture library:', error);
    return DEFAULT_FURNITURE;
  }
};

// Add furniture item
export const addFurnitureItem = (item: FurnitureItem): void => {
  const library = getFurnitureLibrary();
  library.push(item);
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
};

// Remove furniture item
export const removeFurnitureItem = (id: string): void => {
  const library = getFurnitureLibrary();
  const filtered = library.filter(item => item.id !== id);
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(filtered));
};

// Reset to defaults
export const resetFurnitureLibrary = (): void => {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(DEFAULT_FURNITURE));
};