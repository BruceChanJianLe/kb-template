import { BLOCK_REGISTRY } from '../shared/data.js';
import { initTheme } from '../shared/theme.js';
import { renderNav, initNavigation } from '../shared/navigation.js';
import { renderFooter, initFooter } from '../shared/footer.js';
import { getRelatedBlocks } from '../shared/graph.js';
import '../styles/shared.css';
import '../styles/block-detail.css';

function getBlockSlug() {
  const main = document.getElementById('blockDetail');
  if (main && main.dataset.blockSlug) return main.dataset.blockSlug;
  return window.location.pathname.split('/').pop().replace('.html', '');
}

async function loadGuideContent(slug) {
  try {
    const res = await fetch(`../resources/${slug}.html`);
    if (!res.ok) return null;
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body ? doc.body.innerHTML : null;
  } catch {
    return null;
  }
}

function extractGuideText(block) {
  const guide = document.querySelector('.block-guide');
  if (!guide) return `# ${block.title}\nNo guide content loaded.`;

  let out = `# ${block.title}\n`;
  if (block.description) out += `${block.description}\n\n`;

  guide.querySelectorAll('.section').forEach((section) => {
    const num = section.querySelector('.section-number');
    const h2 = section.querySelector('h2');
    if (h2) {
      const title = h2.textContent.replace(num?.textContent || '', '').trim();
      out += `## ${num ? num.textContent.trim() + ' — ' : ''}${title}\n\n`;
    }
    section.querySelectorAll(':scope > .prose').forEach((p) => {
      out += `${p.textContent.trim()}\n\n`;
    });
    section.querySelectorAll(':scope > .cfg').forEach((cfg) => {
      const head = cfg.querySelector('.cfg-head');
      const pre = cfg.querySelector('pre');
      if (head) out += `\`\`\`${head.textContent.trim()}\n`;
      else out += '```\n';
      if (pre) out += `${pre.textContent.trim()}\n`;
      out += '```\n\n';
    });
    section.querySelectorAll(':scope > .tip').forEach((tip) => {
      out += `> ${tip.textContent.trim()}\n\n`;
    });
    section.querySelectorAll(':scope > details').forEach((det) => {
      const summary = det.querySelector('summary');
      if (summary) out += `### ${summary.textContent.trim()}\n`;
      const cfg = det.querySelector('.cfg');
      if (cfg) {
        const pre = cfg.querySelector('pre');
        const head = cfg.querySelector('.cfg-head');
        if (head) out += `\`\`\`${head.textContent.trim()}\n`;
        else out += '```\n';
        if (pre) out += `${pre.textContent.trim()}\n`;
        out += '```\n';
      }
      out += '\n';
    });
    section.querySelectorAll(':scope > table').forEach((table) => {
      const rows = table.querySelectorAll('tr');
      rows.forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll('th, td')).map((c) =>
          c.textContent.trim().replace(/\s+/g, ' '),
        );
        out += `| ${cells.join(' | ')} |\n`;
      });
      out += '\n';
    });
  });

  if (block.sources && block.sources.length) {
    out += `---\nSources:\n`;
    block.sources.forEach((s) => {
      out += `- ${s.title}: ${s.url}\n`;
    });
  }
  return out.trim();
}

async function renderBlockDetail(block) {
  const main = document.getElementById('blockDetail');
  if (!main) return;
  if (!block) {
    main.innerHTML = `
      <div class="container" style="padding: var(--space-12) 0; text-align: center;">
        <h1>Block not found</h1>
        <p><a href="../index.html">← Back to index</a></p>
      </div>
    `;
    return;
  }

  const guide = await loadGuideContent(block.slug);

  main.innerHTML = `
    <div class="block-detail-section">
      <div class="container">
        <a href="../index.html" class="block-back-link">← Back to index</a>
        <div class="block-detail-header">
          <span class="block-detail-icon">${block.icon}</span>
          <div>
            <h1 class="block-detail-title">${block.title}</h1>
            ${
              block.description
                ? `<p class="block-detail-description">${block.description}</p>`
                : ''
            }
          </div>
        </div>
        <div class="block-detail-meta">
          <div>
            ${
              block.tags && block.tags.length
                ? `<div class="block-detail-tags">${block.tags
                    .map((t) => `<span class="block-detail-tag">${t}</span>`)
                    .join('')}</div>`
                : ''
            }
          </div>
          <div class="block-detail-sources">
            ${
              block.sources && block.sources.length
                ? `<h3 class="block-detail-sources-heading">Sources</h3>
                   <ul>${block.sources
                     .map((s) => {
                       const external = /^https?:/i.test(s.url || '');
                       return external
                         ? `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} <span class="block-external-icon">↗</span></a></li>`
                         : `<li><code class="source-path">${s.title}</code></li>`;
                     })
                     .join('')}</ul>`
                : ''
            }
          </div>
          <div class="block-detail-actions">
            <button class="btn btn-secondary block-copy-link">Copy Link</button>
            <button class="btn btn-primary block-share-claude">Share with Claude</button>
          </div>
        </div>
        ${
          guide
            ? `<div class="block-guide">${guide}</div>`
            : `<p class="block-detail-empty">No guide content yet — this block is planned.</p>`
        }
      </div>
    </div>
  `;

  main.querySelector('.block-copy-link')?.addEventListener('click', (e) => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      e.target.textContent = 'Copied!';
      setTimeout(() => (e.target.textContent = 'Copy Link'), 2000);
    });
  });

  main.querySelector('.block-share-claude')?.addEventListener('click', (e) => {
    const text = extractGuideText(block);
    navigator.clipboard.writeText(text).then(() => {
      e.target.textContent = 'Copied!';
      setTimeout(() => (e.target.textContent = 'Share with Claude'), 2000);
    });
  });

  // related blocks
  const related = getRelatedBlocks(block.slug);
  if (related.length) {
    const wrap = document.createElement('section');
    wrap.className = 'block-related';
    wrap.innerHTML = `
      <div class="container">
        <h3 class="block-related-heading">Connected blocks</h3>
        <div class="block-related-grid">
          ${related
            .map((r) => {
              const built = r.built !== false;
              const inner = `
                <span class="block-related-icon">${r.icon}</span>
                <div>
                  <span class="block-related-title">${r.title}</span>
                  <span class="block-related-desc">${r.description || ''}${
                built ? '' : ' (planned)'
              }</span>
                </div>
              `;
              return built
                ? `<a href="./${r.slug}.html" class="block-related-card">${inner}</a>`
                : `<div class="block-related-card" style="opacity: 0.55;" aria-disabled="true">${inner}</div>`;
            })
            .join('')}
        </div>
      </div>
    `;
    main.querySelector('.block-detail-section')?.appendChild(wrap);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderNav();
  initNavigation();

  const slug = getBlockSlug();
  const block = BLOCK_REGISTRY.blocks.find((b) => b.slug === slug);
  renderBlockDetail(block);

  renderFooter();
  initFooter();
});
