import requests
import json
import os
import re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import time


class WarfarinWikiScraper:
    def __init__(self, headless=True):
        self.base_url = "https://warfarin.wiki"
        self.operators_url = f"{self.base_url}/en/operators"
        self.headless = headless

    def get_all_operator_links(self):
        """Get all operator page links from the operators listing page"""
        print("Fetching operator list...")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            page = browser.new_page()
            page.goto(self.operators_url, wait_until="networkidle")
            time.sleep(2)

            operator_links = []
            links = page.locator('a[href^="/en/operators/"]').all()

            seen = set()
            for link in links:
                href = link.get_attribute('href')
                if href and href not in seen and href != "/en/operators":
                    full_url = f"{self.base_url}{href}"
                    operator_name = href.split('/')[-1]
                    operator_links.append({'name': operator_name, 'url': full_url})
                    seen.add(href)

            browser.close()

        print(f"Found {len(operator_links)} operators")
        return operator_links

    # ------------------------------------------------------------------ #
    #  Core page interaction — keeps browser alive, scrolls + clicks      #
    # ------------------------------------------------------------------ #

    def _get_fully_rendered_html(self, url, pw_instance):
        """
        Load a page, scroll to the skills section, and interact with every
        tab/button/accordion inside each skill block so that lazily-rendered
        content (especially multiplier tables) is in the DOM before we
        snapshot the HTML.
        """
        browser = pw_instance.chromium.launch(headless=self.headless)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        page.goto(url, wait_until="networkidle")
        time.sleep(2)

        # 1. Full-page scroll so lazy sections mount
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1)
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(0.5)

        # 2. Scroll to skills section
        skills_section = page.locator("section#skills")
        if skills_section.count() > 0:
            skills_section.scroll_into_view_if_needed()
            time.sleep(1)

            # 3. Interact with each skill block to expose multiplier tables
            skill_blocks = page.locator("section#skills [id^='skill-']")
            block_count = skill_blocks.count()
            print(f"  Found {block_count} skill block(s) in DOM")

            for i in range(block_count):
                block = skill_blocks.nth(i)
                block.scroll_into_view_if_needed()
                time.sleep(0.3)

                # Click any tab triggers, inactive tabs, or toggle buttons
                for selector in [
                    "[role='tab']",
                    "[data-state='inactive']",
                    "[aria-selected='false']",
                    "button",
                    ".tab-trigger",
                ]:
                    try:
                        triggers = block.locator(selector)
                        for j in range(triggers.count()):
                            try:
                                triggers.nth(j).click(timeout=1000)
                                time.sleep(0.3)
                            except Exception:
                                pass
                    except Exception:
                        pass

                # Open any collapsed <details> elements
                try:
                    details_els = block.locator("details:not([open])")
                    for j in range(details_els.count()):
                        try:
                            details_els.nth(j).locator("summary").click(timeout=1000)
                            time.sleep(0.3)
                        except Exception:
                            pass
                except Exception:
                    pass

        # 4. Final settle
        time.sleep(1)

        # 5. Collect all poster download URLs while the page is still live
        self._poster_urls = self._collect_poster_urls(page)

        # 6. Print DOM snapshot for debugging
        #self._debug_skills_dom(page)

        html = page.content()
        browser.close()
        return html

    def _collect_poster_urls(self, page):
        """
        Click every thumbnail button inside section#snapshots and harvest the
        download <a> href that the carousel swaps in for the active slide.
        Returns a list of full-res PNG URLs (one per poster).
        """
        urls = []
        try:
            section = page.locator("section#snapshots")
            if section.count() == 0:
                return urls

            section.scroll_into_view_if_needed()
            time.sleep(0.5)

            thumbs = section.locator("button[aria-label]")
            count  = thumbs.count()
            print(f"  Found {count} artwork thumbnail(s)")

            for i in range(count):
                try:
                    thumbs.nth(i).click(timeout=2000)
                    time.sleep(0.5)
                    # The download anchor is the <a> with a lucide-download icon
                    dl = section.locator("a[href*='imageposter']")
                    if dl.count() > 0:
                        href = dl.first.get_attribute("href")
                        if href and href not in urls:
                            urls.append(href)
                            print(f"    Poster {len(urls)}: {href}")
                except Exception as e:
                    print(f"    Could not click thumbnail {i}: {e}")
        except Exception as e:
            print(f"  _collect_poster_urls error: {e}")
        return urls

    def _debug_skills_dom(self, page):
        """
        Print a compact DOM tree of section#skills so you can see exactly
        what tags and classes are present after all interactions.
        """
        print("\n  --- Skills DOM snapshot ---")
        try:
            report = page.evaluate("""() => {
                const section = document.querySelector('section#skills');
                if (!section) return 'ERROR: section#skills NOT FOUND';

                const lines = [];
                function walk(el, depth) {
                    if (depth > 6) return;
                    const cls  = (el.className && typeof el.className === 'string')
                                  ? el.className.trim() : '';
                    const id   = el.id ? '#' + el.id : '';
                    const tag  = el.tagName.toLowerCase();
                    const leaf = el.children.length === 0
                                  ? ' "' + el.textContent.trim().substring(0, 50) + '"' : '';
                    lines.push(
                        ' '.repeat(depth * 2) +
                        '<' + tag + id +
                        (cls ? ' class="' + cls + '"' : '') +
                        '>' + leaf
                    );
                    for (const child of el.children) walk(child, depth + 1);
                }
                walk(section, 0);
                return lines.join('\\n');
            }""")
            print(report)
        except Exception as e:
            print(f"  DOM snapshot error: {e}")
        print("  --- End snapshot ---\n")

    # ------------------------------------------------------------------ #
    #  Scrape a single operator                                            #
    # ------------------------------------------------------------------ #

    def scrape_operator_page(self, operator_name, url):
        print(f"Scraping {operator_name.capitalize()}...")

        with sync_playwright() as p:
            html_content = self._get_fully_rendered_html(url, p)

        soup = BeautifulSoup(html_content, 'html.parser')

        return {
            operator_name.capitalize(): {
            'overview':   self.extract_overview(soup),
            'attributes': self.extract_attributes(soup),
            'promotions': self.extract_promotions(soup),
            'talents':    self.extract_talents(soup),
            'potentials': self.extract_potentials(soup),
            'skills':     self.extract_skills(soup),
            'url':        url,   
            }
        }

    # ------------------------------------------------------------------ #
    #  extract_skills                                                      #
    # ------------------------------------------------------------------ #

    def extract_skills(self, soup):
        """
        Extract skill info + multiplier tables.

        Selector strategy (most → least specific):
          1. <table class='bg-card'>          — class directly on table
          2. <div class='bg-card'><table>     — class on wrapper div
          3. first <table> in block           — last resort

          Same three-step pattern for multiplier table with 'bg-muted',
          falling back to the second <table> in the block.
        """
        skills = []

        skills_section = soup.find('section', id='skills')
        if not skills_section:
            print("  WARN: section#skills not found")
            return skills

        skill_blocks = skills_section.find_all('div', id=re.compile('^skill-'))
        if not skill_blocks:
            print("  WARN: no div[id^=skill-] inside section#skills")
            return skills

        for block in skill_blocks:
            skill_data = {'name': '', 'type': '', 'description': '', 'multipliers': {}}
            skill_data = {}
            name = ""

            all_tables = block.find_all('table')

            # ---- Info card ----
            info_table = (
                block.find('table', class_='bg-card')
                or _table_in_div(block, 'bg-card')
                or (all_tables[0] if all_tables else None)
            )
            if info_table:
                name = _text(info_table, 'h3',  'font-semibold')
                skill_data = {name: {'type': '', 'description': '', 'multipliers': {}}}

                type_ = _text(info_table, 'div', 'text-muted-foreground')
                try:
                  type_ = f"{type_.split()[0].capitalize()} {type_.split()[1].capitalize()}"
                except:
                    pass
                skill_data[name]['type']        = type_

                skill_data[name]['description'] = _text(info_table, 'div', 'whitespace-pre-line')
            else:
                print(f"  WARN: no info table in {block.get('id')}")

            # ---- Multiplier table ----
            mult_table = (
                block.find('table', class_='bg-muted')
                or _table_in_div(block, 'bg-muted')
                or (all_tables[1] if len(all_tables) >= 2 else None)
            )
            if mult_table:
                thead = mult_table.find('thead')
                tbody = mult_table.find('tbody')
                if thead and tbody:
                    # Skip first <th> (it's the blank/label column header)
                    headers = [th.get_text(strip=True) for th in thead.find_all('th')[1:]]
                    for row in tbody.find_all('tr'):
                        cells = row.find_all('td')
                        if not cells:
                            continue
                        stat   = cells[0].get_text(strip=True)
                        values = [c.get_text(strip=True) for c in cells[1:]]
                        for level, val in zip(headers, values):
                            if "M" not in level:
                                level = f"Level {level}"
                            else:
                                level = f"Mastery {level.split("M")[1]}"
                            skill_data[name]['multipliers'].setdefault(level, {})[stat] = val
                else:
                    print(f"  WARN: multiplier table in {block.get('id')} has no thead/tbody")
            else:
                print(f"  WARN: no multiplier table found in {block.get('id')} "
                      f"(only {len(all_tables)} table(s) in block — "
                      f"may need a different click interaction to expose it)")

            skills.append(skill_data)

        return skills

    # ------------------------------------------------------------------ #
    #  Remaining extractors                                               #
    # ------------------------------------------------------------------ #

    def extract_overview(self, soup):
        overview = {}

        # Section has no id — find it by its h2 text content
        section = None
        for s in soup.find_all('section'):
            h2 = s.find('h2')
            if h2 and h2.get_text(strip=True) == 'Overview':
                section = s
                break
        if not section:
            return overview

        tables = section.find_all('table')
        if not tables:
            return overview

        # ---- Table 1: main info (Name, Description, Trait, Rarity, etc.) ----
        for row in tables[0].find_all('tr'):
            cells = row.find_all(['th', 'td'])
            if not cells:
                continue
            key = cells[0].get_text(strip=True)
            # colspan rows have only 2 cells (th + td spanning 3 cols)
            if len(cells) == 2:
                overview[key] = cells[1].get_text(separator=' ', strip=True)
            elif len(cells) >= 4:
                overview[key]                               = cells[1].get_text(strip=True)
                overview[cells[2].get_text(strip=True)]    = cells[3].get_text(strip=True)

        # ---- Table 2: Voice Actors ----
        if len(tables) >= 2:
            voice = {}
            for row in tables[1].find_all('tr'):
                cells = row.find_all(['th', 'td'])
                if len(cells) >= 4:
                    voice[cells[0].get_text(strip=True)] = cells[1].get_text(strip=True)
                    voice[cells[2].get_text(strip=True)] = cells[3].get_text(strip=True)
            if voice:
                overview['Voice Actors'] = voice

        # ---- Table 3: Weapon Recommendations ----
        if len(tables) >= 3:
            rec_table = tables[2]
            cols = rec_table.find_all('th', class_='bg-card')
            # Column headers are the two <th> in the second row
            col_headers = [th.get_text(strip=True) for th in rec_table.find_all('tr')[1].find_all('th')]
            weapons = {}
            data_row = rec_table.find('td')
            if data_row:
                tds = data_row.find_parent('tr').find_all('td')
                for header, td in zip(col_headers, tds):
                    # Weapon names are in the title attribute of the wrapper div
                    weapons[header] = [
                        div.get('title', '')
                        for div in td.find_all('div', title=True)
                        if div.get('title')
                    ]
            if weapons:
                overview['Weapon Recommendations'] = weapons

        return overview


    def extract_attributes(self, soup):
        attributes = {'summary': {}, 'detailed': {}}
        section = soup.find('section', id='attributes')
        if not section:
            return attributes
        tables = section.find_all('table')
        for idx, key in enumerate(['summary', 'detailed']):
            if idx >= len(tables):
                break
            tbl     = tables[idx]
            headers = [th.get_text(strip=True) for th in tbl.find('thead').find_all('th')[1:]]
            for row in tbl.find('tbody').find_all('tr'):
                cells = row.find_all(['th', 'td'])
                stat  = cells[0].get_text(strip=True)
                vals  = [c.get_text(strip=True) for c in cells[1:]]
                for level, val in zip(headers, vals):
                    try:
                        level = level.split("Level")[1]
                    except:
                        pass
                    
                    attributes[key].setdefault(f"Level {level}", {})[stat] = val
        return attributes

    def extract_promotions(self, soup):
        promotions = []
        section = soup.find('section', id='promotions')
        if not section:
            return promotions
        for card in section.find_all('div', class_='bg-card'):
            name = card.find('span', class_='font-semibold')
            desc = card.find('div',  class_='text-muted-foreground')
            mats = []
            for mat_div in card.find_all('div', class_='flex-col'):
                span = mat_div.find('span', title=True)
                if span:
                    qty = mat_div.find('div', class_='absolute')
                    mats.append({'name': span.get('title'), 'quantity': qty.get_text(strip=True) if qty else '1'})
            promotions.append({
                'name':        name.get_text(strip=True) if name else '',
                'description': desc.get_text(separator=' ', strip=True) if desc else '',
                'materials':   mats,
            })
        return promotions

    def extract_talents(self, soup):
        talents = []
        section = soup.find('section', id='talents')
        if not section:
            return talents
        for card in section.find_all('div', class_='bg-muted'):
            if _text(card, 'h3',  'font-semibold') != "":                
              talents.append({
                  _text(card, 'h3',  'font-semibold'):{
                      'unlock':      _text(card, 'div', 'text-muted-foreground'),
                      'description': _text(card, 'p',   'text-sm'),
                  }
              })
        return talents

    def extract_potentials(self, soup):
        potentials = []
        section = soup.find('section', id='potentials')
        if not section:
            return potentials
        for idx, card in enumerate(section.find_all('div', class_='bg-muted'), 1):
            potentials.append({
                f"Potential {idx}": {
                    'name':        _text(card, 'h3',  'font-semibold'),
                    'description': _text(card, 'div', 'text-sm'),
                }
                
            })
        return potentials

    def extract_base_skills(self, soup):
        base_skills = []
        section = soup.find('section', id='baseskills')
        if not section:
            return base_skills
        for card in section.find_all('div', class_='bg-muted'):
            base_skills.append({
                'name':        _text(card, 'h3',  'font-semibold'),
                'unlock':      _text(card, 'div', 'text-muted-foreground'),
                'description': _text(card, 'div', 'whitespace-pre-line'),
            })
        return base_skills

    def extract_intel(self, soup):
        intel = {}
        section = soup.find('section', id='intel')
        if not section:
            return intel
        for card in section.find_all('div', class_='bg-card'):
            title   = card.find('h3', class_='font-semibold')
            content = card.find('p',  class_='whitespace-pre-line')
            if title and content:
                k, v   = title.get_text(strip=True), content.get_text(separator=' ', strip=True)
                intel[k] = [intel[k], v] if k in intel else v
        return intel

    def extract_files(self, soup):
        files = []
        section = soup.find('section', id='files')
        if not section:
            return files
        for card in section.find_all('div', class_='bg-card'):
            files.append({
                'title':   _text(card, 'h3',  'font-semibold'),
                'content': _text(card, 'div', 'whitespace-pre-line'),
            })
        return files

    def download_images(self, operator_name, soup):
        """
        Download exactly three image types, identified by their URL path:

          icon     — /charremoteicon/   (small portrait icon in the header)
          splash   — /charsplash/       (full operator splash art)
          poster_N — /imageposter/      (full-size costume posters;
                                         thumbnails use /imageposter/subsize/
                                         which we swap to the full-size path)
        """
        images_dir = f"../Data/Images/Operators/{operator_name.capitalize()}"
        os.makedirs(images_dir, exist_ok=True)
        downloaded = []

        targets = {}  # label -> url

        # 1. Portrait icon
        icon = soup.find('img', src=re.compile(r'/charremoteicon/'))
        if icon:
            targets['icon'] = icon['src']

        # 2. Splash art
        splash = soup.find('img', src=re.compile(r'/charsplash/'))
        if splash:
            targets['splash'] = splash['src']

        # 3. Full-size costume posters — URLs collected live by _collect_poster_urls
        #    while the Playwright browser was still open (each poster's download
        #    href is only present in the DOM for the currently active slide).
        for idx, url in enumerate(getattr(self, '_poster_urls', []), 1):
            targets[f'poster_{idx}'] = url

        for label, url in targets.items():
            if not url.startswith('http'):
                url = f"https:{url}" if url.startswith('//') else f"{self.base_url}{url}"
            try:
                r = requests.get(url, timeout=15)
                r.raise_for_status()
                ext      = os.path.splitext(url.split('?')[0])[-1].lstrip('.') or 'webp'
                filename = f"{operator_name.capitalize()}_{label}.{ext}"
                filepath = os.path.join(images_dir, filename)
                with open(filepath, 'wb') as f:
                    f.write(r.content)
                downloaded.append(filepath)
                print(f"  ✓ Downloaded {label}: {filename}")
            except Exception as e:
                print(f"  ✗ Failed {label} ({url}): {e}")

        return downloaded

    def scrape_all_operators(self):
        all_data = []
        for op in self.get_all_operator_links():
            try:
                data = self.scrape_operator_page(op['name'], op['url'])
                # Reuse already-fetched HTML for images
                with sync_playwright() as p:
                    html = self._get_fully_rendered_html(op['url'], p)
                soup = BeautifulSoup(html, 'html.parser')
                data[op['name'].capitalize()]['images'] = self.download_images(op['name'], soup)
                all_data.append(data)
                time.sleep(1)
            except Exception as e:
                print(f"Error scraping {op['name']}: {e}")
        return all_data


# ------------------------------------------------------------------ #
#  Helpers                                                            #
# ------------------------------------------------------------------ #

def _text(tag, element, css_class):
    """Safely get stripped text from a child element matched by tag + class."""
    el = tag.find(element, class_=css_class)
    return el.get_text(separator=' ', strip=True) if el else ''


def _table_in_div(block, css_class):
    """Find <div class='css_class'> and return the <table> inside it, or None."""
    wrapper = block.find('div', class_=css_class)
    return wrapper.find('table') if wrapper else None


# ------------------------------------------------------------------ #
#  Entry points                                                       #
# ------------------------------------------------------------------ #

def diagnose_single(operator_slug="Amiya"):
    """
    Scrape one operator with headless=False (visible browser window) and
    print a detailed skills report.  The DOM snapshot printed during the
    run tells you exactly what classes/tags are present after interaction.

    Usage:
        python warfarin_scraper_fixed.py diagnose Amiya
    """
    scraper = WarfarinWikiScraper(headless=False)
    url     = f"https://warfarin.wiki/en/operators/{operator_slug}"
    print(f"Opening: {url}\n")

    with sync_playwright() as p:
        html = scraper._get_fully_rendered_html(url, p)

    with open(f"{operator_slug}_raw.html", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Raw HTML saved → {operator_slug}_raw.html")

    soup   = BeautifulSoup(html, 'html.parser')
    skills = scraper.extract_skills(soup)

    print(f"\n=== Skills extracted: {len(skills)} ===")
    for s in skills:
        print(f"\n  Skill: {s['name']!r}  type={s['type']!r}")
        mults = s.get('multipliers', {})
        if mults:
            for stat, levels in mults.items():
                print(f"    {stat}: {levels}")
        else:
            print("    multipliers: EMPTY — check DOM snapshot above")


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)) or '.')
    scraper        = WarfarinWikiScraper(headless=True)
    operators_data = scraper.scrape_all_operators()

    output_dir  = "../Data/Stats"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "warfarin_operators.json")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(operators_data, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Scraped {len(operators_data)} operators")
    print(f"✓ Data saved to {output_path}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "diagnose":
        slug = sys.argv[2] if len(sys.argv) > 2 else "Amiya"
        diagnose_single(slug)
    else:
        main()
