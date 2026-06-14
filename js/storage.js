import { state, setStatus, els } from './state.js';
import { copyLayers, renderLayers } from './layers.js';
import { saveHistory } from './history.js';
import { draw } from './renderer.js';

export function saveProject() {
  localStorage.setItem('pixelStudioProject', JSON.stringify({
    size: state.gridSize,
    active: state.active,
    layers: state.layers
  }));
  setStatus('Proyecto guardado');
}

export function loadProject() {
  const raw = localStorage.getItem('pixelStudioProject');
  if (!raw) {
    setStatus('No hay proyecto guardado');
    return;
  }

  try {
    const project = JSON.parse(raw);
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
    setStatus('Proyecto cargado');
  } catch (error) {
    setStatus('No se pudo cargar');
  }
}
