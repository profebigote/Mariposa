/* Mi progreso : compétences en barres (sans note ni pourcentage), Mariposa, leçons historiques. */
(function (g) {
  g.ESP = g.ESP || {};
  const { h, tx, showFr } = g.ESP.Util;
  const S = () => g.ESP.S, P = () => g.ESP.Progress;

  const PHRASE = [
    { es: 'Cuando quieras, empezamos.', fr: 'Quand tu veux, on commence.' },
    { es: 'Has empezado a descubrirlo.', fr: 'Tu as commencé à le découvrir.' },
    { es: 'Vas por buen camino.', fr: 'Tu es sur la bonne voie.' },
    { es: '¡Esto ya es tuyo!', fr: 'Ça, c’est à toi maintenant !' },
    { es: 'Lo has trabajado en varios días.', fr: 'Tu l’as travaillé sur plusieurs jours.' }
  ];
  const levelOf = (id) => {
    const r = P().levelOf(S().skill(id).ev);
    return { level: Math.max(r.level, S().skill(id).max || 0), toNext: r.toNext };
  };

  function skillRow(skill, opts) {
    opts = opts || {};
    const lv = levelOf(skill.id); const L = P().LEVELS[lv.level], LF = P().LEVELS_FR[lv.level];
    const segs = [1, 2, 3, 4].map((n) => {
      const fillPct = lv.level >= n ? 100 : (lv.level === n - 1 ? Math.round(lv.toNext * 100) : 0);
      return h('i', { class: 'seg' + (lv.level >= n ? ' full' : ''), style: '--p:' + fillPct + '%' });
    });
    return h('div', { class: 'skillRow lv' + lv.level },
      h('div', { class: 'skHead' }, h('strong', {}, skill.es), showFr() ? h('small', {}, skill.fr) : null),
      h('div', { class: 'bar', role: 'img', 'aria-label': skill.es + ' : ' + L }, segs),
      h('div', { class: 'skState' }, h('span', { class: 'pill st' + lv.level }, L), showFr() ? h('small', {}, ' ' + LF) : null,
        opts.changed ? h('span', { class: 'newLvl' }, ' ✨ ¡Nuevo nivel! · Nouveau niveau !') : null),
      opts.compact ? null : h('p', { class: 'note' }, tx(PHRASE[lv.level])));
  }

  function view(mount, nav) {
    const B = g.ESP.Butterfly, C = g.ESP.C, cfg = g.ESP.CONFIG;
    const st = B.stage(); const info = g.ESP.BUTTERFLY.stages[st - 1];
    mount.append(h('header', { class: 'hero' }, h('h1', {}, 'Mi progreso'), h('p', {}, 'Lo que ya sabes hacer, a tu ritmo. Sin notas ni comparaciones. · Ce que tu sais déjà faire, à ton rythme.')));
    mount.append(h('div', { class: 'card companion' }, h('div', { class: 'bfBig', html: B.svg(st, info.name) }),
      h('div', {}, h('p', { class: 'eyebrow' }, 'Mariposa'), h('h2', {}, info.name), showFr() ? h('p', { class: 'note' }, info.fr + ' — ' + info.desc) : null,
        st < 5 ? h('div', { class: 'growth', role: 'img', 'aria-label': 'Progreso hacia la siguiente etapa' }, h('i', { style: 'width:' + Math.round(B.toNext() * 100) + '%' })) : h('p', { class: 'note' }, '¡Has descubierto todas las etapas! · Tu as découvert toutes les étapes !'),
        h('p', { class: 'note' }, 'Mariposa crece con lo que aprendes de verdad. Nunca retrocede. · Mariposa grandit avec ce que tu apprends vraiment. Elle ne régresse jamais.'))));

    const skills = g.ESP.SKILLS || [];
    const groups = cfg.rubriques.map((r) => ({ r, list: skills.filter((s) => s.group === r.id) })).filter((x) => x.list.length);
    const started = (s) => levelOf(s.id).level > 0;
    groups.forEach((gr) => {
      const on = gr.list.filter(started);
      if (!on.length) return;
      mount.append(h('div', { class: 'section-title' }, h('h2', {}, gr.r.title), h('small', {}, gr.r.fr)));
      mount.append(h('div', { class: 'card skills' }, on.map((s) => skillRow(s))));
    });
    if (!skills.some(started)) mount.append(h('div', { class: 'card' }, h('p', {}, 'Todavía no has empezado ninguna competencia. Cuando quieras, elige una aventura o una lección. · Tu n’as pas encore commencé de compétence : choisis une aventure ou une leçon quand tu veux.')));
    const off = skills.filter((s) => !started(s));
    if (off.length) {
      mount.append(h('details', { class: 'card skills toDiscover' }, h('summary', {}, 'Por descubrir · À découvrir (' + off.length + ')'),
        h('div', { class: 'skillsOff' }, off.map((s) => h('div', { class: 'offRow' }, h('strong', {}, s.es), h('small', {}, s.fr))))));
    }

    const mods = g.ESP.Modules.list.filter((m) => S().modState(m.id) && S().modState(m.id).done);
    if (mods.length) {
      mount.append(h('div', { class: 'section-title' }, h('h2', {}, 'Módulos terminados'), h('small', {}, 'Modules terminés')),
        h('div', { class: 'list' }, mods.map((m) => h('button', { class: 'row', type: 'button', onclick: () => nav({ v: 'mod', id: m.id }) }, h('span', { class: 't' }, h('strong', {}, m.title), h('small', {}, 'Hecho ' + S().modState(m.id).done + (S().modState(m.id).done > 1 ? ' veces' : ' vez'))), h('span', { class: 'pill' }, m.level)))));
    }
    const legacy = C.units.filter((u) => S().isOpened(u.id));
    if (legacy.length) {
      mount.append(h('div', { class: 'section-title' }, h('h2', {}, 'Mis lecciones'), h('small', {}, 'Leçons déjà ouvertes')),
        h('div', { class: 'list' }, legacy.map((u) => h('button', { class: 'row', type: 'button', onclick: () => nav({ v: 'unit', id: u.id }) }, h('span', { class: 't' }, h('strong', {}, u.title), h('small', {}, u.blurb)), g.ESP.UApi.meter(u)))));
    }
    mount.append(h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => nav({ v: 'explore' }) }, 'Mis palabras por revisar'), h('button', { class: 'btn', type: 'button', onclick: () => nav({ v: 'settings' }) }, 'Ajustes · Réglages')));
  }

  g.ESP.ProgressUI = { skillRow, view, levelOf };
})(typeof window !== 'undefined' ? window : globalThis);
