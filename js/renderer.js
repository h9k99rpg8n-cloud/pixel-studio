import { state } from './state.js';

function drawChecker() {
  const block = 32;
  for (let y = 0; y < state.canvas.height; y += block) {
    for (let x = 0; x < state.canvas.width; x += block) {
      state.ctx.fillStyle = ((x / block + y / block) % 2 === 0) ? '#182033' : '#222c42';
      state.ctx.fillRect(x, y, block, block);
    }
  }
}

function drawGrid(cell) {
  state.ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  for (let i = 0; i <= state.gridSize; i++) {
    state.ctx.beginPath();
    state.ctx.moveTo(i * cell, 0);
    state.ctx.lineTo(i * cell, state.canvas.height);
    state.ctx.stroke();

    state.ctx.beginPath();
    state.ctx.moveTo(0, i * cell);
    state.ctx.lineTo(state.canvas.width, i * cell);
    state.ctx.stroke();
  }
}

function drawSelection(cell) {
  if (!state.selection) return;
  const s = state.selection;
  state.ctx.save();
  state.ctx.strokeStyle = '#facc15';
  state.ctx.lineWidth = 3;
  state.ctx.setLineDash([8, 5]);
  state.ctx.strokeRect(s.x * cell, s.y * cell, s.w * cell, s.h * cell);
  state.ctx.restore();
}

export function draw() {
  const cell = state.canvas.width / state.gridSize;
  drawChecker();

  for (let l = 0; l < state.layers.length; l++) {
    if (!state.layers[l].visible) continue;
    const pixels = state.layers[l].pixels;

    for (let y = 0; y < state.gridSize; y++) {
      for (let x = 0; x < state.gridSize; x++) {
        if (pixels[y][x]) {
          state.ctx.fillStyle = pixels[y][x];
          state.ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }
  }

  drawGrid(cell);
  drawSelection(cell);
}
