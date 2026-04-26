import { BLOCK_REGISTRY } from '../shared/data.js';
import { initTheme } from '../shared/theme.js';
import { renderNav, initNavigation } from '../shared/navigation.js';
import { renderFooter, initFooter } from '../shared/footer.js';
import { buildGraph } from '../shared/graph.js';
import * as d3Force from 'd3-force';
import '../styles/shared.css';

function blockHref(slug) {
  return `./blocks/${slug}.html`;
}

function renderHero(main) {
  const total = BLOCK_REGISTRY.blocks.length;
  const built = BLOCK_REGISTRY.blocks.filter((b) => b.built !== false).length;
  main.insertAdjacentHTML(
    'beforeend',
    `
      <section class="hero">
        <div class="container">
          <h1>${BLOCK_REGISTRY.name}</h1>
          <p>
            A read-only knowledge map for <code>${BLOCK_REGISTRY.subtitle}</code>.
            Each block is a deep reference page on one slice of the topic — what it
            does, the parameters that control it, and recipes you can remix.
          </p>
          <p style="margin-top: var(--space-3); font-size: 0.85rem;">
            <code>${built} of ${total} blocks built</code>
          </p>
        </div>
      </section>
    `,
  );
}

function renderCards(main) {
  const cardsHtml = BLOCK_REGISTRY.blocks
    .map((block) => {
      const built = block.built !== false;
      const tags = (block.tags || [])
        .map((t) => `<span class="block-card-tag">${t}</span>`)
        .join('');
      const inner = `
        <div class="block-card-header">
          <span class="block-card-icon">${block.icon}</span>
          <span class="block-card-title">${block.title}</span>
          ${built ? '' : '<span class="block-card-status">planned</span>'}
        </div>
        <p class="block-card-desc">${block.description || ''}</p>
        <div class="block-card-tags">${tags}</div>
      `;
      if (built) {
        return `<a class="block-card" href="${blockHref(block.slug)}">${inner}</a>`;
      }
      return `<div class="block-card unbuilt" aria-disabled="true">${inner}</div>`;
    })
    .join('');

  main.insertAdjacentHTML(
    'beforeend',
    `
      <section class="container">
        <h2 class="section-title">Blocks</h2>
        <div class="block-grid">${cardsHtml}</div>
      </section>
    `,
  );
}

function renderGraph(main) {
  const { nodes, links } = buildGraph();
  if (!nodes.length) return;

  main.insertAdjacentHTML(
    'beforeend',
    `
      <section class="container">
        <h2 class="section-title">Connection graph</h2>
        <p style="color: var(--fg-muted); margin: 0 0 var(--space-3);">
          Drag nodes to reposition. Click a built block to open its page.
        </p>
        <div class="graph-wrap"><svg id="kbGraph"></svg></div>
      </section>
    `,
  );

  const svg = document.getElementById('kbGraph');
  const width = svg.clientWidth || 900;
  const height = 480;

  const simNodes = nodes.map((n) => ({ ...n }));
  const simLinks = links.map((l) => ({ ...l }));

  const sim = d3Force
    .forceSimulation(simNodes)
    .force(
      'link',
      d3Force.forceLink(simLinks).id((d) => d.id).distance(110).strength(0.6),
    )
    .force('charge', d3Force.forceManyBody().strength(-260))
    .force('center', d3Force.forceCenter(width / 2, height / 2))
    .force('collide', d3Force.forceCollide(46));

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const linkEls = simLinks.map((link) => {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('class', 'graph-link');
    svg.appendChild(line);
    link.el = line;
    return line;
  });

  const nodeEls = simNodes.map((node) => {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', `graph-node${node.built ? '' : ' unbuilt'}`);

    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('r', '22');
    g.appendChild(c);

    const icon = document.createElementNS(SVG_NS, 'text');
    icon.setAttribute('text-anchor', 'middle');
    icon.setAttribute('dy', '0.35em');
    icon.setAttribute('font-size', '18');
    icon.textContent = node.icon;
    g.appendChild(icon);

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('y', '40');
    label.textContent = node.title;
    g.appendChild(label);

    if (node.built) {
      g.style.cursor = 'pointer';
      g.addEventListener('click', () => {
        window.location.href = blockHref(node.id);
      });
    }
    svg.appendChild(g);
    node.el = g;
    return g;
  });

  let dragNode = null;
  function onMouseDown(e) {
    const target = e.target.closest('.graph-node');
    if (!target) return;
    const idx = nodeEls.indexOf(target);
    dragNode = simNodes[idx];
    sim.alphaTarget(0.3).restart();
  }
  function onMouseMove(e) {
    if (!dragNode) return;
    const rect = svg.getBoundingClientRect();
    dragNode.fx = e.clientX - rect.left;
    dragNode.fy = e.clientY - rect.top;
  }
  function onMouseUp() {
    if (!dragNode) return;
    dragNode.fx = null;
    dragNode.fy = null;
    dragNode = null;
    sim.alphaTarget(0);
  }
  svg.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  sim.on('tick', () => {
    simLinks.forEach((link) => {
      link.el.setAttribute('x1', link.source.x);
      link.el.setAttribute('y1', link.source.y);
      link.el.setAttribute('x2', link.target.x);
      link.el.setAttribute('y2', link.target.y);
    });
    simNodes.forEach((node) => {
      node.el.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderNav();
  initNavigation();

  const main = document.getElementById('home');
  if (main) {
    renderHero(main);
    renderCards(main);
    renderGraph(main);
  }

  renderFooter();
  initFooter();
});
