"""Refresh _data/stats.json: Google Scholar citations and total GitHub stars.

Settings come from the `stats:` block in _config.yml.

GitHub stars: every non-fork repo owned by `github_user`, plus `github_repos`.
Scholar citations: via SerpApi when the SERPAPI_KEY secret is set (reliable);
otherwise the public profile page is fetched directly, which Google often blocks
from GitHub's servers. A source that fails keeps its previous number.
"""
import datetime
import json
import os
import re
import sys
import urllib.parse
import urllib.request

import yaml

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "_data", "stats.json")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"

with open(os.path.join(ROOT, "_config.yml")) as f:
    cfg = yaml.safe_load(f).get("stats", {})

try:
    with open(OUT) as f:
        data = json.load(f)
except (OSError, ValueError):
    data = {}

today = datetime.date.today().isoformat()
errors = []


def get(url, headers=None, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8")


# ---------- GitHub stars ----------
def github_stars():
    headers = {"Accept": "application/vnd.github+json"}
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    stars = {}
    user = cfg.get("github_user")
    page = 1
    while user:
        repos = json.loads(get(f"https://api.github.com/users/{user}/repos?per_page=100&type=owner&page={page}", headers))
        for r in repos:
            if not r["fork"]:
                stars[r["full_name"].lower()] = r["stargazers_count"]
        if len(repos) < 100:
            break
        page += 1
    for name in cfg.get("github_repos") or []:
        r = json.loads(get(f"https://api.github.com/repos/{name}", headers))
        stars[r["full_name"].lower()] = r["stargazers_count"]
    return sum(stars.values())


# ---------- Scholar citations ----------
def scholar_citations():
    sid = cfg.get("scholar_id")
    key = os.environ.get("SERPAPI_KEY", "").strip()
    if key:
        q = urllib.parse.urlencode({"engine": "google_scholar_author", "author_id": sid, "hl": "en", "api_key": key})
        res = json.loads(get("https://serpapi.com/search.json?" + q))
        if res.get("error"):
            raise RuntimeError(res["error"])
        table = {k: v.get("all") for row in res.get("cited_by", {}).get("table", []) for k, v in row.items()}
        return table.get("citations")
    html = get(f"https://scholar.google.com/citations?user={sid}&hl=en")
    m = re.search(r'class="gsc_rsb_std">(\d+)<', html)
    if not m:
        raise RuntimeError("citation count not found on the profile page (probably blocked)")
    return int(m.group(1))


for field, fn in (("stars", github_stars), ("citations", scholar_citations)):
    try:
        value = fn()
        if not isinstance(value, int) or value <= 0:
            raise RuntimeError(f"unexpected value {value!r}")
        data[field] = value
        data[f"{field}_updated"] = today
    except Exception as err:  # never print URLs: the SerpApi one contains the key
        errors.append(f"{field}: {type(err).__name__}: {err}")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump(data, f, indent=2, sort_keys=True)
    f.write("\n")
print(json.dumps(data))
for e in errors:
    print("warning:", e, file=sys.stderr)
# Fail the run (GitHub emails you) only if nothing could be refreshed.
sys.exit(1 if len(errors) == 2 else 0)
