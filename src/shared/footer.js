import { BLOCK_REGISTRY } from './data.js';

export function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-inner container">
      <span>${BLOCK_REGISTRY.name} · <code>${BLOCK_REGISTRY.subtitle}</code></span>
      <span class="footer-credit">
        Built from the <a href="https://github.com/brucechanjianle/kb-template">kb-template</a>.
      </span>
    </div>
  `;
}

export function initFooter() {
  /* reserved for future footer interactions */
}
