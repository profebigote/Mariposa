/* Atelier enseignant : consulter, relire, corriger et importer les modules.
   IMPORTANT : l'Atelier travaille sur CET appareil (localStorage « esp.atelier.v1 »). Il ne publie rien en ligne.
   Pour publier : exporter le JSON, le déposer dans modules/ sur GitHub et l'ajouter à modules/manifest.json.
   (Une vraie publication / dépublication depuis le navigateur demandera les comptes Supabase : docs/SUPABASE.md.) */
(function (g) {
  g.ESP = g.ESP || {};
  const KEY = 'esp.atelier.v1';
  const { h } = g.ESP.Util || {};

  /* ───── stockage local de l'Atelier ───── */
  function load() { try { const d = JSON.parse(localStorage.getItem(KEY) || '{}'); return { mods: d.mods || {}, messages: d.messages || [], butterfly: d.butterfly || null, classes: d.classes || [] }; } catch (e) { return { mods: {}, messages: [], butterfly: null, classes: [] }; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }

  /* Appliqué au démarrage (loader) : modules, messages, papillon et classes saisis dans l'Atelier. */
  function applyData(d) {
    const out = [];
    Object.keys(d.mods).forEach((id) => { const m = JSON.parse(JSON.stringify(d.mods[id])); m._local = true; out.push(m); });
    if (d.messages.length) {
      const lib = g.ESP.MESSAGES = g.ESP.MESSAGES || [];
      d.messages.forEach((m) => { const i = lib.findIndex((x) => x.key === m.key); if (i > -1) lib[i] = m; else lib.push(m); });
    }
    if (d.butterfly && g.ESP.BUTTERFLY) g.ESP.BUTTERFLY.stages = d.butterfly;
    if (d.classes.length && g.ESP.CONFIG) d.classes.forEach((c) => { const i = g.ESP.CONFIG.classes.findIndex((x) => x.code === c.code); if (i > -1) g.ESP.CONFIG.classes[i] = c; else g.ESP.CONFIG.classes.push(c); });
    return out;
  }
  function loadLocal() { return applyData(load()); }

  /* ───── fichiers ───── */
  function download(name, text) {
    try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); return true; } catch (e) { return false; }
  }
  function copy(text, ta) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(() => true, () => false);
    try { ta.select(); return Promise.resolve(document.execCommand('copy')); } catch (e) { return Promise.resolve(false); }
  }

  function view(app, go, ctx) {
    const { h: H } = g.ESP.Util; const M = g.ESP.Modules, CFG = g.ESP.CONFIG, I = g.ESP.Importer, V = g.ESP.Validator;
    let data = load(); let selected = null; let pending = null;
    const msg = H('p', { class: 'softnote', role: 'status', 'aria-live': 'polite' });
    const say = (t) => { msg.textContent = t; };
    const rerender = () => { app.innerHTML = ''; build(); };
    const pretty = (m) => { const c = JSON.parse(JSON.stringify(m)); delete c._issues; delete c._ok; delete c._local; return JSON.stringify(c, null, 2); };
    const strip = (m) => JSON.parse(pretty(m));

    function issuesBox(r) {
      if (!r || (!r.errors.length && !r.warnings.length)) return H('p', { class: 'note' }, '✓ Aucune remarque.');
      return H('div', {}, r.errors.map((e) => H('p', { class: 'issue err' }, '✗ ' + e)), r.warnings.map((e) => H('p', { class: 'issue warn' }, '• ' + e)));
    }

    function put(m) { // enregistre localement un module (copie nettoyée)
      const c = strip(m); data.mods[c.id] = c;
      if (!save(data)) { say('Enregistrement impossible sur cet appareil (stockage bloqué).'); return false; }
      M.register(Object.assign(JSON.parse(JSON.stringify(c)), { _local: true })); return true;
    }

    /* ── liste des modules ── */
    function modulesPanel() {
      const box = H('div', { class: 'card stack' }, H('h2', {}, 'Módulos · Modules'),
        H('p', { class: 'note' }, 'Les modules « brouillon » et « validé » ne sont visibles des élèves que si Réglages > « Mostrar los borradores » est activé (ou si le site est configuré ainsi dans data/config.js).'));
      const list = H('div', { class: 'list' });
      M.list.slice().sort((a, b) => String(a.id).localeCompare(String(b.id))).forEach((m) => {
        const bad = m._issues && m._issues.errors.length;
        list.append(H('div', { class: 'atRow' + (selected === m.id ? ' sel' : '') },
          H('div', { class: 't' }, H('strong', {}, m.title || m.id), H('small', {}, m.id + ' · ' + (m.rubrique || '?') + ' · ' + (m.level || '?') + ' · ' + (m.type || '?') + ' · v' + (m.version || '?') + (m._local ? ' · modifié ici' : ''))),
          H('span', { class: 'pill ' + (bad ? 'bad' : (m.status === 'publié' ? 'done' : 'draft')) }, bad ? bad + ' erreur(s)' : m.status),
          H('div', { class: 'actions' },
            bad ? null : H('button', { class: 'btn small', type: 'button', onclick: () => go({ v: 'mod', id: m.id }) }, 'Aperçu'),
            H('button', { class: 'btn small', type: 'button', onclick: () => { selected = m.id; rerender(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } }, 'Éditer'))));
      });
      box.append(list); if (M.loadError) box.append(H('p', { class: 'issue err' }, M.loadError)); return box;
    }

    /* ── éditeur d'un module ── */
    function editor() {
      const m = M.byId[selected]; if (!m) return null;
      const ta = H('textarea', { class: 'txt codeArea', rows: 18, spellcheck: 'false', 'aria-label': 'JSON du module' }); ta.value = pretty(m);
      const res = H('div', {});
      const parse = () => { try { return JSON.parse(ta.value); } catch (e) { res.innerHTML = ''; res.append(H('p', { class: 'issue err' }, '✗ JSON invalide : ' + e.message)); return null; } };
      const validate = () => { const o = parse(); if (!o) return null; const r = V.validate(o); res.innerHTML = ''; res.append(issuesBox(r)); return { o, r }; };
      const sel = (opts, cur) => { const s = H('select', { class: 'txt' }, opts.map((o) => H('option', { value: o.v, selected: o.v === cur ? true : null }, o.t))); return s; };
      const sTitle = H('input', { class: 'txt', type: 'text', value: m.title || '', 'aria-label': 'Titre' });
      const sRub = sel(CFG.rubriques.map((r) => ({ v: r.id, t: r.title })), m.rubrique); const sLvl = sel(CFG.levels.map((l) => ({ v: l, t: l })), m.level); const sSt = sel(CFG.statuses.map((s) => ({ v: s, t: s })), m.status);
      const applyFiche = () => { const o = parse(); if (!o) return; o.title = sTitle.value; o.rubrique = sRub.value; o.level = sLvl.value; o.status = sSt.value; ta.value = JSON.stringify(o, null, 2); validate(); say('Fiche appliquée au texte ci-dessous. Pense à « Enregistrer ici ».'); };
      const field = (label, el) => H('label', { class: 'fld' }, H('span', {}, label), el);
      return H('div', { class: 'card stack', id: 'at-editor' }, H('h2', {}, 'Éditer · ' + (m.title || m.id)),
        H('div', { class: 'fldGrid' }, field('Titre', sTitle), field('Rubrique', sRub), field('Niveau', sLvl), field('Statut', sSt)),
        H('div', { class: 'actions' }, H('button', { class: 'btn small', type: 'button', onclick: applyFiche }, 'Appliquer la fiche')),
        H('p', { class: 'note' }, 'Tous les textes (dialogues, consignes, indices, explications) se modifient dans le JSON ci-dessous. Chaque champ « es » / « fr » est un texte.'),
        ta, res,
        H('div', { class: 'actions' },
          H('button', { class: 'btn', type: 'button', onclick: validate }, 'Valider'),
          H('button', { class: 'btn primary', type: 'button', onclick: () => { const v = validate(); if (!v) return; if (v.r.errors.length) { say('Corrige d’abord les erreurs.'); return; } if (put(v.o)) { say('Enregistré sur cet appareil. Fais « Aperçu » pour essayer.'); rerender(); } } }, 'Enregistrer ici'),
          g.ESP.BUNDLE ? null : H('button', { class: 'btn', type: 'button', onclick: () => { const o = parse(); if (!o) return; const ok = download((o.id || 'module') + '.json', JSON.stringify(o, null, 2) + '\n'); say(ok ? 'Fichier préparé : dépose-le dans le dossier modules/ du dépôt GitHub.' : 'Téléchargement bloqué ici : utilise « Copier ».'); } }, 'Télécharger .json'),
          H('button', { class: 'btn', type: 'button', onclick: () => copy(ta.value, ta).then((ok) => say(ok ? 'JSON copié.' : 'Copie impossible : sélectionne le texte et copie-le à la main.')) }, 'Copier'),
          data.mods[selected] ? H('button', { class: 'btn small', type: 'button', onclick: () => { if (g.ESP.BUNDLE || confirm('Retirer la version modifiée ici ? Le module repartira de la version du site.')) { delete data.mods[selected]; save(data); say('Version locale retirée : recharge la page pour retrouver la version du site.'); selected = null; rerender(); } } }, 'Retirer la version locale') : null,
          H('button', { class: 'btn small', type: 'button', onclick: () => { selected = null; rerender(); } }, 'Fermer')));
    }

    /* ── import ── */
    function importPanel() {
      const out = H('div', {});
      const file = H('input', { type: 'file', id: 'at-file', accept: '.json,.xlsx,.xls,.csv,.tsv', 'aria-label': 'Fichier à importer' });
      const paste = H('textarea', { class: 'txt codeArea', rows: 5, placeholder: 'Ou colle ici un module JSON (un objet, ou { "modules": [ … ], "messages": [ … ] })', spellcheck: 'false', 'aria-label': 'JSON à importer' });
      const show = (res) => {
        /* un onglet de contenu seul (ex. Lexique_demo.csv) met à jour le contenu d'un module déjà présent, sans toucher à sa fiche */
        res.modules = res.modules.map((m) => {
          const ex = !m.title && M.byId[m.id]; if (!ex) return m;
          const base = strip(ex); ['items', 'nodes', 'start', 'screens', 'phases'].forEach((k) => { if (m[k] !== undefined) base[k] = m[k]; });
          base.version = (base.version || 1) + 1; res.report.push({ level: 'info', msg: m.id + ' : contenu fusionné dans le module existant (version ' + base.version + ').' }); return base;
        });
        pending = I.check(res); out.innerHTML = '';
        const msgErr = I.checkMessages(pending.messages);
        pending.report.forEach((r) => out.append(H('p', { class: 'issue ' + (r.level === 'error' ? 'err' : r.level === 'warn' ? 'warn' : '') }, (r.level === 'error' ? '✗ ' : '• ') + r.msg)));
        msgErr.forEach((e) => out.append(H('p', { class: 'issue err' }, '✗ ' + e)));
        pending.modules.forEach((m) => {
          const bad = m._issues.errors.length; const dup = M.byId[m.id];
          out.append(H('div', { class: 'impMod' }, H('strong', {}, (bad ? '✗ ' : '✓ ') + (m.title || m.id)), H('small', {}, ' ' + m.id + ' · ' + (m.type || '?') + ' · ' + (m.level || '?') + (dup ? ' · REMPLACERA le module existant (v' + (dup.version || '?') + ')' : ' · nouveau')), issuesBox(m._issues)));
        });
        if (pending.messages.length) out.append(H('p', {}, '💬 ' + pending.messages.length + ' message(s) : ' + pending.messages.map((m) => m.key).join(', ')));
        if (pending.butterfly) out.append(H('p', {}, '🦋 Évolution du papillon : ' + pending.butterfly.length + ' étapes lues.'));
        const okMods = pending.modules.filter((m) => !m._issues.errors.length); const hasErr = pending.report.some((r) => r.level === 'error') || msgErr.length;
        if (!pending.modules.length && !pending.messages.length && !pending.butterfly) { out.append(H('p', { class: 'issue err' }, 'Rien d’importable dans ce fichier.')); return; }
        out.append(H('div', { class: 'actions' }, H('button', { class: 'btn primary', type: 'button', onclick: () => {
          okMods.forEach((m) => { if (!m.status) m.status = 'brouillon'; put(m); });
          if (!hasErr) { if (pending.messages.length) { pending.messages.forEach((x) => { const i = data.messages.findIndex((y) => y.key === x.key); if (i > -1) data.messages[i] = x; else data.messages.push(x); }); } if (pending.butterfly && pending.butterfly.length === 5) data.butterfly = pending.butterfly; }
          save(data); applyData({ mods: {}, messages: hasErr ? [] : pending.messages, butterfly: hasErr ? null : pending.butterfly, classes: [] });
          say(okMods.length + ' module(s) ajouté(s) sur cet appareil, en relecture (statut conservé : « brouillon » par défaut).'); pending = null; rerender();
        } }, 'Ajouter sur cet appareil (' + okMods.length + ' module' + (okMods.length > 1 ? 's' : '') + ')'),
          H('button', { class: 'btn', type: 'button', onclick: () => { const ta = H('textarea', { class: 'txt codeArea', rows: 8, readonly: true }); ta.value = JSON.stringify({ modules: okMods.map(strip), messages: pending.messages, butterfly: pending.butterfly }, null, 2); out.append(ta); } }, 'Voir le JSON produit')));
        out.append(H('p', { class: 'note' }, 'Les modules en erreur ne sont pas ajoutés. Corrige le fichier source et relance l’import.'));
      };
      file.addEventListener('change', () => { if (!file.files[0]) return; out.innerHTML = ''; out.append(H('p', { class: 'note' }, 'Lecture de ' + file.files[0].name + ' …'));
        I.fromFile(file.files[0]).then(show).catch((e) => { out.innerHTML = ''; out.append(H('p', { class: 'issue err' }, '✗ ' + e.message)); }); });
      return H('div', { class: 'card stack' }, H('h2', {}, 'Importar · Importer'),
        H('p', {}, 'Dépose un classeur Excel (.xlsx) construit sur le modèle à six onglets, un fichier .csv (un fichier par onglet, nommé comme l’onglet) ou un fichier .json.'),
        H('p', { class: 'note' }, 'Modèle : ', g.ESP.BUNDLE ? 'tools/modele_mariposa.xlsx (dans le dépôt)' : H('a', { href: 'tools/modele_mariposa.xlsx', download: '' }, 'modele_mariposa.xlsx'), ' · format détaillé : docs/FORMAT_MODULES.md. L’import ne remplace jamais ta progression d’élève.'),
        file, paste, H('div', { class: 'actions' }, H('button', { class: 'btn', type: 'button', onclick: () => { if (!paste.value.trim()) { say('Colle d’abord un JSON.'); return; } show(I.fromJSONText(paste.value)); } }, 'Analyser le JSON collé')), out);
    }

    /* ── classes ── */
    function classPanel() {
      const code = H('input', { class: 'txt', type: 'text', placeholder: 'Code (ex. 2DE4)', autocapitalize: 'characters', 'aria-label': 'Code de classe' });
      const name = H('input', { class: 'txt', type: 'text', placeholder: 'Nom (ex. 2de 4 — espagnol)', 'aria-label': 'Nom de la classe' });
      const mods = M.list.filter((m) => m._ok).map((m) => ({ id: m.id, label: m.title }));
      const units = (g.ESP.C.units || []).map((u) => ({ id: u.id, label: u.title }));
      const checks = (items, nm) => H('div', { class: 'chkGrid' }, items.map((it) => H('label', { class: 'chk' }, H('input', { type: 'checkbox', name: nm, value: it.id }), H('span', {}, it.label))));
      const cm = checks(mods, 'cm'), cu = checks(units, 'cu'); const snip = H('textarea', { class: 'txt codeArea', rows: 6, readonly: true, 'aria-label': 'Extrait pour config.js' });
      const read = () => ({ code: code.value.trim().toUpperCase(), name: name.value.trim(), modules: [].map.call(cm.querySelectorAll('input:checked'), (x) => x.value), units: [].map.call(cu.querySelectorAll('input:checked'), (x) => x.value) });
      const existing = CFG.classes.map((c) => H('p', { class: 'note' }, '• ' + c.code + ' — ' + c.name + ' (' + (c.modules || []).length + ' modules, ' + (c.units || []).length + ' listes)' + (data.classes.some((x) => x.code === c.code) ? ' · ajouté ici' : '')));
      return H('div', { class: 'card stack' }, H('h2', {}, 'Mi clase · Classes'),
        H('p', { class: 'note' }, 'Un code de classe donne accès, dans « Mi clase », aux modules et listes choisis. Aucun nom d’élève n’est enregistré ; les résultats ne sont pas remontés à l’enseignant tant que les comptes Supabase ne sont pas branchés (docs/SUPABASE.md).'),
        existing, H('div', { class: 'fldGrid' }, code, name), H('h3', {}, 'Modules à assigner'), cm, H('h3', {}, 'Listes de vocabulaire à assigner'), cu,
        H('div', { class: 'actions' },
          H('button', { class: 'btn primary', type: 'button', onclick: () => { const c = read(); if (!c.code || !c.name) { say('Donne un code et un nom à la classe.'); return; } data.classes = data.classes.filter((x) => x.code !== c.code).concat([c]); save(data); applyData({ mods: {}, messages: [], butterfly: null, classes: [c] }); say('Classe « ' + c.code + ' » ajoutée sur cet appareil (test). Pour tous les élèves, copie l’extrait dans data/config.js.'); snip.value = '    ' + JSON.stringify(c, null, 2).replace(/\n/g, '\n    ') + ','; } }, 'Ajouter ici et préparer l’extrait'),
          H('button', { class: 'btn', type: 'button', onclick: () => copy(snip.value, snip).then((ok) => say(ok ? 'Extrait copié : colle-le dans la liste « classes » de data/config.js.' : 'Sélectionne le texte et copie-le à la main.')) }, 'Copier l’extrait')), snip);
    }

    function exportPanel() {
      const ta = H('textarea', { class: 'txt codeArea', rows: 5, readonly: true, 'aria-label': 'Export' });
      return H('div', { class: 'card stack' }, H('h2', {}, 'Exportar · Exporter'),
        H('p', { class: 'note' }, 'Prépare les fichiers à déposer sur GitHub : un fichier par module dans modules/, et modules/manifest.json qui liste ceux qui sont chargés.'),
        H('div', { class: 'actions' }, H('button', { class: 'btn', type: 'button', onclick: () => { const ids = M.list.filter((m) => m._ok).map((m) => m.id + '.json'); ta.value = JSON.stringify({ version: 1, modules: ids }, null, 2); say('manifest.json prêt : copie-le.'); } }, 'Générer manifest.json'),
          H('button', { class: 'btn', type: 'button', onclick: () => { ta.value = JSON.stringify({ modules: M.list.filter((m) => m._ok).map(strip), messages: (g.ESP.MESSAGES || []), butterfly: g.ESP.BUTTERFLY.stages }, null, 2); say('Export complet (modules + messages + papillon) prêt.'); } }, 'Tout exporter (JSON)'),
          H('button', { class: 'btn', type: 'button', onclick: () => copy(ta.value, ta).then((ok) => say(ok ? 'Copié.' : 'Sélectionne le texte et copie-le à la main.')) }, 'Copier')), ta);
    }

    function build() {
      app.append(ctx && ctx.crumbs ? ctx.crumbs : H('nav', { class: 'crumbs' }, H('button', { class: 'linkBtn', type: 'button', onclick: () => go({ v: 'home' }) }, 'Accueil'), ' › Atelier'),
        H('header', { class: 'hero' }, H('h1', {}, '🛠️ Atelier enseignant'), H('p', {}, 'Relire, corriger et importer les modules avant de les publier.')),
        H('div', { class: 'card tip' }, H('strong', {}, 'Bon à savoir : '), 'ce que tu fais ici reste sur cet appareil, pour relire et tester. Les élèves ne voient les nouveautés qu’une fois les fichiers déposés sur GitHub (Exporter).'),
        msg, modulesPanel(), importPanel(), classPanel(), exportPanel(), editor());
    }
    build();
  }

  g.ESP.Atelier = { view, loadLocal, applyData, load };
})(typeof window !== 'undefined' ? window : globalThis);
