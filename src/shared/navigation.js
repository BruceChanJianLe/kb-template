import { BLOCK_REGISTRY } from './data.js';
import { toggleTheme } from './theme.js';

function indexHref() {
  const onBlockPage = window.location.pathname.includes('/blocks/');
  return onBlockPage ? '../index.html' : './index.html';
}

export function renderNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  nav.innerHTML = `
    <div class="nav-inner container">
      <a class="nav-brand" href="${indexHref()}">
        <span class="nav-brand-mark">⌘</span>
        <span class="nav-brand-text">
          <span class="nav-brand-title">${BLOCK_REGISTRY.name}</span>
          <span class="nav-brand-subtitle">${BLOCK_REGISTRY.subtitle}</span>
        </span>
      </a>
      <button class="nav-theme" aria-label="Toggle theme" title="Toggle theme">
        <span class="nav-theme-icon">◐</span>
      </button>
    </div>
  `;
}

export function initNavigation() {
  const btn = document.querySelector('.nav-theme');
  btn?.addEventListener('click', () => {
    toggleTheme();
  });
}
