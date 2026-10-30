/* Bibliothèque d'activités réutilisables. Chaque activité : A[kind](spec, api, env) -> { el, focus?, lock?, retry?, reveal? }
   api.submit({ state:'ok'|'almost'|'wrong', errorKind, matched, assisted, errors, answerText, detail })
   api.ready()            : active le bouton « Continuer » (écrans de lecture)
   api.item(id, quality)  : qualité par mot (révision espacée)
   env : { mod, vars, items (par id) }
   Toutes les interactions se font au toucher / clic / clavier : aucun glisser-déposer obligatoire. */
(function (g) {
  g.ESP = g.ESP || {};
  const { h, shuffle, tx, hl, sndBtn, fill, norm, esc, showFr } = g.ESP.Util;
  const E = g.ESP.E;
  const A = {};

  const bi = (x, env) => (typeof x === 'string' ? fill(x, env && env.vars) : x ? { es: fill(x.es, env && env.vars), fr: fill(x.fr, env && env.vars) } : null);
  const head = (spec, env) => [spec.title ? h('h2', { class: 'act-title' }, tx(bi(spec.title, env))) : null, spec.prompt && !/___/.test(typeof spec.prompt === 'string' ? spec.prompt : spec.prompt.es || '') ? h('p', { class: 'prompt' }, tx(bi(spec.prompt, env))) : null];
  const withArt = (it) => (it.art ? it.art + ' ' : '') + it.es;
  const softNote = (box, msg) => { box.textContent = ''; if (!msg) return; box.append(h('span', {}, msg.es), showFr() && msg.fr ? h('small', {}, ' ' + msg.fr) : null); };
  const wordsOf = (s) => String(s).trim().split(/\s+/);
  const accentOK = (spec) => !spec.sig;

  /* ───────────────── écrans de lecture et de schéma ───────────────── */
  A.observe = function (spec, api, env) {
    const wrap = h('div', { class: 'act' }, head(spec, env), spec.intro ? h('p', {}, tx(bi(spec.intro, env))) : null);
    (spec.examples || []).forEach((ex) => {
      wrap.append(h('div', { class: 'ex' }, ex.img ? h('span', { class: 'exImg', 'aria-hidden': 'true' }, ex.img) : null,
        h('div', { class: 'exTxt' }, h('p', { class: 'exEs', html: hl(fill(ex.es, env.vars), ex.highlight) }), sndBtn(ex.es),
          ex.fr && showFr() ? h('p', { class: 'exFr' }, ex.fr) : null)));
    });
    if (spec.question) {
      const concl = spec.conclusion ? h('div', { class: 'rule', hidden: true }, tx(bi(spec.conclusion, env))) : null;
      wrap.append(h('div', { class: 'think' }, h('p', { class: 'prompt' }, tx(bi(spec.question, env))), concl ? h('button', { class: 'btn small', type: 'button', onclick: (e) => { concl.hidden = false; e.currentTarget.hidden = true; } }, 'Ver la idea · Voir l’idée') : null, concl));
    }
    api.ready(); return { el: wrap };
  };

  A.schema = function (spec, api, env) {
    const rows = []; let all = false;
    const set = (r, on) => { r.on = on; r.btn.setAttribute('aria-pressed', String(on)); r.btn.classList.toggle('on', on); r.res.hidden = !on; };
    const list = h('div', { class: 'schema' }, (spec.rows || []).map((row) => {
      const full = (row.full || (row.stem + row.to)).toLowerCase();
      const r = { on: false };
      r.res = h('span', { class: 'sRes', hidden: true }, '→ ', h('strong', {}, full), sndBtn(full));
      r.btn = h('button', { class: 'sRow', type: 'button', 'aria-pressed': 'false', 'aria-label': row.stem + row.from + ' → ' + full, onclick: () => set(r, !r.on) },
        h('span', { class: 'chip stem' }, row.stem), h('span', { class: 'chip end' }, h('span', { class: 'endOld' }, row.from), h('span', { class: 'endNew' }, row.to)));
      rows.push(r);
      return h('div', { class: 'sItem' }, r.btn, r.res, row.fr && showFr() ? h('small', { class: 'sFr' }, row.fr) : null);
    }));
    const toggle = h('button', { class: 'btn small', type: 'button', onclick: () => { all = !all; rows.forEach((r) => set(r, all)); toggle.textContent = all ? 'Volver al infinitivo · Revenir à l’infinitif' : 'Transformar · Transformer'; } }, 'Transformar · Transformer');
    const legend = h('p', { class: 'legend' }, h('span', { class: 'chip stem' }, 'radical'), ' ', h('span', { class: 'chip end' }, 'terminaison'));
    api.ready();
    return { el: h('div', { class: 'act' }, head(spec, env), spec.intro ? h('p', {}, tx(bi(spec.intro, env))) : null, legend, list, h('div', { class: 'actions' }, toggle), spec.note ? h('p', { class: 'note' }, tx(bi(spec.note, env))) : null) };
  };

  A.formula = function (spec, api, env) {
    const parts = h('div', { class: 'formula' }, (spec.parts || []).map((p) => (p.role ? h('div', { class: 'fBlock role-' + p.role }, h('strong', {}, p.text), p.label ? h('small', {}, p.label) : null) : h('span', { class: 'fOp' }, p.text))));
    const ex = spec.example;
    const exBox = ex ? h('div', { class: 'ex' }, ex.img ? h('span', { class: 'exImg', 'aria-hidden': 'true' }, ex.img) : null,
      h('div', { class: 'exTxt' }, ex.parts ? h('p', { class: 'exEs' }, ex.parts.map((p) => h('span', { class: p.role ? 'seg role-' + p.role : '' }, p.t))) : h('p', { class: 'exEs' }, ex.es), sndBtn(ex.parts ? ex.parts.map((p) => p.t).join('') : ex.es), ex.fr && showFr() ? h('p', { class: 'exFr' }, ex.fr) : null)) : null;
    api.ready(); return { el: h('div', { class: 'act' }, head(spec, env), parts, exBox, spec.note ? h('p', { class: 'note' }, tx(bi(spec.note, env))) : null) };
  };

  A.contrast = function (spec, api, env) {
    api.ready();
    return { el: h('div', { class: 'act' }, head(spec, env), h('div', { class: 'cols' }, (spec.columns || []).map((c, i) => h('div', { class: 'col c' + (i % 3) },
      h('h3', {}, tx(bi(c.title, env))), c.badge ? h('span', { class: 'pill' }, c.badge) : null,
      h('ul', {}, (c.items || []).map((it) => h('li', {}, h('span', { class: 'es' }, it.es), sndBtn(it.es), it.fr && showFr() ? h('small', {}, ' · ' + it.fr) : null, it.note ? h('small', { class: 'note' }, ' ' + it.note) : null)))))), spec.note ? h('p', { class: 'note' }, tx(bi(spec.note, env))) : null) };
  };

  A.rule = function (spec, api, env) {
    api.ready();
    return { el: h('div', { class: 'act' }, h('div', { class: 'ruleCard' }, h('h2', { class: 'act-title' }, tx(bi(spec.title, env))), spec.text ? h('p', {}, tx(bi(spec.text, env))) : null,
      (spec.examples || []).map((e) => h('p', { class: 'exEs' }, e.es, sndBtn(e.es), e.fr && showFr() ? h('small', { class: 'exFr' }, ' · ' + e.fr) : null))),
      (spec.exceptions || []).length ? h('div', { class: 'exceptions' }, h('h3', {}, '⚠ Excepciones · Exceptions'), h('ul', {}, spec.exceptions.map((x) => h('li', {}, h('span', { class: 'es' }, x.es || ''), x.es ? sndBtn(x.es) : null, x.text ? tx(bi(x.text, env)) : null, x.fr && showFr() ? h('small', {}, ' · ' + x.fr) : null)))) : null) };
  };

  A.recap = function (spec, api, env) {
    api.ready();
    return { el: h('div', { class: 'act' }, h('h2', { class: 'act-title' }, tx(bi(spec.title || { es: 'Lo que sabes ahora', fr: 'Ce que tu sais maintenant' }, env))),
      h('ul', { class: 'recap' }, (spec.points || []).map((p) => h('li', {}, tx(bi(p, env)))))) };
  };

  /* ───────────────── choix, texte, construction ───────────────── */
  A.choice = function (spec, api, env) {
    const opts = spec.keepOrder ? spec.options.slice() : shuffle(spec.options);
    const correct = (spec.options.filter((o) => o.ok)[0]) || {};
    const btns = [];
    const labelOf = (o) => (o.text !== undefined ? tx(bi(o.text, env)) : tx(bi({ es: o.es, fr: o.fr }, env)));
    const list = h('div', { class: 'choices' }, opts.map((o) => {
      const b = h('button', { class: 'choice', type: 'button', onclick: () => {
        if (o.ok) { b.classList.add('ok'); btns.forEach((x) => { x.disabled = true; }); api.submit({ state: 'ok', matched: o }); }
        else { b.classList.add('again'); b.disabled = true; api.submit({ state: 'wrong', matched: o, errorKind: o.errorKind || spec.errorKind || 'other', answerText: textOf(correct) }); }
      } }, o.emoji ? h('span', { class: 'chEmoji', 'aria-hidden': 'true' }, o.emoji) : null, labelOf(o));
      btns.push(b); return b;
    }));
    const textOf = (o) => (typeof o.text === 'string' ? o.text : (o.text && o.text.es) || o.es || '');
    return { el: h('div', { class: 'act' }, head(spec, env), spec.img ? h('div', { class: 'bigImg', 'aria-hidden': 'true' }, spec.img) : null, spec.context ? h('p', { class: 'context' }, tx(bi(spec.context, env))) : null, list),
      lock() { btns.forEach((x) => { x.disabled = true; }); }, reveal() { const i = opts.indexOf(correct); if (btns[i]) btns[i].classList.add('ok'); } };
  };

  function inlinePrompt(promptEl, input) {
    // remplace ___ par un champ de saisie dans le texte espagnol
    const raw = typeof promptEl === 'string' ? promptEl : promptEl.es || '';
    const parts = raw.split('___');
    const p = h('p', { class: 'prompt' }, parts[0], input, parts.slice(1).join('___'));
    return h('div', {}, p, typeof promptEl === 'object' && promptEl.fr && showFr() ? h('p', { class: 'note' }, promptEl.fr) : null);
  }

  A.fill = A.transform = function (spec, api, env) {
    const input = h('input', { class: 'txt inline', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Ta réponse' });
    input.style.width = Math.max(8, Math.max.apply(null, spec.answers.map((a) => a.length)) + 3) + 'ch';
    const prompt = bi(spec.prompt, env);
    const hasBlank = /___/.test(typeof prompt === 'string' ? prompt : prompt.es || '');
    const check = () => {
      const val = input.value;
      if (!val.trim()) { api.submit({ state: 'wrong', errorKind: 'missing', answerText: spec.answers[0] }); return; }
      const res = E.compare(val, spec.answers, { sig: !!spec.sig });
      if (res.kind === 'exact') { api.submit({ state: 'ok', matched: { text: res.expected } }); return; }
      if (res.points > 0) { api.submit({ state: 'almost', detail: res.kind === 'accent' ? 'Ojo con los acentos · Attention aux accents : <b>' + esc(res.expected) + '</b>' : 'Pequeña errata · Petite faute : <b>' + esc(res.expected) + '</b>', answerText: res.expected }); return; }
      const close = res.letterDistance != null && res.letterDistance <= 3 && res.expected.length >= 4;
      api.submit({ state: 'wrong', errorKind: close ? 'spelling' : (spec.errorKind || 'other'), answerText: spec.answers[0], matched: { hint: spec.wrong && spec.wrong[norm(val)] } });
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    const btn = h('button', { class: 'btn primary', type: 'button', onclick: check }, 'Comprobar · Vérifier');
    return { el: h('div', { class: 'act' }, spec.title ? h('h2', { class: 'act-title' }, tx(bi(spec.title, env))) : null, spec.given ? h('p', { class: 'given' }, spec.given) : null,
      hasBlank ? inlinePrompt(prompt, input) : h('div', {}, h('p', { class: 'prompt' }, tx(prompt)), input), h('div', { class: 'actions' }, btn)),
      focus() { input.focus(); }, lock() { input.readOnly = true; btn.disabled = true; }, retry() { input.focus(); input.select(); }, reveal() { input.value = spec.answers[0]; } };
  };

  /* mots d'une phrase ou éléments d'une liste, à placer dans l'ordre (toucher pour ajouter / retirer) */
  function tileSequence(spec, env, api, tilesText, check, intro) {
    let uid = 0;
    let pool = shuffle(tilesText.map((t) => ({ t, id: uid++ }))); let line = [];
    const poolEl = h('div', { class: 'tiles', 'aria-label': 'Palabras disponibles · Mots disponibles' });
    const lineEl = h('div', { class: 'tiles line', 'aria-label': 'Tu respuesta · Ta réponse' });
    let locked = false;
    const draw = () => {
      poolEl.innerHTML = ''; lineEl.innerHTML = '';
      pool.forEach((t) => poolEl.append(h('button', { class: 'tilew', type: 'button', onclick: () => { if (locked) return; pool = pool.filter((x) => x !== t); line.push(t); draw(); } }, t.t)));
      line.forEach((t) => lineEl.append(h('button', { class: 'tilew', type: 'button', 'aria-label': 'Quitar · Retirer ' + t.t, onclick: () => { if (locked) return; line = line.filter((x) => x !== t); pool.push(t); draw(); } }, t.t)));
    };
    draw();
    const btn = h('button', { class: 'btn primary', type: 'button', onclick: () => check(line.map((t) => t.t), pool.length) }, 'Comprobar · Vérifier');
    return { el: h('div', { class: 'act' }, head(spec, env), intro, lineEl, poolEl, h('div', { class: 'actions' }, btn)), lock() { locked = true; btn.disabled = true; },
      retry() { pool = pool.concat(line); line = []; draw(); }, reveal(final) { pool = []; line = final.map((t) => ({ t, id: uid++ })); draw(); } };
  }

  A.build = function (spec, api, env) {
    const accept = spec.accept.map((a) => (typeof a === 'string' ? { text: a } : a));
    const first = wordsOf(fill(accept[0].text, env.vars));
    const tiles = (spec.tiles ? spec.tiles.slice() : first.slice()).concat(spec.extra || []);
    const norms = accept.map((a) => norm(fill(a.text, env.vars)));
    const sorted = (s) => norm(s).split(' ').sort().join(' ');
    const ctl = tileSequence(spec, env, api, tiles, (words, left) => {
      const got = norm(words.join(' '));
      const idx = norms.indexOf(got);
      if (idx > -1) { api.submit({ state: 'ok', matched: accept[idx] }); return; }
      const sameWords = norms.some((n) => sorted(n) === sorted(got));
      api.submit({ state: 'wrong', errorKind: !words.length ? 'missing' : sameWords ? 'order' : left ? 'missing' : (spec.errorKind || 'grammar'), answerText: fill(accept[0].text, env.vars) });
    });
    const orig = ctl.reveal; ctl.reveal = () => orig(first);
    return ctl;
  };

  A.order = function (spec, api, env) {
    const items = spec.items.map((x) => (typeof x === 'string' ? x : x.es || x.text));
    const ctl = tileSequence(spec, env, api, items, (seq) => {
      const ok = seq.length === items.length && seq.every((t, i) => t === items[i]);
      if (ok) api.submit({ state: 'ok' });
      else api.submit({ state: 'wrong', errorKind: seq.length < items.length ? 'missing' : 'order', answerText: items.join(' → ') });
    });
    const orig = ctl.reveal; ctl.reveal = () => orig(items);
    return ctl;
  };

  function groupHit(tokens, joined, alts) {
    return alts.some((alt) => {
      const a = norm(alt);
      if (!a) return false;
      if (a.slice(-1) === '*') return tokens.some((t) => t.indexOf(a.slice(0, -1)) === 0);
      if (a.indexOf(' ') > -1) return (' ' + joined + ' ').indexOf(' ' + a + ' ') > -1;
      return tokens.indexOf(a) > -1;
    });
  }
  /* un texte libre est accepté s'il contient, pour chaque groupe, au moins une des variantes (accents tolérés) */
  function matchAccept(text, accept) {
    const joined = norm(text); const tokens = joined.split(' ').filter(Boolean);
    for (let i = 0; i < accept.length; i++) {
      const a = accept[i];
      if (a.all.every((grp) => groupHit(tokens, joined, grp)) && !(a.not || []).some((grp) => groupHit(tokens, joined, grp))) return a;
    }
    return null;
  }
  A.matchAccept = matchAccept;

  A.short = function (spec, api, env) {
    const input = h('textarea', { class: 'txt', rows: 2, 'aria-label': 'Tu respuesta', spellcheck: 'false', autocapitalize: 'off' });
    const check = () => {
      const val = input.value.trim();
      if (!val) { api.submit({ state: 'wrong', errorKind: 'missing', answerText: spec.solution && (spec.solution.es || spec.solution) }); return; }
      const hit = matchAccept(val, spec.accept);
      if (hit) api.submit({ state: 'ok', matched: hit });
      else api.submit({ state: 'wrong', errorKind: spec.errorKind || 'missing', answerText: spec.solution && (spec.solution.es || spec.solution) });
    };
    const btn = h('button', { class: 'btn primary', type: 'button', onclick: check }, 'Comprobar · Vérifier');
    return { el: h('div', { class: 'act' }, head(spec, env), input, h('div', { class: 'actions' }, btn)), focus() { input.focus(); }, lock() { input.readOnly = true; btn.disabled = true; }, retry() { input.focus(); }, reveal() { /* la solution est affichée par le lecteur */ } };
  };

  A.react = function (spec, api, env) {
    const ta = h('textarea', { class: 'txt', rows: 4, 'aria-label': 'Tu texto', spellcheck: 'false' });
    const out = h('div', { hidden: true });
    const btn = h('button', { class: 'btn primary', type: 'button', onclick: () => {
      btn.disabled = true; out.hidden = false;
      out.append(spec.model ? h('div', { class: 'rule' }, h('strong', {}, 'Un modelo posible · Un modèle possible'), h('p', {}, tx(bi(spec.model, env))), typeof spec.model === 'string' ? sndBtn(spec.model) : sndBtn(spec.model.es)) : null,
        (spec.checklist || []).length ? h('div', {}, h('p', {}, h('strong', {}, 'Autoevaluación · Auto-évaluation')), spec.checklist.map((c, i) => h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'chk' + i }), ' ', tx(bi(c, env))))) : null,
        h('p', { class: 'note' }, 'Tu texto no se guarda · Ton texte n’est pas enregistré.'));
      api.submit({ state: 'ok', neutral: true });
    } }, 'Ver un modelo · Voir un modèle');
    return { el: h('div', { class: 'act' }, head(spec, env), ta, h('div', { class: 'actions' }, btn), out), focus() { ta.focus(); } };
  };

  /* ───────────────── associer, classer, repérer ───────────────── */
  A.match = function (spec, api, env) {
    const note = h('p', { class: 'softnote', role: 'status', 'aria-live': 'polite' });
    const n = spec.pairs.length; let solved = 0, errors = 0, selL = null, selR = null;
    const mk = (side) => shuffle(spec.pairs.map((p, i) => ({ p, i }))).map((x) => {
      const it = side === 'L' ? x.p.left : x.p.right; const label = typeof it === 'string' ? { text: it } : it;
      const b = h('button', { class: 'mBtn', type: 'button', 'aria-pressed': 'false', 'aria-label': label.alt || null, onclick: () => pick(side, x.i, b) }, label.img ? h('span', { class: 'mImg', 'aria-hidden': 'true' }, label.img) : null, label.text ? h('span', {}, tx(bi(label.text, env))) : null);
      b._i = x.i; return b;
    });
    const L = mk('L'), R = mk('R');
    function pick(side, i, b) {
      if (b.disabled) return;
      const prev = side === 'L' ? selL : selR;
      if (prev) { prev.b.setAttribute('aria-pressed', 'false'); prev.b.classList.remove('sel'); }
      if (prev && prev.b === b) { if (side === 'L') selL = null; else selR = null; return; }
      b.setAttribute('aria-pressed', 'true'); b.classList.add('sel');
      if (side === 'L') selL = { i, b }; else selR = { i, b };
      if (selL && selR) {
        if (selL.i === selR.i) {
          [selL.b, selR.b].forEach((x) => { x.classList.remove('sel'); x.classList.add('ok'); x.disabled = true; x.setAttribute('aria-pressed', 'false'); });
          solved++; softNote(note, null);
          if (solved === n) api.submit({ state: 'ok', assisted: errors > 0, errors });
        } else {
          errors++; softNote(note, g.ESP.Feedback.choose('err1', { activity: 'match' }));
          [selL.b, selR.b].forEach((x) => { x.classList.remove('sel'); x.classList.add('again'); x.setAttribute('aria-pressed', 'false'); setTimeout(() => x.classList.remove('again'), 700); });
        }
        selL = selR = null;
      }
    }
    return { el: h('div', { class: 'act' }, head(spec, env), h('p', { class: 'note' }, 'Toca un elemento de cada columna · Touche un élément de chaque colonne.'), h('div', { class: 'matchGrid' }, h('div', { class: 'mCol' }, L), h('div', { class: 'mCol' }, R)), note) };
  };

  A.classify = function (spec, api, env) {
    const note = h('p', { class: 'softnote', role: 'status', 'aria-live': 'polite' });
    let sel = null, placed = 0, errors = 0;
    const cats = {};
    const pool = h('div', { class: 'tiles' });
    const items = shuffle(spec.items);
    const catBoxes = spec.categories.map((c) => {
      const inner = h('div', { class: 'catItems' });
      const box = h('button', { class: 'catBox', type: 'button', 'aria-label': 'Categoría ' + (typeof c.label === 'string' ? c.label : c.label.es), onclick: () => drop(c) }, h('strong', {}, tx(bi(c.label, env))), inner);
      cats[c.id] = inner; return box;
    });
    const btns = items.map((it) => {
      const b = h('button', { class: 'tilew', type: 'button', 'aria-pressed': 'false', onclick: () => { if (sel) { sel.b.classList.remove('sel'); sel.b.setAttribute('aria-pressed', 'false'); } if (sel && sel.b === b) { sel = null; return; } sel = { it, b }; b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); } }, tx(bi(it.text, env)));
      pool.append(b); return b;
    });
    function drop(c) {
      if (!sel) { softNote(note, { es: 'Primero toca un elemento.', fr: 'Touche d’abord un élément.' }); return; }
      if (sel.it.cat === c.id) {
        sel.b.classList.remove('sel'); sel.b.setAttribute('aria-pressed', 'false'); sel.b.disabled = true; cats[c.id].append(sel.b); placed++; sel = null; softNote(note, null);
        if (placed === items.length) api.submit({ state: 'ok', assisted: errors > 0, errors });
      } else { errors++; softNote(note, g.ESP.Feedback.choose('err1', { activity: 'classify' })); sel.b.classList.add('again'); const b = sel.b; setTimeout(() => b.classList.remove('again'), 700); }
    }
    void btns;
    return { el: h('div', { class: 'act' }, head(spec, env), h('p', { class: 'note' }, 'Toca un elemento y luego su categoría · Touche un élément, puis sa catégorie.'), pool, h('div', { class: 'catGrid' }, catBoxes), note) };
  };

  A.select = function (spec, api, env) {
    const chosen = new Set();
    const list = h('div', { class: 'passages' }, spec.passages.map((p, i) => h('button', { class: 'passage', type: 'button', 'aria-pressed': 'false', onclick: (e) => { const b = e.currentTarget; if (chosen.has(i)) { chosen.delete(i); b.setAttribute('aria-pressed', 'false'); b.classList.remove('sel'); } else { chosen.add(i); b.setAttribute('aria-pressed', 'true'); b.classList.add('sel'); } } }, p)));
    const btn = h('button', { class: 'btn primary', type: 'button', onclick: () => {
      const want = new Set(spec.correct); const got = Array.from(chosen);
      const hits = got.filter((i) => want.has(i)).length; const extra = got.length - hits;
      if (hits === want.size && extra === 0) { api.submit({ state: 'ok' }); return; }
      api.submit({ state: 'wrong', errorKind: extra ? 'other' : 'missing', detail: 'Has encontrado ' + hits + ' de ' + want.size + ' · Tu en as trouvé ' + hits + ' sur ' + want.size + (extra ? ' (et ' + extra + ' en trop)' : '') + '.', answerText: spec.correct.map((i) => '« ' + spec.passages[i] + ' »').join(' ') });
    } }, 'Comprobar · Vérifier');
    return { el: h('div', { class: 'act' }, head(spec, env), h('p', { class: 'note' }, 'Toca las frases que responden · Touche les phrases qui répondent.'), list, h('div', { class: 'actions' }, btn)),
      lock() { list.querySelectorAll('button').forEach((b) => { b.disabled = true; }); }, reveal() { list.querySelectorAll('button').forEach((b, i) => { b.classList.toggle('ok', spec.correct.indexOf(i) > -1); }); } };
  };

  /* ───────────────── vocabulaire : images, mémorisation, rappel ───────────────── */
  const itemsOf = (spec, env) => (spec.items && spec.items.length ? spec.items : Object.keys(env.items)).map((id) => env.items[id]).filter(Boolean);
  const art = (it) => it.art ? it.art + ' ' : '';

  A.cards = function (spec, api, env) {
    const list = itemsOf(spec, env); let i = 0; let shown = false; const seen = new Set();
    const box = h('div', { class: 'act' });
    const draw = () => {
      box.innerHTML = ''; const it = list[i];
      box.append(head(spec, env));
      box.append(h('button', { class: 'vcard' + (shown ? ' open' : ''), type: 'button', 'aria-label': shown ? 'Tarjeta con la palabra' : 'Toca para ver la palabra', onclick: () => { shown = true; seen.add(i); draw(); if (seen.size === list.length) api.ready(); } },
        h('span', { class: 'vEmoji', 'aria-hidden': 'true' }, it.emoji || ''), shown ? h('span', { class: 'vWord' }, art(it) + it.es) : h('span', { class: 'vCue' }, 'Toca para ver la palabra · Touche pour voir le mot'),
        shown && showFr() ? h('span', { class: 'vFr' }, it.fr) : null, shown && it.example ? h('span', { class: 'vEx' }, it.example.es || it.example) : null));
      box.append(h('div', { class: 'actions' }, shown ? sndBtn(it.es) : null, h('button', { class: 'btn small', type: 'button', onclick: () => { i = (i + list.length - 1) % list.length; shown = seen.has(i); draw(); } }, '←'),
        h('button', { class: 'btn small', type: 'button', onclick: () => { i = (i + 1) % list.length; shown = seen.has(i); draw(); } }, '→'), h('span', { class: 'note' }, (i + 1) + ' / ' + list.length)));
    };
    draw(); return { el: box };
  };

  A.imageMap = function (spec, api, env) {
    const seen = new Set(); const total = [].concat.apply([], spec.shelves).length;
    const info = h('div', { class: 'imgInfo', role: 'status', 'aria-live': 'polite' }, h('span', { class: 'note' }, 'Toca un objeto · Touche un objet'));
    const door = h('div', { class: 'fridge' }, spec.shelves.map((shelf) => h('div', { class: 'shelf' }, shelf.map((id) => {
      const it = env.items[id];
      return h('button', { class: 'fItem', type: 'button', 'aria-label': it.es, onclick: (e) => {
        seen.add(id); e.currentTarget.classList.add('seen');
        info.innerHTML = ''; info.append(h('span', { class: 'vEmoji', 'aria-hidden': 'true' }, it.emoji), h('div', {}, h('strong', {}, art(it) + it.es), sndBtn(it.es), showFr() ? h('div', { class: 'note' }, it.fr) : null));
        if (seen.size === total) api.ready();
      } }, h('span', { 'aria-hidden': 'true' }, it.emoji));
    }))));
    return { el: h('div', { class: 'act' }, head(spec, env), door, info) };
  };

  function distractors(it, all, n) { return shuffle(all.filter((x) => x.id !== it.id)).slice(0, n); }

  A.recognize = function (spec, api, env) {
    const all = Object.keys(env.items).map((k) => env.items[k]);
    const list = shuffle(itemsOf(spec, env)); let i = 0, errors = 0, errNow = 0;
    const box = h('div', { class: 'act' }); const note = h('p', { class: 'softnote', role: 'status', 'aria-live': 'polite' });
    const draw = () => {
      box.innerHTML = ''; const it = list[i]; errNow = 0; softNote(note, null);
      const opts = shuffle([it].concat(distractors(it, all, 2)));
      box.append(head(spec, env), h('p', { class: 'note' }, (i + 1) + ' / ' + list.length), h('div', { class: 'bigImg', 'aria-hidden': 'true' }, it.emoji),
        h('div', { class: 'choices' }, opts.map((o) => { const b = h('button', { class: 'choice', type: 'button', onclick: () => {
          if (o.id === it.id) { b.classList.add('ok'); box.querySelectorAll('.choice').forEach((x) => { x.disabled = true; }); api.item(it.id, errNow === 0 ? 'clean' : 'assisted'); setTimeout(() => { i++; if (i < list.length) draw(); else api.submit({ state: 'ok', assisted: errors > 0, errors }); }, 650); }
          else { errors++; errNow++; b.classList.add('again'); b.disabled = true; softNote(note, g.ESP.Feedback.choose('err1', { activity: 'recognize' })); }
        } }, art(o) + o.es); return b; })), note);
    };
    draw(); return { el: box };
  };

  A.recall = function (spec, api, env) {
    const list = shuffle(itemsOf(spec, env)); let i = 0, errors = 0, tries = 0;
    const box = h('div', { class: 'act' }); const note = h('p', { class: 'softnote', role: 'status', 'aria-live': 'polite' });
    const draw = () => {
      box.innerHTML = ''; const it = list[i]; tries = 0; softNote(note, null);
      const input = h('input', { class: 'txt', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'La palabra' });
      const advance = (q) => { api.item(it.id, q); setTimeout(() => { i++; if (i < list.length) { draw(); } else api.submit({ state: 'ok', assisted: errors > 0, errors }); }, 700); };
      const check = () => {
        const val = input.value; if (!val.trim()) return;
        const bare = it.es.replace(/^(el|la|los|las|un|una)\s+/i, '');
        const full = E.compare(val, [it.es], {}); const noArt = E.compare(val, [bare], {});
        const best = full.points >= noArt.points ? full : noArt;
        if (best.kind === 'exact' && full.kind === 'exact') { softNote(note, { es: '¡Eso es!  ' + it.es, fr: '' }); input.readOnly = true; advance(tries === 0 ? 'clean' : 'assisted'); return; }
        if (best.points > 0) { softNote(note, { es: 'Casi: ' + it.es, fr: (noArt.kind === 'exact' ? 'Pense à l’article.' : 'Vérifie les accents / lettres.') }); input.readOnly = true; advance('assisted'); return; }
        tries++; errors++;
        if (tries === 1) softNote(note, { es: 'Pista: empieza por «' + bare.charAt(0) + '» (' + bare.length + ' letras).', fr: 'Indice : commence par « ' + bare.charAt(0) + ' » (' + bare.length + ' lettres).' });
        else { softNote(note, { es: 'Era: ' + it.es, fr: 'C’était : ' + it.es }); input.readOnly = true; advance('solution'); }
      };
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      box.append(head(spec, env), h('p', { class: 'note' }, (i + 1) + ' / ' + list.length), h('div', { class: 'bigImg', 'aria-hidden': 'true' }, it.emoji), showFr() ? h('p', { class: 'note center' }, it.fr) : null, input,
        h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: check }, 'Comprobar · Vérifier')), note);
      setTimeout(() => input.focus(), 30);
    };
    draw(); return { el: box };
  };

  A.dialogue = function (spec, api, env) {
    const C = g.ESP.Comic;
    const u = { id: (env.mod && env.mod.id) || 'dlg', title: spec.title || '', scene: spec.scene || (env.mod && env.mod.scene) || 'plain', dialogues: spec.dialogues };
    return { el: C.complete(g.ESP.UApi, u, { embedded: true, onComplete: (st) => api.submit({ state: 'ok', assisted: st.helped > 0, errors: st.helped }) }) };
  };

  g.ESP.Act = A;
  g.ESP.ACT_PASSIVE = { observe: 1, schema: 1, formula: 1, contrast: 1, rule: 1, recap: 1, cards: 1, imageMap: 1 };
  void accentOK; void withArt;
})(typeof window !== 'undefined' ? window : globalThis);
