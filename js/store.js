/* Progression : stockée sur l'appareil (localStorage).
   Les fonctions de ce fichier sont les seules à toucher au stockage :
   on pourra les brancher sur Supabase (comptes) sans modifier le reste.
   Évolution non destructive : la clé 'esp.v1' et les anciens champs (opened, mastered, explore)
   sont conservés tels quels ; les nouveaux champs sont ajoutés avec des valeurs par défaut. */
(function (g) {
  const KEY = 'esp.v1';
  const fresh = () => ({ opened: {}, mastered: {}, explore: {}, skills: {}, mods: {}, adv: {}, srs: {}, prefs: {}, butterfly: { reached: 1, seen: 1 } });
  let db = fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const p = JSON.parse(raw); const f = fresh(); Object.keys(f).forEach((k) => { db[k] = Object.assign(f[k], p[k] || {}); }); }
  } catch (e) { /* stockage indisponible : l'app fonctionne sans sauvegarde */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  const S = {
    /* ───── leçons historiques (inchangé) ───── */
    open(unitId) { if (!db.opened[unitId]) { db.opened[unitId] = 1; save(); } },
    // la maîtrise ne fait qu'augmenter : une erreur n'enlève jamais rien
    master(unitId, key) {
      db.mastered[unitId] = db.mastered[unitId] || {};
      db.mastered[unitId][key] = 1;
      delete db.explore[key]; // sort de « À explorer » dès que c'est réussi
      save();
    },
    miss(key, info) { if (!db.mastered[info.unitId] || !db.mastered[info.unitId][key]) { db.explore[key] = info; save(); } },
    release(key) { delete db.explore[key]; save(); },
    masteredCount(unitId) { return Object.keys(db.mastered[unitId] || {}).length; },
    isOpened(unitId) { return !!db.opened[unitId]; },
    exploreList() { return Object.keys(db.explore).map((k) => Object.assign({ key: k }, db.explore[k])); },
    stage(unitId, total) {
      const m = S.masteredCount(unitId);
      if (total > 0 && m / total >= 0.8) return 3;
      if (m > 0) return 2;
      return S.isOpened(unitId) ? 1 : 0;
    },

    /* ───── compétences : on enregistre des preuves, jamais de note ─────
       quality : 'clean' (réussi seul), 'assisted' (réussi après erreur/indice), 'solution' (solution consultée) */
    evidence(skillId, quality, moduleId) {
      const sk = db.skills[skillId] = db.skills[skillId] || { ev: [], max: 0 };
      sk.ev.push({ d: today(), q: quality, m: moduleId || '' });
      if (sk.ev.length > 400) sk.ev = sk.ev.slice(-400);
      save();
    },
    skill(skillId) { return db.skills[skillId] || { ev: [], max: 0 }; },
    setSkillMax(skillId, lvl) { const sk = db.skills[skillId] = db.skills[skillId] || { ev: [], max: 0 }; if (lvl > sk.max) { sk.max = lvl; save(); } },
    allSkills() { return db.skills; },

    /* ───── modules (aventures, leçons, vocabulaire, lectures) ───── */
    modState(id) { return db.mods[id] || null; },
    saveMod(id, patch) { db.mods[id] = Object.assign(db.mods[id] || {}, patch); save(); },
    completeMod(id, summary) {
      const m = db.mods[id] = db.mods[id] || {};
      m.done = (m.done || 0) + 1; m.last = today(); m.summary = summary || m.summary; delete m.resume; save();
    },
    resume(id) { return (db.mods[id] && db.mods[id].resume) || null; },
    setResume(id, data) { db.mods[id] = db.mods[id] || {}; if (data) db.mods[id].resume = data; else delete db.mods[id].resume; save(); },

    /* ───── révision espacée du vocabulaire (sans notification : consultée si l'élève le souhaite) ───── */
    srs(key, quality, info) {
      const INTERVALS = [0, 1, 3, 7, 14, 30]; // jours
      const c = db.srs[key] = db.srs[key] || { box: 0, due: 0, info: info || {} };
      if (info) c.info = info;
      if (quality === 'clean') c.box = Math.min(5, c.box + 1);
      else if (quality === 'assisted') c.box = Math.max(1, c.box);
      else c.box = 0;
      c.due = Date.now() + INTERVALS[c.box] * 86400000; c.seen = (c.seen || 0) + 1;
      save();
    },
    srsDue(now) { now = now || Date.now(); return Object.keys(db.srs).map((k) => Object.assign({ key: k }, db.srs[k])).filter((c) => c.due <= now && c.box < 5); },
    srsAll() { return db.srs; },
    srsRelease(key) { if (db.srs[key]) { db.srs[key].due = Date.now() + 7 * 86400000; save(); } },

    /* ───── réglages et papillon ───── */
    pref(name, fallback) { return db.prefs[name] === undefined ? fallback : db.prefs[name]; },
    setPref(name, val) { db.prefs[name] = val; save(); },
    butterfly() { return db.butterfly; },
    setButterfly(patch) { Object.assign(db.butterfly, patch); save(); },

    exportAll() { return JSON.stringify(db); },
    reset() { db = fresh(); save(); }
  };
  g.ESP = g.ESP || {};
  g.ESP.S = S;
})(window);
