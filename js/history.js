import { state, els, setStatus } from './state.js';
import { copyLayers, renderLayers } from './layers.js';
import { draw } from './renderer.js';

export function saveHistory() {
  state.undo.push({
    size: state.gridSize,
    active: state.active,
    layers: copyLayers(state.layers)
  });
  if (state.undo.length > 40) state.undo.shift();
  state.redo = [];
}

function restore(snapshot) {
  state.gridSize = snapshot.size;
  state.active = snapshot.active;
  state.layers = copyLayers(snapshot.layers);
  els.sizeSelect.value = String(state.gridSize);
  renderLayers();
  draw();
}

export function undo() {
  if (!state.undo.length) {
    setStatus('Nada que deshacer');
    return;
  }
  state.redo.push({
    size: state.gridSize,
    active: state.active,
    layers: copyLayers(state.layers)
  });
  restore(state.undo.pop());
  setStatus('Deshacer');
}

export function redo() {
  if (!state.redo.length) {
    setStatus('Nada que rehacer');
    return;
  }
  state.undo.push({
    size: state.gridSize,
    active: state.active,
    layers: copyLayers(state.layers)
  });
  restore(state.redo.pop());
  setStatus('Rehacer');
}
