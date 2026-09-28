Please add support email discoverability to the main site and to all apps.

Support email:
- `lesverbes.support@gmail.com`

Target repos:
- /Users/simeon/Desktop/proj1
- /Users/simeon/Desktop/greek-verbs
- /Users/simeon/Desktop/portuguese-verbs
- /Users/simeon/Desktop/russian-verbs
- /Users/simeon/Desktop/catalan-verbs
- /Users/simeon/Desktop/ukrainian-verbs
- /Users/simeon/Desktop/latvian-verbs
- /Users/simeon/Desktop/spanish-verbs

Important scope rules:
- Source files only
- Do not edit `dist/`, `dist-gh/`, generated files, or data files
- Do not push or deploy unless explicitly asked

Product direction:
1. Main site
- Add the support email at the bottom of the main site
- It should feel like a quiet, trustworthy footer/contact element
- Not a giant CTA
- Not hidden behind multiple clicks

2. Each app
- Add the same support email somewhere in the app UI
- Preferred location:
  - `Settings`
  - near the `App` section / bottom area
- It should be easy to find when needed, but not visually loud

Design guidance:
- keep it understated
- if possible, make it easy to copy or tap as a `mailto:` link
- preserve the existing visual language of each app

Files likely involved:
- main site / French repo:
  - `/Users/simeon/Desktop/proj1/site_landing.html`
  - `/Users/simeon/Desktop/proj1/index.html`
  - `/Users/simeon/Desktop/proj1/css/style.css`
  - `/Users/simeon/Desktop/proj1/js/script.js` if settings markup is assembled there
- sibling repos:
  - each repo’s `index.html`
  - each repo’s `css/style.css`
  - optionally `js/script.js` if needed for settings rendering hooks

Deliverables:
- add the support email to the main site bottom/footer area
- add the support email to each app in an appropriate app/settings location
- summarize:
  - which files changed
  - where the email now appears in the main site
  - where the email now appears in each app

Do not build, push, or deploy unless explicitly asked.

