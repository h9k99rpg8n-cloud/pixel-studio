import { state, els, bindElements, setStatus, updateProjectName } from './state.js';
import { initLayers, renderLayers, addLayer, toggleLayer, deleteLayer, makePixels } from './layers.js';
import { draw } from './renderer.js';
import { saveHistory, undo, redo } from './history.js';
import { bindTools } from './tools.js';
import { saveProject, loadProject, newProject, renameProject, refreshProjectList } from './storage.js';
import { bindIO } from './io.js';
import { bindPalette, renderPalette } from './palette.js';

let pinchStartDistance = 0;
let pinchStartZoom = 1;

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

function distance(touchA, touchB) {
  const dx = touchA.clientX - touchB.clientX;
  const dy = touchA.clientY - touchB.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function bindPinchZoom() {
  els.canvasScroll.addEventListener('touchstart', (event) => {
    if (event.touches.length === 2) {
      pinchStartDistance = distance(event.touches[0], event.touches[1]);
      pinchStartZoom = state.zoom;
    }
  }, { passive: true });

  els.canvasScroll.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2 && pinchStartDistance > 0) {
      event.preventDefault();
      const currentDistance = distance(event.touches[0], event.touches[1]);
      const nextZoom = pinchStartZoom * (currentDistance / pinchStartDistance);
      state.zoom = Math.min(4, Math.max(0.75, nextZoom));
      applyZoom();
    }
  }, { passive: false });

  els.canvasScroll.addEventListener('touchend', () => {
    pinchStartDistance = 0;
  }, { passive: true });
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
bindPinchZoom();
bindPalette();
bindTools();
bindIO();
bindUI();
refreshProjectList();
draw();

if (window.lucide) {
  window.lucide.createIcons();
}
