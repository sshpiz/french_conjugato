import os
import re

# --- Configuration ---
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')

HTML_TEMPLATE_PATH = os.path.join(ROOT_DIR, 'index.html')
CSS_PATH = os.path.join(ROOT_DIR, 'css', 'style.css')
VERBS_JS_PATH = os.path.join(ROOT_DIR, 'js', 'verbs.full.js')
SCRIPT_JS_PATH = os.path.join(ROOT_DIR, 'js', 'script.js')

HTML_OUTPUT_PATH = os.path.join(DIST_DIR, 'french-verbs.html')

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
        with open(VERBS_JS_PATH, 'r', encoding='utf-8') as f:
            verbs_js_content = f.read()
        with open(SCRIPT_JS_PATH, 'r', encoding='utf-8') as f:
            script_js_content = f.read()

        # 2. Inject CSS content
        print("   - Injecting CSS...")
        # Use a lambda for replacement to prevent re.sub from processing backslashes in the content.
        # This is safer, though less likely to be an issue for CSS.
        replacement_css_block = f'<style>\n{css_content}\n</style>'
        final_html = re.sub(r'<link rel="stylesheet" href=".*">', lambda m: replacement_css_block, html_template)

        # 3. Combine and inject JavaScript content
        print("   - Injecting JavaScript...")
        combined_js = f"\n// --- verbs.js ---\n{verbs_js_content}\n\n// --- script.js ---\n{script_js_content}\n"
        replacement_js_block = f'<script>{combined_js}</script>'
        # Use a lambda for the replacement. This is the crucial fix. It tells the `re` module
        # to use the returned string literally, without processing backslash escapes (like \u).
        final_html = re.sub(r'<script src="js/verbs.full.js"></script>\s*<script src="js/script.js"></script>', lambda m: replacement_js_block, final_html)

        # 4. Ensure the output directory exists
        os.makedirs(DIST_DIR, exist_ok=True)

        # 5. Write the final HTML file
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