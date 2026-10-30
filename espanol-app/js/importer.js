/* Importation de contenus : JSON, Excel (.xlsx), CSV  →  modules validés.
   Aucune dépendance pour les tables (fromSheets) ; Excel est lu par SheetJS (chargé à la demande depuis cdnjs, voir loadSheetJS).
   Le format exact des colonnes est documenté dans docs/FORMAT_MODULES.md et dans le classeur modèle (tools/modele_mariposa.xlsx). */
(function (g) {
  g.ESP = g.ESP || {};
  const SHEETS = ['Messages_UI', 'Fiches_modules', 'Scenario_demo', 'Lecons_visuelles', 'Evolution_papillon', 'Lexique_demo'];
  const OPT_N = 6, ACC_N = 4;

  /* ───── utilitaires ───── */
  const str = (v) => (v === undefined || v === null ? '' : String(v).trim());
  const list = (v) => str(v).split(/\s*[;|]\s*/).filter(Boolean);
  const bool = (v) => /^(1|true|vrai|oui|yes|si|sí|x|ok)$/i.test(str(v));
  const bi = (es, fr) => { const o = {}; if (str(es)) o.es = str(es); if (str(fr)) o.fr = str(fr); return Object.keys(o).length ? o : undefined; };
  const num = (v, d) => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? d : n; };
  const setObj = (v) => { const o = {}; list(v).forEach((p) => { const i = p.indexOf('='); if (i > 0) { const val = p.slice(i + 1).trim(); o[p.slice(0, i).trim()] = val; } }); return Object.keys(o).length ? o : undefined; };
  const json = (v, where, report) => { const s = str(v); if (!s) return undefined; try { return JSON.parse(s); } catch (e) { report.push({ level: 'error', msg: where + ' : data_json illisible (' + e.message + ').' }); return undefined; } };
  const put = (o, k, v) => { if (v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)) o[k] = v; return o; };

  /* Une ligne = objet dont les clés sont en minuscules sans espaces. */
  function rowsOf(table) {
    if (!table) return [];
    return table.map((r) => { const o = {}; Object.keys(r).forEach((k) => { o[String(k).trim().toLowerCase().replace(/\s+/g, '_')] = r[k]; }); return o; })
      .filter((r) => Object.keys(r).some((k) => str(r[k]) !== '') && !/^(#|\/\/)/.test(str(r[Object.keys(r)[0]])));
  }

  /* ───── Messages_UI ───── */
  function messages(table, report) {
    const out = [];
    rowsOf(table).forEach((r, i) => {
      const key = str(r.key), kind = str(r.kind);
      if (!key || !kind) { report.push({ level: 'error', msg: 'Messages_UI ligne ' + (i + 2) + ' : « key » et « kind » sont obligatoires.' }); return; }
      if (!str(r.es) && !str(r.fr)) { report.push({ level: 'error', msg: 'Messages_UI « ' + key + ' » : texte vide.' }); return; }
      const m = { key, kind, es: str(r.es), fr: str(r.fr) };
      if (list(r.activity).length) m.activity = list(r.activity);
      if (list(r.errorkind || r.error_kind).length) m.errorKind = list(r.errorkind || r.error_kind);
      if (list(r.level).length) m.level = list(r.level);
      out.push(m);
    });
    const seen = {}; out.forEach((m) => { if (seen[m.key]) report.push({ level: 'error', msg: 'Messages_UI : clé « ' + m.key + ' » en double.' }); seen[m.key] = 1; });
    return out;
  }

  /* ───── Fiches_modules ───── */
  function shells(table, report) {
    const out = {};
    rowsOf(table).forEach((r, i) => {
      const id = str(r.id);
      if (!id) { report.push({ level: 'error', msg: 'Fiches_modules ligne ' + (i + 2) + ' : « id » manquant.' }); return; }
      const m = { id, type: str(r.type), title: str(r.title), rubrique: str(r.rubrique), theme: str(r.theme), level: str(r.level), duration: num(r.duration, undefined), status: str(r.status) || 'brouillon', version: Math.round(num(r.version, 1)) };
      const ob = {}; put(ob, 'main', str(r.objective_main || r.main)); put(ob, 'secondary', list(r.objectives_secondary)); put(ob, 'outcome', str(r.outcome));
      put(ob, 'lexicon', list(r.lexicon)); put(ob, 'grammar', list(r.grammar)); put(ob, 'prerequisites', list(r.prerequisites));
      m.objectives = ob; m.skills = list(r.skills);
      put(m, 'intro', bi(r.intro_es, r.intro_fr)); put(m, 'scene', str(r.scene));
      const cast = json(r.cast_json, id + ' cast_json', report); put(m, 'cast', cast);
      const doc = json(r.doc_json, id + ' doc_json', report); put(m, 'doc', doc);
      const c = {}; put(c, 'es', str(r.completion_es)); put(c, 'fr', str(r.completion_fr)); put(c, 'review', list(r.review)); put(c, 'next', list(r.next));
      if (Object.keys(c).length) m.completion = c;
      Object.assign(m, json(r.data_json, id + ' (fiche)', report) || {});
      if (out[id]) report.push({ level: 'error', msg: 'Fiches_modules : id « ' + id + ' » en double.' });
      out[id] = m;
    });
    return out;
  }

  /* ───── Scenario_demo : un nœud par ligne ───── */
  function node(r, where, report) {
    const type = str(r.type); const n = { id: str(r.node_id), type };
    if (type === 'say' || type === 'info') { put(n, 'speaker', str(r.speaker)); put(n, 'es', str(r.es)); put(n, 'fr', str(r.fr)); put(n, 'next', str(r.next)); }
    else if (type === 'end') { put(n, 'es', str(r.es)); put(n, 'fr', str(r.fr)); }
    else if (type === 'branch') {
      const cond = setObj(r.cond || r['if']); n.cases = cond ? [{ if: cond, next: str(r.next) }] : []; put(n, 'else', str(r.else));
    } else if (type === 'choice' || type === 'build' || type === 'short') {
      put(n, 'prompt', bi(r.prompt_es, r.prompt_fr)); put(n, 'hint', bi(r.hint_es, r.hint_fr)); put(n, 'explain', bi(r.explain_es, r.explain_fr));
      if (type === 'build') put(n, 'tiles', list(r.tiles));
      if (type === 'choice') {
        n.options = [];
        for (let k = 1; k <= OPT_N; k++) {
          const es = str(r['o' + k + '_es']); if (!es && !str(r['o' + k + '_fr'])) continue;
          const o = { es }; put(o, 'fr', str(r['o' + k + '_fr'])); o.ok = bool(r['o' + k + '_ok']); put(o, 'next', str(r['o' + k + '_next'])); put(o, 'set', setObj(r['o' + k + '_set']));
          put(o, 'hint', bi(r['o' + k + '_hint_es'], r['o' + k + '_hint_fr'])); put(o, 'why', bi(r['o' + k + '_why_es'], r['o' + k + '_why_fr']));
          put(o, 'explain', bi(r['o' + k + '_explain_es'], r['o' + k + '_explain_fr'])); put(o, 'errorKind', str(r['o' + k + '_kind'])); n.options.push(o);
        }
      } else {
        n.accept = [];
        for (let k = 1; k <= ACC_N; k++) {
          const t = str(r['a' + k + '_text']); if (!t) continue;
          const a = { text: t }; put(a, 'es', str(r['a' + k + '_es'])); put(a, 'fr', str(r['a' + k + '_fr'])); put(a, 'next', str(r['a' + k + '_next'])); put(a, 'set', setObj(r['a' + k + '_set'])); n.accept.push(a);
        }
        put(n, 'solution', bi(r.solution_es, r.solution_fr));
      }
    } else report.push({ level: 'error', msg: where + ' : type de nœud « ' + type + ' » inconnu (say, choice, build, short, branch, end, info).' });
    Object.assign(n, json(r.data_json, where, report) || {});
    return n;
  }
  function scenario(table, mods, report) {
    const byMod = {};
    rowsOf(table).forEach((r, i) => {
      const id = str(r.module_id); if (!id) { report.push({ level: 'error', msg: 'Scenario_demo ligne ' + (i + 2) + ' : module_id manquant.' }); return; }
      (byMod[id] = byMod[id] || []).push(node(r, 'Scenario_demo ligne ' + (i + 2), report));
    });
    Object.keys(byMod).forEach((id) => {
      const m = mods[id] || (mods[id] = { id, type: 'adventure', status: 'brouillon', version: 1, objectives: {}, skills: [] });
      if (!m.type) m.type = 'adventure';
      m.nodes = byMod[id]; m.start = m.start || byMod[id][0].id;
    });
  }

  /* ───── Lecons_visuelles : un écran par ligne ───── */
  function optionsFrom(v) { return list(v).map((s) => (s.charAt(0) === '*' ? { text: s.slice(1).trim(), ok: true } : { text: s })); }
  function step(r, where, report) {
    const kind = str(r.kind); const s = { kind };
    put(s, 'title', bi(r.title_es, r.title_fr)); put(s, 'prompt', bi(r.prompt_es, r.prompt_fr));
    put(s, 'hint', bi(r.hint_es, r.hint_fr)); put(s, 'explain', bi(r.explain_es, r.explain_fr)); put(s, 'why', bi(r.why_es, r.why_fr)); put(s, 'example', bi(r.example_es, r.example_fr));
    if (kind === 'choice') s.options = optionsFrom(r.options);
    else if (kind === 'fill' || kind === 'transform') s.answers = list(r.answers);
    else if (kind === 'short') s.accept = list(r.answers).map((t) => ({ text: t }));
    else if (kind === 'build') { s.accept = list(r.answers).map((t) => ({ text: t })); put(s, 'tiles', list(r.tiles)); }
    else if (kind === 'order') s.items = list(r.items);
    else if (kind === 'match') s.pairs = list(r.pairs).map((p) => { const i = p.indexOf('='); return { left: p.slice(0, i).trim(), right: p.slice(i + 1).trim() }; });
    else if (kind === 'recap') { const a = list(r.points_es), b = list(r.points_fr); s.points = a.map((t, i) => bi(t, b[i])); }
    put(s, 'img', str(r.img));
    Object.assign(s, json(r.data_json, where, report) || {});
    return s;
  }
  function lessons(table, mods, report) {
    const by = {};
    rowsOf(table).forEach((r, i) => {
      const id = str(r.module_id); if (!id) { report.push({ level: 'error', msg: 'Lecons_visuelles ligne ' + (i + 2) + ' : module_id manquant.' }); return; }
      (by[id] = by[id] || []).push({ order: num(r.step, i), phase: str(r.phase), s: step(r, 'Lecons_visuelles ligne ' + (i + 2), report) });
    });
    Object.keys(by).forEach((id) => {
      const m = mods[id] || (mods[id] = { id, type: 'lesson', status: 'brouillon', version: 1, objectives: {}, skills: [] });
      const rows = by[id].sort((a, b) => a.order - b.order);
      if (m.type === 'reading' || rows.some((x) => x.phase)) {
        const order = []; const ph = {};
        rows.forEach((x) => { const p = (x.phase || 'comprender').toLowerCase(); if (!ph[p]) { ph[p] = { id: p, title: ({ comprender: 'Comprender', interpretar: 'Interpretar', reaccionar: 'Reaccionar' })[p] || p, steps: [] }; order.push(p); } ph[p].steps.push(x.s); });
        m.phases = order.map((p) => ph[p]); if (!m.type) m.type = 'reading';
      } else { m.screens = rows.map((x) => x.s); if (!m.type) m.type = 'lesson'; }
    });
  }

  /* ───── Lexique_demo ───── */
  function lexique(table, mods, report) {
    const by = {};
    rowsOf(table).forEach((r, i) => {
      const id = str(r.module_id); if (!id) { report.push({ level: 'error', msg: 'Lexique_demo ligne ' + (i + 2) + ' : module_id manquant.' }); return; }
      if (!str(r.es) || !str(r.fr)) { report.push({ level: 'error', msg: 'Lexique_demo ligne ' + (i + 2) + ' : « es » et « fr » obligatoires.' }); return; }
      const it = { id: str(r.id) || str(r.es).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^(el|la|los|las|un|una)\s+/, '').replace(/[^a-z0-9]+/g, '-'), es: str(r.es), fr: str(r.fr) };
      put(it, 'emoji', str(r.emoji)); put(it, 'tags', list(r.tags)); put(it, 'example', bi(r.example_es, r.example_fr));
      const se = str(r.sentence_es); if (se) { it.sentence = { es: se }; put(it.sentence, 'fr', str(r.sentence_fr)); put(it.sentence, 'answers', list(r.answers)); }
      (by[id] = by[id] || []).push(it);
    });
    Object.keys(by).forEach((id) => {
      const m = mods[id] || (mods[id] = { id, type: 'vocab', status: 'brouillon', version: 1, objectives: {}, skills: [] });
      m.items = by[id]; if (!m.type) m.type = 'vocab';
    });
  }

  /* ───── Evolution_papillon ───── */
  function butterfly(table, report) {
    const rows = rowsOf(table); if (!rows.length) return null;
    const stages = rows.map((r, i) => ({ n: Math.round(num(r.stage, i + 1)), name: str(r.name_es), fr: str(r.name_fr), threshold: num(r.threshold, 0), desc: str(r.desc_fr || r.desc), msg: { es: str(r.message_es), fr: str(r.message_fr) } })).sort((a, b) => a.n - b.n);
    if (stages.length !== 5) report.push({ level: 'error', msg: 'Evolution_papillon : 5 étapes attendues (' + stages.length + ' trouvées).' });
    stages.forEach((s, i) => { if (!s.name) report.push({ level: 'error', msg: 'Evolution_papillon étape ' + s.n + ' : name_es manquant.' }); if (i && s.threshold <= stages[i - 1].threshold) report.push({ level: 'error', msg: 'Evolution_papillon : les seuils doivent croître (étape ' + s.n + ').' }); });
    if (stages.length && stages[0].threshold !== 0) report.push({ level: 'warn', msg: 'Evolution_papillon : le seuil de l’étape 1 devrait valoir 0.' });
    return stages;
  }

  /* ───── assemblage ───── */
  function fromSheets(sheets) {
    const report = [];
    const get = (n) => { const k = Object.keys(sheets).filter((x) => x.toLowerCase() === n.toLowerCase())[0]; return k ? sheets[k] : null; };
    const mods = shells(get('Fiches_modules'), report);
    scenario(get('Scenario_demo'), mods, report); lessons(get('Lecons_visuelles'), mods, report); lexique(get('Lexique_demo'), mods, report);
    const msgs = messages(get('Messages_UI'), report); const bf = butterfly(get('Evolution_papillon'), report);
    const modules = Object.keys(mods).map((id) => { const m = mods[id]; if (!m.title) report.push({ level: 'error', msg: id + ' : contenu trouvé sans ligne dans Fiches_modules (titre, niveau, rubrique…).' }); return m; });
    return { modules, messages: msgs, butterfly: bf, report };
  }

  /* JSON : un module, un tableau de modules, ou { modules:[…], messages:[…], butterfly:[…] } */
  function fromJSONText(text) {
    const report = []; let d;
    try { d = JSON.parse(text); } catch (e) { return { modules: [], messages: [], butterfly: null, report: [{ level: 'error', msg: 'JSON illisible : ' + e.message }] }; }
    if (Array.isArray(d)) return { modules: d, messages: [], butterfly: null, report };
    if (d && (d.modules || d.messages || d.butterfly)) return { modules: d.modules || [], messages: d.messages || [], butterfly: d.butterfly || null, report };
    return { modules: [d], messages: [], butterfly: null, report };
  }

  /* CSV : un fichier = un onglet, reconnu par son nom (ex. Lexique_demo.csv) ou par ses colonnes */
  function parseCSV(text) {
    text = String(text).replace(/^﻿/, '');
    const first = text.split(/\r?\n/)[0] || ''; const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : (first.indexOf('\t') > -1 ? '\t' : ',');
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true; else if (c === sep) { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    const head = (rows.shift() || []).map((x) => x.trim());
    return rows.filter((r) => r.some((x) => x.trim())).map((r) => { const o = {}; head.forEach((h, i) => { o[h] = r[i] === undefined ? '' : r[i]; }); return o; });
  }
  function guessSheet(name, table) {
    const n = String(name || '').replace(/\.[a-z]+$/i, '');
    const hit = SHEETS.filter((s) => s.toLowerCase() === n.toLowerCase())[0]; if (hit) return hit;
    const cols = table.length ? Object.keys(table[0]).map((k) => k.trim().toLowerCase()) : [];
    if (cols.indexOf('key') > -1 && cols.indexOf('kind') > -1) return 'Messages_UI';
    if (cols.indexOf('node_id') > -1) return 'Scenario_demo';
    if (cols.indexOf('kind') > -1 && cols.indexOf('module_id') > -1) return 'Lecons_visuelles';
    if (cols.indexOf('module_id') > -1 && cols.indexOf('es') > -1) return 'Lexique_demo';
    if (cols.indexOf('threshold') > -1) return 'Evolution_papillon';
    if (cols.indexOf('id') > -1 && cols.indexOf('rubrique') > -1) return 'Fiches_modules';
    return null;
  }
  function fromCSVText(text, filename) {
    const t = parseCSV(text); const s = guessSheet(filename, t);
    if (!s) return { modules: [], messages: [], butterfly: null, report: [{ level: 'error', msg: 'CSV : onglet non reconnu. Nomme le fichier comme l’onglet (ex. Lexique_demo.csv) ou garde les colonnes du modèle.' }] };
    const o = {}; o[s] = t; const r = fromSheets(o); r.report.unshift({ level: 'info', msg: 'CSV reconnu comme onglet « ' + s + ' ».' }); return r;
  }

  /* Excel : classeur SheetJS déjà lu */
  function fromWorkbook(XLSX, wb) {
    const sheets = {}; wb.SheetNames.forEach((n) => { sheets[n] = XLSX.utils.sheet_to_json(wb.Sheets[n], { defval: '', raw: false }); });
    return fromSheets(sheets);
  }
  let sheetPromise = null;
  function loadSheetJS() {
    if (g.XLSX) return Promise.resolve(g.XLSX);
    if (sheetPromise) return sheetPromise;
    sheetPromise = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload = () => (g.XLSX ? res(g.XLSX) : rej(new Error('SheetJS absent'))); s.onerror = () => { sheetPromise = null; rej(new Error('SheetJS n’a pas pu être chargé (connexion ?)')); };
      document.head.appendChild(s);
    });
    return sheetPromise;
  }
  function fromFile(file) {
    const name = file.name || '';
    if (/\.json$/i.test(name)) return file.text().then(fromJSONText);
    if (/\.(csv|tsv|txt)$/i.test(name)) return file.text().then((t) => fromCSVText(t, name));
    if (/\.xls[xm]?$/i.test(name)) return Promise.all([loadSheetJS(), file.arrayBuffer()]).then(([X, buf]) => fromWorkbook(X, X.read(buf, { type: 'array' })));
    return Promise.resolve({ modules: [], messages: [], butterfly: null, report: [{ level: 'error', msg: 'Format non pris en charge : ' + name + ' (JSON, XLSX ou CSV).' }] });
  }

  /* validation de l'ensemble importé */
  function check(res) {
    const V = g.ESP.Validator;
    res.modules.forEach((m) => { const r = V.validate(m); m._issues = r; });
    return res;
  }

  /* messages : valeurs par défaut manquantes → rapport */
  const KINDS = ['err1', 'err2', 'err3', 'ok1', 'okAfter', 'almost', 'mission', 'hint', 'explain', 'ui'];
  function checkMessages(msgs) { return msgs.filter((m) => KINDS.indexOf(m.kind) < 0).map((m) => 'Message « ' + m.key + ' » : kind « ' + m.kind + ' » inconnu (' + KINDS.join(', ') + ').'); }

  g.ESP.Importer = { SHEETS, fromSheets, fromJSONText, fromCSVText, fromWorkbook, fromFile, loadSheetJS, parseCSV, check, checkMessages, rowsOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.ESP.Importer;
})(typeof window !== 'undefined' ? window : globalThis);
