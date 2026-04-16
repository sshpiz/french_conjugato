import base64
import json
import os
import re
import shutil
import sys
import time

try:
    from PIL import Image

    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT_DIR, "dist")
APP_DIST_DIR = os.path.join(DIST_DIR, "french")

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
ROOT_FILES_TO_COPY = ["favicon_big.png", "CNAME", "landing-greek.png", "landing-portugese.png", "landing-french.png"]

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


def write_text(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


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
    write_text(APP_VERSION_OUTPUT_PATH, json.dumps({
        "version": app_version,
        "app": "french",
    }, ensure_ascii=False, indent=2))

    for name in APP_FILES_TO_COPY:
        src_path = os.path.join(ROOT_DIR, name)
        dest_path = os.path.join(APP_DIST_DIR, name)
        if os.path.exists(src_path):
            print(f"   - Copying {src_path} to {dest_path}...")
            copy_file(src_path, dest_path)
        else:
            print(f"⚠️  Warning: {src_path} does not exist, skipping copy.")

    if os.path.isdir(GENERATED_TTS_DIR):
        if os.path.exists(APP_DIST_TTS_DIR):
            shutil.rmtree(APP_DIST_TTS_DIR)
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

    copy_file(LANDING_MANIFEST_PATH, os.path.join(DIST_DIR, "manifest.json"))
    copy_file(LANDING_SW_PATH, os.path.join(DIST_DIR, "sw.js"))

    if os.path.isdir(ROOT_TTS_DIR):
        shutil.rmtree(ROOT_TTS_DIR)
        print(f"   - Removed legacy root TTS bundle at {ROOT_TTS_DIR}")


def write_legacy_redirects():
    print("   - Writing legacy redirects...")
    legacy_greek_dir = os.path.join(DIST_DIR, "greek-verbs")
    if os.path.isdir(legacy_greek_dir):
        shutil.rmtree(legacy_greek_dir)
    redirects = {
        os.path.join(DIST_DIR, "franconjugue.html"): ("/french/", "French App Redirect"),
        os.path.join(DIST_DIR, "greekonjugation.html"): ("/greek/", "Greek App Redirect"),
        os.path.join(DIST_DIR, "portoconjugue.html"): ("/portugese/", "Portuguese App Redirect"),
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
        write_legacy_redirects()

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
    "landing-greek.png",
    "landing-portugese.png",
    "landing-french.png",
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
