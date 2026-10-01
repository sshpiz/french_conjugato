/* Private preview. Content belongs to existing usage/core-pattern records. */
(() => {
  const turns = new Map();
  const selections = new WeakMap();
  const key = `verb-patterns-preview-v2:${location.pathname.split('/')[1] || 'app'}`;
  let enabled = true;
  let active = null;
  let displayedCard = null;
  try { enabled = localStorage.getItem(key) !== 'off'; } catch (_) {}
  const id = entry => entry?.pattern_id || entry?.sense_id;
  const label = entry => entry?.drill_pattern?.text || entry?.pattern || '';
  const meaning = entry => entry?.drill_pattern?.meaning_en || entry?.meaning_en || '';
  const example = entry => {
    const linked = entry?.example_fr ? entry : (window.verbUsages || []).find(row => row.core_pattern_id === id(entry) && row.example_fr && row.example_en);
    if (!linked?.example_fr) return null;
    return { target: linked.example_fr, english: linked.example_en || '' };
  };
  function prepare(input, records = []) {
    const card = input?._patternBase || input?._constructionBase || input;
    if (!card?.verb || card.isPhraseMode || card.isFrameCard) return card;
    const entries = card.verb.verbExpression
      ? (window.verbUsages || []).filter(e => e.verb === card.verb.infinitive && e.example_fr && e.example_en)
      : records.filter(e => e.drill_pattern?.status === 'private_preview'
        && (!e.drill_pattern.allowed_tenses || e.drill_pattern.allowed_tenses.includes(card.tense)));
    if (!entries.length) return card;
    if (!selections.has(card)) {
      const verb = card.verb.infinitive;
      const turn = turns.get(verb) || 0;
      selections.set(card, entries[turn % entries.length]);
      turns.set(verb, turn + 1);
    }
    // An infinitive reference pattern never modifies morphology, grading or audio.
    return { ...card, _patternBase: card, _patternEntry: enabled ? selections.get(card) : null, _hasPatterns: true };
  }
  function clear() {
    active = null;
    document.getElementById('construction-disclosure')?.remove();
    document.getElementById('construction-pattern')?.remove();
    document.getElementById('construction-control')?.remove();
    document.getElementById('construction-complement')?.remove();
  }
  function appendLabel(node, entry) {
    const focus = entry.drill_pattern?.focus || [];
    // Match complete words (including Catalan d’), never arbitrary substrings.
    const parts = label(entry).split(/([\p{L}]+[’']?)/u);
    for (const part of parts) {
      const child = focus.includes(part) ? document.createElement('strong') : document.createTextNode(part);
      if (focus.includes(part)) child.textContent = part;
      node.appendChild(child);
    }
  }
  function render(card) {
    active = card?._patternEntry || null;
    displayedCard = card;
    if (!active) return;
    const translation = document.getElementById('verb-translation');
    if (!translation) return;
    const panel = document.createElement('div');
    panel.id = 'construction-pattern';
    panel.className = 'construction-pattern';
    if (active) {
      panel.dataset.patternId = id(active);
      const caption = document.createElement('div');
      caption.className = 'construction-example-label';
      caption.textContent = 'Par exemple';
      panel.appendChild(caption);
      const line = document.createElement('div');
      line.className = 'construction-pattern-text';
      appendLabel(line, active);
      panel.appendChild(line);
      const gloss = document.createElement('div');
      gloss.className = 'construction-pattern-meaning';
      gloss.textContent = meaning(active);
      panel.appendChild(gloss);
      const sample = example(active);
      if (sample) {
        panel.classList.add('has-example');
        panel.setAttribute('role', 'button');
        panel.setAttribute('tabindex', '0');
        panel.setAttribute('aria-expanded', 'false');
        const detail = document.createElement('div');
        detail.className = 'construction-pattern-sample';
        detail.hidden = true;
        const detailLabel = document.createElement('span');
        detailLabel.className = 'construction-pattern-sample-label';
        detailLabel.textContent = 'Par exemple';
        const target = document.createElement('span');
        target.className = 'construction-pattern-sample-target';
        target.textContent = sample.target;
        detail.append(detailLabel, target);
        if (sample.english) {
          const english = document.createElement('span');
          english.className = 'construction-pattern-sample-english';
          english.textContent = sample.english;
          detail.appendChild(english);
        }
        panel.appendChild(detail);
        const toggle = event => {
          event.stopPropagation();
          const expanded = panel.getAttribute('aria-expanded') !== 'true';
          panel.setAttribute('aria-expanded', String(expanded));
          detail.hidden = !expanded;
        };
        panel.addEventListener('click', toggle);
        panel.addEventListener('keydown', event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          toggle(event);
        });
      }
    }
    const answer = document.getElementById('phrase-container');
    (answer || translation).insertAdjacentElement('afterend', panel);
  }
  function bindSettings() {
    const toggle = document.getElementById('show-usage-pattern-toggle');
    if (!toggle) return;
    toggle.checked = enabled;
    toggle.addEventListener('change', () => {
      enabled = toggle.checked;
      try { localStorage.setItem(key, enabled ? 'on' : 'off'); } catch (_) {}
      if (displayedCard) {
        const card = displayedCard;
        card._patternEntry = enabled ? selections.get(card._patternBase || card) || null : null;
        clear();
        render(card);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindSettings);
  else bindSettings();
  function decorate(item, entry) {
    const entryId = id(entry);
    if (entryId) item.dataset.patternId = entryId;

  }
  const audio = (_card, audioId, text) => ({ audioId, text });
  window.constructionCards = { prepare, render, clear, audio, label, meaning, example, decorate };
})();
