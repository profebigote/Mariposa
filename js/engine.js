/* Moteur de correction : normalisation, accents / tilde, distance de lettres, barème. */
(function (g) {
  const PUNCT = /[.,;:!?¿¡"“”«»()]+/g;

  function norm(s) {
    return String(s || '').normalize('NFC').toLowerCase().replace(PUNCT, ' ').replace(/\s+/g, ' ').trim();
  }
  // retire accents et tilde (ñ -> n, ü -> u)
  function strip(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
  }

  // Levenshtein classique et variante avec inversion de lettres (Damerau)
  function distances(a, b) {
    const n = a.length, m = b.length;
    const lev = [], dam = [];
    for (let i = 0; i <= n; i++) { lev[i] = [i]; dam[i] = [i]; }
    for (let j = 0; j <= m; j++) { lev[0][j] = j; dam[0][j] = j; }
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const c = a[i - 1] === b[j - 1] ? 0 : 1;
        lev[i][j] = Math.min(lev[i - 1][j] + 1, lev[i][j - 1] + 1, lev[i - 1][j - 1] + c);
        let d = Math.min(dam[i - 1][j] + 1, dam[i][j - 1] + 1, dam[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, dam[i - 2][j - 2] + 1);
        dam[i][j] = d;
      }
    }
    return { lev: lev[n][m], dam: dam[n][m] };
  }

  // Barème (réglable) : 1 point par mot.
  const RULES = { accent: 0.25, oneLetter: 0.25, twoLettersOrSwap: 0.5, minLengthForTolerance: 4 };

  /* Compare une réponse à UNE réponse attendue.
     opts.sig : l'accent change le mot (canto / cantó) -> l'erreur d'accent compte comme une vraie faute.
     opts.lenient : accents ignorés (réponses en français). */
  function compareOne(answer, expected, opts) {
    opts = opts || {};
    const a = norm(answer), e = norm(expected);
    if (!a) return { points: 0, kind: 'empty', accentErrors: 0, letterDistance: null };
    if (a === e) return { points: 1, kind: 'exact', accentErrors: 0, letterDistance: 0 };
    const sa = strip(a), se = strip(e);
    if (opts.lenient && sa === se) return { points: 1, kind: 'exact', accentErrors: 0, letterDistance: 0 };

    let accentErrors = 0;
    if (sa.length === se.length) {
      for (let i = 0; i < a.length; i++) if (a[i] !== e[i] && sa[i] === se[i]) accentErrors++;
    }
    if (sa === se) {
      const pts = opts.sig ? 0 : Math.max(0, 1 - RULES.accent * accentErrors);
      return { points: pts, kind: pts > 0 ? 'accent' : 'wrong', accentErrors, letterDistance: 0 };
    }
    const d = distances(sa, se);
    let pen = 1;
    if (se.length >= RULES.minLengthForTolerance) {
      if (d.dam === 1 && d.lev === 1) pen = RULES.oneLetter;
      else if (d.dam === 1 && d.lev > 1) pen = RULES.twoLettersOrSwap; // inversion de lettres
      else if (d.dam === 2) pen = RULES.twoLettersOrSwap;
    }
    if (pen >= 1) return { points: 0, kind: 'wrong', accentErrors: 0, letterDistance: d.dam };
    const pts = Math.max(0, 1 - pen - (opts.sig ? 1 : RULES.accent) * accentErrors);
    return { points: pts, kind: pts > 0 ? 'close' : 'wrong', accentErrors, letterDistance: d.dam };
  }

  // Plusieurs réponses acceptées : on garde la meilleure.
  function compare(answer, accepted, opts) {
    const list = Array.isArray(accepted) ? accepted : [accepted];
    let best = null;
    list.forEach((exp) => {
      const r = compareOne(answer, exp, opts);
      r.expected = exp;
      if (!best || r.points > best.points) best = r;
    });
    return best;
  }

  // Réponses françaises : "peintre / peintre (femme)" -> variantes acceptées
  function frVariants(fr) {
    const out = new Set();
    String(fr).split(/\s*[\/;]\s*/).forEach((p) => {
      out.add(p);
      out.add(p.replace(/\s*\([^)]*\)/g, '').trim());
      out.add(p.replace(/[()]/g, ''));
    });
    return Array.from(out).filter(Boolean);
  }

  // Classement simple pour l'entraînement (pas de points)
  function state(res) {
    if (res.kind === 'exact') return 'ok';
    if (res.points > 0) return 'almost';
    return 'wrong';
  }

  g.ESP = g.ESP || {};
  g.ESP.E = { norm, strip, compare, compareOne, frVariants, state, RULES };
  if (typeof module !== 'undefined') module.exports = g.ESP.E;
})(typeof window !== 'undefined' ? window : globalThis);
