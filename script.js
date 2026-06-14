var canvas = document.getElementById('pixelCanvas');
var ctx = canvas.getContext('2d', { willReadFrequently: true });
var sizeSelect = document.getElementById('sizeSelect');
var colorPicker = document.getElementById('colorPicker');
var statusText = document.getElementById('statusText');
var exportBtn = document.getElementById('exportBtn');
var clearBtn = document.getElementById('clearBtn');
var zoomInBtn = document.getElementById('zoomInBtn');
var zoomOutBtn = document.getElementById('zoomOutBtn');
var zoomResetBtn = document.getElementById('zoomResetBtn');
var canvasScroll = document.getElementById('canvasScroll');
var saveBtn = document.getElementById('saveBtn');
var loadBtn = document.getElementById('loadBtn');
var undoBtn = document.getElementById('undoBtn');
var redoBtn = document.getElementById('redoBtn');

var gridSize = Number(sizeSelect.value);
var pixels = [];
var currentTool = 'pencil';
var isDown = false;
var zoom = 1;
var undoStack = [];
var redoStack = [];
var didChangeDuringStroke = false;

function copyPixels(source) {
  return source.map(function(row) { return row.slice(); });
}

function resetPixels() {
  pixels = [];
  for (var y = 0; y < gridSize; y++) {
    var row = [];
    for (var x = 0; x < gridSize; x++) row.push('');
    pixels.push(row);
  }
}

function saveHistory() {
  undoStack.push({ size: gridSize, data: copyPixels(pixels) });
  if (undoStack.length > 40) undoStack.shift();
  redoStack = [];
}

function restoreState(state) {
  gridSize = state.size;
  sizeSelect.value = String(gridSize);
  pixels = copyPixels(state.data);
  draw();
}

function drawChecker() {
  var block = 32;
  for (var y = 0; y < canvas.height; y += block) {
    for (var x = 0; x < canvas.width; x += block) {
      ctx.fillStyle = ((x / block + y / block) % 2 === 0) ? '#182033' : '#222c42';
      ctx.fillRect(x, y, block, block);
    }
  }
}

function drawGrid(cell) {
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1;
  for (var i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(canvas.width, i * cell);
    ctx.stroke();
  }
}

function draw() {
  var cell = canvas.width / gridSize;
  drawChecker();
  for (var y = 0; y < gridSize; y++) {
    for (var x = 0; x < gridSize; x++) {
      if (pixels[y][x] !== '') {
        ctx.fillStyle = pixels[y][x];
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }
  drawGrid(cell);
}

function applyZoom() {
  var visualSize = Math.round(512 * zoom);
  canvas.style.width = visualSize + 'px';
  canvas.style.height = visualSize + 'px';
  statusText.textContent = 'Zoom ' + Math.round(zoom * 100) + '%';
}

function getPoint(e) {
  var rect = canvas.getBoundingClientRect();
  var x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
  var y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);
  if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return null;
  return { x: x, y: y };
}

function setToolButtonActive(button) {
  var buttons = document.querySelectorAll('[data-tool]');
  for (var i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
  button.classList.add('active');
}

function floodFill(startX, startY, newColor) {
  var oldColor = pixels[startY][startX];
  if (oldColor === newColor) return;
  var stack = [{ x: startX, y: startY }];
  while (stack.length) {
    var p = stack.pop();
    if (p.x < 0 || p.y < 0 || p.x >= gridSize || p.y >= gridSize) continue;
    if (pixels[p.y][p.x] !== oldColor) continue;
    pixels[p.y][p.x] = newColor;
    stack.push({ x: p.x + 1, y: p.y });
    stack.push({ x: p.x - 1, y: p.y });
    stack.push({ x: p.x, y: p.y + 1 });
    stack.push({ x: p.x, y: p.y - 1 });
  }
}

function useTool(e) {
  var p = getPoint(e);
  if (!p) return;
  var before = pixels[p.y][p.x];

  if (currentTool === 'picker') {
    if (before !== '') colorPicker.value = before;
    statusText.textContent = before === '' ? 'Pixel transparente' : 'Color copiado';
    return;
  }

  if (currentTool === 'bucket') {
    saveHistory();
    floodFill(p.x, p.y, colorPicker.value);
    draw();
    statusText.textContent = 'Cubeta aplicada';
    return;
  }

  var nextColor = currentTool === 'eraser' ? '' : colorPicker.value;
  if (before !== nextColor) {
    pixels[p.y][p.x] = nextColor;
    didChangeDuringStroke = true;
  }
  statusText.textContent = 'Pixel ' + p.x + ', ' + p.y;
  draw();
}

canvas.onpointerdown = function(e) {
  isDown = true;
  didChangeDuringStroke = false;
  if (currentTool === 'pencil' || currentTool === 'eraser') saveHistory();
  useTool(e);
};
canvas.onpointermove = function(e) {
  if (isDown && (currentTool === 'pencil' || currentTool === 'eraser')) useTool(e);
};
window.onpointerup = function() {
  isDown = false;
};

var buttons = document.querySelectorAll('[data-tool]');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function() {
    currentTool = this.getAttribute('data-tool');
    setToolButtonActive(this);
    var names = { pencil: 'Modo pintar', eraser: 'Modo borrar', bucket: 'Modo cubeta', picker: 'Modo copiar color' };
    statusText.textContent = names[currentTool] || 'Herramienta lista';
  };
}

sizeSelect.onchange = function() {
  saveHistory();
  gridSize = Number(sizeSelect.value);
  resetPixels();
  zoom = gridSize === 64 ? 1.5 : 1;
  applyZoom();
  draw();
  statusText.textContent = 'Nuevo lienzo ' + gridSize + ' x ' + gridSize;
};

clearBtn.onclick = function() {
  saveHistory();
  resetPixels();
  draw();
  statusText.textContent = 'Lienzo limpio';
};

zoomInBtn.onclick = function() {
  zoom = Math.min(3, zoom + 0.25);
  applyZoom();
};

zoomOutBtn.onclick = function() {
  zoom = Math.max(0.75, zoom - 0.25);
  applyZoom();
};

zoomResetBtn.onclick = function() {
  zoom = 1;
  applyZoom();
  canvasScroll.scrollLeft = 0;
  canvasScroll.scrollTop = 0;
};

saveBtn.onclick = function() {
  localStorage.setItem('pixelStudioProject', JSON.stringify({ size: gridSize, data: pixels }));
  statusText.textContent = 'Proyecto guardado';
};

loadBtn.onclick = function() {
  var raw = localStorage.getItem('pixelStudioProject');
  if (!raw) {
    statusText.textContent = 'No hay proyecto guardado';
    return;
  }
  try {
    var project = JSON.parse(raw);
    saveHistory();
    gridSize = project.size;
    pixels = project.data;
    sizeSelect.value = String(gridSize);
    draw();
    statusText.textContent = 'Proyecto cargado';
  } catch (error) {
    statusText.textContent = 'No se pudo cargar';
  }
};

undoBtn.onclick = function() {
  if (!undoStack.length) {
    statusText.textContent = 'Nada que deshacer';
    return;
  }
  redoStack.push({ size: gridSize, data: copyPixels(pixels) });
  restoreState(undoStack.pop());
  statusText.textContent = 'Deshacer';
};

redoBtn.onclick = function() {
  if (!redoStack.length) {
    statusText.textContent = 'Nada que rehacer';
    return;
  }
  undoStack.push({ size: gridSize, data: copyPixels(pixels) });
  restoreState(redoStack.pop());
  statusText.textContent = 'Rehacer';
};

function exportImage(scale) {
  var out = document.createElement('canvas');
  out.width = gridSize * scale;
  out.height = gridSize * scale;
  var outCtx = out.getContext('2d');
  outCtx.imageSmoothingEnabled = false;
  outCtx.clearRect(0, 0, out.width, out.height);
  for (var y = 0; y < gridSize; y++) {
    for (var x = 0; x < gridSize; x++) {
      if (pixels[y][x] !== '') {
        outCtx.fillStyle = pixels[y][x];
        outCtx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  out.toBlob(function(blob) {
    if (!blob) {
      statusText.textContent = 'No se pudo crear el PNG';
      return;
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'pixel-studio-' + gridSize + 'x' + gridSize + '-x' + scale + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    statusText.textContent = 'PNG exportado en x' + scale;
  }, 'image/png');
}

exportBtn.onclick = function() {
  try {
    exportImage(16);
  } catch (error) {
    statusText.textContent = 'Error al exportar PNG';
  }
};

resetPixels();
applyZoom();
draw();
