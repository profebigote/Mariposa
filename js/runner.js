/* Lecteurs de modules :
   - playStep    : joue UN écran interactif avec retours progressifs (indice, explication, solution) ;
   - runLinear   : leçons, vocabulaire et lectures (suite d'écrans) ;
   - runAdventure: mini-aventures à embranchements, avec reprise.
   Aucune note : on enregistre des « preuves » de compétence (réussi seul, avec aide, solution consultée). */
(function (g) {
  g.ESP = g.ESP || {};
  const { h, esc, shuffle, tx, fill, sndBtn, showFr, accentBar, norm } = g.ESP.Util;
  const S = g.ESP.S, F = g.ESP.Feedback, A = g.ESP.Act, P = g.ESP.Progress;
  const bi = (x, vars) => (typeof x === 'string' ? fill(x, vars) : x ? { es: fill(x.es, vars), fr: fill(x.fr, vars) } : null);
  const skillById = (id) => (g.ESP.SKILLS || []).filter((s) => s.id === id)[0] || { id, es: id, fr: id };

  /* ───── enregistrement d'une preuve de compétence ───── */
  function record(skillId, quality, modId) {
    const before = Math.max(P.levelOf(S.skill(skillId).ev).level, S.skill(skillId).max || 0);
    S.evidence(skillId, quality, modId);
    const now = P.levelOf(S.skill(skillId).ev).level;
    S.setSkillMax(skillId, now);
    return { before, after: Math.max(now, before) };
  }
  P.record = record;

  /* ───── affichage d'un retour ───── */
  function fbDom(c) {
    if (c.compact) return h('div', { class: 'fb compact ok' }, '✓ ', c.lead ? h('span', {}, c.lead.es) : null);
    const box = h('div', { class: 'fb ' + c.tone });
    if (c.lead) box.append(h('strong', { class: 'lead' }, c.lead.es), showFr() && c.lead.fr ? h('small', { class: 'leadFr' }, c.lead.fr) : null);
    if (c.detail) box.append(h('p', { html: c.detail }));
    if (c.why) box.append(h('p', { class: 'why' }, tx(c.why)));
    if (c.hint) box.append(h('div', { class: 'hintBox' }, h('b', {}, '💡 Pista · Indice : '), tx(c.hint)));
    if (c.explain) box.append(h('div', { class: 'explain' }, tx(c.explain)));
    if (c.example) box.append(h('div', { class: 'rule' }, h('b', {}, 'Ejemplo · Exemple : '), tx(c.example)));
    return box;
  }

  /* ───── un écran interactif ─────
     done({ quality:'clean'|'assisted'|'solution'|'none', items:[…], matched, solution, attempts }) est appelé au clic sur « Seguir ». */
  function playStep(spec, env, done, opts) {
    opts = opts || {};
    const kind = spec.kind; const passive = !!g.ESP.ACT_PASSIVE[kind];
    const card = h('section', { class: 'card stepCard' });
    const fb = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const actions = h('div', { class: 'actions' });
    const root = h('div', {}, card, fb, actions);
    let attempts = 0, finished = false, solutionSeen = false, last = null; const itemsQ = [];

    const next = (extra) => { if (finished) return; finished = true; done(Object.assign({ quality: 'none', items: itemsQ, attempts }, extra || {})); };
    const contBtn = (label, onclick) => h('button', { class: 'btn primary', type: 'button', onclick }, label || F.ui('continue').es + ' · ' + F.ui('continue').fr);
    const showContinue = (extra, label) => { actions.innerHTML = ''; actions.append(contBtn(label, () => next(extra))); };

    const api = {
      ready() { if (!actions.children.length) showContinue({ quality: 'none' }); },
      item(id, q) {
        itemsQ.push({ id, q });
        const it = env.items && env.items[id];
        if (it) S.srs(env.mod.id + '|' + id, q, { mod: env.mod.id, id, es: it.es, fr: it.fr, emoji: it.emoji || '' });
      },
      submit(res) {
        last = res; fb.innerHTML = ''; actions.innerHTML = '';
        const m = res.matched || {};
        if (res.neutral) { ctl.lock && ctl.lock(); showContinue({ quality: 'clean', matched: m }); return; }
        if (res.state === 'ok' || res.state === 'almost') {
          const extra = res.assisted ? 1 + Math.min(2, res.errors || 1) : 0;
          const att = Math.max(1, attempts + 1 + extra);
          const c = F.compose({ activity: kind, outcome: res.state, attempts: att, errorKind: spec.errorKind, level: env.mod.level, why: m.why || spec.why, detail: res.detail });
          fb.append(fbDom(c));
          const quality = (res.state === 'ok' && att === 1) ? 'clean' : 'assisted';
          if (ctl.lock) ctl.lock();
          showContinue({ quality, matched: m, answerText: res.answerText });
          return;
        }
        attempts++;
        const c = F.compose({ activity: kind, outcome: 'wrong', attempts, errorKind: res.errorKind || spec.errorKind || 'other', level: env.mod.level,
          hint: m.hint || spec.hint, hint2: m.hint2 || spec.hint2, explain: m.explain || spec.explain, example: m.example || spec.example });
        fb.append(fbDom(c));
        if (ctl.retry) actions.append(h('button', { class: 'btn primary', type: 'button', onclick: () => { fb.innerHTML = ''; actions.innerHTML = ''; ctl.retry(); } }, F.ui('retry').es + ' · ' + F.ui('retry').fr));
        if (c.offerSolution) actions.append(h('button', { class: 'btn', type: 'button', onclick: () => {
          solutionSeen = true; if (ctl.lock) ctl.lock(); if (ctl.reveal) ctl.reveal();
          const sol = spec.solution ? tx(bi(spec.solution, env.vars)) : res.answerText ? h('span', {}, res.answerText) : null;
          fb.append(h('div', { class: 'fb almost solution' }, h('strong', { class: 'lead' }, F.ui('solution').es + ' · ' + F.ui('solution').fr), sol ? h('p', {}, sol) : null, spec.explain ? h('p', { class: 'explain' }, tx(bi(spec.explain, env.vars))) : null));
          showContinue({ quality: 'solution', solution: true, matched: m, answerText: res.answerText }, F.ui('skip').es + ' · ' + F.ui('skip').fr);
        } }, F.ui('showSolution').es + ' · ' + F.ui('showSolution').fr));
      }
    };
    const ctl = A[kind] ? A[kind](spec, api, env) : { el: h('p', {}, 'Type d’écran inconnu : ' + kind) };
    card.append(ctl.el);
    root._focus = ctl.focus;
    void passive; void solutionSeen; void last; void esc; void norm; void shuffle;
    return root;
  }

  /* ───── préparation des écrans d'un module ───── */
  function itemsById(mod) { const o = {}; (mod.items || []).forEach((it) => { o[it.id] = it; }); return o; }
  function autoVocab(mod) {
    const ids = (mod.items || []).map((i) => i.id); const out = [];
    out.push({ kind: 'cards', title: { es: 'Descubre las palabras', fr: 'Découvre les mots' }, items: ids });
    out.push({ kind: 'recognize', title: { es: '¿Qué palabra es?', fr: 'Quel est le mot ?' }, items: ids });
    out.push({ kind: 'recall', title: { es: 'Escríbela sin ayuda', fr: 'Écris-le sans aide' }, items: ids });
    (mod.items || []).filter((i) => i.sentence).slice(0, 4).forEach((i) => out.push({ kind: 'fill', prompt: i.sentence.es ? { es: i.sentence.es, fr: i.sentence.fr } : i.sentence, answers: i.sentence.answers || [i.es.replace(/^(el|la|los|las|un|una)\s+/i, '')], itemId: i.id, hint: { es: 'Mira la imagen de la palabra.', fr: 'Pense à l’image du mot.' } }));
    out.push({ kind: 'recap', points: [{ es: 'Has visto y usado las palabras en frases.', fr: 'Tu as vu et utilisé les mots dans des phrases.' }] });
    return out;
  }
  function flowOf(mod) {
    if (mod.type === 'lesson') return mod.screens.map((s) => Object.assign({}, s));
    if (mod.type === 'vocab') return (mod.screens && mod.screens.length ? mod.screens : autoVocab(mod)).map((s) => Object.assign({}, s));
    const out = [];
    (mod.phases || []).forEach((p) => (p.steps || []).forEach((s, i) => out.push(Object.assign({ _phase: p.id, _phaseTitle: p.title, _first: i === 0 }, s))));
    return out;
  }

  /* ───── écran de fin ───── */
  function finishScreen(mod, stats, before, nav) {
    S.completeMod(mod.id, { clean: stats.clean, assisted: stats.assisted, solution: stats.solution });
    const skills = (mod.skills || []).map(skillById);
    const msg = F.mission(skills, mod.completion);
    const box = h('div', { class: 'card stack finish' }, h('p', { class: 'eyebrow' }, 'Misión'), h('h2', {}, msg.es), showFr() && msg.fr ? h('p', { class: 'note' }, msg.fr) : null);
    if (skills.length) {
      box.append(h('h3', {}, 'Competencias trabajadas · Compétences travaillées'));
      skills.forEach((sk) => {
        const lvl = Math.max(P.levelOf(S.skill(sk.id).ev).level, S.skill(sk.id).max || 0);
        box.append(g.ESP.ProgressUI.skillRow(sk, { compact: true, changed: lvl > (before[sk.id] || 0) }));
      });
    }
    /* mots à revoir : `completion.review` = ids d'items du module OU objets { id?, es, fr, emoji? } ; + mots dont la solution a été consultée */
    const byId = itemsById(mod);
    const toWord = (r) => (typeof r === 'string' ? (byId[r] ? { id: r, es: byId[r].es, fr: byId[r].fr, emoji: byId[r].emoji || '' } : { id: r, es: r, fr: '' }) : { id: r.id || r.es, es: r.es, fr: r.fr || '', emoji: r.emoji || '' });
    const words = {};
    ((mod.completion && mod.completion.review) || []).concat(stats.items.filter((x) => x.q === 'solution').map((x) => x.id)).forEach((r) => { const w = toWord(r); words[w.id] = w; });
    const rv = Object.keys(words).map((k) => words[k]);
    if (rv.length) {
      const known = S.srsAll();
      rv.forEach((w) => { const k = mod.id + '|' + w.id; if (!known[k]) S.srs(k, 'assisted', { mod: mod.id, id: w.id, es: w.es, fr: w.fr, emoji: w.emoji }); });
      box.append(h('h3', {}, 'Para repasar · À revoir'), h('div', { class: 'chips' }, rv.map((w) => h('span', { class: 'chipW' }, (w.emoji ? w.emoji + ' ' : '') + w.es))), h('p', { class: 'note' }, 'Aparecerán en « Mis palabras por revisar », cuando quieras · Ils apparaîtront dans « Mis palabras por revisar », quand tu voudras.'));
    }
    const nexts = ((mod.completion && mod.completion.next) || []).map((id) => g.ESP.Modules.byId[id]).filter((m) => m && g.ESP.Modules.isVisible(m, S.pref('showDrafts', g.ESP.CONFIG.showDraftsByDefault)));
    box.append(h('div', { class: 'actions' }, nexts.map((m) => h('button', { class: 'btn primary', type: 'button', onclick: () => nav({ v: 'mod', id: m.id }) }, 'Siguiente: ' + m.title)),
      h('button', { class: 'btn', type: 'button', onclick: () => nav({ v: 'mod', id: mod.id }) }, 'Volver al módulo · Retour au module'), h('button', { class: 'btn', type: 'button', onclick: () => nav({ v: 'prog' }) }, 'Mi progreso')));
    if (g.ESP.Butterfly) setTimeout(() => g.ESP.Butterfly.celebrateIfNew(), 400);
    return box;
  }

  const skillSnapshot = (mod) => { const o = {}; (mod.skills || []).forEach((id) => { o[id] = Math.max(P.levelOf(S.skill(id).ev).level, S.skill(id).max || 0); }); return o; };

  /* ───── leçons, vocabulaire, lectures ───── */
  function runLinear(mod, mount, nav, startPos) {
    const flow = flowOf(mod); const env = { mod, vars: {}, items: itemsById(mod) };
    const stats = { clean: 0, assisted: 0, solution: 0, items: [] }; const before = skillSnapshot(mod);
    let i = Math.min(startPos || 0, flow.length - 1);
    const wrap = h('div', { class: 'runner' }); mount.append(wrap);
    const docPanel = mod.type === 'reading' ? readingDoc(mod) : null;

    function draw() {
      wrap.innerHTML = '';
      if (i >= flow.length) { S.setResume(mod.id, null); wrap.append(finishScreen(mod, stats, before, nav)); return; }
      const spec = flow[i];
      const bar = h('div', { class: 'progress', 'aria-hidden': 'true' }, h('div', { style: 'width:' + Math.round(i / flow.length * 100) + '%' }));
      wrap.append(bar, h('p', { class: 'note stepNo' }, (i + 1) + ' / ' + flow.length));
      if (mod.type === 'reading') {
        const names = { comprender: 'Comprender', interpretar: 'Interpretar', reaccionar: 'Reaccionar' };
        wrap.append(h('ol', { class: 'phases', 'aria-label': 'Fases' }, (mod.phases || []).map((p) => h('li', { class: p.id === spec._phase ? 'on' : '' }, (names[p.id] || p.id) + (p.title ? ' · ' + (typeof p.title === 'string' ? p.title : p.title.es) : '')))), docPanel);
      }
      const spk = playStep(spec, env, (res) => {
        if (!g.ESP.ACT_PASSIVE[spec.kind] && res.quality !== 'none') {
          stats[res.quality]++;
          const sks = spec.skills || (spec.skill ? [spec.skill] : (mod.skills || []));
          sks.forEach((id) => record(id, res.quality, mod.id));
        }
        (res.items || []).forEach((x) => stats.items.push(x));
        i++; S.setResume(mod.id, i < flow.length ? { pos: i } : null); draw();
        window.scrollTo(0, 0);
      });
      wrap.append(spk, accentBar());
      if (spk._focus) spk._focus();
    }
    draw();
  }

  function readingDoc(mod) {
    const d = mod.doc;
    const body = h('div', { class: 'doc' }, h('h3', {}, d.title || mod.title), d.source ? h('p', { class: 'note' }, d.source) : null,
      (d.blocks || []).map((b) => {
        if (b.type === 'heading') return h('h4', {}, b.text);
        if (b.type === 'quote') return h('blockquote', {}, b.text);
        if (b.type === 'facts') return h('ul', { class: 'facts' }, (b.items || []).map((x) => h('li', {}, x.emoji ? h('span', { 'aria-hidden': 'true' }, x.emoji + ' ') : null, x.text)));
        if (b.type === 'poster') return h('div', { class: 'poster' }, (b.lines || []).map((l, k) => h(k === 0 ? 'strong' : 'p', {}, l)));
        return h('p', { class: 'docP' }, glossed(b.text, d.glossary || []));
      }),
      (d.glossary || []).length ? h('p', { class: 'note' }, 'Toca una palabra subrayada para ver su sentido · Touche un mot souligné pour voir son sens.') : null);
    return h('details', { class: 'docPanel', open: true }, h('summary', {}, '📄 Documento · Document'), body);
  }
  function glossed(text, glossary) {
    if (!glossary.length) return text;
    const frag = document.createDocumentFragment(); let rest = text;
    while (rest) {
      let at = -1, g0 = null;
      glossary.forEach((e) => { const k = rest.indexOf(e.w); if (k > -1 && (at < 0 || k < at)) { at = k; g0 = e; } });
      if (!g0) { frag.append(rest); break; }
      frag.append(rest.slice(0, at));
      const tip = h('span', { class: 'gloTip', hidden: true }, ' (' + g0.fr + ')');
      frag.append(h('button', { class: 'glo', type: 'button', onclick: () => { tip.hidden = !tip.hidden; } }, g0.w), tip);
      rest = rest.slice(at + g0.w.length);
    }
    return frag;
  }

  /* ───── aventures à embranchements ───── */
  function runAdventure(mod, mount, nav, resume) {
    const byId = {}; mod.nodes.forEach((n) => { byId[n.id] = n; });
    const stats = { clean: 0, assisted: 0, solution: 0, items: [] }; const before = skillSnapshot(mod);
    let vars = Object.assign({}, mod.vars || {}); let log = []; let current = mod.start;
    if (resume) { vars = resume.vars || vars; log = resume.log || []; current = resume.node || current; Object.assign(stats, resume.stats || {}); stats.items = stats.items || []; }
    const cast = mod.cast || {};
    const wrap = h('div', { class: 'runner adv' }); mount.append(wrap);
    const stageBox = h('div', { class: 'advStage' }); const logBox = h('div', { class: 'advLog', 'aria-live': 'polite' }); const act = h('div', { class: 'advAct' });
    wrap.append(stageBox, logBox, act);
    let npcKey = null, scene = mod.scene || 'plain'; const playerKey = Object.keys(cast).filter((k) => cast[k].player)[0] || 'tu';

    const drawStage = (speaking) => {
      stageBox.innerHTML = '';
      const npc = npcKey && cast[npcKey] ? cast[npcKey] : (Object.keys(cast).filter((k) => !cast[k].player).map((k) => cast[k])[0] || {});
      const me = cast[playerKey] || {};
      stageBox.append(g.ESP.Comic.stage(scene, [npc, me], speaking === 'me' ? 1 : speaking === 'npc' ? 0 : -1));
    };
    const addLog = (who, es, fr, side) => {
      log.push({ who, es, fr, side }); if (log.length > 40) log.shift();
      logBox.append(bubble(who, es, fr, side));
    };
    const bubble = (who, es, fr, side) => h('div', { class: 'advMsg ' + side }, h('span', { class: 'who' }, who), h('p', { class: 'btext' }, es, sndBtn(es)), fr && showFr() ? h('p', { class: 'bfr' }, fr) : null);
    const speakerName = (k) => (cast[k] && cast[k].name) || k || '';
    const save = () => S.setResume(mod.id, { node: current, vars, log, stats: { clean: stats.clean, assisted: stats.assisted, solution: stats.solution, items: [] } });

    // reprise : on réaffiche la conversation déjà jouée
    log.forEach((l) => logBox.append(bubble(l.who, l.es, l.fr, l.side)));
    function applySet(o) { if (o && o.set) Object.assign(vars, o.set); }
    const cond = (c) => Object.keys(c).every((k) => (Array.isArray(c[k]) ? c[k].indexOf(vars[k]) > -1 : vars[k] === c[k]));
    const cont = (label, fn) => act.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: fn }, label || 'Seguir · Continuer')));
    const scrollDown = () => { setTimeout(() => { const last = logBox.lastElementChild; (act.firstElementChild || last || act).scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 30); };

    function go(id) {
      current = id; act.innerHTML = '';
      const n = byId[id]; if (!n) return;
      if (n.scene) scene = n.scene;
      if (n.type === 'branch') { const c = (n.cases || []).filter((k) => cond(k.if || {}))[0]; go(c ? c.next : n.else); return; }
      if (n.type === 'say') {
        npcKey = n.speaker || npcKey; drawStage('npc'); applySet(n);
        addLog(speakerName(n.speaker), fill(n.es, vars), fill(n.fr, vars), 'npc'); save(); cont(n.cta, () => go(n.next)); scrollDown(); return;
      }
      if (n.type === 'info') {
        act.append(h('div', { class: 'card tip' }, h('strong', {}, '💡 '), tx(bi({ es: n.es, fr: n.fr }, vars)))); applySet(n); save(); cont('Seguir · Continuer', () => go(n.next)); scrollDown(); return;
      }
      if (n.type === 'end') {
        drawStage('none'); S.setResume(mod.id, null);
        const msg = n.es || n.fr ? { es: fill(n.es, vars), fr: fill(n.fr, vars) } : null;
        const mm = Object.assign({}, mod, { completion: Object.assign({}, mod.completion || {}, msg && !(mod.completion && (mod.completion.es || mod.completion.fr)) ? msg : {}) });
        act.append(finishScreen(mm, stats, before, nav)); scrollDown(); return;
      }
      // étapes où l'apprenant répond
      drawStage('npc'); save();
      const spec = Object.assign({}, n, { kind: n.type === 'short' ? 'short' : n.type });
      if (spec.kind === 'choice') spec.keepOrder = n.keepOrder;
      const env = { mod, vars, items: {} };
      const step = playStep(spec, env, (res) => {
        const m = res.matched || {};
        let target = m.next, setter = m;
        if (res.solution) { // l'élève a consulté la solution : on continue par le premier chemin valide
          const okOne = (n.options || n.accept || []).filter((o) => (o.ok !== false))[0] || {};
          target = n.skipTo || okOne.next; setter = okOne; m.text = m.text || okOne.es || okOne.text;
        }
        if (!target) target = n.next || (n.options || n.accept || [])[0].next;
        const said = res.solution ? (setter.es || setter.text || res.answerText || '') : (m.es || (typeof m.text === 'string' ? m.text : '') || m.said || '');
        applySet(setter);
        if (res.quality !== 'none') {
          stats[res.quality]++;
          (n.skills || mod.skills || []).forEach((sid) => record(sid, res.quality, mod.id));
        }
        if (said) addLog(speakerName(playerKey), fill(said, vars), fill(m.fr || '', vars), 'me');
        else if (n.type === 'short') addLog(speakerName(playerKey), (step.querySelector('textarea') || {}).value || '', '', 'me');
        drawStage('me'); act.innerHTML = ''; go(target);
      });
      act.append(step, accentBar()); if (step._focus) step._focus(); scrollDown();
    }

    drawStage('none');
    go(current);
  }

  g.ESP.Runner = { playStep, runLinear, runAdventure, record, fbDom };
})(typeof window !== 'undefined' ? window : globalThis);
