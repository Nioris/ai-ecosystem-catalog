# Changelog

## v14.1 — 2026-09-11

### Uncensored / Reduced safeguards
- Added a dedicated **Uncensored / Reduced safeguards** section instead of mixing these community checkpoints into the ordinary model list without context.
- Added a global quick filter **Без цензуры / Uncensored / 无审查**.
- Added curated cards for current Qwen, Gemma, GLM and DeepSeek community variants, including abliterated, uncensored fine-tune, balanced reduced-safeguards and roleplay/creative classes.
- Added model lineage, modification class, parameter/format information, local runtime hints and safeguard-risk labels.
- Added explicit warning that reduced refusal behavior does not imply better accuracy/reliability and that public/tool-using deployments need their own permission, logging and moderation layers.
- Added full RU / EN / Simplified Chinese copy for the new section.
- CI now validates the v14.1 JSON payload and JavaScript.

## v14 — 2026-09-11

### Unity / game-engine agents
- Added **Unity In-Editor AI Assistant** with Ask / Plan / Agent modes.
- Added the official **Unity Agent Plugin** for Claude Code, Codex and Grok workflows.
- Added **Unity CLI + MCP Server** as a separate infrastructure layer for live Editor control.
- Added the official Unity agent repository to the weekly GitHub health snapshot.

### Agents / models / infrastructure
- Added **DeepSeek-V4.1-Flash**.
- Added **Qwen3.8-Max-0902**.
- Updated **Kimi Code** with Tower multi-agent collaboration and newer agent/plugin workflows.
- Added **Grok Bot** and new agent tooling where verified.
- Added **OpenAI Secure MCP Tunnel** (`openai/tunnel-client`) and included it in repository health checks.

## v13 — 2026-09-06

### September model refresh
- Added **GPT-6 Astra** and marked GPT-5.6 Sol as the previous-generation OpenAI flagship.
- Added **Claude Fable 5.1** and restricted-access **Claude Mythos 5.1**.
- Added **Gemini 3.8 Flash**, **Gemini 3.8 Flash Cyber**, **Gemini Omni 1.1 Flash** and **Lyria 3.5**.
- Corrected **GLM-5.3**: the full official open-weight checkpoint is now published; the catalog no longer marks its weights as pending.
- Added **DeepSeek-V4-Pro-0813** and experimental **DeepSeek-V4-Flash-Vision-Exp**.
- Added **Qwen-Drive-1.0-4B** for autonomous-driving perception/reasoning/planning research.
- Added **Stable Audio 3 Optimized** deployment package.
- Added **GPT-Realtime-2.1**, **GPT-Realtime-2.1 Mini** and **GPT-Image-2**.
- Added specialized **WeatherNext 3** to broaden the catalog beyond general-purpose generative models.
- Added a September release strip linking directly to official release/model pages.
- New v13 cards include curated RU / EN / Simplified Chinese descriptions, requirements and notes.

### Data pipeline
- Added `data/v13-extra.b64` as a gzip+base64 incremental release payload, so fast model updates no longer require rebuilding the old compressed base catalog.
- Added `v13-update.js` for incremental model insertion and stale-entry patches.
- CI now validates the v13 payload and JavaScript syntax before publication.

## v12.2 — 2026-09-01
- Fixed profession/task matching to use token-aware keywords instead of broad substring matching.
- Made profession and task selectors cascade in both directions.
- Added live quick-filter counts and removable active-filter chips.
- The top summary now shows the actual filtered result count instead of only the total catalog size.

## v12.1 — 2026-09-01
- Prevented Russian source text from leaking into English/Chinese cards when a manual translation is not yet available.
- Added runtime localization safety for historical tags and requirements.

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
