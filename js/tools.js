import { state, els, setStatus } from './state.js';
import { getActiveLayer } from './layers.js';
import { saveHistory } from './history.js';
import { draw } from './renderer.js';
import { trackColor } from './palette.js';

function getPoint(event) {
  const rect = state.canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / rect.width * state.gridSize);
  const y = Math.floor((event.clientY - rect.top) / rect.height * state.gridSize);
  if (x < 0 || y < 0 || x >= state.gridSize || y >= state.gridSize) return null;
  return { x, y };
}

function floodFill(startX, startY, color) {
  const pixels = getActiveLayer().pixels;
  const oldColor = pixels[startY][startX];
  if (oldColor === color) return;

  const stack = [{ x: startX, y: startY }];
  while (stack.length) {
    const p = stack.pop();
    if (p.x < 0 || p.y < 0 || p.x >= state.gridSize || p.y >= state.gridSize) continue;
    if (pixels[p.y][p.x] !== oldColor) continue;

    pixels[p.y][p.x] = color;
    stack.push({ x: p.x + 1, y: p.y });
    stack.push({ x: p.x - 1, y: p.y });
    stack.push({ x: p.x, y: p.y + 1 });
    stack.push({ x: p.x, y: p.y - 1 });
  }
}

function makeSelection(start, end) {
  const x1 = Math.min(start.x, end.x);
  const y1 = Math.min(start.y, end.y);
  const x2 = Math.max(start.x, end.x);
  const y2 = Math.max(start.y, end.y);
  state.selection = { x: x1, y: y1, w: x2 - x1 + 1, h: y2 - y1 + 1 };
}

function useTool(event) {
  const point = getPoint(event);
  if (!point) return;

  const pixels = getActiveLayer().pixels;

  if (state.tool === 'select') {
    if (!state.selectionStart) state.selectionStart = point;
    makeSelection(state.selectionStart, point);
    setStatus('Seleccion ' + state.selection.w + ' x ' + state.selection.h);
    draw();
    return;
  }

  if (state.tool === 'picker') {
    for (let l = state.layers.length - 1; l >= 0; l--) {
      const layer = state.layers[l];
      if (layer.visible && layer.pixels[point.y][point.x]) {
        els.colorPicker.value = layer.pixels[point.y][point.x];
        trackColor(layer.pixels[point.y][point.x]);
        setStatus('Color copiado');
        return;
      }
    }
    setStatus('Pixel transparente');
    return;
  }

  if (state.tool === 'bucket') {
    saveHistory();
    floodFill(point.x, point.y, els.colorPicker.value);
    trackColor(els.colorPicker.value);
    draw();
    setStatus('Cubeta aplicada');
    return;
  }

  pixels[point.y][point.x] = state.tool === 'eraser' ? '' : els.colorPicker.value;
  if (state.tool === 'pencil') trackColor(els.colorPicker.value);
  setStatus('Pixel ' + point.x + ', ' + point.y);
  draw();
}

export function bindTools() {
  state.canvas.onpointerdown = (event) => {
    state.down = true;
    if (state.tool === 'select') {
      state.selectionStart = getPoint(event);
      state.selection = null;
    }
    if (state.tool === 'pencil' || state.tool === 'eraser') saveHistory();
    useTool(event);
  };

  state.canvas.onpointermove = (event) => {
    if (!state.down) return;
    if (state.tool === 'pencil' || state.tool === 'eraser' || state.tool === 'select') useTool(event);
  };

  window.onpointerup = () => {
    state.down = false;
    state.selectionStart = null;
  };

  for (let i = 0; i < els.toolButtons.length; i++) {
    els.toolButtons[i].onclick = function () {
      state.tool = this.dataset.tool;
      for (let j = 0; j < els.toolButtons.length; j++) els.toolButtons[j].classList.remove('active');
      this.classList.add('active');

      const names = {
        pencil: 'Modo pintar',
        eraser: 'Modo borrar',
        bucket: 'Modo cubeta',
        picker: 'Modo cuentagotas',
        select: 'Modo seleccion'
      };
      setStatus(names[state.tool]);
    };
  }
}
