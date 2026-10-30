/* Mariposa : le compagnon qui évolue avec les apprentissages consolidés.
   Illustrations originales en SVG. Aucune régression : le stade atteint est conservé, quelle que soit l'absence. */
(function (g) {
  g.ESP = g.ESP || {};
  const { h } = g.ESP.Util;
  const INK = '#2e1f1a';

  const WING_UP = 'M100 80 C118 30 176 18 184 54 C188 80 142 94 102 88 Z';
  const WING_LOW = 'M102 90 C136 90 166 106 152 136 C140 154 112 134 100 100 Z';
  const mirror = (inner) => '<g transform="translate(200,0) scale(-1,1)">' + inner + '</g>';

  function caterpillar(stage) {
    const big = stage === 2;
    const segs = big ? [[44, 112, 15], [70, 108, 16], [97, 104, 17], [124, 102, 17], [150, 100, 17]] : [[52, 114, 12], [76, 111, 13], [100, 108, 14], [124, 106, 14]];
    const head = big ? [176, 90, 21] : [148, 98, 17];
    const colA = '#8fbf4a', colB = big ? '#e9a41c' : '#a8cf62';
    let s = '<path d="M10 128 C50 118 130 118 190 128 L190 140 L10 140 Z" fill="#5a7d3a"/><path d="M20 124 C40 100 60 98 70 120" fill="#6f9a45" stroke="' + INK + '" stroke-width="2"/>';
    segs.forEach((c, i) => {
      s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + (big && i % 2 ? colB : colA) + '" stroke="' + INK + '" stroke-width="2.5"/>';
      s += '<path d="M' + (c[0] - 5) + ' ' + (c[1] + c[2] - 1) + ' v8 M' + (c[0] + 5) + ' ' + (c[1] + c[2] - 1) + ' v8" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>';
      if (big) s += '<circle cx="' + c[0] + '" cy="' + (c[1] - 5) + '" r="3" fill="#c0392b"/>';
    });
    s += '<circle cx="' + head[0] + '" cy="' + head[1] + '" r="' + head[2] + '" fill="' + colA + '" stroke="' + INK + '" stroke-width="2.5"/>';
    s += '<circle cx="' + (head[0] + 4) + '" cy="' + (head[1] - 3) + '" r="3.2" fill="' + INK + '"/><circle cx="' + (head[0] - 6) + '" cy="' + (head[1] - 3) + '" r="3.2" fill="' + INK + '"/>';
    s += '<path d="M' + (head[0] - 6) + ' ' + (head[1] + 6) + ' q6 5 12 0" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
    s += '<path d="M' + (head[0] - 4) + ' ' + (head[1] - head[2] + 2) + ' q-6 -16 -14 -18 M' + (head[0] + 5) + ' ' + (head[1] - head[2] + 2) + ' q6 -16 14 -16" stroke="' + INK + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    s += '<circle cx="' + (head[0] - 18) + '" cy="' + (head[1] - head[2] - 15) + '" r="3.5" fill="#c0392b"/><circle cx="' + (head[0] + 19) + '" cy="' + (head[1] - head[2] - 13) + '" r="3.5" fill="#c0392b"/>';
    return '<g class="bf-crawl">' + s + '</g>';
  }

  function chrysalis() {
    return '<path d="M20 22 H180" stroke="#6b3f23" stroke-width="8" stroke-linecap="round"/><path d="M60 22 q8 -8 16 0 M130 22 q8 -8 16 0" stroke="#5a7d3a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<g class="bf-sway"><path d="M100 22 V44" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M100 44 C78 50 70 82 78 110 C84 132 94 146 100 148 C106 146 116 132 122 110 C130 82 122 50 100 44 Z" fill="#7fb069" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M86 66 q14 8 28 0 M82 84 q18 10 36 0 M82 102 q18 10 36 0 M88 120 q12 8 24 0" stroke="#3f6b2e" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="100" cy="60" r="2.8" fill="#e9a41c"/><circle cx="90" cy="96" r="2.8" fill="#e9a41c"/><circle cx="110" cy="96" r="2.8" fill="#e9a41c"/><circle cx="100" cy="128" r="2.8" fill="#e9a41c"/></g>';
  }

  function butterfly(stage) {
    const voyager = stage === 5;
    const sc = voyager ? 1 : 0.86;
    const defs = voyager
      ? '<defs><linearGradient id="bfw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2845f"/><stop offset=".55" stop-color="#f1be4d"/><stop offset="1" stop-color="#2f8f8a"/></linearGradient><linearGradient id="bfw2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f8f8a"/><stop offset=".6" stop-color="#e9a41c"/><stop offset="1" stop-color="#c0392b"/></linearGradient></defs>'
      : '';
    const f1 = voyager ? 'url(#bfw)' : '#e9a41c', f2 = voyager ? 'url(#bfw2)' : '#f2a65a';
    const wing = (flip) => {
      const inner = '<path d="' + WING_UP + '" fill="' + f1 + '" stroke="' + INK + '" stroke-width="3"/><path d="' + WING_LOW + '" fill="' + f2 + '" stroke="' + INK + '" stroke-width="3"/>' +
        (voyager ? '<circle cx="152" cy="52" r="7" fill="#fff" opacity=".9"/><circle cx="168" cy="66" r="4" fill="#fff" opacity=".9"/><circle cx="134" cy="120" r="5" fill="#fff" opacity=".9"/><path d="M104 88 C130 70 150 60 172 52" stroke="' + INK + '" stroke-width="1.6" fill="none" opacity=".5"/><path d="M152 136 l10 12 l-18 -4z" fill="#2f8f8a" stroke="' + INK + '" stroke-width="2"/>'
          : '<circle cx="150" cy="56" r="6" fill="#fff" opacity=".85"/><circle cx="128" cy="122" r="4" fill="#fff" opacity=".85"/>');
      return flip ? mirror(inner) : inner;
    };
    const body = '<ellipse cx="100" cy="92" rx="6.5" ry="30" fill="#3a2a22" stroke="' + INK + '" stroke-width="2.5"/><circle cx="100" cy="58" r="9" fill="#3a2a22" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M96 52 C90 38 82 34 76 36 M104 52 C110 38 118 34 124 36" stroke="' + INK + '" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="76" cy="36" r="3" fill="' + (voyager ? '#f1be4d' : '#c0392b') + '"/><circle cx="124" cy="36" r="3" fill="' + (voyager ? '#f1be4d' : '#c0392b') + '"/>' +
      '<circle cx="96.5" cy="57" r="1.8" fill="#fffaf1"/><circle cx="103.5" cy="57" r="1.8" fill="#fffaf1"/>';
    const stars = voyager ? '<path d="M24 36 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z M168 128 l2.4 5.6 l5.6 2.4 l-5.6 2.4 l-2.4 5.6 l-2.4 -5.6 l-5.6 -2.4 l5.6 -2.4z" fill="#f1be4d" stroke="' + INK + '" stroke-width="1.5"/>' : '';
    return defs + stars + '<g class="bf-flutter" transform="translate(' + (100 - 100 * sc) + ' ' + (80 - 80 * sc + 4) + ') scale(' + sc + ')">' + wing(true) + wing(false) + body + '</g>';
  }

  /* Dessin du stade 1..5. Les animations sont des classes CSS (désactivées si « animations réduites »). */
  function svg(stage, label) {
    const inner = stage <= 2 ? caterpillar(stage) : stage === 3 ? chrysalis() : butterfly(stage);
    return '<svg class="bfSvg stage' + stage + '" viewBox="0 0 200 160" role="img" aria-label="' + (label || 'Mariposa') + '">' + inner + '</svg>';
  }

  const C = () => g.ESP.C, S = () => g.ESP.S, P = () => g.ESP.Progress;
  const unitTotal = (u) => (u.items || []).length + (u.exercises || []).length + (u.dialogues || []).length + (u.conj ? u.conj.verbs.length * 3 : 0);

  function skillLevel(id) { return Math.max(P().levelOf(S().skill(id).ev).level, S().skill(id).max || 0); }
  function points() {
    const lv = (g.ESP.SKILLS || []).map((s) => skillLevel(s.id));
    const legacy = (C() ? C().units : []).map((u) => S().stage(u.id, unitTotal(u)));
    return P().growth(lv, legacy);
  }
  const stages = () => g.ESP.BUTTERFLY.stages;
  function stage() {
    const st = P().stageOf(points(), stages().map((x) => x.threshold));
    const reached = S().butterfly().reached || 1;
    if (st > reached) S().setButterfly({ reached: st });
    return Math.max(st, reached); // jamais de régression
  }
  /* progression vers la prochaine étape, 0..1 (pour une barre sans chiffre) */
  function toNext() {
    const st = stage(); if (st >= 5) return 1;
    const a = stages()[st - 1].threshold, b = stages()[st].threshold;
    return Math.max(0, Math.min(1, (points() - a) / (b - a)));
  }
  const reduceMotion = () => S().pref('reduceMotion', typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function applyMotionPref() { document.documentElement.classList.toggle('no-motion', !!reduceMotion()); }

  /* petite fête de passage d'étape : une seule fois, facultative, sans mouvement si les animations sont réduites */
  function celebrateIfNew() {
    const st = stage(); const seen = S().butterfly().seen || 1;
    if (st <= seen || document.getElementById('bfCelebrate')) return;
    S().setButterfly({ seen: st });
    const info = stages()[st - 1];
    const close = () => { const e = document.getElementById('bfCelebrate'); if (e) e.remove(); };
    const box = h('div', { class: 'bfOverlay', id: 'bfCelebrate', role: 'dialog', 'aria-modal': 'true', 'aria-label': info.name },
      h('div', { class: 'bfCard' + (reduceMotion() ? '' : ' pop') }, h('p', { class: 'eyebrow' }, 'Mariposa evoluciona · Mariposa évolue'),
        h('div', { class: 'bfBig', html: svg(st, info.name) }), h('h2', {}, info.name), h('p', { class: 'note' }, info.fr),
        h('p', {}, info.msg.es), S().pref('showFr', true) ? h('p', { class: 'note' }, info.msg.fr) : null,
        h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: close }, 'Seguir · Continuer'), h('button', { class: 'btn', type: 'button', onclick: () => { close(); if (g.ESP.UApi) g.ESP.UApi.go({ v: 'prog' }); } }, 'Ver mi progreso'))));
    document.body.append(box);
    const b = box.querySelector('button'); if (b) b.focus();
    box.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  g.ESP.Butterfly = { svg, points, stage, toNext, celebrateIfNew, applyMotionPref, reduceMotion, unitTotal };
})(typeof window !== 'undefined' ? window : globalThis);
