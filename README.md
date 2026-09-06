# AI Ecosystem Catalog

Public, curated navigator of AI models, agents, runtimes, creative tools, game-development tools, paid AI services and useful GitHub repositories.

**Live site:** https://nioris.github.io/ai-ecosystem-catalog/

## v13 — 6 September 2026

The September refresh adds current frontier and specialized models, including:

- GPT-6 Astra
- Claude Fable 5.1 / Mythos 5.1
- Gemini 3.8 Flash / Gemini 3.8 Flash Cyber
- Gemini Omni 1.1 Flash
- Lyria 3.5
- DeepSeek-V4-Pro-0813 / DeepSeek-V4-Flash-Vision-Exp
- Qwen-Drive-1.0-4B
- GPT-Realtime-2.1 / Mini
- GPT-Image-2
- Stable Audio 3 Optimized
- WeatherNext 3

It also corrects **GLM-5.3**: the full official open-weight checkpoint is now available, so it is no longer marked as “weights pending”.

Fast model refreshes are now shipped as an incremental compressed payload (`data/v13-extra.b64`) loaded by `v13-update.js`, avoiding a rebuild of the older compressed base catalog.

## Three languages

The interface supports:

- **Русский** — `?lang=ru`
- **English** — `?lang=en`
- **简体中文** — `?lang=zh`

The language selector is available in the page header. The choice is stored locally in the browser, while the query parameter makes a language-specific link shareable.

Navigation, filters, profession/task guidance, ready-made stacks, search synonyms, card labels and key statuses are localized. v12.1 added a safety layer so English/Chinese cards do not silently leak Russian source text when a hand-written translation is absent. New v13 cards ship with curated RU/EN/ZH descriptions, requirements and notes.

## Task-oriented navigation

The catalog is more than a flat list:

- choose a **profession / role**;
- choose **what you want to do**;
- the profession/task selectors cascade and intersect;
- combine filters such as local/cloud, open-source/open-weights, <=24 GB VRAM, Russian support, API and free tier;
- see live result counts and removable active filters;
- search with Russian, English and Chinese synonyms;
- browse verified GitHub health metadata;
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

## Automated GitHub health

The Top GitHub section is backed by an automated snapshot for more than 100 repositories. A GitHub Actions workflow refreshes repository metadata every Monday and can also be run manually.

The snapshot includes, when available:

- Stars and forks
- Archived/disabled state
- Last push and repository update date
- License
- Primary language
- Open issues
- Default branch
- Latest GitHub release

The site loads `data/repo-health.json` when available and falls back to curated metadata if the automated snapshot is missing.

## Repository structure

```text
.
├── index.html
├── app.js
├── i18n-runtime.js
├── filter-v12.2.js
├── v13-update.js
├── styles.css
├── README.md
├── CHANGELOG.md
├── SOURCES.md
├── TRANSLATIONS.md
├── LICENSE
├── .nojekyll
├── locales/
│   ├── ru.json
│   ├── en.json
│   └── zh.json
├── scripts/
│   ├── refresh_repo_health.py
│   └── check_i18n.py
├── .github/workflows/
│   ├── refresh-repo-health.yml
│   └── check-i18n.yml
└── data/
    ├── catalog.part1a
    ├── catalog.part2
    ├── catalog.part3
    ├── catalog.part4a
    ├── catalog.part4b
    ├── v11-extra.json
    ├── v13-extra.json
    ├── v13-extra.b64
    ├── repo-sources.json
    └── repo-health.json
```

## Source policy

Telegram/news posts are treated as **discovery signals**, not authoritative sources. Before a project or model is promoted into the main catalog, we verify the official GitHub, Hugging Face, developer documentation or release announcement where possible.

The Radar also watches public discoveries from `@vibecoding_tg`.

## Notes

Hardware requirements, pricing, model availability, licenses and repository status change quickly. Always verify the official source before a commercial deployment or a large download.

Catalog/site code is MIT-licensed. Third-party projects and model weights retain their own licenses.
