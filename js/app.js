/* Interface : accueil, rubriques, leçons guidées, exercices, flashcards, test blanc, « À explorer ». */
(function () {
  'use strict';
  const { C, E, S } = window.ESP;
  const app = document.getElementById('app');
  const unitsById = {}; C.units.forEach((u) => { unitsById[u.id] = u; });
  const catsById = {}; C.categories.forEach((c) => { catsById[c.id] = c; });

  /* ───────── utilitaires ───────── */
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
  const canSpeak = 'speechSynthesis' in window;
  function speak(t) {
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'es-ES'; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) { /* pas de voix */ }
  }
  const sndBtn = (t) => (canSpeak ? h('button', { class: 'snd', type: 'button', 'aria-label': 'Écouter', title: 'Écouter', onclick: () => speak(t) }, '🔊') : null);
  const key = (unit, local) => unit.id + '|' + local;

  /* ───────── navigation (sans changer l'adresse) ───────── */
  function go(state) { history.pushState(state, ''); render(state); }
  window.addEventListener('popstate', (e) => render(e.state || { v: 'home' }));

  function render(st) {
    st = st || { v: 'home' };
    app.innerHTML = '';
    window.scrollTo(0, 0);
    const views = { home, cat, unit, flash, train, dialogues, test, explore, comic, bdquiz, order };
    (views[st.v] || home)(st);
    updateExploreCount();
  }

  /* ───────── éléments communs ───────── */
  let lastInput = null;
  document.addEventListener('focusin', (e) => { if (e.target.matches('input.txt, input.inline, textarea.txt')) lastInput = e.target; });
  function accentBar() {
    return h('div', { class: 'accents', role: 'group', 'aria-label': 'Caractères espagnols' },
      ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'].map((ch) => h('button', {
        type: 'button', 'aria-label': 'Insérer ' + ch,
        onmousedown: (e) => e.preventDefault(),
        onclick: () => {
          const el = lastInput; if (!el) return;
          el.focus(); el.setRangeText(ch, el.selectionStart, el.selectionEnd, 'end');
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, ch)));
  }
  function meter(unit) {
    const st = S.stage(unit.id, unitTotal(unit));
    const labels = ['Pas encore commencé', 'Découvert', 'En cours', 'Bien installé'];
    return h('span', { class: 'meter', title: labels[st] },
      h('i', { class: st >= 1 ? 'on' : '' }), h('i', { class: st >= 2 ? 'on' : '' }), h('i', { class: st >= 3 ? 'on' : '' }), labels[st]);
  }
  function unitTotal(u) {
    return (u.items || []).length + (u.exercises || []).length + (u.dialogues || []).length + (u.conj ? u.conj.verbs.length * 3 : 0);
  }
  function crumbs(parts) {
    return h('nav', { class: 'crumbs', 'aria-label': 'Fil d’Ariane' }, parts.map((p, i) => [
      i ? '›' : null,
      p.go ? h('button', { class: 'linkbtn', type: 'button', onclick: () => go(p.go) }, p.t) : h('span', {}, p.t)
    ]));
  }
  function ruleBox(id) {
    const r = C.rules[id]; if (!r) return null;
    return h('div', { class: 'rule' }, h('strong', {}, r.title), h('div', { html: r.text }), h('em', {}, r.example));
  }
  function updateExploreCount() {
    const n = S.exploreList().length;
    const b = document.getElementById('explore-btn');
    if (b) b.textContent = 'À explorer à mon rythme' + (n ? ' (' + n + ')' : '');
  }

  /* ───────── accueil ───────── */
  function home() {
    const sit = C.units.filter((u) => u.cat === 'situaciones');
    app.append(
      h('header', { class: 'hero' },
        h('h1', {}, '¿Qué situación quieres practicar?'),
        h('p', {}, 'Choisis une situation de la vie réelle, ou explore la grammaire, la conjugaison et le vocabulaire. Tu t’entraînes quand tu veux, à ton rythme.')),
      h('div', { class: 'grid' }, sit.map((u) => h('button', { class: 'tile', type: 'button', onclick: () => go({ v: 'unit', id: u.id }) },
        h('span', { class: 'ico', 'aria-hidden': 'true' }, u.icon || ''),
        h('h3', {}, u.title), h('span', { class: 'meta' }, u.blurb), h('span', {}, h('span', { class: 'pill' }, u.level), ' ', meter(u))))),
      h('div', { class: 'section-title' }, h('h2', {}, 'Toutes les rubriques')),
      h('div', { class: 'grid' }, C.categories.filter((c) => c.id !== 'situaciones').map((c) => {
        const n = C.units.filter((u) => u.cat === c.id).length;
        return h('button', { class: 'tile' + (n ? '' : ' soon'), type: 'button', onclick: () => n && go({ v: 'cat', id: c.id }) },
          h('h3', {}, c.title), h('span', { class: 'meta' }, c.desc), h('span', { class: 'note' }, n ? n + (n > 1 ? ' leçons' : ' leçon') : 'Bientôt'));
      })));
  }

  /* ───────── rubrique ───────── */
  function cat(st) {
    const c = catsById[st.id];
    app.append(crumbs([{ t: 'Accueil', go: { v: 'home' } }, { t: c.title }]),
      h('header', { class: 'hero' }, h('h1', {}, c.title), h('p', {}, c.desc)),
      h('div', { class: 'list' }, C.units.filter((u) => u.cat === c.id).map((u) => h('button', { class: 'row', type: 'button', onclick: () => go({ v: 'unit', id: u.id }) },
        h('span', { class: 't' }, h('strong', {}, u.title), h('small', {}, u.blurb)), h('span', {}, h('span', { class: 'pill' }, u.level), ' ', meter(u))))));
  }

  /* ───────── leçon ───────── */
  const orderable = (u) => (u.items || []).map((it, i) => ({ it, i })).filter((x) => x.it.es.split(' ').length >= 3);

  function unit(st) {
    const u = unitsById[st.id]; S.open(u.id);
    const c = catsById[u.cat];
    app.append(crumbs([{ t: 'Accueil', go: { v: 'home' } }, { t: c.title, go: u.cat === 'situaciones' ? { v: 'home' } : { v: 'cat', id: c.id } }, { t: u.title }]),
      h('header', { class: 'hero' }, h('h1', {}, (u.icon ? u.icon + ' ' : '') + u.title), h('p', {}, u.blurb), h('p', {}, h('span', { class: 'pill' }, u.level), ' ', meter(u))));

    // Parcours conseillé : l'ordre est une vraie progression (reconnaître, retenir, employer, restituer)
    const steps = [];
    if ((u.dialogues || []).length) steps.push({ t: 'Lire la BD', d: 'Découvre la situation en images. Touche FR pour la traduction.', to: { v: 'comic', id: u.id } });
    if ((u.items || []).length) steps.push({ t: 'Flashcards', d: 'La carte en français, un indice, puis la réponse : tu t’entraînes seul(e).', to: { v: 'flash', id: u.id } });
    if ((u.dialogues || []).length) steps.push({ t: 'BD à compléter', d: 'La même BD : choisis le bon mot dans chaque bulle.', to: { v: 'bdquiz', id: u.id } });
    if (orderable(u).length >= 3) steps.push({ t: 'Remettre dans l’ordre', d: 'Reconstitue les phrases, mot par mot.', to: { v: 'order', id: u.id } });
    if (u.test && (u.items || []).length) steps.push({ t: 'Quiz', d: 'Comme une évaluation : FR → ES et ES → FR, avec note prévisionnelle.', to: { v: 'test', id: u.id } });
    if (steps.length) {
      app.append(h('div', { class: 'section-title' }, h('h2', {}, 'Ton parcours'), h('small', {}, 'Dans l’ordre conseillé, mais tu fais comme tu veux')),
        h('div', { class: 'steps' }, steps.map((x, i) => h('button', { class: 'step', type: 'button', onclick: () => go(x.to) },
          h('span', { class: 'num', 'aria-hidden': 'true' }, i + 1), h('span', { class: 'what' }, h('strong', {}, x.t), h('small', {}, x.d)), h('span', { class: 'go', 'aria-hidden': 'true' }, '→')))));
    }
    const more = h('div', { class: 'actions' });
    if (buildTrain(u, 'all').length) more.append(h('button', { class: 'btn', type: 'button', onclick: () => go({ v: 'train', id: u.id }) }, 'Exercices variés'));
    if ((u.dialogues || []).length) more.append(h('button', { class: 'btn', type: 'button', onclick: () => go({ v: 'dialogues', id: u.id }) }, 'Mini-dialogues à écrire'));
    if (more.children.length) app.append(h('div', { class: 'section-title' }, h('h2', {}, 'Pour aller plus loin')), more);

    if ((u.blocks || []).length) {
      app.append(h('div', { class: 'section-title' }, h('h2', {}, 'La leçon en questions')));
      u.blocks.forEach((b, i) => app.append(h('details', { class: 'lesson', open: i === 0 }, h('summary', {}, b.q), h('div', { class: 'body', html: b.a }))));
    }
    if ((u.items || []).length) {
      app.append(h('div', { class: 'section-title' }, h('h2', {}, u.cat === 'situaciones' ? 'Les phrases utiles' : 'Le lexique')),
        h('div', { class: 'card scroll' }, h('table', { class: 'vocab' }, u.items.map((it) =>
          h('tr', {}, h('td', {}, it.es, sndBtn(it.es)), h('td', {}, it.fr, it.note ? h('div', { class: 'note' }, it.note) : null))))));
    }
  }

  /* ───────── BD : lecture, BD à compléter ───────── */
  function comic(st) {
    const u = unitsById[st.id]; S.open(u.id);
    app.append(crumbs([{ t: 'Accueil', go: { v: 'home' } }, { t: u.title, go: { v: 'unit', id: u.id } }, { t: 'La BD' }]),
      h('header', { class: 'hero' }, h('h1', {}, 'La BD : ' + u.title), h('p', {}, 'Lis la scène, écoute-la, et touche FR pour vérifier le sens.')),
      window.ESP.Comic.read(U, u),
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => go({ v: 'bdquiz', id: u.id }) }, 'Passer à la BD à compléter'),
        h('button', { class: 'btn', type: 'button', onclick: () => go({ v: 'flash', id: u.id }) }, 'Flashcards')));
  }
  function bdquiz(st) {
    const u = unitsById[st.id]; S.open(u.id);
    app.append(crumbs([{ t: 'Accueil', go: { v: 'home' } }, { t: u.title, go: { v: 'unit', id: u.id } }, { t: 'BD à compléter' }]),
      h('header', { class: 'hero' }, h('h1', {}, 'BD à compléter'), h('p', {}, 'Dans chaque bulle, choisis le mot qui convient. Pas de pénalité : tu peux essayer autant de fois que tu veux.')),
      window.ESP.Comic.complete(U, u));
  }

  /* ───────── flashcards : français → indice → réponse ───────── */
  const ARTICLES = /^(el|la|los|las|un|una|le|les|une|l’)$/i;
  function hintOf(ans) {
    const words = ans.split(' '); let shown = false;
    return words.map((w) => {
      if (!shown) {
        if (ARTICLES.test(w) && words.length > 1) return w;
        shown = true; return w.slice(0, w.length > 4 ? 2 : 1) + '…';
      }
      return '…';
    }).join(' ');
  }

  function flash(st) {
    const u = unitsById[st.id]; S.open(u.id);
    let dir = 'fr-es';
    let deck = []; let pos = 0; let stage = 0; let usedHint = false; let known = 0;
    const box = h('div', { class: 'stack' });
    app.append(crumbs([{ t: 'Accueil', go: { v: 'home' } }, { t: u.title, go: { v: 'unit', id: u.id } }, { t: 'Flashcards' }]), box);

    function start() { deck = shuffle(u.items.map((it, i) => ({ it, i }))); pos = 0; known = 0; stage = 0; usedHint = false; draw(); }
    function nextCard(animate) { pos++; stage = 0; usedHint = false; draw(animate); updateExploreCount(); }
    function draw(animate) {
      box.innerHTML = '';
      const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Sens' }, [['fr-es', 'FR → ES'], ['es-fr', 'ES → FR'], ['mix', 'Mélange']].map(([d, t]) =>
        h('button', { type: 'button', 'aria-pressed': String(dir === d), onclick: () => { dir = d; stage = 0; usedHint = false; draw(); } }, t)));
      if (pos >= deck.length) {
        box.append(seg, h('div', { class: 'card stack' }, h('h2', {}, 'Tour terminé'),
          h('p', {}, known + ' carte' + (known > 1 ? 's' : '') + ' sur ' + deck.length + ' déjà bien en tête. Les autres sont rangées dans « À explorer à mon rythme », pour plus tard.'),
          h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: start }, 'Refaire un tour'),
            h('button', { class: 'btn', type: 'button', onclick: () => go({ v: 'unit', id: u.id }) }, 'Retour à la leçon'))));
        return;
      }
      const { it, i } = deck[pos];
      const d = dir === 'mix' ? (i % 2 ? 'es-fr' : 'fr-es') : dir;
      const front = d === 'fr-es' ? it.fr : it.es, back = d === 'fr-es' ? it.es : it.fr;
      const label = d === 'fr-es' ? 'En espagnol ?' : 'En français ?';
      const cue = stage === 0 ? 'Réfléchis, puis touche la carte pour un indice' : stage === 1 ? 'Touche encore pour voir la réponse' : (it.note || '');
      const card = h('button', { class: 'fcard s' + stage + (animate ? ' pop' : ''), type: 'button', 'aria-label': stage === 2 ? 'Réponse affichée' : 'Carte : touche pour continuer',
        onclick: () => { if (stage < 2) { stage++; if (stage === 1) usedHint = true; draw(true); } } },
        h('span', { class: 'tag' }, label), h('span', { class: 'q' }, front),
        stage === 1 ? h('span', { class: 'hint', 'aria-live': 'polite' }, hintOf(back)) : null,
        stage === 2 ? h('span', { class: 'ans', 'aria-live': 'polite' }, back) : null,
        h('span', { class: 'cue' }, cue));
      box.append(seg, h('div', { class: 'progress' }, h('div', { style: 'width:' + Math.round(pos / deck.length * 100) + '%' })), card);
      if (stage === 2) {
        const actions = h('div', { class: 'actions' }, canSpeak ? h('button', { class: 'btn small', type: 'button', onclick: () => speak(it.es) }, '🔊 Écouter') : null);
        actions.append(h('button', { class: 'btn primary', type: 'button', onclick: () => { S.master(u.id, key(u, 'i' + i)); known++; nextCard(true); } }, usedHint ? 'Trouvé avec l’indice' : 'Je le savais'));
        if (usedHint) actions.append(h('button', { class: 'btn', type: 'button', onclick: () => { S.master(u.id, key(u, 'i' + i)); known++; nextCard(true); } }, 'Je le savais déjà'));
        actions.append(h('button', { class: 'btn', type: 'button', onclick: () => { S.miss(key(u, 'i' + i), { unitId: u.id, unit: u.title, q: it.fr, a: it.es }); nextCard(true); } }, 'À revoir plus tard'));
        box.append(actions);
      }
      box.append(h('p', { class: 'note' }, 'Carte ' + (pos + 1) + ' sur ' + deck.length));
    }
    start();
  }

  /* ───────── fabrication des exercices ───────── */
  const ENDINGS = { ar: ['o', 'as', 'a', 'amos', 'áis', 'an'], er: ['o', 'es', 'e', 'emos', 'éis', 'en'], ir: ['o', 'es', 'e', 'imos', 'ís', 'en'] };
  const regularForm = (inf, idx) => inf.slice(0, -2) + ENDINGS[inf.slice(-2)][idx];

  function buildTrain(u, mode) {
    const list = [];
    if (mode !== 'dialogues') {
      (u.exercises || []).forEach((ex, i) => list.push(Object.assign({}, ex, { key: key(u, 'x' + i) })));
      if ((u.items || []).length && !(u.exercises || []).some((e) => e.type === 'translate')) {
        shuffle(u.items.map((it, i) => ({ it, i }))).slice(0, 4).forEach(({ it, i }) => list.push({
          type: 'translate', prompt: it.fr, answers: [it.es].concat(it.alt || []), sig: !!it.sig, key: key(u, 'i' + i), speak: it.es, rule: null
        }));
      }
      if (u.conj) {
        const combos = [];
        u.conj.verbs.forEach((v) => C.pronouns.forEach((p, idx) => combos.push({ v, idx })));
        shuffle(combos).slice(0, 8).forEach(({ v, idx }) => list.push({ type: 'conj', verb: v, idx, tense: u.conj.tense, key: key(u, 'c:' + v + ':' + idx) }));
      }
    }
    (u.dialogues || []).forEach((d, i) => list.push({ type: 'dialogue', dlg: d, key: key(u, 'd' + i) }));
    return mode === 'all' ? shuffleKeepOrderLight(list) : list;
  }
  // on garde l'ordre pédagogique : exercices, puis traduction, conjugaison, dialogues
  function shuffleKeepOrderLight(l) { return l; }

  function train(st) { const u = unitsById[st.id]; S.open(u.id); session(u, buildTrain(u, 'all'), 'S’entraîner', 'train'); }
  function order(st) {
    const u = unitsById[st.id]; S.open(u.id);
    const list = shuffle(orderable(u)).map(({ it, i }) => ({ type: 'order', fr: it.fr, words: it.es.split(' '), key: key(u, 'i' + i) }));
    session(u, list, 'Remettre dans l’ordre', 'order');
  }
  function dialogues(st) { const u = unitsById[st.id]; S.open(u.id); session(u, buildTrain(u, 'dialogues'), 'Mini-dialogues', 'dialogues'); }

  /* ───────── retours bienveillants ───────── */
  const FB = {
    okFirst: ['¡Muy bien !', '¡Eso es !', 'Perfecto.', '¡Exacto !'],
    okHelped: ['Tu l’as eu ! C’est comme ça qu’on retient.', '¡Lo lograste ! Chaque essai compte.', 'Voilà, tu y es arrivé(e).'],
    almost: ['¡Casi !', '¡Casi, casi !', 'Presque !'],
    wrong: ['Pas encore, mais tu y es presque.', 'Pas tout à fait. Regarde l’astuce ci-dessous.', 'On y est presque, courage.'],
    wrongMany: ['¡Ánimo ! Encore un petit effort, tu vas y arriver.', '¡Tú puedes ! Tu peux relire la règle, ou voir la réponse et continuer.']
  };

  function fbHtml(res, attempts, ex) {
    let lead = '', cls = 'ok';
    if (res.state === 'ok') { lead = attempts === 1 ? pick(FB.okFirst) : pick(FB.okHelped); cls = 'ok'; }
    else if (res.state === 'almost') { lead = pick(FB.almost); cls = 'almost'; }
    else { lead = attempts >= 3 ? pick(FB.wrongMany) : pick(FB.wrong); cls = 'again'; }
    if (res.lead) lead = res.lead;
    const box = h('div', { class: 'fb ' + cls }, h('strong', { class: 'lead' }, lead));
    if (res.html) box.append(h('div', { html: res.html }));
    if (res.state !== 'ok') { const rb = ruleBox(res.rule || ex.rule); if (rb) box.append(rb); }
    return box;
  }

  /* ───────── session d'exercices ───────── */
  function session(u, list, label, view) {
    const wrap = h('div', {});
    app.append(crumbs([{ t: 'Accueil', go: { v: 'home' } }, { t: u.title, go: { v: 'unit', id: u.id } }, { t: label }]), wrap);
    let idx = 0; const stats = { clean: 0, helped: 0, explore: 0 };

    function next() { idx++; step(); }
    function summary() {
      wrap.innerHTML = '';
      wrap.append(h('div', { class: 'card stack' }, h('h2', {}, 'Séance terminée'),
        h('p', {}, 'Merci d’avoir pris ce temps. Chaque essai fait avancer, même les ratés.'),
        h('ul', {}, h('li', {}, stats.clean + ' réussi' + (stats.clean > 1 ? 's' : '') + ' du premier coup'),
          h('li', {}, stats.helped + ' réussi' + (stats.helped > 1 ? 's' : '') + ' avec un petit coup de pouce'),
          stats.explore ? h('li', {}, stats.explore + ' à explorer à ton rythme') : null),
        h('div', { class: 'actions' },
          h('button', { class: 'btn primary', type: 'button', onclick: () => go({ v: st0(), id: u.id }) }, 'Refaire une séance'),
          h('button', { class: 'btn', type: 'button', onclick: () => go({ v: 'unit', id: u.id }) }, 'Retour à la leçon'),
          stats.explore ? h('button', { class: 'btn', type: 'button', onclick: () => go({ v: 'explore' }) }, 'Voir « À explorer »') : null)));
      updateExploreCount();
    }
    const st0 = () => view;
    function step() {
      if (idx >= list.length) { summary(); return; }
      const ex = list[idx]; let attempts = 0;
      wrap.innerHTML = '';
      const fb = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
      const actions = h('div', { class: 'actions' });
      const holder = h('section', { class: 'card' });
      const ctl = RENDER[ex.type](ex, u, submit);
      holder.append(ctl.el);
      wrap.append(h('div', { class: 'progress', 'aria-hidden': 'true' }, h('div', { style: 'width:' + Math.round(idx / list.length * 100) + '%' })),
        h('p', { class: 'note' }, 'Exercice ' + (idx + 1) + ' sur ' + list.length), holder, fb, actions, accentBar());
      if (ctl.focus) ctl.focus();

      function submit(res) {
        attempts++; fb.innerHTML = ''; actions.innerHTML = '';
        fb.append(fbHtml(res, attempts, ex));
        if (res.state === 'ok' || res.state === 'almost') {
          S.master(u.id, ex.key);
          if (res.state === 'ok' && attempts === 1) stats.clean++; else stats.helped++;
          if (ctl.lock) ctl.lock();
          actions.append(h('button', { class: 'btn primary', type: 'button', onclick: next }, idx + 1 >= list.length ? 'Terminer' : 'Suivant'));
        } else {
          S.miss(ex.key, { unitId: u.id, unit: u.title, q: res.q || ex.prompt || ex.fr || '', a: res.answerText || '', rule: res.rule || ex.rule || null });
          actions.append(h('button', { class: 'btn primary', type: 'button', onclick: () => { fb.innerHTML = ''; actions.innerHTML = ''; if (ctl.retry) ctl.retry(); } }, 'Réessayer'),
            h('button', { class: 'btn', type: 'button', onclick: () => {
              stats.explore++; if (ctl.lock) ctl.lock(); if (ctl.reveal) ctl.reveal();
              fb.append(h('div', { class: 'fb almost', style: 'margin-top:10px' }, h('strong', { class: 'lead' }, 'Voici la réponse'), res.answerText || ''));
              actions.innerHTML = ''; actions.append(h('button', { class: 'btn primary', type: 'button', onclick: next }, idx + 1 >= list.length ? 'Terminer' : 'Suivant'));
            } }, 'Voir la réponse'));
        }
        updateExploreCount();
      }
    }
    step();
  }

  /* ───────── rendus par type d'exercice ───────── */
  function evalText(val, ex, answers, sig) {
    const res = E.compare(val, answers, { sig });
    const exp = res.expected;
    const out = { state: E.state(res), answerText: answers[0], q: ex.prompt || '' };
    if (!val.trim()) { out.state = 'wrong'; out.html = 'Écris ta réponse, même si tu hésites : essayer fait partie de l’apprentissage.'; return out; }
    if (res.kind === 'accent') out.html = 'Il ne manque qu’un détail d’accent ou de tilde : <b>' + esc(exp) + '</b>.';
    else if (res.kind === 'close') out.html = 'Petite faute d’orthographe : <b>' + esc(exp) + '</b>.';
    else if (res.kind === 'wrong') {
      const same = E.strip(E.norm(val)) === E.strip(E.norm(exp));
      if (sig && same) { out.html = 'Ici, l’accent change le mot : il faut écrire <b>' + esc(exp) + '</b>.'; out.rule = 'accent_sig'; }
      else {
        const custom = ex.wrong && ex.wrong[E.norm(val)];
        out.html = custom ? esc(custom) : 'La réponse attendue est <b>' + esc(answers[0]) + '</b>.';
        if (custom) out.html += '<br>La réponse attendue : <b>' + esc(answers[0]) + '</b>.';
      }
    }
    return out;
  }

  const RENDER = {};

  RENDER.qcm = function (ex, u, submit) {
    const opts = shuffle(ex.options.map((o, i) => ({ o, ok: i === ex.answer })));
    const btns = opts.map((x) => h('button', { class: 'choice', type: 'button', onclick: () => {
      if (x.ok) { b(x).classList.add('ok'); all().forEach((q) => { q.disabled = true; }); submit({ state: 'ok', answerText: ex.options[ex.answer].t, rule: ex.rule }); }
      else { b(x).classList.add('again'); b(x).disabled = true; submit({ state: 'wrong', html: esc(x.o.why || 'Ce n’est pas la bonne réponse.'), answerText: ex.options[ex.answer].t, rule: ex.rule }); }
    } }, x.o.t));
    const b = (x) => btns[opts.indexOf(x)];
    const all = () => btns;
    return {
      el: h('div', {}, h('p', { class: 'prompt' }, ex.prompt), h('div', { class: 'choices' }, btns)),
      lock() { btns.forEach((q) => { q.disabled = true; }); },
      reveal() { btns[opts.findIndex((x) => x.ok)].classList.add('ok'); }
    };
  };

  function textExercise(ex, u, submit, promptEl, answers, sig, extra) {
    const input = h('input', { class: 'txt', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Ta réponse' });
    let inline = null;
    if (ex.prompt && ex.prompt.indexOf('___') > -1 && ex.type === 'fill') {
      const [a, b2] = ex.prompt.split('___');
      input.className = 'txt inline'; input.style.width = '14ch';
      inline = h('p', { class: 'prompt' }, a, input, b2);
    }
    const go1 = () => {
      const res = extra ? extra(input.value) : evalText(input.value, ex, answers, sig);
      submit(res);
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go1(); } });
    const btn = h('button', { class: 'btn primary', type: 'button', onclick: go1 }, 'Vérifier');
    return {
      el: h('div', {}, inline || [promptEl, input], h('div', { class: 'actions' }, btn, ex.speak ? sndBtn(ex.speak) : null)),
      focus() { input.focus(); }, lock() { input.readOnly = true; btn.disabled = true; },
      retry() { input.focus(); input.select(); }, reveal() { input.value = answers[0]; }
    };
  }

  RENDER.fill = function (ex, u, submit) {
    const hasBlank = ex.prompt.indexOf('___') > -1;
    return textExercise(ex, u, submit, hasBlank ? null : h('p', { class: 'prompt' }, ex.prompt), ex.answers, !!ex.sig);
  };
  RENDER.translate = function (ex, u, submit) {
    return textExercise(ex, u, submit, h('p', { class: 'prompt' }, 'Traduis en espagnol : « ' + ex.prompt + ' »'), ex.answers, !!ex.sig);
  };
  RENDER.conj = function (ex, u, submit) {
    const v = C.verbs[ex.verb]; const form = v.forms[ex.idx];
    const sig = (v.sig || []).indexOf(form) > -1;
    const prompt = h('p', { class: 'prompt', html: 'Conjugue <b>' + esc(ex.verb) + '</b> (' + esc(v.fr) + ') — ' + esc(ex.tense) + ' — <b>' + esc(C.pronouns[ex.idx]) + '</b>' });
    return textExercise(ex, u, submit, prompt, [form], sig, (val) => {
      const out = evalText(val, { prompt: ex.verb + ' / ' + C.pronouns[ex.idx] }, [form], sig);
      out.rule = v.rule;
      if (out.state === 'wrong' && val.trim()) {
        const n = E.norm(val);
        const reg = !v.noRegular ? E.norm(regularForm(ex.verb, ex.idx)) : null;
        const other = v.forms.findIndex((f, j) => j !== ex.idx && E.norm(f) === n);
        if (reg && n === reg && reg !== E.norm(form)) out.html = 'Cette forme suivrait le modèle régulier, mais <b>' + esc(ex.verb) + '</b> est irrégulier ici : <b>' + esc(form) + '</b>.';
        else if (other > -1) out.html = '« ' + esc(val.trim()) + ' » est la forme de <b>' + esc(C.pronouns[other]) + '</b>. Pour <b>' + esc(C.pronouns[ex.idx]) + '</b>, on écrit <b>' + esc(form) + '</b>.';
      }
      return out;
    });
  };

  RENDER.order = function (ex, u, submit) {
    let pool = shuffle(ex.words.map((w, i) => ({ w, i }))); let line = [];
    const poolEl = h('div', { class: 'tiles', 'aria-label': 'Mots disponibles' });
    const lineEl = h('div', { class: 'tiles line', 'aria-label': 'Ta phrase' });
    let locked = false;
    function draw() {
      poolEl.innerHTML = ''; lineEl.innerHTML = '';
      pool.forEach((t) => poolEl.append(h('button', { class: 'tilew', type: 'button', onclick: () => { if (locked) return; pool = pool.filter((x) => x !== t); line.push(t); draw(); } }, t.w)));
      line.forEach((t) => lineEl.append(h('button', { class: 'tilew', type: 'button', 'aria-label': 'Retirer ' + t.w, onclick: () => { if (locked) return; line = line.filter((x) => x !== t); pool.push(t); draw(); } }, t.w)));
    }
    draw();
    const check = () => {
      const got = line.map((t) => t.w).join(' '); const exp = ex.words.join(' ');
      if (line.length < ex.words.length) { submit({ state: 'wrong', html: 'Il manque encore des mots : place-les tous pour former la phrase.', answerText: exp, q: ex.fr }); return; }
      const res = E.compare(got, exp);
      if (res.kind === 'exact') submit({ state: 'ok', answerText: exp, q: ex.fr });
      else submit({ state: 'wrong', html: 'Le bon ordre commence par « <b>' + esc(ex.words[0]) + '</b> ». Essaie à nouveau.', answerText: exp, q: ex.fr });
    };
    return {
      el: h('div', {}, h('p', { class: 'prompt' }, 'Remets les mots dans l’ordre : « ' + ex.fr + ' »'), lineEl, poolEl,
        h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: check }, 'Vérifier'))),
      lock() { locked = true; },
      retry() { pool = pool.concat(line); line = []; draw(); },
      reveal() { pool = []; line = ex.words.map((w, i) => ({ w, i })); draw(); }
    };
  };

  RENDER.free = function (ex, u, submit) {
    const ta = h('textarea', { class: 'txt', 'aria-label': 'Ton texte', spellcheck: 'false' });
    const area = h('div', {});
    const btn = h('button', { class: 'btn primary', type: 'button', onclick: () => {
      btn.disabled = true;
      area.append(h('div', { class: 'rule' }, h('strong', {}, 'Un modèle possible'), h('p', {}, ex.model), sndBtn(ex.model)),
        h('p', {}, h('strong', {}, 'Auto-évaluation')),
        ex.checklist.map((c, i) => h('label', { style: 'display:block;margin:4px 0' }, h('input', { type: 'checkbox', id: 'chk' + i }), ' ' + c)),
        h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => submit({ state: 'ok', lead: 'Merci d’avoir essayé !', html: 'Ton texte n’est pas enregistré. Compare-le avec le modèle : il y a souvent plusieurs bonnes façons de le dire.' }) }, 'J’ai terminé')));
    } }, 'Voir un modèle et m’auto-évaluer');
    return { el: h('div', {}, h('p', { class: 'prompt' }, ex.prompt), ta, h('div', { class: 'actions' }, btn), area), focus() { ta.focus(); } };
  };

  /* mini-dialogue à trous, avec la liste française à barrer */
  function parseDialogue(d) {
    const blanks = [];
    const lines = d.lines.map((l) => {
      const parts = []; let last = 0; const re = /\{\{([^}]+)\}\}/g; let m;
      while ((m = re.exec(l.t))) {
        parts.push(l.t.slice(last, m.index));
        const [ans, fr] = m[1].split('::');
        const b = { answers: ans.split('|'), fr: fr || ans.split('|')[0] }; blanks.push(b); parts.push(b); last = m.index + m[0].length;
      }
      parts.push(l.t.slice(last)); return { who: l.who, parts };
    });
    return { lines, blanks };
  }
  RENDER.dialogue = function (ex, u, submit) {
    const { lines, blanks } = parseDialogue(ex.dlg);
    blanks.forEach((b) => { b.input = h('input', { class: 'txt inline', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Trou à compléter' }); b.input.style.width = Math.max(8, b.answers[0].length + 3) + 'ch'; });
    const list = h('div', { class: 'frlist', role: 'group', 'aria-label': 'Mots à placer (clique pour barrer)' },
      shuffle(blanks).map((b) => h('button', { type: 'button', 'aria-pressed': 'false', onclick: (e) => { const t = e.currentTarget; t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); } }, b.fr)));
    const body = lines.map((l) => h('p', { class: 'dline' }, h('b', { class: 'who' }, l.who), l.parts.map((p) => (typeof p === 'string' ? p : p.input))));
    const check = () => {
      let allOk = true, anyZero = false; const miss = [];
      blanks.forEach((b) => {
        const r = E.compare(b.input.value, b.answers, { sig: false });
        b.input.classList.remove('ok', 'almost', 'again');
        if (r.kind === 'exact') b.input.classList.add('ok');
        else if (r.points > 0) { b.input.classList.add('almost'); allOk = false; miss.push('<b>' + esc(r.expected) + '</b>'); }
        else { b.input.classList.add('again'); allOk = false; anyZero = true; miss.push('<b>' + esc(b.answers[0]) + '</b>'); }
      });
      const answerText = blanks.map((b) => b.answers[0]).join(' · ');
      if (allOk) submit({ state: 'ok', answerText });
      else if (anyZero) submit({ state: 'wrong', answerText, q: ex.dlg.title, html: 'Certains trous sont à revoir. Relis le contexte : le sens de la phrase aide à choisir.' });
      else submit({ state: 'almost', answerText, html: 'Tous les mots y sont, il reste des détails d’orthographe ou d’accents : ' + miss.join(', ') + '.' });
    };
    return {
      el: h('div', {}, h('h3', { style: 'margin-bottom:10px' }, ex.dlg.title), list, body,
        h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: check }, 'Vérifier'))),
      focus() { blanks[0].input.focus(); },
      lock() { blanks.forEach((b) => { b.input.readOnly = true; }); },
      reveal() { blanks.forEach((b) => { b.input.value = b.answers[0]; }); }
    };
  };

  /* ───────── test blanc ───────── */
  const ARTICLE = /^(el|la|los|las|un|una)\s+/;
  function scoreEs(val, it) {
    const accepted = [it.es].concat(it.alt || []);
    let best = E.compare(val, accepted, { sig: !!it.sig });
    const bare = accepted.map((a) => E.norm(a).replace(ARTICLE, '')).filter((x, i) => x !== E.norm(accepted[i]));
    if (bare.length && best.points < 0.75) {
      const r = E.compare(val, bare, { sig: !!it.sig });
      if (r.points > 0) { const p = Math.min(r.points, 0.75); if (p > best.points) best = { points: p, kind: 'close', expected: it.es, article: true }; }
    }
    return best;
  }
  function test(st) {
    const u = unitsById[st.id]; S.open(u.id);
    const n = Math.min(10, u.items.length);
    const picks = shuffle(u.items.map((it, i) => ({ it, i }))).slice(0, n).map((x) => Object.assign(x, { dir: Math.random() < 0.5 ? 'es-fr' : 'fr-es' }));
    const box = h('div', {});
    app.append(crumbs([{ t: 'Accueil', go: { v: 'home' } }, { t: u.title, go: { v: 'unit', id: u.id } }, { t: 'Quiz' }]), box);
    const rows = picks.map((p) => Object.assign(p, { input: h('input', { class: 'txt', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Réponse' }) }));
    box.append(h('header', { class: 'hero' }, h('h1', {}, 'Quiz : ' + n + (u.cat === 'situaciones' ? ' phrases' : ' mots')),
      h('p', {}, 'Comme en évaluation : pas d’aide pendant le test, les explications arrivent à la fin. Barème : 1 point par mot, − 0,25 par erreur d’accent ou de tilde (ñ), et une petite déduction pour une faute de lettre ou une inversion. La note obtenue est une estimation.')),
      h('div', { class: 'stack' }, rows.map((r, k) => h('div', { class: 'card' },
        h('div', { class: 'note' }, 'Mot ' + (k + 1) + ' · ' + (r.dir === 'es-fr' ? 'espagnol → français' : 'français → espagnol')),
        h('p', { class: 'prompt', style: 'margin-bottom:8px' }, r.dir === 'es-fr' ? r.it.es : r.it.fr), r.input))),
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: finish }, 'Terminer le test')), accentBar());
    function finish() {
      let total = 0, perfect = 0, almost = 0, redo = 0;
      const out = picks.map((p) => {
        const val = p.input.value; let r;
        if (p.dir === 'fr-es') r = scoreEs(val, p.it);
        else r = E.compare(val, E.frVariants(p.it.fr), { lenient: true });
        const pts = val.trim() ? r.points : 0;
        total += pts;
        const status = pts === 1 ? 'ok' : pts > 0 ? 'almost' : 'again';
        if (status === 'ok') { perfect++; S.master(u.id, key(u, 'i' + p.i)); } else if (status === 'almost') { almost++; S.master(u.id, key(u, 'i' + p.i)); } else { redo++; S.miss(key(u, 'i' + p.i), { unitId: u.id, unit: u.title, q: p.it.fr, a: p.it.es }); }
        const given = val.trim() || '(vide)';
        const expected = p.dir === 'es-fr' ? p.it.fr : p.it.es;
        let note = '';
        if (r.article) note = 'Article manquant.';
        else if (r.kind === 'accent') note = 'Accent ou tilde.';
        else if (r.kind === 'close') note = 'Petite faute de lettre.';
        return h('tr', {}, h('td', {}, p.dir === 'es-fr' ? p.it.es : p.it.fr), h('td', {}, given), h('td', {}, expected, note ? h('div', { class: 'note' }, note) : null),
          h('td', {}, h('span', { class: 'chip ' + status }, fmt(pts) + ' / 1')));
      });
      box.innerHTML = '';
      box.append(h('header', { class: 'hero' }, h('h1', {}, 'Voici ton quiz'),
        h('p', { class: 'big' }, perfect + (perfect > 1 ? ' parfaits' : ' parfait') + ' · ' + almost + ' presque · ' + redo + ' à revoir'),
        h('p', {}, 'Note prévisionnelle (estimation) : ', h('strong', {}, fmt(total / n * 10) + ' / 10'), '. Ce n’est qu’un repère pour savoir où tu en es.')),
        h('div', { class: 'card scroll' }, h('table', { class: 'res' }, h('tr', {}, ['Mot', 'Ta réponse', 'Attendu', 'Points'].map((t) => h('th', {}, t))), out)),
        h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => go({ v: 'test', id: u.id }) }, 'Un autre quiz'),
          h('button', { class: 'btn', type: 'button', onclick: () => go({ v: 'flash', id: u.id }) }, 'Revoir en flashcards'),
          h('button', { class: 'btn', type: 'button', onclick: () => go({ v: 'unit', id: u.id }) }, 'Retour à la leçon')));
      window.scrollTo(0, 0); updateExploreCount();
    }
  }

  /* ───────── À explorer à mon rythme ───────── */
  function explore() {
    const items = S.exploreList();
    app.append(crumbs([{ t: 'Accueil', go: { v: 'home' } }, { t: 'À explorer à mon rythme' }]),
      h('header', { class: 'hero' }, h('h1', {}, 'À explorer à mon rythme'),
        h('p', {}, 'Ici, des points que tu peux regarder quand tu en as envie. Chaque élément disparaît dès que tu l’as réussi. Aucune obligation.')));
    if (!items.length) { app.append(h('div', { class: 'card' }, h('p', {}, 'Rien pour l’instant. Quand quelque chose te résiste, ça apparaîtra ici, sans pression.'))); return; }
    app.append(h('div', { class: 'stack' }, items.map((it) => {
      const ans = h('div', { hidden: true }, h('p', {}, h('strong', {}, it.a || '—'), it.a ? sndBtn(it.a) : null), ruleBox(it.rule));
      return h('div', { class: 'card' }, h('div', { class: 'note' }, it.unit), h('p', { class: 'prompt', style: 'margin-bottom:8px' }, it.q), ans,
        h('div', { class: 'actions' }, h('button', { class: 'btn small', type: 'button', onclick: () => { ans.hidden = !ans.hidden; } }, 'Voir la réponse'),
          h('button', { class: 'btn small', type: 'button', onclick: () => { S.release(it.key); go({ v: 'explore' }); } }, 'C’est retenu')));
    })));
  }

  const U = { h, esc, shuffle, pick, speak, sndBtn, key, go, S, updateExploreCount };

  /* ───────── démarrage ───────── */
  document.getElementById('brand').addEventListener('click', () => go({ v: 'home' }));
  document.getElementById('explore-btn').addEventListener('click', () => go({ v: 'explore' }));
  history.replaceState({ v: 'home' }, '');
  render({ v: 'home' });
})();
