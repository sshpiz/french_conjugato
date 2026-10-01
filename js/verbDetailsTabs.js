/* Optional details shell. Existing content and handlers are moved, never rebuilt. */
(() => {
    'use strict';
    const FLAG = 'vf:details-tabs:v1';
    const TAB = 'vf:details-tab:v1';
    const names = ['conjugation', 'usage', 'family'];
    const read = (key) => { try { return localStorage.getItem(key); } catch (_) { return null; } };
    const write = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
    let enabled = read(FLAG) !== '0';
    let context = null;
    const requested = new URLSearchParams(location.search).get('detailsV2');
    if (requested === '1' || requested === '0') {
        enabled = requested === '1';
        write(FLAG, enabled ? '1' : '0');
        // Consume the preview override so the visible off switch survives a reload.
        const url = new URL(location.href);
        url.searchParams.delete('detailsV2');
        history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }
    const element = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    function setEnabled(value) {
        enabled = !!value;
        write(FLAG, enabled ? '1' : '0');
        const toggle = document.getElementById('details-tabs-toggle');
        if (toggle) toggle.checked = enabled;
        if (context) context.rerender();
    }
    function mountSetting() {
        const target = document.querySelector('#app-group .collapsible-body');
        if (!target || document.getElementById('details-tabs-toggle')) return;
        const row = element('div', 'toggle-row');
        row.id = 'details-tabs-setting';
        const copy = element('div', 'settings-row-copy');
        const label = element('label', '', 'Tabbed verb details');
        label.htmlFor = 'details-tabs-toggle';
        copy.append(label, element('p', 'setting-helper-text', 'Try Conjugation, Usage and Word family tabs. Switch off to restore classic details.'));
        const control = element('div', 'toggle-switch');
        const input = element('input', 'toggle-input');
        input.type = 'checkbox'; input.id = 'details-tabs-toggle'; input.checked = enabled;
        input.addEventListener('change', () => setEnabled(input.checked));
        const visual = element('label', 'toggle-label'); visual.htmlFor = input.id;
        control.append(input, visual); row.append(copy, control); target.prepend(row);
    }
    function familyPanel(panel, options) {
        const data = window.VF_WORD_FAMILIES;
        if (!data || !Array.isArray(data.records)) {
            panel.append(element('p', 'vf-details-empty', 'Word families are unavailable right now. Conjugation and usage are still available.'));
            return;
        }
        const record = data.records.find(row => row.lemma === options.verb.infinitive);
        const groups = [['verbs', 'Other verbs'], ['nouns', 'Nouns'], ['adjectives', 'Adjectives'], ['adverbs', 'Adverbs'], ['presentParticiples', 'Present participle'], ['pastParticiples', 'Past participle']];
        if (!record || !groups.some(([key]) => record[key]?.length)) {
            panel.append(element('p', 'vf-details-empty', 'No word family added for this verb yet.'));
            return;
        }
        if (record.familyOf) panel.append(element('p', 'vf-family-hint', `Built on ${record.familyOf} · words in the base verb’s family.`));
        panel.append(element('p', 'vf-family-hint', 'Tap a word for its meaning.'));
        groups.forEach(([key, label]) => {
            if (!record[key]?.length) return;
            const section = element('section', 'vf-family-group');
            section.append(element('h3', 'vf-family-label', label));
            const list = element('ul', 'vf-family-words');
            const definition = element('div', 'vf-family-definition');
            definition.id = `vf-family-definition-${key}`;
            definition.hidden = true;
            definition.setAttribute('role', 'region');
            definition.setAttribute('aria-live', 'polite');
            let selected = null;
            const close = () => {
                definition.hidden = true;
                if (selected) selected.setAttribute('aria-expanded', 'false');
                selected = null;
            };
            record[key].forEach(word => {
                const item = element('li');
                const entry = record.participleDefinitions?.[key]?.[word] || window.VF_FAMILY_DEFINITIONS?.[key]?.[word];
                const button = element('button', 'vf-family-word', entry?.display || word);
                button.type = 'button';
                button.setAttribute('aria-expanded', 'false');
                button.setAttribute('aria-controls', definition.id);
                button.setAttribute('aria-label', `Meaning of ${entry?.display || word}`);
                button.addEventListener('click', () => {
                    const wasSelected = selected === button;
                    close();
                    if (wasSelected) return;
                    selected = button;
                    button.setAttribute('aria-expanded', 'true');
                    definition.replaceChildren();
                    definition.setAttribute('aria-label', `Meaning of ${word}`);
                    const heading = element('strong', '', entry?.display || word);
                    const text = entry?.definition;
                    definition.append(heading, element('p', '', text || 'Definition unavailable.'));
                    if (key === 'verbs' && options.hasVerb(word)) {
                        const open = element('button', 'vf-family-open', 'Open verb');
                        open.type = 'button';
                        open.addEventListener('click', () => {
                            write(TAB, 'conjugation'); options.openVerb(word);
                        });
                        definition.append(open);
                    }
                    const dismiss = element('button', 'vf-family-close', 'Close');
                    dismiss.type = 'button';
                    dismiss.addEventListener('click', () => { close(); button.focus(); });
                    definition.append(dismiss);
                    definition.hidden = false;
                    definition.scrollIntoView({block: 'nearest'});
                });
                item.append(button); list.append(item);
            });
            section.addEventListener('keydown', event => {
                if (event.key !== 'Escape' || !selected) return;
                const trigger = selected; close(); trigger.focus(); event.stopPropagation();
            });
            section.append(list, definition); panel.append(section);
        });
    }
    function enhance(options) {
        context = options;
        const root = options.container;
        root.classList.toggle('vf-details-tabs-enabled', enabled);
        if (!enabled) return;
        const header = root.querySelector('.verb-detail-header');
        if (!header) return;
        const tablist = element('div', 'vf-details-tabs');
        tablist.setAttribute('role', 'tablist'); tablist.setAttribute('aria-label', 'Verb details');
        const panels = {};
        const buttons = {};
        names.forEach((name, index) => {
            const panel = element('section', 'vf-details-panel');
            panel.id = `vf-details-panel-${name}`;
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', `vf-details-tab-${name}`);
            panels[name] = panel;
            const button = element('button', '', ['Conjugation', 'Usage', 'Word family'][index]);
            button.type = 'button'; button.id = `vf-details-tab-${name}`;
            button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id);
            button.addEventListener('click', () => select(name, true));
            button.addEventListener('keydown', event => {
                let target;
                if (event.key === 'ArrowRight') target = names[(index + 1) % names.length];
                if (event.key === 'ArrowLeft') target = names[(index + names.length - 1) % names.length];
                if (event.key === 'Home') target = names[0];
                if (event.key === 'End') target = names[names.length - 1];
                if (!target) return;
                event.preventDefault(); select(target, true); buttons[target].focus();
            });
            tablist.append(button); buttons[name] = button;
        });
        // Preserve the existing nodes, audio data attributes and delegated handlers.
        Array.from(root.children).forEach(node => {
            if (node === header) return;
            panels[node.classList.contains('verb-usages-detail-section') ? 'usage' : 'conjugation'].append(node);
        });
        if (!panels.usage.children.length) panels.usage.append(element('p', 'vf-details-empty', 'No usage patterns added for this verb yet.'));
        familyPanel(panels.family, options);
        root.append(tablist, ...names.map(name => panels[name]));
        function select(name, remember) {
            names.forEach(key => {
                const active = key === name;
                panels[key].hidden = !active;
                buttons[key].setAttribute('aria-selected', String(active));
                buttons[key].tabIndex = active ? 0 : -1;
            });
            if (remember) {
                write(TAB, name);
                root.scrollTop = 0;
            }
        }
        const saved = read(TAB);
        select(options.tenseToFocus ? 'conjugation' : names.includes(saved) ? saved : 'conjugation', false);
    }
    window.VerbDetailsTabs = {enhance, setEnabled, isEnabled: () => enabled};
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountSetting, {once: true});
    else mountSetting();
})();
