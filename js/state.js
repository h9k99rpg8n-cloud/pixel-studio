export const state = {
  canvas: null,
  ctx: null,
  gridSize: 32,
  tool: 'pencil',
  down: false,
  zoom: 1,
  layers: [],
  active: 0,
  undo: [],
  redo: [],
  currentProjectId: 'main-project',
  currentProjectName: 'Proyecto principal'
};

export const els = {};

export function bindElements() {
  els.canvas = document.getElementById('pixelCanvas');
  els.sizeSelect = document.getElementById('sizeSelect');
  els.colorPicker = document.getElementById('colorPicker');
  els.statusText = document.getElementById('statusText');
  els.exportBtn = document.getElementById('exportBtn');
  els.clearBtn = document.getElementById('clearBtn');
  els.zoomInBtn = document.getElementById('zoomInBtn');
  els.zoomOutBtn = document.getElementById('zoomOutBtn');
  els.zoomResetBtn = document.getElementById('zoomResetBtn');
  els.canvasScroll = document.getElementById('canvasScroll');
  els.saveBtn = document.getElementById('saveBtn');
  els.loadBtn = document.getElementById('loadBtn');
  els.newProjectBtn = document.getElementById('newProjectBtn');
  els.renameProjectBtn = document.getElementById('renameProjectBtn');
  els.undoBtn = document.getElementById('undoBtn');
  els.redoBtn = document.getElementById('redoBtn');
  els.addLayerBtn = document.getElementById('addLayerBtn');
  els.toggleLayerBtn = document.getElementById('toggleLayerBtn');
  els.deleteLayerBtn = document.getElementById('deleteLayerBtn');
  els.importBtn = document.getElementById('importBtn');
  els.importInput = document.getElementById('importInput');
  els.layersPanel = document.getElementById('layersPanel');
  els.projectList = document.getElementById('projectList');
  els.projectNameText = document.getElementById('projectNameText');
  els.toolButtons = document.querySelectorAll('[data-tool]');

  state.canvas = els.canvas;
  state.ctx = els.canvas.getContext('2d');
  state.gridSize = Number(els.sizeSelect.value);
}

export function setStatus(text) {
  els.statusText.textContent = text;
}

export function updateProjectName() {
  if (els.projectNameText) els.projectNameText.textContent = state.currentProjectName;
}
