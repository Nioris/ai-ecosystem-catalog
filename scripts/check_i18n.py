#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "locales"
required_ui = {
    "title","metaDescription","version","hero","language","loading",
    "navigatorTitle","navigatorText","profession","task","allProfessions","allTasks",
    "clear","recipesTitle","recipesText","tabCatalog","tabPaid","tabRepos","tabRadar",
    "catalogPlaceholder","paidPlaceholder","repoPlaceholder","requirements","runtime",
    "source","copy","copied","service","pricing","clone","open","risk","checked",
    "shown","of","noResults","loadError"
}
required_professions = {
    "game-dev","frontend","backend","ai-engineer","devops","data-research","uiux",
    "2d-artist","3d-artist","animator","video","music","voice","writer","marketing","office"
}
required_tasks = {
    "html-game","sprite","game-ui","game-vfx","3d-asset","animation","image","video-gen",
    "video-fix","music","tts","asr","docs","coding-agent","local-llm","agent-memory",
    "browser","skills-mcp","novel","research"
}
required_quick = {"local","cloud","open","24gb","russian","api","free"}

errors=[]
for code in ("ru","en","zh"):
    path=LOCALES/f"{code}.json"
    try:
        data=json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        errors.append(f"{code}: invalid JSON: {e}")
        continue
    for keyset,field in ((required_ui,"ui"),(required_professions,"professions"),(required_tasks,"tasks"),(required_quick,"quickFilters")):
        missing=sorted(keyset-set(data.get(field,{})))
        if missing: errors.append(f"{code}.{field}: missing {missing}")
if errors:
    print("\n".join(errors))
    raise SystemExit(1)
print("i18n OK: ru/en/zh locale schemas are complete")
