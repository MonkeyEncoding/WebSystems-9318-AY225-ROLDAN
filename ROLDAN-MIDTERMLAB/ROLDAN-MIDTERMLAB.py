"""
SEGA Games Web Scraper
======================
Python Stack: Requests + BeautifulSoup + Flask + SQLite

FIXED:
 - Category page now correctly reads game titles + links from mw-category divs
 - Detail page scraping improved with better infobox field matching
 - Title validation tightened (no year-only strings, no short tokens)
"""

from flask import Flask, render_template, jsonify, request, send_file
import requests
from bs4 import BeautifulSoup
import sqlite3, re, time, os, csv, io, json
from datetime import datetime

app = Flask(__name__)

DB_PATH = "data/games.db"
os.makedirs("data", exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# ─────────────────────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS games (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                title        TEXT NOT NULL,
                release_date TEXT DEFAULT 'Not Available',
                developer    TEXT DEFAULT 'Not Available',
                publisher    TEXT DEFAULT 'Not Available',
                platforms    TEXT DEFAULT 'Not Available',
                key_features TEXT DEFAULT 'Not Available',
                image_url    TEXT DEFAULT '',
                wiki_url     TEXT DEFAULT '',
                source_url   TEXT DEFAULT '',
                scraped_at   TEXT DEFAULT ''
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scrape_log (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                source_url  TEXT,
                games_found INTEGER,
                scraped_at  TEXT
            )
        """)
        conn.commit()

def clear_games():
    with get_db() as conn:
        conn.execute("DELETE FROM games")
        conn.commit()

def insert_games(games):
    with get_db() as conn:
        conn.executemany("""
            INSERT INTO games
              (title, release_date, developer, publisher, platforms,
               key_features, image_url, wiki_url, source_url, scraped_at)
            VALUES
              (:title,:release_date,:developer,:publisher,:platforms,
               :key_features,:image_url,:wiki_url,:source_url,:scraped_at)
        """, games)
        conn.execute(
            "INSERT INTO scrape_log (source_url, games_found, scraped_at) VALUES (?,?,?)",
            (games[0]["source_url"] if games else "", len(games),
             datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        )
        conn.commit()

def query_games(search="", platform=""):
    with get_db() as conn:
        q, args = "SELECT * FROM games WHERE 1=1", []
        if search:
            q += " AND (title LIKE ? OR developer LIKE ? OR publisher LIKE ? OR platforms LIKE ?)"
            like = f"%{search}%"
            args += [like, like, like, like]
        if platform:
            q += " AND LOWER(platforms) LIKE ?"
            args.append(f"%{platform.lower()}%")
        return [dict(r) for r in conn.execute(q + " ORDER BY id", args).fetchall()]

def get_status():
    with get_db() as conn:
        count = conn.execute("SELECT COUNT(*) FROM games").fetchone()[0]
        log   = conn.execute("SELECT * FROM scrape_log ORDER BY id DESC LIMIT 1").fetchone()
        return {
            "total_games":  count,
            "last_scraped": dict(log)["scraped_at"] if log else None,
            "source_url":   dict(log)["source_url"]  if log else None,
        }

# ─────────────────────────────────────────────────────────────────────────────
# SCRAPER HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def clean(text):
    if not text:
        return "Not Available"
    text = re.sub(r'\[\d+\]', '', str(text))
    text = re.sub(r'\s+', ' ', text).strip()
    return text or "Not Available"

def is_valid_path(path):
    """Must be a plain /wiki/Article_name with no namespace."""
    if not path or not path.startswith("/wiki/"):
        return False
    # Skip namespaced pages: File:, Category:, Help:, Talk:, etc.
    if re.search(r'/wiki/[A-Za-z_]+:', path):
        return False
    return True

def is_valid_title(title, seen):
    """Reject years, single words that are clearly not game titles, and duplicates."""
    if not title or title in seen:
        return False
    # Reject pure year strings like "1991", "2003"
    if re.fullmatch(r'\d{4}', title.strip()):
        return False
    # Must be at least 3 characters and contain a letter
    if len(title) < 3 or not re.search(r'[A-Za-z]', title):
        return False
    skip = ["list of", "wikipedia", "category", "template", "file:", "portal",
            "talk:", "help:", "special:"]
    if any(s in title.lower() for s in skip):
        return False
    return True

# ── Strategy 1: wikitable (standard list pages) ──────────────────────────────
def from_wikitable(soup, seen, max_n):
    results = []
    for table in soup.find_all("table", class_=re.compile(r"wikitable")):
        for row in table.find_all("tr")[1:]:
            cells = row.find_all(["td", "th"])
            if not cells:
                continue
            cell  = cells[0]
            a     = cell.find("a", href=True)
            title = clean(cell.get_text())
            path  = a["href"] if a else None
            if is_valid_title(title, seen) and (path is None or is_valid_path(path)):
                seen.add(title)
                results.append((title, path))
            if len(results) >= max_n:
                return results
    return results

# ── Strategy 2: mw-category div (Category: pages) ────────────────────────────
def from_category(soup, seen, max_n):
    results = []
    for div in soup.find_all("div", class_=re.compile(r"mw-category")):
        for a in div.find_all("a", href=True):
            title = clean(a.get_text())
            path  = a["href"]
            if is_valid_title(title, seen) and is_valid_path(path):
                seen.add(title)
                results.append((title, path))
            if len(results) >= max_n:
                return results
    return results

# ── Strategy 3: bulleted lists (series/franchise pages) ──────────────────────
def from_lists(soup, seen, max_n):
    results = []
    # Look inside content area only, skip navbars/sidebars
    content = soup.find("div", id="mw-content-text") or soup
    for li in content.find_all("li"):
        a = li.find("a", href=True)
        if not a:
            continue
        title = clean(a.get_text())
        path  = a["href"]
        if is_valid_title(title, seen) and is_valid_path(path):
            seen.add(title)
            results.append((title, path))
        if len(results) >= max_n:
            return results
    return results

def collect_game_links(soup, max_games):
    seen = set()
    # Try each strategy in order, return first one that gets results
    for strategy in [from_wikitable, from_category, from_lists]:
        results = strategy(soup, seen, max_games)
        if results:
            print(f"  [strategy] {strategy.__name__} → {len(results)} links")
            return results
    return []


def scrape_detail_page(wiki_path):
    """Visit a single Wikipedia game article and pull all required fields."""
    empty = {
        "release_date": "Not Available",
        "developer":    "Not Available",
        "publisher":    "Not Available",
        "platforms":    "Not Available",
        "key_features": "Not Available",
        "image_url":    "",
        "wiki_url":     f"https://en.wikipedia.org{wiki_path}"
    }
    try:
        r = requests.get(f"https://en.wikipedia.org{wiki_path}",
                         headers=HEADERS, timeout=9)
        if r.status_code != 200:
            return empty

        soup    = BeautifulSoup(r.content, "html.parser")
        infobox = soup.find("table", class_=re.compile(r"infobox"))

        if not infobox:
            # Still try to get key features from paragraphs
            snippets = _get_snippets(soup)
            if snippets:
                empty["key_features"] = snippets
            return empty

        result = dict(empty)   # copy

        for row in infobox.find_all("tr"):
            th = row.find("th")
            td = row.find("td")
            if not th or not td:
                continue
            label = th.get_text(" ", strip=True).lower()
            value = clean(td.get_text(" ", strip=True))

            if re.search(r'release|released|date', label):
                result["release_date"] = value[:120]
            elif "developer" in label:
                result["developer"] = value[:150]
            elif "publisher" in label:
                result["publisher"] = value[:150]
            elif re.search(r'platform|system', label):
                result["platforms"] = value[:200]

        # Cover image
        img = infobox.find("img")
        if img and img.get("src"):
            src = img["src"]
            result["image_url"] = ("https:" + src) if src.startswith("//") else src

        # Key features from opening paragraphs
        result["key_features"] = _get_snippets(soup)

        return result

    except Exception as e:
        print(f"    [!] Detail error ({wiki_path}): {e}")
        return empty


def _get_snippets(soup):
    """Return first 2 meaningful paragraphs joined as a string."""
    snippets = []
    for p in soup.find_all("p"):
        text = clean(p.get_text())
        if len(text) > 80:
            snippets.append(text[:240])
        if len(snippets) >= 2:
            break
    return " | ".join(snippets) if snippets else "Not Available"


def scrape_games(source_url: str, max_games: int = 15):
    games     = []
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print(f"\n[*] Fetching: {source_url}")
    try:
        r = requests.get(source_url, headers=HEADERS, timeout=12)
        if r.status_code != 200:
            return [], f"HTTP {r.status_code} — could not reach that URL."

        soup  = BeautifulSoup(r.content, "html.parser")
        links = collect_game_links(soup, max_games)

        if not links:
            return [], (
                "No game links found on that page.\n"
                "Try one of these:\n"
                "• https://en.wikipedia.org/wiki/Sonic_the_Hedgehog_(series)\n"
                "• https://en.wikipedia.org/wiki/List_of_Sega_arcade_games\n"
                "• https://en.wikipedia.org/wiki/Category:Sega_games"
            )

        for title, wiki_path in links:
            print(f"  [+] {title}")
            detail = scrape_detail_page(wiki_path) if wiki_path else {
                "release_date":"Not Available","developer":"Not Available",
                "publisher":"Not Available","platforms":"Not Available",
                "key_features":"Not Available","image_url":"","wiki_url":""
            }
            games.append({
                "title":        title,
                "release_date": detail["release_date"],
                "developer":    detail["developer"],
                "publisher":    detail["publisher"],
                "platforms":    detail["platforms"],
                "key_features": detail["key_features"],
                "image_url":    detail["image_url"],
                "wiki_url":     detail["wiki_url"],
                "source_url":   source_url,
                "scraped_at":   timestamp
            })
            time.sleep(0.35)

    except requests.exceptions.ConnectionError:
        return [], "Connection error — check your internet."
    except Exception as e:
        return [], str(e)

    print(f"[*] Done — {len(games)} games scraped.\n")
    return games, None

# ─────────────────────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/scrape", methods=["POST"])
def api_scrape():
    body       = request.get_json(silent=True) or {}
    source_url = body.get("url", "").strip()
    max_games  = min(int(body.get("max_games", 15)), 30)

    if not source_url:
        return jsonify({"error": "No URL provided."}), 400
    if not source_url.startswith("http"):
        return jsonify({"error": "URL must start with http or https."}), 400

    games, err = scrape_games(source_url, max_games)
    if err:
        return jsonify({"error": err}), 500
    if not games:
        return jsonify({"error": "No games found on that page."}), 404

    clear_games()
    insert_games(games)
    return jsonify({"scraped": len(games), "games": games})

@app.route("/api/games")
def api_games():
    return jsonify(query_games(
        request.args.get("q","").strip(),
        request.args.get("platform","").strip()
    ))

@app.route("/api/status")
def api_status():
    return jsonify(get_status())

@app.route("/api/export/csv")
def api_export_csv():
    games = query_games()
    if not games:
        return jsonify({"error": "No data yet."}), 404
    out = io.StringIO()
    fields = ["id","title","release_date","developer","publisher",
              "platforms","key_features","image_url","wiki_url","scraped_at"]
    w = csv.DictWriter(out, fieldnames=fields, extrasaction="ignore")
    w.writeheader(); w.writerows(games)
    return send_file(io.BytesIO(out.getvalue().encode()), as_attachment=True,
                     download_name="sega_games.csv", mimetype="text/csv")

@app.route("/api/export/json")
def api_export_json():
    games = query_games()
    if not games:
        return jsonify({"error": "No data yet."}), 404
    buf = io.BytesIO(json.dumps(games, indent=2, ensure_ascii=False).encode())
    return send_file(buf, as_attachment=True,
                     download_name="sega_games.json", mimetype="application/json")

if __name__ == "__main__":
    init_db()
    app.run(debug=True)