// =================================================================
// KNOWLEDGE BLOCKS REGISTRY
//
// To add a block:
//   1. Add an entry below (slug, title, icon, description, tags,
//      connections, sources).
//   2. Create blocks/<slug>.html (entry shell — copy an existing one).
//   3. Create public/resources/<slug>.html (the actual content).
//
// Field reference:
//   slug        kebab-case id; must match the filename in blocks/
//                 and public/resources/
//   title       short human title (≤ 32 chars)
//   icon        single emoji
//   description one-sentence summary shown on the home grid
//   tags        a few short kebab-case tags for visual grouping
//   connections list of slugs this block links to in the graph
//   built       false = appears in the graph but not navigable yet
//   sources     [{ title, url }] — http(s) urls render as outbound
//                 links; everything else renders as a styled file path
// =================================================================

export const BLOCK_REGISTRY = {
  // Customise these two for your topic. The init-topic.sh script
  // patches them automatically when you scaffold a new repo.
  name: 'Knowledge Blocks',
  subtitle: 'topic-name',

  blocks: [
    {
      slug: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      description:
        'How this site is structured, the content vocabulary you can use, and how to add your next block',
      tags: ['template', 'meta'],
      connections: [],
      built: true,
      sources: [
        { title: 'AGENTS.md', url: 'https://github.com/' },
      ],
    },
  ],
};
