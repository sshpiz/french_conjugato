
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
JS_DIR = os.path.join(ROOT_DIR, 'js')
IMAGE_PATH = os.path.join(ROOT_DIR, 'bg.png')
DARK_IMAGE_PATH = os.path.join(ROOT_DIR, 'bg.dark.png')
FAVICON_PATH = os.path.join(ROOT_DIR, 'favicon_big.png')
HTML_OUTPUT_PATH = os.path.join(DIST_DIR, 'franconjugue.html')


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
            css_content = f.read()

        # Collect all relevant JS files in a logical order
        js_files = []
        preferred_order = [
            'verbs.full.js',
            'sentences.js',
            # 'main.js',
            # 'alphabetScroller.js',
            # 'verbListModes.js',
            'script.js',
        ]
        # Add preferred files if they exist
        for fname in preferred_order:
            fpath = os.path.join(JS_DIR, fname)
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
        final_html = re.sub(r'<script src="js/verbs.full.js"></script>\s*<script src="js/sentences.js"></script>\s*<script src="js/script.js"></script>', lambda m: replacement_js_block, final_html)

        # 5. Ensure the output directory exists
        os.makedirs(DIST_DIR, exist_ok=True)

        # 6. Write the final HTML file
        with open(HTML_OUTPUT_PATH, 'w', encoding='utf-8') as f:
            f.write(final_html)

        print(f"\n✅ Build successful!")
        print(f"   Standalone file created at: {HTML_OUTPUT_PATH}")

    except FileNotFoundError as e:
        print(f"\n❌ Build failed: File not found - {e.filename}")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    import sys
    force_jpeg = '--jpeg' in sys.argv
    build(force_jpeg=force_jpeg)