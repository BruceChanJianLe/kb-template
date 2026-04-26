# kb-template

A template for building **knowledge-blocks** sites — small, single-topic
reference sites that render as a card grid + force-directed connection
graph, with deep-dive pages for each block.

Live demo (this template, deployed): _coming when first published_

## Quick start

```bash
# 1. Use this repo as a GitHub template ("Use this template" button on GitHub)
#    OR clone it directly:
git clone https://github.com/brucechanjianle/kb-template kb-mytopic
cd kb-mytopic

# 2. Rename to your topic
./init-topic.sh mytopic "My Topic Reference" "what this site is about"

# 3. Install + run
npm install
npm run dev
```

The dev server prints a localhost URL. Open it, you'll see one example
block ("Getting Started") that demonstrates every content pattern.

## Adding blocks

Hand the topic to an LLM agent and point it at [`AGENTS.md`](./AGENTS.md) —
that file contains the full brief on the block schema, content vocabulary,
and quality bar. The agent will:

1. Add an entry to `BLOCK_REGISTRY.blocks` in `src/shared/data.js`
2. Create `blocks/<slug>.html` (entry shell)
3. Write `public/resources/<slug>.html` (the content)

Or do it by hand — same three steps, just slower.

## Deploying to GitHub Pages

This repo includes `.github/workflows/pages.yml`. To deploy:

1. Push the repo to GitHub as `<your-user>/kb-<topic>`
2. Go to **Settings → Pages → Build and deployment** and set source to **GitHub Actions**
3. Push to `master` — the workflow builds and deploys

Your site will be live at `https://<your-user>.github.io/kb-<topic>/`.

The Vite config uses `base: './'` (relative paths), so the same build
works at any subpath without per-topic configuration.

## Project structure

```
kb-template/
├── index.html                          home page
├── blocks/
│   └── <slug>.html                     entry shell per block
├── public/resources/
│   └── <slug>.html                     content per block
├── src/
│   ├── pages/{home,block-detail}.js
│   ├── shared/{data,theme,navigation,footer,graph}.js
│   └── styles/{shared,block-detail}.css
├── .github/workflows/pages.yml
├── AGENTS.md                           LLM brief
├── CLAUDE.md                           redirect to AGENTS.md
├── init-topic.sh                       one-shot rename
├── package.json
└── vite.config.js
```

## Scripts

```bash
npm run dev      # local dev server (hot reload)
npm run build    # production build → dist/
npm run preview  # serve the built dist/ for a final check
```

## Versioning

The template version lives in `package.json` and is rendered in the
footer of every page (e.g. `kb-template v1.0.0`). When you release a new
version of the template:

```bash
npm version <patch|minor|major>   # bumps package.json + creates git tag
git push --follow-tags
```

Topic repos created from a given template version stay pinned to that
version unless you re-sync them.

## License

MIT — see [LICENSE](./LICENSE).
