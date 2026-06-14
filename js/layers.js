import { state, els, setStatus } from './state.js';
import { draw } from './renderer.js';

export function makePixels() {
  const data = [];
  for (let y = 0; y < state.gridSize; y++) {
    const row = [];
    for (let x = 0; x < state.gridSize; x++) row.push('');
    data.push(row);
  }
  return data;
}

export function copyPixels(pixels) {
  return pixels.map((row) => row.slice());
}

export function copyLayers(layers) {
  return layers.map((layer) => ({
    name: layer.name,
    visible: layer.visible,
    pixels: copyPixels(layer.pixels)
  }));
}

export function initLayers() {
  state.layers = [{ name: 'Capa 1', visible: true, pixels: makePixels() }];
  state.active = 0;
}

export function getActiveLayer() {
  return state.layers[state.active];
}

export function renderLayers() {
  els.layersPanel.innerHTML = '';

  for (let i = state.layers.length - 1; i >= 0; i--) {
    const button = document.createElement('button');
    button.className = 'layer-chip';
    if (i === state.active) button.className += ' active';
    if (!state.layers[i].visible) button.className += ' hidden-layer';
    button.textContent = state.layers[i].name + (state.layers[i].visible ? '' : ' oculta');
    button.dataset.layer = String(i);
    button.onclick = () => {
      state.active = Number(button.dataset.layer);
      renderLayers();
      setStatus('Capa activa: ' + state.layers[state.active].name);
    };
    els.layersPanel.appendChild(button);
  }
}

export function addLayer() {
  state.layers.push({
    name: 'Capa ' + (state.layers.length + 1),
    visible: true,
    pixels: makePixels()
  });
  state.active = state.layers.length - 1;
  renderLayers();
  draw();
  setStatus('Nueva capa creada');
}

export function toggleLayer() {
  getActiveLayer().visible = !getActiveLayer().visible;
  renderLayers();
  draw();
  setStatus(getActiveLayer().visible ? 'Capa visible' : 'Capa oculta');
}

export function deleteLayer() {
  if (state.layers.length <= 1) {
    setStatus('Debe existir una capa');
    return false;
  }
  state.layers.splice(state.active, 1);
  state.active = Math.max(0, state.active - 1);
  renderLayers();
  draw();
  setStatus('Capa eliminada');
  return true;
}
