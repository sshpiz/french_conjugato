import base64
import json
import os
import re
import shutil
import sys
import time
from reference_pages import generate_reference_pages

try:
    from PIL import Image

    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT_DIR, "dist")
APP_DIST_DIR = os.path.join(DIST_DIR, "french")
DESKTOP_DIR = os.path.dirname(ROOT_DIR)
LABS_DIR = os.path.join(ROOT_DIR, "labs")
DIST_LABS_DIR = os.path.join(DIST_DIR, "labs")

HTML_TEMPLATE_PATH = os.path.join(ROOT_DIR, "index.html")
LANDING_TEMPLATE_PATH = os.path.join(ROOT_DIR, "site_landing.html")
LANDING_MANIFEST_PATH = os.path.join(ROOT_DIR, "site_manifest.json")
LANDING_SW_PATH = os.path.join(ROOT_DIR, "site_sw.js")

IMAGE_PATH = os.path.join(ROOT_DIR, "bg.png")
DARK_IMAGE_PATH = os.path.join(ROOT_DIR, "bg.dark.png")
FAVICON_PATH = os.path.join(ROOT_DIR, "favicon_big.png")

APP_STANDALONE_OUTPUT_PATH = os.path.join(APP_DIST_DIR, "franconjugue.html")
APP_INDEX_OUTPUT_PATH = os.path.join(APP_DIST_DIR, "index.html")
APP_VERSION_OUTPUT_PATH = os.path.join(APP_DIST_DIR, "version.json")
APP_FILES_TO_COPY = ["manifest.json", "favicon_big.png", "sw.js"]
ROOT_FILES_TO_COPY = [
    "favicon_big.png",
    "CNAME",
    "robots.txt",
    "llms.txt",
    "landing-greek.png",
    "landing-portugese.png",
    "landing-french.png",
    "landing-spanish.png",
    "landing-russian.png",
    "landing-catalan.png",
    "landing-ukrainian.png",
    "landing-latvian.png",
]
ROOT_EXTERNAL_FILES_TO_COPY = [
    {
        "src": os.path.join(DESKTOP_DIR, "german-verbs", "screenshot_german.png"),
        "dest_name": "landing-german.png",
    },
    {
        "src": os.path.join(DESKTOP_DIR, "screenshot_italian.png"),
        "dest_name": "landing-italian.png",
    },
]

SIBLING_APPS = [
    {
        "name": "greek",
        "source_dist": os.path.join(DESKTOP_DIR, "greek-verbs", "dist"),
        "target_dir": os.path.join(DIST_DIR, "greek"),
        "standalone": "greekonjugation.html",
    },
    {
        "name": "portugese",
        "source_dist": os.path.join(DESKTOP_DIR, "portuguese-verbs", "dist"),
        "target_dir": os.path.join(DIST_DIR, "portugese"),
        "standalone": "portoconjugue.html",
    },
    {
        "name": "russian",
        "source_dist": os.path.join(DESKTOP_DIR, "russian-verbs", "dist"),
        "target_dir": os.path.join(DIST_DIR, "russian"),
        "standalone": "glagoly.html",
    },
    {
        "name": "spanish",
        "source_dist": os.path.join(DESKTOP_DIR, "spanish-verbs", "dist"),
        "target_dir": os.path.join(DIST_DIR, "spanish"),
        "standalone": "conjugaespanol.html",
    },
    {
        "name": "catalan",
        "source_dist": os.path.join(DESKTOP_DIR, "catalan-verbs", "dist"),
        "target_dir": os.path.join(DIST_DIR, "catalan"),
        "standalone": "catalanjugacio.html",
    },
    {
        "name": "ukrainian",
        "source_dist": os.path.join(DESKTOP_DIR, "ukrainian-verbs", "dist"),
        "target_dir": os.path.join(DIST_DIR, "ukrainian"),
        "standalone": "dieslova.html",
    },
    {
        "name": "latvian",
        "source_dist": os.path.join(DESKTOP_DIR, "latvian-verbs", "dist"),
        "target_dir": os.path.join(DIST_DIR, "latvian"),
        "standalone": "darbibasvardi.html",
    },
    {
        "name": "german",
        "source_dist": os.path.join(DESKTOP_DIR, "german-verbs", "dist"),
        "target_dir": os.path.join(DIST_DIR, "german"),
        "standalone": "dieverben.html",
    },
    {
        "name": "italian",
        "source_dist": os.path.join(DESKTOP_DIR, "italian-verbs", "dist"),
        "target_dir": os.path.join(DIST_DIR, "italian"),
        "standalone": "iverbi.html",
    },
]

GENERATED_TTS_DIR = os.path.join(ROOT_DIR, "generated_tts")
APP_DIST_TTS_DIR = os.path.join(APP_DIST_DIR, "tts")
ROOT_TTS_DIR = os.path.join(DIST_DIR, "tts")

SCRIPT_SRC_RE = re.compile(r'<script\b([^>]*)\bsrc="([^"]+)"([^>]*)></script>', re.IGNORECASE)
STYLESHEET_HREF_RE = re.compile(r'<link\b([^>]*)rel="stylesheet"([^>]*)href="([^"]+)"([^>]*)>', re.IGNORECASE)
MANIFEST_LINK_RE = re.compile(r'\s*<link rel="manifest" href="[^"]+">\s*', re.IGNORECASE)


def strip_url_suffix(url):
    return url.split("?", 1)[0].split("#", 1)[0]


def is_local_asset(url):
    return not re.match(r"^(?:[a-z]+:)?//", url) and not url.startswith("data:")


def process_image(path, force_jpeg=False, max_width=900, quality=75):
    if not PIL_AVAILABLE:
        with open(path, "rb") as f:
            return f.read(), "png"
    img = Image.open(path)
    fmt = "JPEG" if force_jpeg else ("JPEG" if img.mode in ("RGB", "L") else "PNG")
    if img.width > max_width:
        height = int(img.height * max_width / img.width)
        img = img.resize((max_width, height), Image.LANCZOS)
    from io import BytesIO

    buf = BytesIO()
    if fmt == "JPEG":
        img = img.convert("RGB")
        img.save(buf, format=fmt, quality=quality, optimize=True)
    else:
        img.save(buf, format=fmt, optimize=True)
    return buf.getvalue(), "jpeg" if fmt == "JPEG" else "png"


def favicon_data_uri():
    favicon_data = None
    if PIL_AVAILABLE:
        from io import BytesIO

        with Image.open(FAVICON_PATH) as im:
            im = im.convert("RGBA")
            new_data = []
            for item in im.getdata():
                if item[0] > 250 and item[1] > 250 and item[2] > 250 and item[3] > 0:
                    new_data.append((255, 255, 255, 0))
                else:
                    new_data.append(item)
            im.putdata(new_data)
            buffer = BytesIO()
            im.save(buffer, format="PNG")
            favicon_data = buffer.getvalue()
    if favicon_data is None:
        with open(FAVICON_PATH, "rb") as f:
            favicon_data = f.read()
    return f"data:image/png;base64,{base64.b64encode(favicon_data).decode('utf-8')}"


def copy_file(src_path, dest_path):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(src_path, "rb") as src_file, open(dest_path, "wb") as dest_file:
        dest_file.write(src_file.read())


def write_versioned_app_manifest(app_version):
    with open(os.path.join(ROOT_DIR, "manifest.json"), "r", encoding="utf-8") as f:
        manifest = json.load(f)

    for icon in manifest.get("icons", []):
        src = icon.get("src")
        if not isinstance(src, str) or not src:
            continue
        separator = "&" if "?" in src else "?"
        icon["src"] = f"{src}{separator}v={app_version}"

    write_text(
        os.path.join(APP_DIST_DIR, "manifest.json"),
        json.dumps(manifest, ensure_ascii=False, indent=2),
    )


def remove_tree(path, attempts=3, delay=0.12):
    if not os.path.exists(path):
        return
    last_error = None
    for attempt in range(attempts):
        try:
            shutil.rmtree(path)
            return
        except FileNotFoundError:
            return
        except OSError as exc:
            last_error = exc
            if attempt == attempts - 1:
                raise
            time.sleep(delay)
    if last_error:
        raise last_error


def write_text(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def ensure_sibling_favicon_alias(target_dir):
    canonical_icon = os.path.join(target_dir, "favicon_big.png")
    if os.path.exists(canonical_icon):
        return

    candidates = sorted(
        name for name in os.listdir(target_dir)
        if re.fullmatch(r"favicon(?:_[^.]+)*\.png", name)
    )
    if not candidates:
        return

    preferred = None
    for name in candidates:
        if name.startswith("favicon_"):
            preferred = name
            break
    source_name = preferred or candidates[0]
    copy_file(os.path.join(target_dir, source_name), canonical_icon)
    print(f"   - Aliased sibling favicon {source_name} to {canonical_icon}")


def redirect_html(target, title):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url={target}">
  <link rel="canonical" href="{target}">
  <script>location.replace({target!r});</script>
  <style>
    body {{
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #0b1114, #18333e 60%, #f0c776);
      color: #f7f7ef;
      font-family: Georgia, serif;
      text-align: center;
      padding: 24px;
    }}
    a {{ color: #ffe49a; }}
  </style>
</head>
<body>
  <main>
    <h1>Redirecting...</h1>
    <p>If nothing happens, <a href="{target}">continue here</a>.</p>
  </main>
</body>
</html>
"""


def build_french_app(force_jpeg=False):
    print("   - Reading French app source files...")
    with open(HTML_TEMPLATE_PATH, "r", encoding="utf-8") as f:
      html_template = f.read()

    print("   - Processing and encoding background images...")
    image_data, image_fmt = process_image(IMAGE_PATH, force_jpeg=force_jpeg)
    dark_image_data, dark_image_fmt = process_image(DARK_IMAGE_PATH, force_jpeg=force_jpeg)
    image_data_uri = f"data:image/{image_fmt};base64,{base64.b64encode(image_data).decode('utf-8')}"
    dark_image_data_uri = f"data:image/{dark_image_fmt};base64,{base64.b64encode(dark_image_data).decode('utf-8')}"

    if not PIL_AVAILABLE:
        print(
            "\n⚠️  Pillow (PIL) not installed. Images will not be resized or compressed.\n"
            "   To enable image optimization, run: pip install pillow\n"
        )

    icon_data_uri = favicon_data_uri()

    def inline_local_stylesheets(html):
        def repl(match):
            href = match.group(3)
            if not is_local_asset(href):
                return match.group(0)

            css_path = os.path.join(ROOT_DIR, strip_url_suffix(href))
            if not os.path.exists(css_path):
                print(f"⚠️  Warning: local stylesheet not found, leaving as-is: {href}")
                return match.group(0)

            with open(css_path, "r", encoding="utf-8") as f:
                css_text = f.read()
            print("   - Inlining stylesheet:", css_path)

            css_text = css_text.replace("../bg.png", image_data_uri)
            css_text = css_text.replace("../bg.dark.png", dark_image_data_uri)
            return f"<style>\n{css_text}\n</style>"

        return STYLESHEET_HREF_RE.sub(repl, html)

    def inline_local_scripts(html):
        deferred_json_scripts = {
            "verb_usages.js": {
                "element_id": "verb-usages-data",
                "variable_prefix": "window.verbUsages =",
            },
            "verb_core_patterns.js": {
                "element_id": "verb-core-patterns-data",
                "variable_prefix": "window.verbCorePatterns =",
            },
        }

        def convert_assignment_script_to_json(content, prefix):
            normalized = content.strip()
            if not normalized.startswith(prefix):
                raise ValueError(f"Expected script to start with {prefix!r}")
            json_text = normalized[len(prefix):].strip()
            if json_text.endswith(";"):
                json_text = json_text[:-1].rstrip()
            return json_text

        def repl(match):
            src = match.group(2)
            if not is_local_asset(src):
                return match.group(0)

            script_path = os.path.join(ROOT_DIR, strip_url_suffix(src))
            if not os.path.exists(script_path):
                print(f"⚠️  Warning: local script not found, leaving as-is: {src}")
                return match.group(0)

            with open(script_path, "r", encoding="utf-8") as f:
                content = f.read()
            clean_src = strip_url_suffix(src)
            print("   - Inlining script:", clean_src, f"(len={len(content)})")

            deferred_spec = deferred_json_scripts.get(clean_src)
            if deferred_spec:
                json_text = convert_assignment_script_to_json(content, deferred_spec["variable_prefix"])
                json_text = json_text.replace("</script>", "<\\/script>")
                return (
                    f'<script id="{deferred_spec["element_id"]}" '
                    f'type="application/json" data-source="{clean_src}">\n'
                    f'{json_text}\n'
                    f'</script>'
                )

            return f"<script>\n// --- {clean_src} ---\n{content}\n</script>"

        return SCRIPT_SRC_RE.sub(repl, html)

    final_html = inline_local_stylesheets(html_template)
    final_html = re.sub(r'(<link rel="icon" href=")[^"]*(".*?>)', rf"\1{icon_data_uri}\2", final_html)
    final_html = inline_local_scripts(final_html)

    from datetime import datetime

    app_version = datetime.now().strftime("%Y%m%d_%H%M%S")
    web_html = final_html.replace("{{APP_VERSION}}", app_version)
    standalone_html = MANIFEST_LINK_RE.sub("\n", web_html)

    os.makedirs(APP_DIST_DIR, exist_ok=True)
    write_text(APP_INDEX_OUTPUT_PATH, web_html)
    write_text(APP_STANDALONE_OUTPUT_PATH, standalone_html)
    write_text(os.path.join(DIST_DIR, "franconjugue.html"), standalone_html)
    write_text(APP_VERSION_OUTPUT_PATH, json.dumps({
        "version": app_version,
        "app": "french",
    }, ensure_ascii=False, indent=2))
    write_versioned_app_manifest(app_version)

    for name in APP_FILES_TO_COPY:
        if name == "manifest.json":
            continue
        src_path = os.path.join(ROOT_DIR, name)
        dest_path = os.path.join(APP_DIST_DIR, name)
        if os.path.exists(src_path):
            print(f"   - Copying {src_path} to {dest_path}...")
            copy_file(src_path, dest_path)
        else:
            print(f"⚠️  Warning: {src_path} does not exist, skipping copy.")

    if os.path.isdir(GENERATED_TTS_DIR):
        if os.path.exists(APP_DIST_TTS_DIR):
            remove_tree(APP_DIST_TTS_DIR)
        shutil.copytree(GENERATED_TTS_DIR, APP_DIST_TTS_DIR)
        print(f"   - Copied French TTS assets to {APP_DIST_TTS_DIR}")
    else:
        print(f"⚠️  Warning: {GENERATED_TTS_DIR} does not exist, skipping TTS asset copy.")


def build_root_site():
    print("   - Writing root landing page...")
    with open(LANDING_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        landing_html = f.read()

    from datetime import datetime

    landing_html = landing_html.replace("{{APP_VERSION}}", datetime.now().strftime("%Y%m%d_%H%M%S"))
    write_text(os.path.join(DIST_DIR, "index.html"), landing_html)

    for name in ROOT_FILES_TO_COPY:
        src_path = os.path.join(ROOT_DIR, name)
        dest_path = os.path.join(DIST_DIR, name)
        if os.path.exists(src_path):
            print(f"   - Copying {src_path} to {dest_path}...")
            copy_file(src_path, dest_path)

    for spec in ROOT_EXTERNAL_FILES_TO_COPY:
        src_path = spec["src"]
        dest_path = os.path.join(DIST_DIR, spec["dest_name"])
        if os.path.exists(src_path):
            print(f"   - Copying {src_path} to {dest_path}...")
            copy_file(src_path, dest_path)

    copy_file(LANDING_MANIFEST_PATH, os.path.join(DIST_DIR, "manifest.json"))
    copy_file(LANDING_SW_PATH, os.path.join(DIST_DIR, "sw.js"))

    if os.path.isdir(ROOT_TTS_DIR):
        remove_tree(ROOT_TTS_DIR)
        print(f"   - Removed legacy root TTS bundle at {ROOT_TTS_DIR}")

    if os.path.isdir(LABS_DIR):
        if os.path.exists(DIST_LABS_DIR):
            remove_tree(DIST_LABS_DIR)
        shutil.copytree(LABS_DIR, DIST_LABS_DIR)
        print(f"   - Copied lab pages to {DIST_LABS_DIR}")


def sync_sibling_apps():
    print("   - Syncing sibling app builds...")
    for app in SIBLING_APPS:
        source_dist = app["source_dist"]
        target_dir = app["target_dir"]
        standalone_name = app["standalone"]

        if not os.path.isdir(source_dist):
            print(f"⚠️  Warning: sibling dist missing for {app['name']}: {source_dist}")
            continue

        if os.path.exists(target_dir):
            remove_tree(target_dir)
        shutil.copytree(source_dist, target_dir)
        ensure_sibling_favicon_alias(target_dir)
        print(f"   - Synced {app['name']} app to {target_dir}")

        standalone_src = os.path.join(source_dist, standalone_name)
        standalone_dest = os.path.join(DIST_DIR, standalone_name)
        if os.path.exists(standalone_src):
            copy_file(standalone_src, standalone_dest)
            print(f"   - Copied {app['name']} standalone to {standalone_dest}")
        else:
            print(f"⚠️  Warning: standalone missing for {app['name']}: {standalone_src}")


def write_legacy_redirects():
    print("   - Writing legacy redirects...")
    legacy_greek_dir = os.path.join(DIST_DIR, "greek-verbs")
    if os.path.isdir(legacy_greek_dir):
        remove_tree(legacy_greek_dir)
    redirects = {
        os.path.join(legacy_greek_dir, "index.html"): ("/greek/", "Greek Legacy Redirect"),
        os.path.join(legacy_greek_dir, "greekonjugation.html"): ("/greek/", "Greek Legacy Redirect"),
    }
    for dest_path, (target, title) in redirects.items():
        write_text(dest_path, redirect_html(target, title))


def build(force_jpeg=False):
    try:
        print("🚀 Starting site build...")
        if force_jpeg:
            print("   - Forcing JPEG output for backgrounds.")

        os.makedirs(DIST_DIR, exist_ok=True)
        build_french_app(force_jpeg=force_jpeg)
        build_root_site()
        sync_sibling_apps()
        write_legacy_redirects()
        reference_report = generate_reference_pages(ROOT_DIR, DIST_DIR)
        if reference_report and reference_report.get("total_pages", 0) > 0:
            print(
                "   - Generated SEO reference pages: "
                f'{reference_report["total_pages"]} total'
            )
            by_language = reference_report.get("by_language", {})
            if by_language:
                summary = ", ".join(
                    f"{language}={count}" for language, count in sorted(by_language.items())
                )
                print(f"     By language: {summary}")
            for path in reference_report.get("sample_paths", []):
                print(f"     Sample: {path}")
            if reference_report.get("limited"):
                print(
                    "     Note: limited by SEO_REFERENCE_LIMIT="
                    f'{reference_report["limited"]}'
                )
        for warning in (reference_report or {}).get("warnings", []):
            print(f"⚠️  SEO warning: {warning}")

        print("\n✅ Build successful!")
        print(f"   Landing page: {os.path.join(DIST_DIR, 'index.html')}")
        print(f"   French app: {APP_INDEX_OUTPUT_PATH}")

    except FileNotFoundError as e:
        print(f"\n❌ Build failed: File not found - {e.filename}")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")


WATCHED_FILES = [
    "index.html",
    "site_landing.html",
    "site_manifest.json",
    "site_sw.js",
    "css/style.css",
    "css/dictate-btn.css",
    "js/verbs.full.generated.js",
    "verb_usages.js",
    "js/practicePhrases.js",
    "js/preRenderedTts.js",
    "js/script.js",
    "generated_tts/manifest.json",
    "manifest.json",
    "favicon_big.png",
    "sw.js",
    "CNAME",
    "robots.txt",
    "llms.txt",
    "landing-greek.png",
    "landing-portugese.png",
    "landing-french.png",
    "landing-spanish.png",
    "landing-russian.png",
    "landing-catalan.png",
    "landing-ukrainian.png",
    "landing-latvian.png",
    os.path.join(DESKTOP_DIR, "german-verbs", "screenshot_german.png"),
]
WATCHED_FILES = [os.path.join(ROOT_DIR, path) for path in WATCHED_FILES]


def files_mtime(files):
    return {path: os.path.getmtime(path) for path in files if os.path.exists(path)}


def watch_and_build(force_jpeg=False, debounce_sec=20):
    print("👀 Watching for changes...")
    last_mtimes = files_mtime(WATCHED_FILES)

    while True:
        time.sleep(2)
        current_mtimes = files_mtime(WATCHED_FILES)

        if current_mtimes != last_mtimes:
            print(f"🔧 Change detected, waiting {debounce_sec}s for stability...")
            stable = False
            wait_start = time.time()
            stability_checks = 0
            required_checks = max(3, debounce_sec // 2)

            while not stable:
                time.sleep(2)
                new_mtimes = files_mtime(WATCHED_FILES)
                elapsed = time.time() - wait_start

                if new_mtimes == current_mtimes:
                    stability_checks += 1
                    if elapsed >= debounce_sec and stability_checks >= required_checks:
                        stable = True
                        print(f"✅ Files stable for {elapsed:.1f}s ({stability_checks} checks)")
                    else:
                        print(f"⏳ Stable for {elapsed:.1f}s ({stability_checks}/{required_checks} checks)")
                else:
                    current_mtimes = new_mtimes
                    wait_start = time.time()
                    stability_checks = 0
                    print(f"🔄 Files changed again, restarting {debounce_sec}s timer...")

            print("🔁 File system is stable. Running build...")
            build_start = time.time()
            build(force_jpeg=force_jpeg)
            build_time = time.time() - build_start
            print(f"✅ Build completed in {build_time:.2f}s")
            last_mtimes = current_mtimes


if __name__ == "__main__":
    force_jpeg = True
    debounce_time = 20

    for arg in sys.argv:
        if arg.startswith("--debounce="):
            try:
                debounce_time = int(arg.split("=", 1)[1])
                print(f"🕒 Using custom debounce time: {debounce_time}s")
            except ValueError:
                print(f"⚠️  Invalid debounce time '{arg}', using default: {debounce_time}s")

    if "--watch" in sys.argv:
        watch_and_build(force_jpeg=force_jpeg, debounce_sec=debounce_time)
    else:
        build(force_jpeg=force_jpeg)
