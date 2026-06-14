var canvas = document.getElementById('pixelCanvas');
var ctx = canvas.getContext('2d');
var sizeSelect = document.getElementById('sizeSelect');
var colorPicker = document.getElementById('colorPicker');
var statusText = document.getElementById('statusText');
var exportBtn = document.getElementById('exportBtn');
var clearBtn = document.getElementById('clearBtn');

var gridSize = 32;
var pixels = [];
var currentTool = 'pencil';
var isDown = false;

function resetPixels() {
  pixels = [];
  for (var y = 0; y < gridSize; y++) {
    var row = [];
    for (var x = 0; x < gridSize; x++) row.push('');
    pixels.push(row);
  }
}

function draw() {
  var cell = canvas.width / gridSize;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var y = 0; y < gridSize; y++) {
    for (var x = 0; x < gridSize; x++) {
      if (pixels[y][x] !== '') {
        ctx.fillStyle = pixels[y][x];
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }
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

canvas.onpointerdown = function(e) { isDown = true; pickPixel(e); };
canvas.onpointermove = function(e) { if (isDown) pickPixel(e); };
window.onpointerup = function() { isDown = false; };

var buttons = document.querySelectorAll('[data-tool]');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function() {
    currentTool = this.getAttribute('data-tool');
    for (var j = 0; j < buttons.length; j++) buttons[j].classList.remove('active');
    this.classList.add('active');
  };
}

sizeSelect.onchange = function() {
  gridSize = Number(sizeSelect.value);
  resetPixels();
  draw();
};

clearBtn.onclick = function() {
  resetPixels();
  draw();
};

exportBtn.onclick = function() {
  var out = document.createElement('canvas');
  out.width = gridSize;
  out.height = gridSize;
  var outCtx = out.getContext('2d');
  for (var y = 0; y < gridSize; y++) {
    for (var x = 0; x < gridSize; x++) {
      if (pixels[y][x] !== '') {
        outCtx.fillStyle = pixels[y][x];
        outCtx.fillRect(x, y, 1, 1);
      }
    }
  }
  var a = document.createElement('a');
  a.download = 'pixel-studio.png';
  a.href = out.toDataURL('image/png');
  a.click();
};

resetPixels();
draw();
