import os
import re
import base64

# --- Configuration ---
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')

HTML_TEMPLATE_PATH = os.path.join(ROOT_DIR, 'index.html')
CSS_PATH = os.path.join(ROOT_DIR, 'css', 'style.css')
JS_DIR = os.path.join(ROOT_DIR, 'js')
IMAGE_PATH = os.path.join(ROOT_DIR, 'bg.png')
FAVICON_PATH = os.path.join(ROOT_DIR, 'favicon_big.png')
HTML_OUTPUT_PATH = os.path.join(DIST_DIR, 'franconjugue.html')

def build():
    """Reads source files, injects content, and writes a standalone HTML file."""
    try:
        print("🚀 Starting build process...")

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
            'main.js',
            'alphabetScroller.js',
            'verbListModes.js',
            'script.js',
        ]
        # Add preferred files if they exist
        for fname in preferred_order:
            fpath = os.path.join(JS_DIR, fname)
            if os.path.exists(fpath):
                js_files.append(fpath)
        # Add any other .js files not already included (skip backups, test, bak, copy, etc)
        for fname in os.listdir(JS_DIR):
            if fname.endswith('.js') and fname not in preferred_order and not any(x in fname for x in ['bak', 'copy', 'test', 'disabled']):
                js_files.append(os.path.join(JS_DIR, fname))
        # Read and concatenate
        js_contents = []
        for fpath in js_files:
            with open(fpath, 'r', encoding='utf-8') as f:
                js_contents.append(f"\n// --- {os.path.basename(fpath)} ---\n" + f.read())
        
        # Read and encode the image to a data URI
        print("   - Encoding background image...")
        with open(IMAGE_PATH, 'rb') as f:
            image_data = f.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        image_data_uri = f'data:image/png;base64,{base64_image}'

        # Read and encode the favicon to a data URI
        print("   - Encoding favicon...")
        with open(FAVICON_PATH, 'rb') as f:
            favicon_data = f.read()
        base64_favicon = base64.b64encode(favicon_data).decode('utf-8')
        favicon_data_uri = f'data:image/png;base64,{base64_favicon}'

        # 2. Inject CSS content
        print("   - Injecting CSS...")
        # First, replace the relative image path with the Base64 data URI
        css_content = css_content.replace("../bg.png", image_data_uri)
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
    build()