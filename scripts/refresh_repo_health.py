import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "data" / "repo-sources.json"
OUTPUT = ROOT / "data" / "repo-health.json"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
API = "https://api.github.com"

headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "ai-ecosystem-catalog-health-check",
    "X-GitHub-Api-Version": "2022-11-28",
}
if TOKEN:
    headers["Authorization"] = f"Bearer {TOKEN}"


def get_json(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response), response.status
    except urllib.error.HTTPError as exc:
        if exc.code in (404, 451):
            return None, exc.code
        raise


def short_date(value):
    return value[:10] if value else None


def main():
    source = json.loads(SOURCES.read_text(encoding="utf-8"))
    slugs = source["repositories"]
    today = datetime.now(timezone.utc).date().isoformat()
    result = {}
    errors = []

    for index, slug in enumerate(slugs, 1):
        print(f"[{index}/{len(slugs)}] {slug}", flush=True)
        repo, status = get_json(f"{API}/repos/{slug}")
        if repo is None:
            result[slug] = {
                "verified": today,
                "missing": True,
                "http_status": status,
            }
            errors.append(f"{slug}: HTTP {status}")
            continue

        release, _ = get_json(f"{API}/repos/{slug}/releases/latest")
        result[slug] = {
            "verified": today,
            "stars": repo.get("stargazers_count"),
            "forks": repo.get("forks_count"),
            "archived": bool(repo.get("archived")),
            "disabled": bool(repo.get("disabled")),
            "license": (repo.get("license") or {}).get("spdx_id") or (repo.get("license") or {}).get("name"),
            "pushed": short_date(repo.get("pushed_at")),
            "repo_updated": short_date(repo.get("updated_at")),
            "language": repo.get("language"),
            "open_issues": repo.get("open_issues_count"),
            "default_branch": repo.get("default_branch"),
            "latest_release": release.get("tag_name") if release else None,
            "latest_release_date": short_date(release.get("published_at")) if release else None,
            "missing": False,
        }

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "repository_count": len(slugs),
        "errors": errors,
        "repositories": result,
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT} ({len(result)} repositories, {len(errors)} errors)")


if __name__ == "__main__":
    main()
