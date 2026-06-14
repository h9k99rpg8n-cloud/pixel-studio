import { els, setStatus } from './state.js';

const KEY = 'pixelStudioPalette';
const MAX_RECENT = 12;
const MAX_FAVORITES = 16;
const MAX_USED = 12;

let palette = {
  favorites: [],
  recent: [],
  used: {}
};

function normalize(color) {
  return String(color || '').toLowerCase();
}

function savePalette() {
  localStorage.setItem(KEY, JSON.stringify(palette));
}

function loadPalette() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) palette = JSON.parse(raw);
  } catch (error) {
    palette = { favorites: [], recent: [], used: {} };
  }
}

function makeSwatch(color) {
  const button = document.createElement('button');
  button.className = 'color-swatch';
  button.style.background = color;
  button.title = color;
  button.onclick = () => {
    els.colorPicker.value = color;
    trackColor(color);
    setStatus('Color seleccionado ' + color);
  };
  return button;
}

function renderRow(container, colors) {
  container.innerHTML = '';
  if (!colors.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-projects';
    empty.textContent = 'Sin colores';
    container.appendChild(empty);
    return;
  }
  colors.forEach((color) => container.appendChild(makeSwatch(color)));
}

export function renderPalette() {
  renderRow(els.favoriteColors, palette.favorites || []);
  renderRow(els.recentColors, palette.recent || []);

  const mostUsed = Object.entries(palette.used || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_USED)
    .map((item) => item[0]);
  renderRow(els.usedColors, mostUsed);
}

export function trackColor(color) {
  color = normalize(color);
  if (!color) return;

  palette.recent = [color].concat((palette.recent || []).filter((item) => item !== color)).slice(0, MAX_RECENT);
  palette.used = palette.used || {};
  palette.used[color] = (palette.used[color] || 0) + 1;
  savePalette();
  renderPalette();
}

export function addFavoriteColor() {
  const color = normalize(els.colorPicker.value);
  if (!color) return;

  palette.favorites = palette.favorites || [];
  if (!palette.favorites.includes(color)) {
    palette.favorites.unshift(color);
    palette.favorites = palette.favorites.slice(0, MAX_FAVORITES);
    savePalette();
    renderPalette();
    setStatus('Color agregado a favoritos');
  } else {
    setStatus('Ese color ya es favorito');
  }
}

export function bindPalette() {
  loadPalette();
  renderPalette();
  els.addFavoriteColorBtn.onclick = addFavoriteColor;
  els.colorPicker.onchange = () => trackColor(els.colorPicker.value);
}
