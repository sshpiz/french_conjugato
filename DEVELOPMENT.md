# Portable development: French pilot

Keep this repository in a folder named `proj1`, next to `spanish-verbs` and
`catalan-verbs`. The planned WSL parent is `/home/codemonkey/projects/verbsfirst`.
The build derives paths from its source directory. Python 3.11+ is recommended
for the repository's broader tooling; the app build uses the standard library,
with Pillow optional for image conversion. No API key is needed to build the app.

```sh
python3 build.py
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Open `http://localhost:8080/french/`. Build Spanish and Catalan first if you want
the French hub to include their current `dist` outputs. A three-repository pilot
prints warnings for absent languages and is **not a complete production build**.
For a quick build check, `SEO_REFERENCE_LIMIT=2 python3 build.py` limits generated
reference pages; never deploy a build made with that limit.

When accessing a WSL development server from the Mac, forward port 8080 through
the existing SSH connection (`ssh -N -L 8080:127.0.0.1:8080 blackswan-dev`). Keep
the server bound to loopback. A private HTTPS phone preview is a separate step.

Do not copy Mac virtualenvs. If optional Python packages are needed, create a
local `.venv` and install only the required packages there. The general
`requirements.txt` includes data-generation dependencies and is not required
for ordinary frontend work.

## Audio and generated files

`build_french_tts.py` requires macOS `say`; audio generation stays on the Mac for
the pilot. Copy a validated audio pack directory **including its manifest** into
`generated_tts/` before building if packaged audio is needed. The build does not
generate that audio itself. An MP3 folder without its timing/index manifest is
not a complete pack. Browser speech support remains device-dependent.

`french_tts_inventory.json` is audio-generation input, not an app-build dependency.
It can be regenerated on the Mac using `generate_french_tts_inventory.py`.
Keep the data and its corresponding audio version together for audio work.

The migration branch includes the runtime files required by the current working
build, including `js/french-phonetic-diff-v3.js` and `js/vendor/espeak-ng.*`.
A clone of the old branch alone does not contain the current app.

Keep `.env*`, virtualenvs, TLS keys, Wrangler state, model caches and deployment
credentials local. No deployment credentials are needed for the pilot. The
cross-language generation scripts require their selected language repositories;
portable paths do not make the missing languages available.
