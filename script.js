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

var gridSize = Number(sizeSelect.value);
var pixels = [];
var currentTool = 'pencil';
var isDown = false;
var zoom = 1;

function resetPixels() {
  pixels = [];
  for (var y = 0; y < gridSize; y++) {
    var row = [];
    for (var x = 0; x < gridSize; x++) row.push('');
    pixels.push(row);
  }
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

function pickPixel(e) {
  var rect = canvas.getBoundingClientRect();
  var x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
  var y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);
  if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return;
  pixels[y][x] = currentTool === 'eraser' ? '' : colorPicker.value;
  statusText.textContent = 'Pixel ' + x + ', ' + y;
  draw();
}

canvas.onpointerdown = function(e) {
  isDown = true;
  pickPixel(e);
};
canvas.onpointermove = function(e) {
  if (isDown) pickPixel(e);
};
window.onpointerup = function() {
  isDown = false;
};

var buttons = document.querySelectorAll('[data-tool]');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function() {
    currentTool = this.getAttribute('data-tool');
    for (var j = 0; j < buttons.length; j++) buttons[j].classList.remove('active');
    this.classList.add('active');
    statusText.textContent = currentTool === 'pencil' ? 'Modo pintar' : 'Modo borrar';
  };
}

sizeSelect.onchange = function() {
  gridSize = Number(sizeSelect.value);
  resetPixels();
  zoom = gridSize === 64 ? 1.5 : 1;
  applyZoom();
  draw();
  statusText.textContent = 'Nuevo lienzo ' + gridSize + ' x ' + gridSize;
};

clearBtn.onclick = function() {
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
