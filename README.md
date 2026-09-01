# AI Ecosystem Catalog

Public, curated navigator of AI models, agents, runtimes, creative tools, game-development tools, paid AI services and useful GitHub repositories.

**Live site:** https://nioris.github.io/ai-ecosystem-catalog/

## v11 — 1 September 2026

The catalog is now task-oriented rather than only a flat list:

- choose a **profession / role**;
- choose **what you want to do**;
- combine filters such as local/cloud, open-source/open-weights, <=24 GB VRAM, Russian, API and free tier;
- search with Russian/English synonyms;
- browse verified GitHub health metadata where available;
- use **Radar** for newly discovered projects before they are promoted into the main catalog.

### Main sections

- Models & tools
- Paid services
- Top GitHub repositories
- Radar / findings
- Game assets / pixel art / VFX / animation
- Video / image / audio / music / voice / 3D
- Coding agents / MCP / agent skills / RAG / local inference
- Documents / OCR

## Repository structure

```text
.
├── index.html
├── app.js
├── styles.css
├── README.md
├── CHANGELOG.md
├── SOURCES.md
├── LICENSE
├── .nojekyll
└── data/
    ├── catalog.part1a
    ├── catalog.part2
    ├── catalog.part3
    ├── catalog.part4a
    ├── catalog.part4b
    └── v11-extra.json
```

The current site keeps the compressed v10 base dataset and applies the small `v11-extra.json` verified delta in the browser. This makes routine updates smaller while preserving the full catalog.

## Source policy

Telegram/news posts are treated as **discovery signals**, not authoritative sources. Before a project is promoted into the main catalog, we try to verify its official GitHub/Hugging Face page, release status, license and activity.

The Radar currently also watches public discoveries from `@vibecoding_tg`.

## Notes

Hardware requirements, pricing, model availability, licenses and repository status change quickly. Always verify the official source before a commercial deployment or a large download.

Catalog/site code is MIT-licensed. Third-party projects and model weights retain their own licenses.
