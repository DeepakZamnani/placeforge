'use client';

import { useState } from 'react';

// Mock furniture data
const FURNITURE_CATEGORIES = [
  { id: 'all', name: 'All', count: 48 },
  { id: 'seating', name: 'Seating', count: 12 },
  { id: 'tables', name: 'Tables', count: 8 },
  { id: 'storage', name: 'Storage', count: 10 },
  { id: 'beds', name: 'Beds', count: 6 },
  { id: 'lighting', name: 'Lighting', count: 12 },
];

const MOCK_FURNITURE = [
  { id: '1', name: 'Modern Sofa', category: 'seating', thumbnail: '🛋️' },
  { id: '2', name: 'Dining Table', category: 'tables', thumbnail: '🪑' },
  { id: '3', name: 'Bookshelf', category: 'storage', thumbnail: '📚' },
  { id: '4', name: 'Bed Frame', category: 'beds', thumbnail: '🛏️' },
  { id: '5', name: 'Floor Lamp', category: 'lighting', thumbnail: '💡' },
  { id: '6', name: 'Armchair', category: 'seating', thumbnail: '🪑' },
  { id: '7', name: 'Coffee Table', category: 'tables', thumbnail: '☕' },
  { id: '8', name: 'Wardrobe', category: 'storage', thumbnail: '🚪' },
];

export default function FurnitureLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFurniture = MOCK_FURNITURE.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          {FURNITURE_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition
                ${selectedCategory === category.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category.name}
              <span className="ml-1 opacity-70">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Furniture Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredFurniture.map(item => (
            <button
              key={item.id}
              className="group aspect-square bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition flex flex-col items-center justify-center p-3 cursor-grab active:cursor-grabbing"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('furnitureId', item.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <div className="text-4xl mb-2">{item.thumbnail}</div>
              <p className="text-xs text-gray-700 font-medium text-center group-hover:text-blue-600">
                {item.name}
              </p>
            </button>
          ))}
        </div>

        {filteredFurniture.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No furniture found</p>
          </div>
        )}
      </div>
    </aside>
  );
}