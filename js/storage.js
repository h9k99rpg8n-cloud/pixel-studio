import { state, setStatus, els, updateProjectName } from './state.js';
import { copyLayers, renderLayers, initLayers } from './layers.js';
import { saveHistory } from './history.js';
import { draw } from './renderer.js';

const DB_NAME = 'PixelStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

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
    tx.objectStore(STORE_NAME).put(project);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getProject(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllProjects() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function newId() {
  return 'project-' + Date.now();
}

function applyProject(project) {
  saveHistory();
  state.currentProjectId = project.id;
  state.currentProjectName = project.name || 'Proyecto sin nombre';
  state.gridSize = project.size;
  state.active = project.active || 0;
  state.layers = project.layers ? copyLayers(project.layers) : [{ name: 'Capa 1', visible: true, pixels: project.data }];
  els.sizeSelect.value = String(state.gridSize);
  updateProjectName();
  renderLayers();
  draw();
}

export async function refreshProjectList() {
  if (!els.projectList) return;
  const projects = await getAllProjects();
  projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  els.projectList.innerHTML = '';
  if (!projects.length) {
    els.projectList.innerHTML = '<div class="empty-projects">No hay proyectos guardados</div>';
    return;
  }
  projects.forEach((project) => {
    const button = document.createElement('button');
    button.className = 'project-card';
    if (project.id === state.currentProjectId) button.className += ' active';
    button.textContent = project.name || 'Proyecto sin nombre';
    button.onclick = async () => {
      const fullProject = await getProject(project.id);
      if (fullProject) {
        applyProject(fullProject);
        setStatus('Proyecto abierto');
        refreshProjectList();
      }
    };
    els.projectList.appendChild(button);
  });
}

export async function saveProject() {
  try {
    await putProject({
      id: state.currentProjectId,
      name: state.currentProjectName,
      updatedAt: Date.now(),
      size: state.gridSize,
      active: state.active,
      layers: copyLayers(state.layers)
    });
    setStatus('Proyecto guardado');
    refreshProjectList();
  } catch (error) {
    setStatus('No se pudo guardar');
  }
}

export async function loadProject() {
  try {
    const project = await getProject(state.currentProjectId);
    if (!project) {
      setStatus('No hay proyecto guardado');
      return;
    }
    applyProject(project);
    setStatus('Proyecto cargado');
  } catch (error) {
    setStatus('No se pudo cargar');
  }
}

export function newProject() {
  saveHistory();
  state.currentProjectId = newId();
  state.currentProjectName = 'Proyecto nuevo';
  state.gridSize = Number(els.sizeSelect.value);
  initLayers();
  updateProjectName();
  renderLayers();
  draw();
  setStatus('Nuevo proyecto creado');
}

export async function renameProject() {
  const name = prompt('Nombre del proyecto:', state.currentProjectName);
  if (!name || !name.trim()) return;
  state.currentProjectName = name.trim();
  updateProjectName();
  await saveProject();
  setStatus('Proyecto renombrado');
}
