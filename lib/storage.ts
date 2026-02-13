// Simple IndexedDB wrapper for storing large files

const DB_NAME = 'interior3d';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

interface Project {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  fileData: ArrayBuffer; // The actual GLB file
}

// Initialize database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Save project
export const saveProject = async (project: Project): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(project);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Get project
// Get project
export const getProject = async (id: string): Promise<Project | null> => {
  // Validate ID first
  if (!id || id === 'undefined' || id === 'null') {
    console.error('❌ Invalid project ID provided to getProject:', id);
    return null;
  }

  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    } catch (error) {
      console.error('❌ Error in getProject:', error);
      reject(error);
    }
  });
};

// Get all projects (metadata only, without fileData for performance)
export const getAllProjects = async (): Promise<Omit<Project, 'fileData'>[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = async () => {
      const keys = request.result;
      const projects: Omit<Project, 'fileData'>[] = [];

      for (const key of keys) {
        const projectRequest = store.get(key);
        await new Promise<void>((res, rej) => {
          projectRequest.onsuccess = () => {
            const project = projectRequest.result;
            if (project) {
              // Exclude fileData for list view (performance)
              const { fileData, ...metadata } = project;
              projects.push(metadata);
            }
            res();
          };
          projectRequest.onerror = () => rej(projectRequest.error);
        });
      }

      resolve(projects);
    };
    request.onerror = () => reject(request.error);
  });
};

// Delete project
export const deleteProject = async (id: string): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Clear all projects
export const clearAllProjects = async (): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};