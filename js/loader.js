/* Chargement des modules : js/bundle (aperçu autonome) ou modules/manifest.json (site publié sur GitHub Pages).
   Chaque module est validé ; un module invalide est signalé dans l'Atelier mais n'est jamais joué. */
(function (g) {
  g.ESP = g.ESP || {};
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const M = {
    list: [], byId: {}, loadError: null,
    register(mod) {
      const r = g.ESP.Validator.validate(mod);
      mod._issues = r; mod._ok = !r.errors.length;
      const i = M.list.findIndex((x) => x.id === mod.id);
      if (i > -1) M.list[i] = mod; else M.list.push(mod);
      if (mod.id) M.byId[mod.id] = mod;
      return mod;
    },
    isVisible(mod, showDrafts) {
      if (!mod._ok) return false;
      const s = norm(mod.status);
      return s === 'publie' || (showDrafts && (s === 'brouillon' || s === 'valide'));
    },
    visible(showDrafts) { return M.list.filter((m) => M.isVisible(m, showDrafts)); },
    /* modules, messages et classes saisis dans l'Atelier sur cet appareil : appliqués après les fichiers du site */
    local() { try { if (g.ESP.Atelier) g.ESP.Atelier.loadLocal().forEach(M.register); } catch (e) { M.loadError = M.loadError || 'Données locales de l’Atelier illisibles.'; } return M.list; },
    load() {
      if (g.ESP.BUNDLE) { g.ESP.BUNDLE.forEach(M.register); return Promise.resolve(M.local()); }
      if (typeof fetch !== 'function') return Promise.resolve(M.local());
      return fetch('modules/manifest.json').then((r) => { if (!r.ok) throw new Error('manifest ' + r.status); return r.json(); })
        .then((man) => Promise.all((man.modules || []).map((f) => fetch('modules/' + f).then((r) => r.json()).then(M.register).catch((e) => { M.loadError = 'Module « ' + f + ' » illisible : ' + e.message; }))))
        .then(() => M.local())
        .catch((e) => { M.loadError = M.loadError || ('Modules non chargés (' + e.message + '). Les leçons historiques restent disponibles.'); return M.local(); });
    }
  };
  g.ESP.Modules = M;
})(typeof window !== 'undefined' ? window : globalThis);
