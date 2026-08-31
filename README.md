# AI Ecosystem Catalog

Curated catalog of AI models, agents, tools, game assets, video, audio, 3D, paid AI services and useful open-source repositories.

**Current release:** v10 — 2026-08-31  
**Catalog:** 217 entries — 86 models + 131 tools/systems  
**Curated repositories:** 104  
**Paid services:** 31

## Live site

Once GitHub Pages is enabled for the `main` branch, the catalog is available at:

https://nioris.github.io/ai-ecosystem-catalog/

## What is inside

The catalog covers:

- text, reasoning and creative-writing models
- coding models and coding agents
- image generation and editing
- video generation, avatars, lip-sync, restoration and post-processing
- TTS, voice cloning, ASR, music and audio
- multimodal / vision / OCR models
- 3D and game-asset generation
- pixel art, sprites, tilesets, maps, UI/HUD and VFX
- local inference runtimes and desktop/web UIs
- agent frameworks, MCP, RAG and orchestration
- paid AI services with pricing notes
- curated open-source repositories by category

## Repository structure

```text
.
├── index.html
├── README.md
├── CHANGELOG.md
├── LICENSE
├── .nojekyll
└── data/
    ├── catalog.part1
    ├── catalog.part2
    ├── catalog.part3
    └── catalog.part4
```

The four `catalog.part*` files are generated Base64 shards of a gzip-compressed JSON object containing `models`, `tools`, `paid`, and `repos`. The browser joins and decompresses them at runtime. This is a generated deployment format; on updates the shards are regenerated together.

## Updating

Major catalog updates should:

1. verify new releases against official sources;
2. regenerate catalog data and `catalog.part*`;
3. update `index.html` if UI or metadata changes;
4. add a short entry to `CHANGELOG.md`.

## Accuracy

AI releases, pricing, licenses and hardware requirements change quickly. Dates inside cards indicate the verification/update date where available. Always open the official source before purchasing a service, downloading a very large checkpoint, or relying on a license for commercial use.

## License

The repository code and catalog presentation are under the repository's MIT License. Individual models, tools, datasets, trademarks and linked services retain their own licenses and terms.
