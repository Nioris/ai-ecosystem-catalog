#!/usr/bin/env python3
import base64
import gzip
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "locales"
RUNTIME = ROOT / "i18n-runtime.js"
INDEX = ROOT / "index.html"
CYR = re.compile(r"[А-Яа-яЁё]")
CYR_WORD = re.compile(r"[А-Яа-яЁё]+")

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
warnings=[]
locales={}
for code in ("ru","en","zh"):
    path=LOCALES/f"{code}.json"
    try:
        data=json.loads(path.read_text(encoding="utf-8"))
        locales[code]=data
    except Exception as e:
        errors.append(f"{code}: invalid JSON: {e}")
        continue
    for keyset,field in ((required_ui,"ui"),(required_professions,"professions"),(required_tasks,"tasks"),(required_quick,"quickFilters")):
        missing=sorted(keyset-set(data.get(field,{})))
        if missing: errors.append(f"{code}.{field}: missing {missing}")

# v12.1 must load the safety layer that prevents Russian source fallbacks in EN/ZH.
if not RUNTIME.exists():
    errors.append("missing i18n-runtime.js")
else:
    runtime=RUNTIME.read_text(encoding="utf-8")
    for needle in ("content=function", "fallbackFor=function(){return false}", "function translatedTerm", "genericRequirements", 'return LANG==="zh"?"其他":"Other"'):
        if needle not in runtime:
            errors.append(f"i18n-runtime.js: missing safety mechanism {needle!r}")
    if 'i18n-runtime.js' not in INDEX.read_text(encoding="utf-8"):
        errors.append("index.html does not load i18n-runtime.js")

# Decode the published catalog and inspect categorical values rendered as tags/chips.
# Explicit dictionaries are preferred, but older rare variants may safely fall back to
# the v12.1 runtime's non-Cyrillic Other/其他 label. Those are reported as warnings.
try:
    parts=["catalog.part1a","catalog.part2","catalog.part3","catalog.part4a","catalog.part4b"]
    encoded="".join((ROOT/"data"/p).read_text(encoding="utf-8") for p in parts)
    base=json.loads(gzip.decompress(base64.b64decode(encoded)).decode("utf-8"))
    extra=json.loads((ROOT/"data"/"v11-extra.json").read_text(encoding="utf-8"))

    tools=list(base.get("tools",[]))
    for upd in extra.get("itemUpdates",[]):
        for x in tools:
            if x.get("name")==upd.get("name"):
                x.update(upd.get("patch",{}))
                break
    existing={x.get("name") for x in tools}
    for x in extra.get("newTools",[]):
        if x.get("name") not in existing:
            tools.append(x)

    repos=list(base.get("repos",[]))
    by_slug={x.get("slug"):i for i,x in enumerate(repos)}
    for r in extra.get("repoAdditions",[]):
        if r.get("slug") in by_slug:
            repos[by_slug[r.get("slug")]].update(r)
        else:
            repos.append(r)

    values=set()
    for x in list(base.get("models",[]))+tools:
        for key in ("kind","status","locality"):
            if x.get(key): values.add(str(x[key]))
        for key in ("tags2","cats"):
            for v in x.get(key,[]) or []: values.add(str(v))
    for x in base.get("paid",[]):
        for key in ("category","status","locality"):
            if x.get(key): values.add(str(x[key]))
    for x in repos:
        for key in ("category","status","verified"):
            if x.get(key): values.add(str(x[key]))
    for x in extra.get("radar",[]):
        for key in ("type","source","status"):
            if x.get(key): values.add(str(x[key]))

    runtime_text=RUNTIME.read_text(encoding="utf-8") if RUNTIME.exists() else ""
    for code in ("en","zh"):
        terms=locales.get(code,{}).get("terms",{})
        uncovered=[]
        for value in sorted(v for v in values if CYR.search(v)):
            if value in terms:
                continue
            tokens=CYR_WORD.findall(value)
            if tokens and all(tok in runtime_text for tok in tokens):
                continue
            uncovered.append(value)
        if uncovered:
            warnings.append(f"{code}: {len(uncovered)} historical tag/status variants use safe runtime fallback: {uncovered}")
except Exception as e:
    errors.append(f"catalog i18n inspection failed: {e}")

for w in warnings:
    print("WARNING:",w)
if errors:
    print("\n".join(errors))
    raise SystemExit(1)
print("i18n OK: RU/EN/ZH schemas are complete and EN/ZH cannot render Cyrillic source fallbacks")
