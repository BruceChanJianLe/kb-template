import { BLOCK_REGISTRY } from './data.js';

function blockBySlug(slug) {
  return BLOCK_REGISTRY.blocks.find((b) => b.slug === slug);
}

export function getRelatedBlocks(slug) {
  const block = blockBySlug(slug);
  if (!block) return [];
  const direct = (block.connections || []).map(blockBySlug).filter(Boolean);

  const incoming = BLOCK_REGISTRY.blocks.filter(
    (b) => (b.connections || []).includes(slug) && !direct.find((d) => d.slug === b.slug),
  );

  return [...direct, ...incoming];
}

export function buildGraph() {
  const nodes = BLOCK_REGISTRY.blocks.map((b) => ({
    id: b.slug,
    title: b.title,
    icon: b.icon,
    built: b.built !== false,
  }));

  const seen = new Set();
  const links = [];
  for (const block of BLOCK_REGISTRY.blocks) {
    for (const target of block.connections || []) {
      const key = [block.slug, target].sort().join('::');
      if (seen.has(key)) continue;
      seen.add(key);
      if (BLOCK_REGISTRY.blocks.find((b) => b.slug === target)) {
        links.push({ source: block.slug, target });
      }
    }
  }
  return { nodes, links };
}
