'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllProjects, deleteProject, clearAllProjects } from '@/lib/storage';

interface Project {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        console.log('📂 Loading all projects...');
        const allProjects = await getAllProjects();
        console.log('✅ Found', allProjects.length, 'projects');
        
        allProjects.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setProjects(allProjects as Project[]);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading projects:', error);
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleNewProject = () => {
    console.log('🆕 Navigating to upload page');
    router.push('/upload');
  };

  const handleOpenProject = (projectId: string) => {
    console.log('🚀 Opening project:', projectId);
    router.push(`/editor/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting project:', projectId);
      await deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      console.log('✅ Project deleted');
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('⚠️ This will delete ALL projects. Are you sure?')) {
      return;
    }

    try {
      console.log('🗑️ Clearing all projects...');
      await clearAllProjects();
      setProjects([]);
      console.log('✅ All projects cleared');
    } catch (error) {
      console.error('❌ Error clearing projects:', error);
      alert('Failed to clear projects');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - ALWAYS VISIBLE */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition"
            >
              Interior3D
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => router.push('/')}
                className="text-sm font-medium text-blue-600"
              >
                Projects
              </button>
            </nav>
          </div>
          
          <button
            onClick={handleNewProject}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          /* Loading State */
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg 
                  className="w-12 h-12 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Interior3D
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Transform your floor plans into interactive 3D spaces. Upload a GLB model, place furniture, and design beautiful interiors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleNewProject}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Project
              </button>
              
              
              <a
                href="https://sketchfab.com/3d-models?features=downloadable"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Download Test Models
              </a>
            </div>

            {/* Features Grid */}
            <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
              <div className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Upload</h3>
                <p className="text-sm text-gray-600">
                  Drag and drop your GLB/GLTF floor plans. Support for files up to 50MB.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3D Viewer</h3>
                <p className="text-sm text-gray-600">
                  Explore your space in full 3D with smooth camera controls and realistic lighting.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Furniture Library</h3>
                <p className="text-sm text-gray-600">
                  Place and arrange furniture with drag-and-drop. Customize every detail.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Projects List */
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {projects.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={handleNewProject}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Project
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className="group bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition overflow-hidden cursor-pointer"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
                    <svg 
                      className="w-20 h-20 text-blue-400 group-hover:text-blue-600 transition" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-4">
                      <span className="text-white text-sm font-medium">Click to open</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition z-10"
                      title="Delete project"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition">
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 truncate">
                      {project.fileName}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>{formatFileSize(project.fileSize)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2024 Interior3D. Built with Next.js, Three.js & IndexedDB
            </p>
            <div className="flex items-center gap-6">
              <a 
                href="https://sketchfab.com/3d-models?features=downloadable" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Free Models
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}