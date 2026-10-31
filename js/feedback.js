/* Moteur de retours pédagogiques : choisit le bon message selon le type d'activité,
   le nombre de tentatives, la nature de l'erreur et le niveau. Aucune note, aucune pénalité. */
(function (g) {
  g.ESP = g.ESP || {};
  let rnd = Math.random;
  const recent = [];           // clés récemment utilisées, pour éviter les répétitions
  let streak = 0;              // réussites consécutives du premier coup (calme la fréquence des félicitations)

  const lib = () => g.ESP.MESSAGES || [];
  const inList = (list, v) => !list || !list.length || (v != null && list.indexOf(v) > -1);

  function score(m, c) {
    // les messages plus spécifiques passent avant les messages génériques ; un filtre non satisfait exclut le message
    let s = 0;
    if (m.activity) { if (m.activity.indexOf(c.activity) < 0) return -1; s += 2; }
    if (m.errorKind) { if (m.errorKind.indexOf(c.errorKind) < 0) return -1; s += 3; }
    if (m.level) { if (m.level.indexOf(c.level) < 0) return -1; s += 1; }
    return s;
  }

  function choose(kind, c) {
    c = c || {};
    const cands = lib().filter((m) => m.kind === kind).map((m) => ({ m, s: score(m, c) })).filter((x) => x.s >= 0);
    if (!cands.length) return null;
    const best = Math.max.apply(null, cands.map((x) => x.s));
    let pool = cands.filter((x) => x.s === best).map((x) => x.m);
    const fresh = pool.filter((m) => recent.indexOf(m.key) < 0);
    if (fresh.length) pool = fresh;
    const pick = pool[Math.floor(rnd() * pool.length)];
    recent.push(pick.key); if (recent.length > 6) recent.shift();
    return pick;
  }

  /* Compose le retour affiché après une tentative.
     ctx : { activity, outcome:'ok'|'almost'|'wrong', attempts (>=1), errorKind, level,
             hint, hint2, explain, example, solution, why, detail }               */
  function compose(ctx) {
    const attempts = Math.max(1, ctx.attempts || 1);
    const out = { tone: 'ok', compact: false, lead: null, hint: null, explain: null, example: null, solution: null, why: null, detail: null, offerSolution: false, key: null };
    if (ctx.outcome === 'ok') {
      const first = attempts === 1;
      const msg = choose(first ? 'ok1' : 'okAfter', ctx);
      out.lead = msg; out.key = msg && msg.key; out.tone = 'ok';
      if (first) {
        streak++;
        // réponse juste du premier coup : validation courte ; plus on enchaîne, plus on reste discret
        out.compact = streak >= 3 ? true : rnd() < 0.5;
        if (ctx.why && !out.compact) out.why = ctx.why;
        if (streak >= 3 && ctx.why) { out.compact = false; out.why = ctx.why; out.lead = null; } // une explication utile remplace la félicitation
      } else { streak = 0; out.why = ctx.why || null; }
      return out;
    }
    streak = 0;
    if (ctx.outcome === 'almost') {
      out.tone = 'almost'; out.lead = choose('almost', ctx); out.detail = ctx.detail || null; out.key = out.lead && out.lead.key; return out;
    }
    out.tone = 'again';
    if (attempts === 1) {
      out.lead = choose('err1', ctx);
      out.hint = ctx.hint || fallback('hint', ctx);
    } else if (attempts === 2) {
      out.lead = choose('err2', ctx);
      out.hint = ctx.hint2 || null;
      out.explain = ctx.explain || fallback('explain', ctx);
      out.example = ctx.example || null;
    } else {
      out.lead = choose('err3', ctx);
      out.explain = ctx.explain || fallback('explain', ctx);
      out.example = ctx.example || null;
      out.offerSolution = true;
    }
    out.key = out.lead && out.lead.key;
    return out;
  }

  function fallback(kind, ctx) {
    const m = lib().filter((x) => x.kind === kind && x.errorKind && x.errorKind.indexOf(ctx.errorKind || 'other') > -1)[0]
      || lib().filter((x) => x.kind === kind && x.errorKind && x.errorKind.indexOf('other') > -1)[0];
    return m ? { es: m.es, fr: m.fr } : null;
  }

  function mission(skillLabels, override) {
    if (override && (override.es || override.fr)) return { es: override.es || '', fr: override.fr || '', key: 'custom' };
    const m = choose('mission', {});
    const skill = (skillLabels && skillLabels[0]) || { es: 'algo nuevo', fr: 'quelque chose de nouveau' };
    const low = (t) => (t || '').charAt(0).toLowerCase() + (t || '').slice(1);
    return { key: m.key, es: m.es.replace('{skill}', low(skill.es)), fr: m.fr.replace('{skill}', low(skill.fr)) };
  }

  const ui = (key) => { const m = lib().filter((x) => x.key === 'ui.' + key)[0]; return m ? { es: m.es, fr: m.fr } : { es: key, fr: key }; };

  g.ESP.Feedback = {
    compose, mission, ui, choose,
    resetStreak() { streak = 0; },
    setRandom(fn) { rnd = fn || Math.random; recent.length = 0; streak = 0; }
  };
  if (typeof module !== 'undefined') module.exports = g.ESP.Feedback;
})(typeof window !== 'undefined' ? window : globalThis);
