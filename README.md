# AI Ecosystem Catalog

Public, curated navigator of AI models, agents, runtimes, creative tools, game-development tools, paid AI services and useful GitHub repositories.

**Live site:** https://nioris.github.io/ai-ecosystem-catalog/

## v14.1 — 11 September 2026

The catalog now includes a dedicated **Uncensored / Reduced safeguards** section for community-modified local models. These models are separated from ordinary official checkpoints so their lineage and changed safety behavior are visible instead of being hidden behind a generic model card.

The section currently covers representative Qwen, Gemma, GLM and DeepSeek variants across four classes:

- **Abliterated** — refusal-related behavior modified directly in weights;
- **Uncensored fine-tune** — community fine-tunes with reduced refusals;
- **Roleplay / Creative** — variants primarily aimed at free-form chat, fiction and persona workflows;
- **Balanced reduced safeguards** — less restrictive community variants that intentionally retain more behavioral stability than aggressive uncensoring.

Each card includes base-model lineage, modification class, model size/format, local-runtime notes and a safeguard-risk marker. The navigator also has a global **Uncensored / Reduced safeguards** quick filter. Public or tool-using deployments should add their own permission boundaries, logging and moderation because reduced refusal behavior does not imply higher accuracy or reliability.

## v14 — Unity / agent tooling

The September 11 refresh also added the Unity agent stack as separate layers rather than one ambiguous “Unity AI” entry:

- **Unity In-Editor AI Assistant** — Ask / Plan / Agent modes inside Unity;
- **Official Unity Agent Plugin** — first-party skills/integration for Claude Code, Codex and Grok;
- **Unity CLI + MCP Server** — terminal and MCP control of a live Unity Editor.

It also added DeepSeek-V4.1-Flash, Qwen3.8-Max-0902, current Kimi Code agent features, Grok Bot and OpenAI Secure MCP Tunnel where verified.

## Three languages

The interface supports:

- **Русский** — `?lang=ru`
- **English** — `?lang=en`
- **简体中文** — `?lang=zh`

The language selector is available in the page header. The choice is stored locally in the browser, while the query parameter makes a language-specific link shareable.

Navigation, filters, profession/task guidance, ready-made stacks, search synonyms, card labels and key statuses are localized. New release cards and the reduced-safeguards section include curated RU/EN/ZH descriptions, requirements and notes.

## Task-oriented navigation

The catalog is more than a flat list:

- choose a **profession / role**;
- choose **what you want to do**;
- the profession/task selectors cascade and intersect;
- combine filters such as local/cloud, open-source/open-weights, <=24 GB VRAM, Russian support, API, free tier and reduced safeguards;
- see live result counts and removable active filters;
- search with Russian, English and Chinese synonyms;
- browse verified GitHub health metadata;
- use **Radar** for newly discovered projects before they are promoted into the main catalog.

### Main sections

- Models & tools
- Uncensored / Reduced safeguards
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
├── v14-update.js
├── v14.1-update.js
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
    ├── v14-extra.json
    ├── v14.1-uncensored.json
    ├── repo-sources.json
    └── repo-health.json
```

## Source policy

Telegram/news posts are treated as **discovery signals**, not authoritative sources. Before a project or model is promoted into the main catalog, we verify the official GitHub, Hugging Face, developer documentation or release announcement where possible.

The Radar also watches public discoveries from `@vibecoding_tg`.

## Notes

Hardware requirements, pricing, model availability, licenses and repository status change quickly. Always verify the official source before a commercial deployment or a large download.

Catalog/site code is MIT-licensed. Third-party projects and model weights retain their own licenses.
