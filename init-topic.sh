#!/usr/bin/env bash
# init-topic.sh — rename this template to a specific topic.
#
# Usage:
#   ./init-topic.sh <topic-slug> [<display-title>] [<subtitle>]
#
# Examples:
#   ./init-topic.sh procgen-overview
#   ./init-topic.sh procgen-overview "Procgen Pipeline Reference" "data_gen/procedural_generation"
#
# What it patches:
#   - package.json     → "name": "kb-<topic-slug>"
#   - package.json     → "description": "<subtitle>"
#   - index.html       → <title>
#   - src/shared/data.js → BLOCK_REGISTRY.name + .subtitle
#   - README.md        → first heading

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <topic-slug> [<display-title>] [<subtitle>]" >&2
  echo "  <topic-slug>     kebab-case, e.g. procgen-overview" >&2
  echo "  <display-title>  defaults to <topic-slug> title-cased" >&2
  echo "  <subtitle>       short tagline, defaults to <topic-slug>" >&2
  exit 1
fi

slug="$1"
default_title="$(echo "$slug" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1')"
title="${2:-$default_title}"
subtitle="${3:-$slug}"

if ! [[ "$slug" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "Error: slug must be kebab-case (lowercase, digits, hyphens), got: $slug" >&2
  exit 1
fi

echo "→ topic slug:  $slug"
echo "→ title:       $title"
echo "→ subtitle:    $subtitle"
echo

# Use perl for portable in-place editing (works on Linux + macOS without -i quirks).
perl -i -pe "s/\"name\": \"kb-template\"/\"name\": \"kb-$slug\"/" package.json
perl -i -pe "s/\"description\": \".*\"/\"description\": \"$subtitle\"/" package.json
echo "✓ patched package.json"

perl -i -pe "s|<title>Knowledge Blocks</title>|<title>$title</title>|" index.html
echo "✓ patched index.html"

perl -i -pe "s/name: 'Knowledge Blocks',/name: '$title',/" src/shared/data.js
perl -i -pe "s/subtitle: 'topic-name',/subtitle: '$subtitle',/" src/shared/data.js
echo "✓ patched src/shared/data.js"

perl -i -pe "s/^# kb-template$/# kb-$slug/" README.md
echo "✓ patched README.md"

echo
echo "Done. Next:"
echo "  npm install"
echo "  npm run dev"
