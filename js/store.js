/* Progression : stockée sur l'appareil (localStorage).
   Les fonctions de ce fichier sont les seules à toucher au stockage :
   on pourra les brancher sur Supabase (comptes) sans modifier le reste. */
(function (g) {
  const KEY = 'esp.v1';
  let db = { opened: {}, mastered: {}, explore: {} };
  try { const raw = localStorage.getItem(KEY); if (raw) db = Object.assign(db, JSON.parse(raw)); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }

  const S = {
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
    reset() { db = { opened: {}, mastered: {}, explore: {} }; save(); }
  };
  g.ESP = g.ESP || {};
  g.ESP.S = S;
})(window);
