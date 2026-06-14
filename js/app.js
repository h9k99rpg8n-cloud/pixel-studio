import { state, els, bindElements, setStatus } from './state.js';
import { initLayers, renderLayers, addLayer, toggleLayer, deleteLayer, makePixels } from './layers.js';
import { draw } from './renderer.js';
import { saveHistory, undo, redo } from './history.js';
import { bindTools } from './tools.js';
import { saveProject, loadProject } from './storage.js';
import { bindIO } from './io.js';

function applyZoom() {
  const visualSize = Math.round(512 * state.zoom);
  state.canvas.style.width = visualSize + 'px';
  state.canvas.style.height = visualSize + 'px';
  setStatus('Zoom ' + Math.round(state.zoom * 100) + '%');
}

function bindUI() {
  els.sizeSelect.onchange = () => {
    saveHistory();
    state.gridSize = Number(els.sizeSelect.value);
    initLayers();
    state.zoom = state.gridSize === 64 ? 1.5 : 1;
    applyZoom();
    renderLayers();
    draw();
    setStatus('Nuevo lienzo ' + state.gridSize + ' x ' + state.gridSize);
  };

  els.clearBtn.onclick = () => {
    saveHistory();
    state.layers[state.active].pixels = makePixels();
    draw();
    setStatus('Capa limpia');
  };

  els.zoomInBtn.onclick = () => {
    state.zoom = Math.min(3, state.zoom + 0.25);
    applyZoom();
  };

  els.zoomOutBtn.onclick = () => {
    state.zoom = Math.max(0.75, state.zoom - 0.25);
    applyZoom();
  };

  els.zoomResetBtn.onclick = () => {
    state.zoom = 1;
    applyZoom();
    els.canvasScroll.scrollLeft = 0;
    els.canvasScroll.scrollTop = 0;
  };

  els.addLayerBtn.onclick = () => {
    saveHistory();
    addLayer();
  };

  els.toggleLayerBtn.onclick = () => {
    saveHistory();
    toggleLayer();
  };

  els.deleteLayerBtn.onclick = () => {
    saveHistory();
    deleteLayer();
  };

  els.saveBtn.onclick = saveProject;
  els.loadBtn.onclick = loadProject;
  els.undoBtn.onclick = undo;
  els.redoBtn.onclick = redo;
}

bindElements();
initLayers();
renderLayers();
applyZoom();
bindTools();
bindIO();
bindUI();
draw();
