/* Validateur de modules : vérifie la structure avant publication. Utilisé par l'Atelier, l'import et les tests.
   Retourne { errors: [...], warnings: [...] } ; un module sans erreur peut être joué. */
(function (g) {
  g.ESP = g.ESP || {};
  const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
  const TYPES = ['adventure', 'lesson', 'vocab', 'reading'];
  const REQ = {
    observe: ['examples'], schema: ['rows'], formula: ['parts'], contrast: ['columns'], rule: ['title'], recap: ['points'],
    choice: ['prompt', 'options'], fill: ['prompt', 'answers'], transform: ['prompt', 'answers'], build: ['prompt', 'accept'],
    match: ['pairs'], classify: ['categories', 'items'], order: ['items'], select: ['passages', 'correct'], short: ['prompt', 'accept'],
    react: ['prompt'], imageMap: ['shelves'], cards: [], recognize: [], recall: [], dialogue: ['dialogues']
  };
  const NODE_TYPES = ['say', 'choice', 'build', 'short', 'branch', 'end', 'info'];

  const has = (o, k) => o && o[k] !== undefined && o[k] !== null && !(Array.isArray(o[k]) && !o[k].length) && o[k] !== '';
  const text = (x) => (typeof x === 'string' ? x : x && (x.es || x.fr)) || '';

  function validate(m, ctx) {
    const cfg = (ctx && ctx.config) || (g.ESP.CONFIG || {});
    const skillIds = ((ctx && ctx.skills) || g.ESP.SKILLS || []).map((s) => s.id);
    const E = [], W = [];
    const err = (where, msg) => E.push(where ? where + ' : ' + msg : msg);
    const warn = (where, msg) => W.push(where ? where + ' : ' + msg : msg);
    if (!m || typeof m !== 'object') return { errors: ['Le module n’est pas un objet JSON.'], warnings: [] };

    /* ───── identification ───── */
    if (!has(m, 'id') || !ID_RE.test(m.id)) err('id', 'obligatoire, en minuscules sans espace (lettres, chiffres, tirets), ex. « m-desayuno-madrid ».');
    if (TYPES.indexOf(m.type) < 0) err('type', 'doit valoir ' + TYPES.join(', ') + '.');
    if (!has(m, 'title')) err('title', 'obligatoire.');
    const rubs = (cfg.rubriques || []).map((r) => r.id);
    if (rubs.length && rubs.indexOf(m.rubrique) < 0) err('rubrique', 'doit valoir ' + rubs.join(', ') + '.');
    if ((cfg.levels || []).length && cfg.levels.indexOf(m.level) < 0) err('level', 'doit valoir ' + cfg.levels.join(', ') + '.');
    if ((cfg.statuses || []).length && cfg.statuses.indexOf(m.status) < 0) err('status', 'doit valoir ' + cfg.statuses.join(', ') + '.');
    if (!Number.isInteger(m.version) || m.version < 1) err('version', 'entier supérieur ou égal à 1.');
    if (typeof m.duration !== 'number') warn('duration', 'durée estimée (minutes) manquante.');
    else if (m.duration > 10) warn('duration', 'plus de 10 minutes : prévoir de découper en plusieurs modules (idéal : 3 à 7 minutes).');
    if (!m.objectives || !has(m.objectives, 'main')) warn('objectives.main', 'compétence principale non renseignée.');
    if (!Array.isArray(m.skills) || !m.skills.length) warn('skills', 'aucune compétence associée : la progression ne sera pas mise à jour.');
    else m.skills.forEach((s) => { if (skillIds.length && skillIds.indexOf(s) < 0) warn('skills', 'compétence « ' + s + ' » absente du catalogue (data/skills.js).'); });
    if (!m.completion || !(has(m.completion, 'es') || has(m.completion, 'fr'))) warn('completion', 'message de fin absent : un message générique sera utilisé.');

    /* ───── contenu selon le type ───── */
    if (m.type === 'adventure') adventure(m, err, warn);
    else if (m.type === 'lesson') steps(m.screens, 'screens', m, err, warn);
    else if (m.type === 'vocab') vocab(m, err, warn);
    else if (m.type === 'reading') reading(m, err, warn);
    return { errors: E, warnings: W };
  }

  function step(s, where, m, err, warn) {
    if (!s || typeof s !== 'object') { err(where, 'écran invalide.'); return; }
    if (!has(s, 'kind')) { err(where, 'champ « kind » manquant.'); return; }
    if (!(s.kind in REQ)) { err(where, 'type d’écran inconnu « ' + s.kind + ' » (valeurs : ' + Object.keys(REQ).join(', ') + ').'); return; }
    REQ[s.kind].forEach((k) => { if (!has(s, k)) err(where + ' (' + s.kind + ')', 'champ « ' + k + ' » manquant.'); });
    const k = s.kind;
    if (k === 'choice' && Array.isArray(s.options)) {
      if (s.options.length < 2) err(where, 'au moins 2 options.');
      if (!s.options.some((o) => o.ok === true)) err(where, 'aucune option marquée ok:true.');
      s.options.forEach((o, i) => { if (!has(o, 'text') && !has(o, 'es')) err(where + ' option ' + (i + 1), 'texte manquant.'); });
      if (s.options.some((o) => o.ok === false) && !has(s, 'hint') && !s.options.some((o) => has(o, 'hint'))) warn(where, 'aucun indice : un indice générique sera utilisé.');
    }
    if ((k === 'fill' || k === 'transform') && has(s, 'prompt') && String(text(s.prompt)).indexOf('___') < 0) warn(where, 'la consigne ne contient pas « ___ » (trou).');
    if (k === 'fill' && Array.isArray(s.answers) && s.answers.some((a) => typeof a !== 'string')) err(where, 'answers doit être une liste de textes.');
    if (k === 'build' && Array.isArray(s.accept) && !s.accept.every((a) => typeof a === 'string' || (a && typeof a.text === 'string'))) err(where, 'accept : liste de phrases (texte) ou d’objets {text,…}.');
    if (k === 'match' && Array.isArray(s.pairs) && s.pairs.length < 2) err(where, 'au moins 2 paires.');
    if (k === 'classify') {
      const ids = (s.categories || []).map((c) => c.id);
      (s.items || []).forEach((it, i) => { if (ids.indexOf(it.cat) < 0) err(where + ' élément ' + (i + 1), 'catégorie « ' + it.cat + ' » inconnue.'); });
    }
    if (k === 'order' && Array.isArray(s.items) && s.items.length < 2) err(where, 'au moins 2 éléments.');
    if (k === 'select' && Array.isArray(s.passages)) (s.correct || []).forEach((i) => { if (!(i >= 0 && i < s.passages.length)) err(where, 'indice correct hors limites : ' + i + '.'); });
    if (k === 'short' && Array.isArray(s.accept)) s.accept.forEach((a, i) => { if (!a || !Array.isArray(a.all) || !a.all.length) err(where + ' accept ' + (i + 1), 'attendu : { "all": [["mot","variante"], …] }.'); });
    if (k === 'imageMap') {
      const ids = (m.items || []).map((i) => i.id);
      [].concat.apply([], s.shelves || []).forEach((id) => { if (ids.indexOf(id) < 0) err(where, 'objet « ' + id + ' » absent de items.'); });
    }
  }
  function steps(list, label, m, err, warn) {
    if (!Array.isArray(list) || !list.length) { err(label, 'liste d’écrans vide ou absente.'); return; }
    const ids = {};
    list.forEach((s, i) => {
      const where = label + '[' + (i + 1) + ']';
      if (s && s.id) { if (ids[s.id]) err(where, 'identifiant « ' + s.id + ' » en double.'); ids[s.id] = 1; }
      step(s, where, m, err, warn);
    });
    if (list.length > 14) warn(label, list.length + ' écrans : prévoir de découper (une idée principale par écran, 3 à 7 minutes).');
  }
  function vocab(m, err, warn) {
    if (!Array.isArray(m.items) || m.items.length < 3) { err('items', 'au moins 3 mots.'); return; }
    const ids = {};
    m.items.forEach((it, i) => {
      const w = 'items[' + (i + 1) + ']';
      if (!has(it, 'id')) err(w, 'id manquant.'); else if (ids[it.id]) err(w, 'id en double « ' + it.id + ' ».'); else ids[it.id] = 1;
      if (!has(it, 'es')) err(w, 'mot espagnol (es) manquant.');
      if (!has(it, 'fr')) err(w, 'traduction (fr) manquante.');
      if (!has(it, 'emoji') && !has(it, 'image')) warn(w, 'ni emoji ni image : la carte sera sans illustration.');
    });
    if (has(m, 'screens')) steps(m.screens, 'screens', m, err, warn);
  }
  function reading(m, err, warn) {
    if (!m.doc || !Array.isArray(m.doc.blocks) || !m.doc.blocks.length) err('doc.blocks', 'le document (blocs de texte) est obligatoire.');
    if (!Array.isArray(m.phases) || !m.phases.length) { err('phases', 'obligatoire : comprender, interpretar, reaccionar.'); return; }
    const names = m.phases.map((p) => p.id);
    ['comprender', 'interpretar', 'reaccionar'].forEach((n) => { if (names.indexOf(n) < 0) warn('phases', 'phase « ' + n + ' » absente.'); });
    m.phases.forEach((p, i) => steps(p.steps, 'phases[' + (i + 1) + '].steps', m, err, warn));
    const kinds = {}; m.phases.forEach((p) => (p.steps || []).forEach((s) => { kinds[s.kind] = 1; }));
    if (Object.keys(kinds).length === 1 && kinds.choice) warn('phases', 'uniquement des QCM : varier les interactions (classement, repérage, réponse courte, remise en ordre).');
  }

  function adventure(m, err, warn) {
    const nodes = m.nodes;
    if (!Array.isArray(nodes) || !nodes.length) { err('nodes', 'liste d’étapes absente.'); return; }
    const byId = {};
    nodes.forEach((n, i) => {
      if (!n || !has(n, 'id')) { err('nodes[' + (i + 1) + ']', 'id manquant.'); return; }
      if (byId[n.id]) err('nodes', 'identifiant « ' + n.id + ' » en double.');
      byId[n.id] = n;
    });
    if (!has(m, 'start') || !byId[m.start]) err('start', 'étape de départ introuvable.');
    const targets = (n) => {
      const t = [];
      if (n.next) t.push(n.next);
      (n.options || []).forEach((o) => { if (o.next) t.push(o.next); });
      (n.accept || []).forEach((o) => { if (o && o.next) t.push(o.next); });
      (n.cases || []).forEach((c) => { if (c.next) t.push(c.next); });
      if (n.else) t.push(n.else);
      if (n.skipTo) t.push(n.skipTo);
      return t;
    };
    nodes.forEach((n) => {
      if (!n || !n.id) return;
      const w = 'étape « ' + n.id + ' »';
      if (NODE_TYPES.indexOf(n.type) < 0) { err(w, 'type inconnu « ' + n.type + ' » (valeurs : ' + NODE_TYPES.join(', ') + ').'); return; }
      if ((n.type === 'say' || n.type === 'info') && !has(n, 'es') && !has(n, 'fr')) err(w, 'texte (es) manquant.');
      if ((n.type === 'say' || n.type === 'info') && !n.next) err(w, 'next manquant.');
      if (n.type === 'choice') {
        if (!Array.isArray(n.options) || n.options.length < 2) err(w, 'au moins 2 options.');
        else {
          if (!n.options.some((o) => o.ok)) err(w, 'aucune option valide (ok:true).');
          n.options.forEach((o, i) => {
            if (!has(o, 'es') && !has(o, 'text')) err(w + ' option ' + (i + 1), 'texte manquant.');
            if (o.ok && !o.next) err(w + ' option ' + (i + 1), 'une option valide doit avoir un « next ».');
            if (!o.ok && !has(o, 'hint') && !has(n, 'hint')) warn(w + ' option ' + (i + 1), 'option inadaptée sans indice : un indice générique sera utilisé.');
          });
        }
      }
      if (n.type === 'build') {
        if (!Array.isArray(n.accept) || !n.accept.length) err(w, 'accept (phrases acceptées) manquant.');
        else n.accept.forEach((a, i) => { if (typeof a !== 'object' || !has(a, 'text') || !a.next) err(w + ' accept ' + (i + 1), 'attendu : { "text": "…", "next": "…" }.'); });
        if (!has(n, 'tiles')) warn(w, 'aucune liste de mots (tiles) : elle sera déduite de la première phrase acceptée.');
      }
      if (n.type === 'short') {
        if (!Array.isArray(n.accept) || !n.accept.length) err(w, 'accept manquant.');
        else n.accept.forEach((a, i) => { if (!a || !Array.isArray(a.all) || !a.all.length || !a.next) err(w + ' accept ' + (i + 1), 'attendu : { "all": [["mot","variante"],…], "next": "…" }.'); });
      }
      if (n.type === 'branch') { if (!Array.isArray(n.cases) || !n.cases.length || !n.else) err(w, 'branch : « cases » et « else » obligatoires.'); }
      if (n.type === 'end' && !has(n, 'es') && !has(n, 'fr')) warn(w, 'message de fin absent.');
      if ((n.type === 'choice' || n.type === 'build' || n.type === 'short') && !has(n, 'solution') && !n.options) warn(w, 'pas de « solution » : la solution expliquée ne pourra pas être proposée.');
      targets(n).forEach((t) => { if (!byId[t]) err(w, 'renvoie vers l’étape inconnue « ' + t + ' ».'); });
    });
    // accessibilité des étapes
    const seen = {}; const stack = [m.start];
    while (stack.length) { const id = stack.pop(); if (!id || seen[id] || !byId[id]) continue; seen[id] = 1; targets(byId[id]).forEach((t) => stack.push(t)); }
    const reachableEnd = nodes.some((n) => n.type === 'end' && seen[n.id]);
    if (!reachableEnd) err('nodes', 'aucune étape « end » atteignable depuis le départ.');
    nodes.forEach((n) => { if (n.id && !seen[n.id]) warn('étape « ' + n.id + ' »', 'inaccessible depuis le départ.'); });
  }

  g.ESP.Validator = { validate, KINDS: Object.keys(REQ), NODE_TYPES, TYPES };
  if (typeof module !== 'undefined') module.exports = g.ESP.Validator;
})(typeof window !== 'undefined' ? window : globalThis);
