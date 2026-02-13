import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Logo / Brand */}
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Interior3D
        </Link>
        
        {/* Navigation links */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/projects" 
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Projects
          </Link>
          <Link 
            href="/library" 
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Furniture Library
          </Link>
        </div>
      </div>
      
      {/* Right side - User menu */}
      <div className="flex items-center gap-4">
        {/* New Project button */}
        <Link
          href="/upload"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          New Project
        </Link>
        
        {/* User avatar placeholder */}
        <button className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-300 transition">
          U
        </button>
      </div>
    </nav>
  );
}