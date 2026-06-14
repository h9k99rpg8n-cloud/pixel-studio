import { state, els, setStatus } from './state.js';
import { getActiveLayer } from './layers.js';
import { saveHistory } from './history.js';
import { draw } from './renderer.js';

function drawCover(ctx, image, size) {
  const imageRatio = image.width / image.height;
  const targetRatio = 1;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;

  if (imageRatio > targetRatio) {
    sw = image.height * targetRatio;
    sx = (image.width - sw) / 2;
  } else if (imageRatio < targetRatio) {
    sh = image.width / targetRatio;
    sy = (image.height - sh) / 2;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, size, size);
}

export function importImage(file) {
  if (!file) return;

  const image = new Image();
  image.onload = () => {
    saveHistory();
    const temp = document.createElement('canvas');
    temp.width = state.gridSize;
    temp.height = state.gridSize;
    const tempCtx = temp.getContext('2d', { willReadFrequently: true });
    drawCover(tempCtx, image, state.gridSize);

    const data = tempCtx.getImageData(0, 0, state.gridSize, state.gridSize).data;
    const pixels = getActiveLayer().pixels;

    for (let y = 0; y < state.gridSize; y++) {
      for (let x = 0; x < state.gridSize; x++) {
        const index = (y * state.gridSize + x) * 4;
        if (data[index + 3] === 0) {
          pixels[y][x] = '';
        } else {
          pixels[y][x] = '#' + [data[index], data[index + 1], data[index + 2]]
            .map((value) => value.toString(16).padStart(2, '0'))
            .join('');
        }
      }
    }

    draw();
    setStatus('Imagen convertida a ' + state.gridSize + ' x ' + state.gridSize);
    URL.revokeObjectURL(image.src);
  };
  image.src = URL.createObjectURL(file);
}

export function exportImage(scale) {
  const output = document.createElement('canvas');
  output.width = state.gridSize * scale;
  output.height = state.gridSize * scale;
  const outputCtx = output.getContext('2d');
  outputCtx.imageSmoothingEnabled = false;

  for (let l = 0; l < state.layers.length; l++) {
    if (!state.layers[l].visible) continue;
    const pixels = state.layers[l].pixels;
    for (let y = 0; y < state.gridSize; y++) {
      for (let x = 0; x < state.gridSize; x++) {
        if (pixels[y][x]) {
          outputCtx.fillStyle = pixels[y][x];
          outputCtx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
  }

  output.toBlob((blob) => {
    if (!blob) {
      setStatus('No se pudo crear el PNG');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pixel-studio-' + state.gridSize + 'x' + state.gridSize + '-x' + scale + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('PNG exportado');
  }, 'image/png');
}

export function bindIO() {
  els.importBtn.onclick = () => els.importInput.click();
  els.importInput.onchange = (event) => {
    importImage(event.target.files[0]);
    els.importInput.value = '';
  };
  els.exportBtn.onclick = () => exportImage(16);
}
