# AGENTS.md — brief for LLM agents filling out this template

You are filling out a **knowledge-blocks** site. This file tells you how the
site works, what to build, and the quality bar. Read it end-to-end before
making any changes.

## Mission

A knowledge-blocks site is a **read-only reference** for one topic.
Each "block" is a deep-dive page on one slice of the topic — what it does,
the parameters that control it, and recipes the reader can remix.

Your job is to:

1. Understand the topic the user gives you (read their source material first).
2. Decompose it into 5–15 blocks, each covering one cohesive slice.
3. Wire them up: register each block, create its entry shell, and write its
   content using the patterns documented below.
4. Verify with `npm run build`.

> [!IMPORTANT]
> If the topic documents code in another repo, treat that code as
> **read-only**. You are writing reference material, not modifying the
> upstream. Don't propose code changes unless the user explicitly asks.

## Repo layout

```
kb-{topic}/
├── index.html                          home page shell (don't edit)
├── blocks/
│   └── <slug>.html                     one entry shell per block
├── public/resources/
│   └── <slug>.html                     content for each block (the work)
├── src/
│   ├── pages/{home,block-detail}.js    page renderers (don't edit)
│   ├── shared/
│   │   ├── data.js                     ★ BLOCK_REGISTRY — edit this
│   │   ├── theme.js | navigation.js | footer.js | graph.js   (don't edit)
│   └── styles/{shared,block-detail}.css                       (don't edit)
├── AGENTS.md                           this file
├── CLAUDE.md                           one-line redirect to AGENTS.md
├── README.md                           human-facing usage
├── init-topic.sh                       one-shot rename script
├── package.json
└── vite.config.js
```

**You only ever edit three things:** `src/shared/data.js`, files in
`blocks/`, and files in `public/resources/`. Everything else is
infrastructure.

## The block schema

Every block is one entry in the `BLOCK_REGISTRY.blocks` array in
`src/shared/data.js`:

```javascript
{
  slug: 'my-block',                  // kebab-case, matches filenames
  title: 'My Block',                 // ≤ 32 chars, human-readable
  icon: '🧩',                         // single emoji
  description:                       // one sentence shown on home grid
    'What this block covers, in one line',
  tags: ['category', 'subcategory'], // 1–4 short kebab-case tags
  connections: ['other-slug'],       // graph edges to other blocks
  built: true,                       // false = appears in graph but not navigable
  sources: [
    { title: 'docs/foo.md', url: '../../docs/foo.md' },           // local → renders as path
    { title: 'Upstream Project', url: 'https://example.com/x' },  // http(s) → renders as link
  ],
}
```

### Field rules

| Field | Rule |
|-------|------|
| `slug` | Must match the filename in `blocks/` and `public/resources/`. The slug is also the URL. |
| `icon` | Exactly one emoji. Don't combine emojis. |
| `description` | One sentence, ≤ 120 chars. No marketing fluff ("comprehensive", "powerful"). |
| `tags` | 1–4 tags, kebab-case. Group related blocks visually. |
| `connections` | Slugs of blocks this one references. Bidirectional in the UI — you only need to declare each edge once. |
| `built` | Default `true`. Set `false` only if you're scaffolding a placeholder for later. |
| `sources` | URLs starting with `http(s)://` render as outbound links; everything else renders as a styled file path (no link). |

## How to add a block — 3 steps

### Step 1 — register it

Append to `BLOCK_REGISTRY.blocks` in `src/shared/data.js`. Keep entries
ordered by reading flow (overview → fundamentals → details).

### Step 2 — create the entry shell

Copy any existing file in `blocks/` (e.g. `getting-started.html`) and change:

- The `<title>` (e.g. `My Block · {topic}`)
- The `data-block-slug` attribute on `<main id="blockDetail">`

The rest of the shell is identical for every block.

### Step 3 — write the content

Create `public/resources/<slug>.html`. This is where 95% of your work goes.
Use the **content vocabulary** below.

## Content vocabulary

Every block's resource HTML is a series of `<section class="section">`
wrappers. Inside each section, use these patterns:

### Section heading

```html
<section class="section">
  <h2><span class="section-number">01</span>Title of this section</h2>
  ...
</section>
```

Number sections starting at `01`. Pad to 2 digits (`01`, `02`, ..., `12`).

### Prose

```html
<p class="prose">
  Body text. Inline <code>tokens</code> look like this. Keep paragraphs
  short — one idea each.
</p>
```

### Config block (code, commands, diagrams)

```html
<div class="cfg">
  <div class="cfg-head">bash</div>
<pre>npm install
npm run dev</pre>
</div>
```

The `cfg-head` label is purely visual — `bash`, `python`, `flow`, `yaml`,
etc. There's no syntax highlighting; pick whatever label clarifies what
you're showing.

> [!NOTE]
> Inside `<pre>`, **don't indent the content**. The `<pre>` preserves
> whitespace exactly as written, so leading spaces become visible
> indentation in the rendered page.

### Tip callout

```html
<div class="tip">
  <strong>Lead-in:</strong> one or two sentences of high-signal advice.
</div>
```

Bold the lead-in so readers can skim. If your tip needs more than 3
sentences, it should be a section instead.

### Recipe card (named end-to-end scenario)

```html
<div class="uc">
  <div class="uc-title">Recipe name</div>
  <div class="uc-sub">when to reach for it</div>
  <div class="uc-body">
    <p>One paragraph of context.</p>
  </div>
  <div class="cfg">
    <div class="cfg-head">bash</div>
<pre>actual command here</pre>
  </div>
</div>
```

Use these for "here's how I'd actually do X". Each block typically has
2–4 recipes near the end.

### Debugging accordion

```html
<details>
  <summary>Symptom or question (this is what readers see closed)</summary>
  <p class="prose">
    Cause, then fix.
  </p>
</details>
```

Stack 3–6 of these in a "Diagnosing problems" section near the end of a
block.

### Tables

Use plain `<table>` for parameter references or comparisons. Cells
support inline `<code>`.

```html
<table>
  <thead>
    <tr><th>Parameter</th><th>Default</th><th>Effect</th></tr>
  </thead>
  <tbody>
    <tr><td><code>foo</code></td><td><code>3</code></td><td>How many bars</td></tr>
  </tbody>
</table>
```

### Inline cross-block links

Resource files all live in the same flat directory at build time, so
sibling links use plain relative paths:

```html
<p class="prose">
  See the <a href="./other-slug.html"><em>Other Block</em></a> for
  the rest of the parameters.
</p>
```

Wrap the linked title in `<em>` for visual distinction.

## Quality bar

A block is ready when:

- [ ] Entry in `BLOCK_REGISTRY.blocks` with `built: true`
- [ ] Both files exist: `blocks/<slug>.html` and `public/resources/<slug>.html`
- [ ] At least 3 sections, numbered `01`, `02`, `03`, ...
- [ ] At least one `.cfg` block showing concrete code/config
- [ ] At least one `.tip` or `.uc` recipe
- [ ] Cross-links to other blocks where there's a real connection (not just to fill the graph)
- [ ] `npm run build` succeeds

### Things to avoid

- **No marketing language.** "Powerful", "comprehensive", "seamless" are dead weight.
- **No fabrication.** If you don't know a parameter's default, leave it blank or check the source. Never invent.
- **No giant prose walls.** Break up with sections, tables, code blocks. If a section is > 4 paragraphs, split it.
- **No fake source links.** If you're pointing at a file in another repo that won't resolve at build time, leave the URL as a relative path — the renderer will display it as a file path with no broken link.
- **No emoji decoration in body text.** Emojis are for the `icon` field only. (Exception: standard symbols like ✓ or → in tables are fine.)

## Verifying

```bash
npm install        # one-time
npm run build      # must succeed cleanly
npm run preview    # open the URL it prints, click around
```

Open the home page, confirm every block card is clickable, click each
one, confirm the page renders, click the cross-block links in the body
and in the "Connected blocks" footer.

## What's already in this repo

A single example block, `getting-started`, that demonstrates every
content pattern. Read it before writing your own — it's the closest
thing to a worked reference. Once you've started filling out your own
blocks, you can either delete the `getting-started` block (remove from
registry + delete both files) or rewrite it as your topic's introduction.
