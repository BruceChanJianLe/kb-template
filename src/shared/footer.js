import { BLOCK_REGISTRY } from './data.js';
import pkg from '../../package.json';

export function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-inner container">
      <span>${BLOCK_REGISTRY.name} · <code>${BLOCK_REGISTRY.subtitle}</code></span>
      <span class="footer-credit">
        Built from <a href="https://github.com/brucechanjianle/kb-template">kb-template</a>
        <code>v${pkg.version}</code>
      </span>
    </div>
  `;
}

export function initFooter() {
  /* reserved for future footer interactions */
}
