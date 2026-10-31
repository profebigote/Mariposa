/* Calcul des niveaux de compétence et du stade du papillon. Fonctions pures, sans pénalité :
   les niveaux ne baissent jamais (le maximum atteint est conservé par le stockage). */
(function (g) {
  g.ESP = g.ESP || {};
  const LEVELS = ['Por descubrir', 'En aprendizaje', 'En progreso', 'Adquirido', 'Consolidado'];
  const LEVELS_FR = ['À découvrir', 'En apprentissage', 'En progrès', 'Acquis', 'Consolidé'];
  const W = { clean: 1, assisted: 0.5, solution: 0.15 };
  const DAY_CAP = 8; // poids maximum comptabilisé par jour : s'entraîner longtemps d'un coup ne suffit pas à « consolider »
  const dayNum = (s) => Math.round(Date.parse(s + 'T12:00:00Z') / 86400000);

  /* ev : [{d:'AAAA-MM-JJ', q:'clean'|'assisted'|'solution'}] -> { level, toNext (0..1), score } */
  function levelOf(ev) {
    ev = ev || [];
    if (!ev.length) return { level: 0, toNext: 0, score: 0 };
    const byDay = {}; let clean = 0;
    ev.forEach((e) => { byDay[e.d] = Math.min(DAY_CAP, (byDay[e.d] || 0) + (W[e.q] || 0)); if (e.q === 'clean') clean++; });
    const days = Object.keys(byDay).sort();
    const score = days.reduce((s, d) => s + byDay[d], 0);
    const span = dayNum(days[days.length - 1]) - dayNum(days[0]);
    let level = 1;
    if (score >= 3) level = 2;
    if (score >= 6 && (clean >= 3 || score >= 8)) level = 3;
    if (level === 3 && score >= 9 && days.length >= 2 && span >= 2) level = 4; // il faut y être revenu au moins deux jours plus tard
    const next = { 1: 3, 2: 6, 3: 9 }[level];
    const toNext = level >= 4 ? 1 : Math.min(1, score / next);
    return { level, toNext, score };
  }

  const SKILL_POINTS = [0, 1, 2, 4, 6];
  /* points de croissance : niveaux de compétence atteints + étapes des leçons historiques (jamais en baisse) */
  function growth(skillMaxLevels, legacyStages) {
    return (skillMaxLevels || []).reduce((s, l) => s + SKILL_POINTS[l || 0], 0) + (legacyStages || []).reduce((s, l) => s + (l || 0), 0);
  }
  /* thresholds : [0, a, b, c, d] -> stade 1..5 */
  function stageOf(points, thresholds) {
    let st = 1;
    thresholds.forEach((t, i) => { if (points >= t) st = i + 1; });
    return st;
  }
  g.ESP.Progress = { levelOf, growth, stageOf, LEVELS, LEVELS_FR };
  if (typeof module !== 'undefined') module.exports = g.ESP.Progress;
})(typeof window !== 'undefined' ? window : globalThis);
