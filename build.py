
import os
import re
import base64
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# --- Configuration ---
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')

HTML_TEMPLATE_PATH = os.path.join(ROOT_DIR, 'index.html')
CSS_PATH = os.path.join(ROOT_DIR, 'css', 'style.css')
DICTATE_CSS_PATH = os.path.join(ROOT_DIR, 'css', 'dictate-btn.css')
JS_DIR = os.path.join(ROOT_DIR, 'js')
IMAGE_PATH = os.path.join(ROOT_DIR, 'bg.png')
DARK_IMAGE_PATH = os.path.join(ROOT_DIR, 'bg.dark.png')
FAVICON_PATH = os.path.join(ROOT_DIR, 'favicon_big.png')
HTML_OUTPUT_PATH = os.path.join(DIST_DIR, 'franconjugue.html')
FILES_TO_COPY = ['manifest.json', 'favicon_big.png', 'sw.js', "CNAME"]

def build(force_jpeg=False):
    """Reads source files, injects content, and writes a standalone HTML file."""
    try:
        print("🚀 Starting build process...")
        if force_jpeg:
            print("   - Forcing JPEG output for backgrounds.")

        # 1. Read all source files
        print("   - Reading source files...")
        with open(HTML_TEMPLATE_PATH, 'r', encoding='utf-8') as f:
            html_template = f.read()
        with open(CSS_PATH, 'r', encoding='utf-8') as f:
            print('adding css path:', CSS_PATH)
            css_content = f.read()
        # Read dictate-btn.css and append
        if os.path.exists(DICTATE_CSS_PATH):
            print('adding dictate-btn.css content...')
            with open(DICTATE_CSS_PATH, 'r', encoding='utf-8') as f:
                css_content += '\n' + f.read()

        # Collect all relevant JS files in a logical order
        js_files = []
        preferred_order = [
            'js/verbs.full.generated.js',
            'js/sentences.generated.js',
            'js/practicePhrases.js',
            # 'main.js',
            # 'alphabetScroller.js',
            # 'verbListModes.js',
            'js/script.js',
        ]
        # Add preferred files if they exist
        for fname in preferred_order:
            fpath=fname
            # fpath = os.path.join(JS_DIR, fname)
            if os.path.exists(fpath):
                js_files.append(fpath)
        # # Add any other .js files not already included (skip backups, test, bak, copy, etc)
        # for fname in os.listdir(JS_DIR):
        #     if fname.endswith('.js') and fname not in preferred_order and not any(x in fname for x in ['bak', 'copy', 'test', 'disabled']):
        #         js_files.append(os.path.join(JS_DIR, fname))
        # Read and concatenate
        js_contents = []
        for fpath in js_files:
            with open(fpath, 'r', encoding='utf-8') as f:
                js_contents.append(f"\n// --- {os.path.basename(fpath)} ---\n" + f.read())
                print('Added JS file:', os.path.basename(fpath), 'with length:', len(js_contents[-1]))
        



        def process_image(path, max_width=900, quality=75):
            if not PIL_AVAILABLE:
                with open(path, 'rb') as f:
                    return f.read(), 'png'
            img = Image.open(path)
            # Always use JPEG if flag is set, else auto-detect
            if force_jpeg:
                fmt = 'JPEG'
            else:
                fmt = 'JPEG' if img.mode in ('RGB', 'L') else 'PNG'
            if img.width > max_width:
                h = int(img.height * max_width / img.width)
                img = img.resize((max_width, h), Image.LANCZOS)
            from io import BytesIO
            buf = BytesIO()
            if fmt == 'JPEG':
                img = img.convert('RGB')
                img.save(buf, format=fmt, quality=quality, optimize=True)
            else:
                img.save(buf, format=fmt, optimize=True)
            return buf.getvalue(), 'jpeg' if fmt == 'JPEG' else 'png'

        print("   - Processing and encoding background image (light)...")
        image_data, image_fmt = process_image(IMAGE_PATH)
        base64_image = base64.b64encode(image_data).decode('utf-8')
        image_data_uri = f'data:image/{image_fmt};base64,{base64_image}'

        print("   - Processing and encoding background image (dark)...")
        dark_image_data, dark_image_fmt = process_image(DARK_IMAGE_PATH)
        base64_dark_image = base64.b64encode(dark_image_data).decode('utf-8')
        dark_image_data_uri = f'data:image/{dark_image_fmt};base64,{base64_dark_image}'

        if not PIL_AVAILABLE:
            print("\n⚠️  Pillow (PIL) not installed. Images will not be resized or compressed.\n   To enable image optimization, run: pip install pillow\n")

        # Read and encode the favicon to a data URI, making white transparent if possible
        print("   - Encoding favicon (white to transparent)...")
        favicon_data = None
        if PIL_AVAILABLE:
            from io import BytesIO
            with Image.open(FAVICON_PATH) as im:
                im = im.convert('RGBA')
                datas = im.getdata()
                newData = []
                for item in datas:
                    # If pixel is white (tolerant to near-white)
                    if item[0] > 250 and item[1] > 250 and item[2] > 250 and item[3] > 0:
                        newData.append((255, 255, 255, 0))
                    else:
                        newData.append(item)
                im.putdata(newData)
                buffer = BytesIO()
                im.save(buffer, format="PNG")
                favicon_data = buffer.getvalue()
        if favicon_data is None:
            with open(FAVICON_PATH, 'rb') as f:
                favicon_data = f.read()
        base64_favicon = base64.b64encode(favicon_data).decode('utf-8')
        favicon_data_uri = f'data:image/png;base64,{base64_favicon}'

        # 2. Inject CSS content
        print("   - Injecting CSS...")
        # First, replace the relative image paths with the Base64 data URIs
        css_content = css_content.replace("../bg.png", image_data_uri)
        css_content = css_content.replace("../bg.dark.png", dark_image_data_uri)
        replacement_css_block = f'<style>\n{css_content}\n</style>'
        final_html = re.sub(r'<link rel="stylesheet" href=".*">', lambda m: replacement_css_block, html_template)

        # 3. Inject Favicon
        print("   - Injecting favicon...")
        # Find the link tag and replace its href with the data URI
        final_html = re.sub(r'(<link rel="icon" href=")[^"]*(".*?>)', rf'\1{favicon_data_uri}\2', final_html)

        # 4. Combine and inject JavaScript content
        print("   - Injecting JavaScript...")

        combined_js = '\n'.join(js_contents)

        replacement_js_block = f'<script>{combined_js}</script>'
        # Use a lambda for the replacement. This is the crucial fix. It tells the `re` module
        # to use the returned string literally, without processing backslash escapes (like \u).
        final_html = re.sub(r'<script src="js/verbs.full.generated.js"></script>\s*<script src="sentences.generated.js"></script>\s*<script src="js/practicePhrases.js"></script>\s*<script src="js/script.js"></script>', lambda m: replacement_js_block, final_html)

        # 5. Inject version string for cache busting
        print("   - Injecting version string...")
        from datetime import datetime
        app_version = datetime.now().strftime('%Y%m%d_%H%M%S')
        final_html = final_html.replace('{{APP_VERSION}}', app_version)

        # 6. Ensure the output directory exists
        os.makedirs(DIST_DIR, exist_ok=True)

        # 7. Write the final HTML file
        with open(HTML_OUTPUT_PATH, 'w', encoding='utf-8') as f:
            f.write(final_html)
        INDEX_HTML_PATH = os.path.join(DIST_DIR, 'index.html')

        with open(INDEX_HTML_PATH, 'w', encoding='utf-8') as f:
            f.write(final_html)

        for f in FILES_TO_COPY:
            src_path =  os.path.join(ROOT_DIR, f)
            dest_path = os.path.join(DIST_DIR, f)
            if os.path.exists(src_path):
                # os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                with open(src_path, 'rb') as src_file:
                    with open(dest_path, 'wb') as dest_file:
                        print(f"   - Copying {src_path} to {dest_path} directory...")
                        dest_file.write(src_file.read())
            else:
                print(f"⚠️  Warning: {src_path} does not exist, skipping copy.")

        print(f"\n✅ Build successful!")
        print(f"   Standalone file created at: {HTML_OUTPUT_PATH} + index.html with same content")

    except FileNotFoundError as e:
        print(f"\n❌ Build failed: File not found - {e.filename}")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")



import os
import time
import sys

# Base path of the project (safe fallback if __file__ is not defined)
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
except NameError:
    BASE_DIR = os.getcwd()

# --- CONFIG: files to watch ---
WATCHED_FILES = [
    'index.html',
    'css/style.css',
    'css/dictate-btn.css',
    'js/verbs.full.generated.js',
    'sentences.generated.js',
    'js/script.js',
    'js/practicePhrases.js',
    # 'bg.png',
    # 'bg.dark.png',
    'manifest.json',
    'favicon_big.png',

]
WATCHED_FILES = [os.path.join(BASE_DIR, f) for f in WATCHED_FILES]

def files_mtime(files):
    return {f: os.path.getmtime(f) for f in files if os.path.exists(f)}

def watch_and_build(force_jpeg=False, debounce_sec=20):
    print("👀 Watching for changes...")
    last_mtimes = files_mtime(WATCHED_FILES)

    while True:
        time.sleep(2)  # Check less frequently to reduce CPU usage
        current_mtimes = files_mtime(WATCHED_FILES)

        if current_mtimes != last_mtimes:
            print(f"🔧 Change detected, waiting {debounce_sec}s for stability...")
            stable = False
            wait_start = time.time()
            stability_checks = 0
            required_checks = max(3, debounce_sec // 2)  # At least 3 checks, or 1 every 2 seconds

            while not stable:
                time.sleep(2)  # Check every 2 seconds instead of 0.5
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
                    # Files changed again, reset everything
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
    # force_jpeg = '--jpeg' in sys.argv
    force_jpeg = True
    
    # Allow override of debounce time via command line
    debounce_time = 20  # default
    for arg in sys.argv:
        if arg.startswith('--debounce='):
            try:
                debounce_time = int(arg.split('=')[1])
                print(f"🕒 Using custom debounce time: {debounce_time}s")
            except ValueError:
                print(f"⚠️  Invalid debounce time '{arg}', using default: {debounce_time}s")
    
    if '--watch' in sys.argv:
        watch_and_build(force_jpeg=force_jpeg, debounce_sec=debounce_time)
    else:
        build(force_jpeg=force_jpeg)



# if __name__ == "__main__":
#     import sys
#     force_jpeg = '--jpeg' in sys.argv
#     build(force_jpeg=force_jpeg)