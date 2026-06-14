import { state, els, bindElements, setStatus, updateProjectName } from './state.js';
import { initLayers, renderLayers, addLayer, toggleLayer, deleteLayer, makePixels } from './layers.js';
import { draw } from './renderer.js';
import { saveHistory, undo, redo } from './history.js';
import { bindTools } from './tools.js';
import { saveProject, loadProject, newProject, renameProject, refreshProjectList } from './storage.js';
import { bindIO } from './io.js';
import { bindPalette, renderPalette } from './palette.js';

function autoZoomForSize(size) {
  if (size >= 128) return 2;
  if (size >= 64) return 1.5;
  return 1;
}

function applyZoom() {
  const visualSize = Math.round(512 * state.zoom);
  state.canvas.style.width = visualSize + 'px';
  state.canvas.style.height = visualSize + 'px';
  setStatus('Zoom ' + Math.round(state.zoom * 100) + '%');
}

function bindTabs() {
  const tabs = document.querySelectorAll('[data-panel]');
  const pages = document.querySelectorAll('.panel-page');

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].onclick = function () {
      const target = this.dataset.panel;
      for (let j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
      for (let k = 0; k < pages.length; k++) pages[k].classList.remove('active');
      this.classList.add('active');
      document.getElementById(target).classList.add('active');
      if (target === 'libraryPanel') refreshProjectList();
      if (target === 'palettePanel') renderPalette();
    };
  }
}

function bindUI() {
  els.sizeSelect.onchange = () => {
    saveHistory();
    state.gridSize = Number(els.sizeSelect.value);
    initLayers();
    state.zoom = autoZoomForSize(state.gridSize);
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
    state.zoom = Math.min(4, state.zoom + 0.25);
    applyZoom();
  };

  els.zoomOutBtn.onclick = () => {
    state.zoom = Math.max(0.75, state.zoom - 0.25);
    applyZoom();
  };

  els.zoomResetBtn.onclick = () => {
    state.zoom = autoZoomForSize(state.gridSize);
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
  els.newProjectBtn.onclick = newProject;
  els.renameProjectBtn.onclick = renameProject;
  els.undoBtn.onclick = undo;
  els.redoBtn.onclick = redo;
}

bindElements();
initLayers();
state.zoom = autoZoomForSize(state.gridSize);
updateProjectName();
renderLayers();
applyZoom();
bindTabs();
bindPalette();
bindTools();
bindIO();
bindUI();
refreshProjectList();
draw();
