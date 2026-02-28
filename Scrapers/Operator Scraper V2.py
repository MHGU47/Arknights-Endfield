import json
import os
import re
import requests
import time

from bs4 import BeautifulSoup
from datetime import datetime
from playwright.sync_api import sync_playwright
from urllib.parse import unquote, urlparse

# ------------------------
# Config
# ------------------------
CHARACTERS_PAGE = "https://www.prydwen.gg/arknights-endfield/characters/"

# ------------------------
# Helper functions
# ------------------------
def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def clean_name(name):
    name = name.replace('-', '_')
    n = "_".join(part.capitalize() for part in name.split("_"))
    return n

def extract_multipliers(box):
    multipliers = {}

    multi_rows = box.locator(".multipliers.inside .multi-single")
    count = multi_rows.count()

    for i in range(count):
        row = multi_rows.nth(i)
        try:
            name = clean(row.locator(".name").inner_text())
            value = clean(row.locator(".value").inner_text())
            multipliers.update({name: value})
        except:
            continue

    return multipliers

def download_image(url, save_path):
    """Download an image from URL and save to path."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        print(f"  ✓ Downloaded image: {os.path.basename(save_path)}")
        return True
    except Exception as e:
        print(f"  ✗ Failed to download image: {e}")
        return False

def scrape_character_image(page, character_name):
    """Scrape character portrait image from the page."""
    try:
        # Find the character portrait image
        img_locator = page.locator("div.character-portrait img").first
        img_url = img_locator.get_attribute("src")
        
        if img_url:
            # Make absolute URL if relative
            if img_url.startswith("/"):
                img_url = "https://www.prydwen.gg" + img_url
            
            # Create filename from character name
            safe_name = re.sub(r'[<>:"/\\|?*]', '_', character_name)
            image_path = f"../Data/Images/Operators/{safe_name}.png"
            
            # Download the image
            if download_image(img_url, image_path):
                return image_path
        
        return None
    except Exception as e:
        print(f"  ✗ Failed to scrape image: {e}")
        return None


# ------------------------
# Scraping functions
# ------------------------
def scrape_stats(page):
    """Scrape stats from the va-section container."""
    container = page.locator(
        "div.va-section.attributes.row.row-cols-xxl-4.row-cols-1"
    )
    container.wait_for(state="visible", timeout=10000)

    stats = {}
    mainSub = {}
    attributes = container.locator("div.single-attribute")
    count = attributes.count()

    for i in range(count):
        attr = attributes.nth(i)
        category = attr.locator("div.category").inner_text().strip()
        value = attr.locator("div.details").inner_text().strip()

        cls = attr.get_attribute("class") or ""
        if "main" in cls:
            mainSub.update({"Main Attribute" : category})
        elif "secondary" in cls:
            mainSub.update({"Secondary Attribute" : category})

        stats.update({category : value})


    stats.update(mainSub)
    return stats

def scrape_core_info(page):
    """Scrape basic character info"""
    print(page.locator("h1").first.inner_text().strip("\n").split("\n")[0])
    return {"name": page.locator("h1").first.inner_text().strip().split("\n")[0]}

def get_name(page):
    return page.locator("h1").first.inner_text().strip().split("\n")[0]

def expand_all_dropdowns(page):
    """Click all collapsed buttons to expand skill descriptions."""
    buttons = page.locator("button[aria-expanded='false']").all()
    for btn in buttons:
        try:
            btn.click(timeout=300)
        except:
            pass

def scrape_skills(page):
    skills = []

    # Grab the FIRST skills-v2 block (this is the Skills section)
    skills_container = page.locator("div.skills-v2").first
    skills_container.wait_for(state="visible", timeout=10000)

    # Each skill is a .box
    skill_boxes = skills_container.locator("div.box")
    count = skill_boxes.count()

    for i in range(count):
        box = skill_boxes.nth(i)

        try:
            name = clean(box.locator(".skill-name").inner_text())

            # There can be multiple description blocks per skill
            descriptions = box.locator(".skill-description")
            desc_text = " ".join(
                clean(descriptions.nth(j).inner_text())
                for j in range(descriptions.count())
            )

            skills.append({
                name : {
                  "description": desc_text,
                  "multipliers": extract_multipliers(box)
                }
            })

        except:
            continue

    return skills

def scrape_talents(page):
    talents = []

    # SECOND skills-v2 block = Talents section
    talents_container = page.locator("div.skills-v2").nth(1)
    talents_container.wait_for(state="visible", timeout=10000)

    talent_boxes = talents_container.locator("div.box")
    count = talent_boxes.count()

    for i in range(count):
        box = talent_boxes.nth(i)

        try:
            name = clean(box.locator(".skill-name").inner_text())

            # Talent type (Base Talent / Combat Talent), optional
            talent_type = None
            if box.locator(".skill-icon").count() > 0:
                talent_type = clean(box.locator(".skill-icon").inner_text())

            # Main description
            description = ""
            if box.locator(".skill-description").count() > 0:
                description = clean(
                    box.locator(".skill-description").inner_text()
                )

            talents.append({
                "name": name,
                "type": talent_type,
                "description": description,
                "multipliers": extract_multipliers(box)
            })

        except:
            continue

    return talents

def scrape_wiki_stats_via_api(character_name, retries=5, wait_seconds=2):
    """
    Scrape stats table from endfield.wiki.gg/wiki/<character_name>
    using MediaWiki API only (no Playwright).

    This includes waiting and retrying when the API returns errors.
    """

    character_name = clean_name(character_name)

    wiki_url = f"https://endfield.wiki.gg/wiki/{character_name}"
    api_url = "https://endfield.wiki.gg/api.php"

    params = {
        "action": "parse",
        "page": character_name,
        "format": "json",
        "prop": "text",
        "formatversion": 2
    }

    for attempt in range(1, retries + 1):
        res = requests.get(api_url, params=params)

        # Retry on HTTP error
        if res.status_code != 200:
            print(f"[Attempt {attempt}] HTTP {res.status_code}. Retrying in {wait_seconds}s...")
            time.sleep(wait_seconds)
            continue

        data = res.json()

        # Retry on API error (missing "parse" or contains "error")
        if "error" in data:
            print(f"[Attempt {attempt}] API error: {data['error']}. Retrying in {wait_seconds}s...")
            character_name = character_name.replace(" ", "_")
            character_name = clean_name(character_name)

            params = {
                "action": "parse",
                "page": character_name,
                "format": "json",
                "prop": "text",
                "formatversion": 2
            }
            
            time.sleep(wait_seconds)
            continue

        if "parse" not in data:
            print(f"[Attempt {attempt}] No parse data. Retrying in {wait_seconds}s...")
            time.sleep(wait_seconds)
            continue

        html = data["parse"]["text"]
        soup = BeautifulSoup(html, "html.parser")

        # Find the stats table
        table = soup.find("table", {"class": "mrfz-wtable"})
        if not table:
            print(f"[Attempt {attempt}] Stats table not found. Retrying in {wait_seconds}s...")
            time.sleep(wait_seconds)
            continue

        # Extract headers
        header_cells = table.find("tr").find_all("th")[1:]
        headers = [th.get_text(strip=True) for th in header_cells]

        stats = {h: {} for h in headers}

        # Extract rows
        rows = table.find_all("tr")[1:]
        for row in rows:
            cells = row.find_all(["th", "td"])
            label = cells[0].get_text(strip=True)

            for idx, cell in enumerate(cells[1:]):
                stats[headers[idx]][label] = cell.get_text(strip=True)

        return {
            "name": character_name.replace("_", " "),
            "source": wiki_url,
            "wiki_stats": stats
        }

    # Failed after all retries
    return None

# ------------------------
# Scrape character page
# ------------------------
def scrape_character(page, url):
    print(f"Scraping {url} ...")
    page.goto(url, wait_until="networkidle")

    name = get_name(page)
    prydwen_stats = scrape_stats(page)
    
    # Scrape character image
    image_path = scrape_character_image(page, name)

    # Get wiki stats and merge (if exist)
    wiki_stats_data = scrape_wiki_stats_via_api(name)
    wiki_stats = wiki_stats_data.get("wiki_stats") if wiki_stats_data else None

    merged_stats = merge_stats(prydwen_stats, wiki_stats)

    return {
        name: {
            "stats": merged_stats,
            "skills": scrape_skills(page),
            "talents": scrape_talents(page),
            "image_path": image_path,
            "metadata": {
                "source": [
                    url,
                    wiki_stats_data["source"] if wiki_stats_data else None
                ],
                "scraped_at": datetime.utcnow().isoformat() + "Z",
                "game": "Arknights: Endfield",
                "site": "prydwen.gg"
            }
        }
    }


# ------------------------
# Get all character URLs
# ------------------------
def get_character_links(page):
    page.goto(CHARACTERS_PAGE, wait_until="networkidle")
    # Each character card has a link
    links = page.locator("div.avatar-card.card a").all()
    urls = []
    for link in links:
        href = link.get_attribute("href")
        if href:
            # Convert relative URL to absolute
            if href.startswith("/"):
                href = "https://www.prydwen.gg" + href
            urls.append(href)
    return urls

def get_character_names(urls):
    names =[]

    for url in urls:
        names.append(unquote(urlparse(url).path.split("/")[-1]))
    
    return names

# ------------------------
# Main scraping routine
# ------------------------
def scrape_all_characters():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # Get all character URLs
        character_urls = get_character_links(page)
        character_names = get_character_names(character_urls)
        print(f"Found {len(character_urls)} characters.")

        all_data = []
        wiki_data = []
        for url in character_urls:
            data = scrape_character(page, url)
            all_data.append(data)

        # for name in character_names:
        #     data = scrape_wiki_stats_via_api(name)
        #     wiki_data.append(data)

        browser.close()
        return all_data

def merge_stats(prydwen_stats, wiki_stats):
    """
    Merge wiki stats into prydwen stats.
    Wiki stats overwrite Prydwyn stats ONLY if they exist.
    HP and Attack are always present (added if missing).
    Main/Secondary attributes remain at the bottom.
    """

    # Save main/secondary and remove temporarily
    main_attr = prydwen_stats.pop("Main Attribute", None)
    sub_attr = prydwen_stats.pop("Secondary Attribute", None)

    # Mapping wiki abbreviations to Prydwyn names
    wiki_map = {
        "HP": "HP",
        "ATK": "Attack",
        "STR": "Strength",
        "AGL": "Agility",
        "INT": "Intellect",
        "WIL": "Will"
    }

    # Apply wiki stats if present
    if wiki_stats:
        base_col = wiki_stats.get("Base") or next(iter(wiki_stats.values()), None)
        if base_col:
            for k, v in base_col.items():
                mapped_key = wiki_map.get(k, k)
                prydwen_stats[mapped_key] = v

    # Ensure HP and Attack exist
    prydwen_stats.setdefault("HP", prydwen_stats.get("HP", ""))
    prydwen_stats.setdefault("Attack", prydwen_stats.get("Attack", ""))

    # Rebuild ordered dict-like output
    ordered = {}

    # Put HP and Attack at the top
    ordered["HP"] = prydwen_stats.get("HP", "")
    ordered["Attack"] = prydwen_stats.get("Attack", "")

    # Add remaining stats except main/secondary
    for k, v in prydwen_stats.items():
        if k not in ["HP", "Attack"]:
            ordered[k] = v

    # Add main/secondary at bottom
    if main_attr:
        ordered["Main Attribute"] = main_attr
    if sub_attr:
        ordered["Secondary Attribute"] = sub_attr

    return ordered

# ------------------------
# Run and save JSON
# ------------------------
if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)) or '.')
    roster_data = scrape_all_characters()

    fileDir = "../Data/Stats"
    os.makedirs(fileDir, exist_ok=True)
    
    output_path = os.path.join(fileDir, "all_characters.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(roster_data, f, ensure_ascii=False, indent=2)
    print("✓ all_characters.json created successfully")