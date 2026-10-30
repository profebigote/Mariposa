/* Utilitaires communs : construction du DOM, texte bilingue, synthèse vocale. */
(function (g) {
  g.ESP = g.ESP || {};
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    Object.keys(attrs || {}).forEach((k) => {
      const v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    kids.flat(Infinity).forEach((c) => { if (c == null || c === false) return; el.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return el;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fmt = (n) => String(Math.round(n * 100) / 100).replace('.', ',');
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  function speak(t) {
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'es-ES'; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) { /* pas de voix */ }
  }
  const sndBtn = (t) => (canSpeak ? h('button', { class: 'snd', type: 'button', 'aria-label': 'Écouter', title: 'Écouter', onclick: () => speak(t) }, '🔊') : null);

  const showFr = () => (g.ESP.S ? g.ESP.S.pref('showFr', true) : true);
  const getText = (x, lang) => (typeof x === 'string' ? x : x ? (x[lang] || '') : '');
  /* Texte bilingue : une chaîne simple est affichée telle quelle ; {es, fr} affiche l'espagnol puis, si l'aide est active, le français. */
  function tx(x, cls) {
    if (x == null) return null;
    if (typeof x === 'string') return h('span', { class: cls || '' }, x);
    const box = h('span', { class: (cls || '') + ' bi' });
    if (x.es) box.append(h('span', { class: 'es' }, x.es));
    if (x.fr && (showFr() || !x.es)) box.append(h('span', { class: 'fr' }, x.fr));
    return box;
  }
  /* Remplace {{variable}} par la valeur courante (aventures). */
  const fill = (s, vars) => String(s == null ? '' : s).replace(/\{\{(\w+)\}\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : ''));
  /* Surligne des sous-chaînes dans un texte sûr : retourne du HTML. */
  function hl(text, parts) {
    let out = esc(text);
    (parts || []).forEach((p, i) => { if (p) out = out.split(esc(p)).join('<mark class="hl hl' + ((i % 3) + 1) + '">' + esc(p) + '</mark>'); });
    return out;
  }
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[.,;:!?¿¡"“”«»()]+/g, ' ').replace(/\s+/g, ' ').trim();
  /* Barre d'accents : insère dans le dernier champ de saisie utilisé. */
  let lastInput = null;
  if (typeof document !== 'undefined') document.addEventListener('focusin', (e) => { if (e.target.matches && e.target.matches('input.txt, input.inline, textarea.txt')) lastInput = e.target; });
  function accentBar() {
    return h('div', { class: 'accents', role: 'group', 'aria-label': 'Caractères espagnols' },
      ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'].map((ch) => h('button', {
        type: 'button', 'aria-label': 'Insérer ' + ch, onmousedown: (e) => e.preventDefault(),
        onclick: () => { const el = lastInput; if (!el) return; el.focus(); el.setRangeText(ch, el.selectionStart, el.selectionEnd, 'end'); el.dispatchEvent(new Event('input', { bubbles: true })); }
      }, ch)));
  }
  g.ESP.Util = { accentBar, h, esc, shuffle, pick, fmt, canSpeak, speak, sndBtn, showFr, tx, fill, hl, getText, norm };
  if (typeof module !== 'undefined') module.exports = g.ESP.Util;
})(typeof window !== 'undefined' ? window : globalThis);
