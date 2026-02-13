import { ReactNode } from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export default function MainLayout({ children, showSidebar = false }: MainLayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Navbar at top */}
      <Navbar />
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (conditionally rendered) */}
        {showSidebar && (
          <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            {/* Sidebar content will go here later */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700">Furniture Library</h3>
              <p className="text-xs text-gray-500 mt-1">Coming soon...</p>
            </div>
          </aside>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}