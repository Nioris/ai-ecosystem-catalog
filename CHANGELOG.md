# Changelog

## v12 — 2026-09-01

### Multilingual UI
- Added first-class **Russian / English / Simplified Chinese** interface support.
- Added header language switcher: `RU / EN / 中文`.
- Added shareable language URLs: `?lang=ru`, `?lang=en`, `?lang=zh`.
- Browser language/localStorage is used as a default preference.
- Localized profession/task navigator, quick filters, ready-made stacks, tabs, sorting, warnings, stats and card action labels.
- Added English and Chinese search synonym expansion.
- Added exact translation maps for common categories, statuses, locality and license/access labels.

### Progressive content localization
- Added `locales/ru.json`, `locales/en.json` and `locales/zh.json`.
- Added curated English/Chinese content translations for newly verified projects such as MinerU, Agent Skills, Codebase Memory MCP, Prime Agent, Vercel AI SDK, DFlash and `codex-chatgpt-web`.
- Untranslated long-form descriptions safely fall back to the original curated text and are visibly marked as `original RU` / `俄文原文`.
- Added `TRANSLATIONS.md` with the contribution format.
- Added `scripts/check_i18n.py` and a GitHub Actions locale-schema validation workflow.

## v11 — 2026-09-01

### Navigation / UX
- Added **Profession → Task → Tool** navigator.
- Added curated ready-made stacks: Solo HTML Game, 2D Pixel Game, 3D Indie Game, YouTube/Shorts, Local AI Workstation, Research/PDF, Writer Studio and Coding Agent Stack.
- Added Russian/English synonym expansion for common searches (`спрайт`, `озвучка`, `ролик`, `3д`, `PDF`, `кодинг`, etc.).
- Added combinable quick filters: Local, Cloud, Open weights/source, <=24 GB VRAM, Russian, API and Free tier.
- Profession/task selection now also narrows paid services and GitHub repositories.
- Added sorting for catalog and GitHub repositories.

### GitHub / repository health
- Added verified metadata fields: Stars, Forks, last push, license and verification date.
- Added health labels (`A Active`, `B Experimental`, `C Legacy`, `D Archived`).
- Corrected **Flowise** to Archived.
- Kept **Roo Code** as Archived/Legacy.
- Added an automated weekly GitHub Actions health check covering **111 repositories**.
- Added `data/repo-health.json` with stars, forks, archive state, language, open issues, last push and latest release.
- The first full automated scan completed with **0 API errors**.

### New verified projects
- MinerU
- Addy Osmani Agent Skills
- Codebase Memory MCP
- Prime Agent
- Vercel AI SDK
- DFlash
- `miuuyy/codex-chatgpt-web` (marked Experimental / Unofficial)

### Radar
- Added a dedicated Radar tab.
- Added `@vibecoding_tg` as a discovery source, with verification required before promotion.
- Added security/risk notes for MCP, skills and subscription/browser bridges.

## v10 — 2026-08-31
- Updated model catalog through 31 August 2026.
- Added Qwen3.8-Flash-Next, GLM-5.3-Flash, Liquid LFM2.5 updates, MiniMax H3/M3, Wan Animate 2, Ideogram 4, Krea models, Seed models and other releases.
- Updated Hermes Agent, OpenClaw, Grok and other fast-moving entries.
