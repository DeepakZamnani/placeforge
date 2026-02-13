'use client';

import { useState, useEffect } from 'react';
import { getFurnitureLibrary, FURNITURE_CATEGORIES, FurnitureItem } from '@/lib/furnitureLibrary';

interface FurnitureLibraryProps {
  onPlaceFurniture: (furniture: FurnitureItem) => void;
}

export default function FurnitureLibrary({ onPlaceFurniture }: FurnitureLibraryProps) {
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const library = getFurnitureLibrary();
    setFurniture(library);
  }, []);

  const filteredFurniture = furniture.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = FURNITURE_CATEGORIES.map(cat => ({
    ...cat,
    count: cat.id === 'all' 
      ? furniture.length 
      : furniture.filter(f => f.category === cat.id).length
  }));

  const handleDragStart = (e: React.DragEvent, item: FurnitureItem) => {
    console.log('🎯 Started dragging:', item.name);
    // Store the furniture data in the drag event
    e.dataTransfer.setData('furniture', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Optional: Create a drag image
    if (e.dataTransfer.setDragImage) {
      const dragImage = document.createElement('div');
      dragImage.style.fontSize = '48px';
      dragImage.textContent = item.thumbnail;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 24, 24);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Furniture Library</h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search furniture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg 
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-2">
          {categoryCounts.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition flex items-center gap-1.5
                ${selectedCategory === category.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className="opacity-70">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Furniture Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredFurniture.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No furniture found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredFurniture.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => onPlaceFurniture(item)}
                className="group aspect-square bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center p-3 cursor-grab active:cursor-grabbing"
              >
                <div className="text-4xl mb-2 pointer-events-none">{item.thumbnail}</div>
                <p className="text-xs text-gray-700 font-medium text-center group-hover:text-blue-600 line-clamp-2 pointer-events-none">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 mt-1 pointer-events-none">
                  {item.dimensions.width}×{item.dimensions.depth}m
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Instructions */}
      <div className="p-4 border-t border-gray-200 bg-blue-50">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-blue-900">
            <p className="font-semibold mb-1">How to place:</p>
            <p className="text-blue-700">• <strong>Drag & drop</strong> into scene</p>
            <p className="text-blue-700">• Or <strong>click</strong> then click ground</p>
          </div>
        </div>
      </div>
    </aside>
  );
}