# Sources and verification

The catalog uses a two-stage workflow:

1. **Discovery** — public Telegram channels, GitHub trending/search, Hugging Face, model announcements, community posts.
2. **Verification** — official repository/model page, latest release, archive status, license, official docs and (when relevant) pricing page.

## Discovery sources

- GitHub
- Hugging Face
- Official developer/company blogs
- Public community feeds, including `https://t.me/vibecoding_tg`

A link found in a community channel goes to **Radar** first. It should not be treated as verified simply because it is popular.

## Security-sensitive projects

Extra caution is required for:
- browser automation bridges;
- subscription bridges;
- MCP servers;
- agent skill packs;
- tools that receive filesystem/shell/browser permissions;
- projects that store session cookies, browser profiles, API keys or tunnel credentials.

For these projects, read `README`, `SECURITY`, permissions and Terms before installing or enabling full tool access.
