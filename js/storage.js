import { state, setStatus, els } from './state.js';
import { copyLayers, renderLayers } from './layers.js';
import { saveHistory } from './history.js';
import { draw } from './renderer.js';

const DB_NAME = 'PixelStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const DEFAULT_PROJECT_ID = 'main-project';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putProject(project) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(project);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getProject(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function applyProject(project) {
  saveHistory();
  state.gridSize = project.size;
  state.active = project.active || 0;
  state.layers = project.layers ? copyLayers(project.layers) : [{
    name: 'Capa 1',
    visible: true,
    pixels: project.data
  }];
  els.sizeSelect.value = String(state.gridSize);
  renderLayers();
  draw();
}

export async function saveProject() {
  try {
    await putProject({
      id: DEFAULT_PROJECT_ID,
      name: 'Proyecto principal',
      updatedAt: Date.now(),
      size: state.gridSize,
      active: state.active,
      layers: copyLayers(state.layers)
    });
    setStatus('Proyecto guardado en IndexedDB');
  } catch (error) {
    setStatus('No se pudo guardar');
  }
}

export async function loadProject() {
  try {
    const project = await getProject(DEFAULT_PROJECT_ID);
    if (!project) {
      setStatus('No hay proyecto guardado');
      return;
    }
    applyProject(project);
    setStatus('Proyecto cargado desde IndexedDB');
  } catch (error) {
    setStatus('No se pudo cargar');
  }
}
