/* Mini BD : décors et personnages dessinés en SVG, bulles de dialogue.
   - read(u)     : la BD à lire (toucher une bulle affiche la traduction)
   - complete(u) : la même BD, à compléter avec un QCM dans les bulles
   Les dialogues viennent de content.js : { who, t: 'texte avec {{réponse|variante::sens FR::piège1|piège2}}', fr } */
(function (g) {
  const SKIN = ['#f2cfae', '#dba477', '#b9825a', '#8d5b3d'];
  const HAIR = ['#2b1d16', '#6b3f23', '#c9792a', '#1f1f2b', '#7a2e1d'];
  const SHIRT = ['#c0392b', '#2f6f8f', '#e9a41c', '#5a7d3a', '#8a3c6e', '#d9703a'];

  function figure(n, talking) {
    let skin, hair, shirt, beard;
    if (n && typeof n === 'object') {
      skin = SKIN[(n.skin || 0) % SKIN.length]; hair = HAIR[(n.hair || 0) % HAIR.length]; shirt = SHIRT[(n.shirt || 0) % SHIRT.length]; beard = !!n.beard;
    } else { skin = SKIN[n % SKIN.length]; hair = HAIR[(n * 2 + 1) % HAIR.length]; shirt = SHIRT[(n * 3 + 1) % SHIRT.length]; beard = n % 3 === 1; }
    const mouth = talking
      ? '<ellipse cx="45" cy="63" rx="5" ry="3.6" fill="#7a2a22"/>'
      : '<path d="M39 62 Q45 67 51 62" stroke="#7a2a22" stroke-width="2" fill="none" stroke-linecap="round"/>';
    const extra = beard ? '<path d="M24 52 C26 70 36 76 45 76 C54 76 64 70 66 52 C60 62 50 66 45 66 C40 66 30 62 24 52Z" fill="' + hair + '"/>' : '';
    return '<svg viewBox="0 0 90 130" width="100%" role="img" aria-hidden="true">' +
      '<path d="M10 130 C10 94 28 82 45 82 C62 82 80 94 80 130Z" fill="' + shirt + '" stroke="#2e1f1a" stroke-width="2.5"/>' +
      '<rect x="39" y="68" width="12" height="16" fill="' + skin + '"/>' +
      '<ellipse cx="45" cy="48" rx="22" ry="25" fill="' + skin + '" stroke="#2e1f1a" stroke-width="2.5"/>' + extra +
      '<path d="M22 46 C19 20 36 13 46 13 C62 13 73 26 68 46 C62 35 52 30 44 30 C36 30 28 36 22 46Z" fill="' + hair + '" stroke="#2e1f1a" stroke-width="2"/>' +
      '<circle cx="37" cy="50" r="2.5" fill="#1d1a17"/><circle cx="53" cy="50" r="2.5" fill="#1d1a17"/>' + mouth + '</svg>';
  }

  const W = '#2e1f1a';
  const SCENES = {
    airport: '<rect width="400" height="260" fill="#f0d7b0"/><rect x="28" y="22" width="215" height="96" rx="6" fill="#bfe0ee" stroke="' + W + '" stroke-width="4"/><line x1="135" y1="22" x2="135" y2="118" stroke="' + W + '" stroke-width="3"/>' +
      '<ellipse cx="170" cy="70" rx="40" ry="9" fill="#fff" stroke="' + W + '" stroke-width="2"/><path d="M160 70 L138 94 L152 94 L178 72Z" fill="#fff" stroke="' + W + '" stroke-width="2"/><path d="M198 66 L212 50 L219 50 L212 68Z" fill="#fff" stroke="' + W + '" stroke-width="2"/>' +
      '<rect x="0" y="168" width="400" height="92" fill="#d6b88f"/><rect x="262" y="104" width="120" height="62" rx="4" fill="#c0392b" stroke="' + W + '" stroke-width="3"/><rect x="258" y="96" width="128" height="12" fill="#8f2a20"/><circle cx="322" cy="66" r="15" fill="#e9a41c" stroke="' + W + '" stroke-width="3"/><path d="M315 66 h14 M322 59 v14" stroke="' + W + '" stroke-width="3"/>',
    restaurant: '<rect width="400" height="260" fill="#e8b872"/><rect y="150" width="400" height="110" fill="#c98b5b"/><path d="M0 150 H400" stroke="' + W + '" stroke-width="3"/>' +
      '<path d="M40 150 V70 A50 50 0 0 1 140 70 V150Z" fill="#fbe4b8" stroke="' + W + '" stroke-width="4"/><path d="M270 150 V70 A50 50 0 0 1 370 70 V150Z" fill="#fbe4b8" stroke="' + W + '" stroke-width="4"/>' +
      '<line x1="200" y1="0" x2="200" y2="34" stroke="' + W + '" stroke-width="3"/><circle cx="200" cy="44" r="14" fill="#f4c542" stroke="' + W + '" stroke-width="3"/>' +
      '<ellipse cx="200" cy="206" rx="118" ry="22" fill="#fffaf1" stroke="' + W + '" stroke-width="3"/><circle cx="170" cy="204" r="11" fill="#fff" stroke="' + W + '" stroke-width="2"/><circle cx="232" cy="204" r="11" fill="#fff" stroke="' + W + '" stroke-width="2"/><rect x="196" y="176" width="9" height="30" rx="3" fill="#5a7d3a" stroke="' + W + '" stroke-width="2"/>',
    office: '<rect width="400" height="260" fill="#e4d6bd"/><rect x="40" y="26" width="170" height="104" rx="4" fill="#bfe0ee" stroke="' + W + '" stroke-width="4"/><path d="M52 130 V86 h22 v44 M84 130 V62 h26 v68 M120 130 V92 h20 v38 M150 130 V74 h24 v56" fill="#a78a6f" stroke="' + W + '" stroke-width="2"/>' +
      '<circle cx="320" cy="56" r="24" fill="#fffaf1" stroke="' + W + '" stroke-width="3"/><path d="M320 56 V40 M320 56 L332 62" stroke="' + W + '" stroke-width="3" stroke-linecap="round"/>' +
      '<rect y="190" width="400" height="70" fill="#8a5a3b"/><rect y="184" width="400" height="10" fill="#6b3f23"/><path d="M350 184 C340 150 350 130 368 118 C372 140 366 160 360 184Z" fill="#5a7d3a" stroke="' + W + '" stroke-width="2"/><rect x="346" y="176" width="26" height="16" fill="#c0392b" stroke="' + W + '" stroke-width="2"/>',
    street: '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0ee"/><stop offset="1" stop-color="#fbe4b8"/></linearGradient></defs><rect width="400" height="260" fill="url(#sk)"/><circle cx="64" cy="52" r="24" fill="#f6c453"/>' +
      '<rect x="150" y="70" width="110" height="130" fill="#e9d3a8" stroke="' + W + '" stroke-width="3"/><rect x="140" y="38" width="34" height="162" fill="#dcc08e" stroke="' + W + '" stroke-width="3"/><rect x="236" y="38" width="34" height="162" fill="#dcc08e" stroke="' + W + '" stroke-width="3"/><path d="M140 38 L157 12 L174 38Z M236 38 L253 12 L270 38Z" fill="#c0392b" stroke="' + W + '" stroke-width="3"/>' +
      '<path d="M188 200 V150 A17 17 0 0 1 222 150 V200Z" fill="#5a3b2b" stroke="' + W + '" stroke-width="3"/><circle cx="205" cy="104" r="14" fill="#bfe0ee" stroke="' + W + '" stroke-width="3"/>' +
      '<rect y="196" width="400" height="64" fill="#d9b27a"/><path d="M0 196 H400" stroke="' + W + '" stroke-width="3"/><circle cx="352" cy="170" r="22" fill="#5a7d3a" stroke="' + W + '" stroke-width="3"/><rect x="349" y="186" width="6" height="14" fill="#6b3f23"/>',
    shop: '<rect width="400" height="260" fill="#efe2c8"/><path d="M20 70 H380 M20 124 H380" stroke="#8a5a3b" stroke-width="6"/>' +
      '<rect x="36" y="40" width="40" height="30" fill="#c98b5b" stroke="' + W + '" stroke-width="2"/><rect x="86" y="46" width="34" height="24" fill="#e9a41c" stroke="' + W + '" stroke-width="2"/><rect x="250" y="38" width="46" height="32" fill="#c98b5b" stroke="' + W + '" stroke-width="2"/><rect x="310" y="48" width="38" height="22" fill="#c0392b" stroke="' + W + '" stroke-width="2"/>' +
      '<rect x="40" y="94" width="50" height="30" fill="#e9a41c" stroke="' + W + '" stroke-width="2"/><rect x="104" y="86" width="40" height="38" fill="#c98b5b" stroke="' + W + '" stroke-width="2"/><rect x="270" y="96" width="60" height="28" fill="#c98b5b" stroke="' + W + '" stroke-width="2"/>' +
      '<rect y="190" width="400" height="70" fill="#b87a4b"/><rect y="182" width="400" height="12" fill="#8a5a3b"/><rect x="170" y="150" width="60" height="34" rx="3" fill="#fffaf1" stroke="' + W + '" stroke-width="3"/><path d="M180 162 h40 M180 172 h28" stroke="' + W + '" stroke-width="3"/>',
    cafe: '<rect width="400" height="260" fill="#ecd2a6"/><rect y="150" width="400" height="110" fill="#c98b5b"/><path d="M0 150 H400" stroke="' + W + '" stroke-width="3"/>' +
      '<rect x="26" y="26" width="120" height="96" rx="6" fill="#bfe0ee" stroke="' + W + '" stroke-width="4"/><path d="M40 122 V80 h22 v42 M70 122 V58 h26 v64 M104 122 V88 h30 v34" fill="#e9d3a8" stroke="' + W + '" stroke-width="2"/>' +
      '<rect x="176" y="30" width="96" height="62" rx="4" fill="#2e1f1a"/><path d="M190 48 h50 M190 62 h38 M190 76 h44" stroke="#f6e8d6" stroke-width="3" stroke-linecap="round"/><circle cx="256" cy="48" r="4" fill="#e9a41c"/>' +
      '<rect x="290" y="110" width="100" height="44" rx="4" fill="#fffaf1" stroke="' + W + '" stroke-width="3"/><ellipse cx="318" cy="122" rx="14" ry="7" fill="#e9a41c" stroke="' + W + '" stroke-width="2"/><ellipse cx="358" cy="122" rx="14" ry="7" fill="#c98b5b" stroke="' + W + '" stroke-width="2"/>' +
      '<rect x="296" y="82" width="42" height="30" rx="4" fill="#8a5a3b" stroke="' + W + '" stroke-width="3"/><circle cx="352" cy="98" r="9" fill="#c0392b" stroke="' + W + '" stroke-width="2"/>' +
      '<rect x="0" y="190" width="400" height="12" fill="#8a5a3b"/><ellipse cx="200" cy="208" rx="70" ry="9" fill="#fffaf1" stroke="' + W + '" stroke-width="2"/><path d="M188 196 h24 v-14 a12 8 0 0 0 -24 0z" fill="#fff" stroke="' + W + '" stroke-width="2"/>',
    home: '<rect width="400" height="260" fill="#f2dcc0"/><rect x="36" y="30" width="110" height="90" rx="4" fill="#bfe0ee" stroke="' + W + '" stroke-width="4"/><line x1="91" y1="30" x2="91" y2="120" stroke="' + W + '" stroke-width="3"/>' +
      '<rect x="230" y="44" width="120" height="70" rx="4" fill="#fffaf1" stroke="' + W + '" stroke-width="3"/><path d="M244 100 l22 -26 l18 16 l20 -30 l26 40z" fill="#5a7d3a" stroke="' + W + '" stroke-width="2"/><circle cx="260" cy="62" r="7" fill="#e9a41c"/>' +
      '<rect y="190" width="400" height="70" fill="#c98b5b"/><path d="M0 190 H400" stroke="' + W + '" stroke-width="3"/><rect x="40" y="160" width="130" height="34" rx="6" fill="#8a3c6e" stroke="' + W + '" stroke-width="3"/>',
    plain: '<rect width="400" height="260" fill="#f3dfc1"/><path d="M0 60 A50 50 0 0 1 100 60 A50 50 0 0 1 200 60 A50 50 0 0 1 300 60 A50 50 0 0 1 400 60" fill="none" stroke="#e9a41c" stroke-width="6"/><path d="M0 100 H400" stroke="#ebd6bc" stroke-width="3"/><rect y="190" width="400" height="70" fill="#d9b27a"/><path d="M0 190 H400" stroke="' + W + '" stroke-width="3"/>'
  };
  const sceneSvg = (k) => '<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true">' + (SCENES[k] || SCENES.plain) + '</svg>';

  /* Scène complète (décor + 2 personnages) : speaking = 0 (gauche), 1 (droite) ou -1 (personne) */
  function stage(sceneKey, cast, speaking) {
    const el = document.createElement('div'); el.className = 'stageArt';
    el.innerHTML = '<div class="art" aria-hidden="true">' + sceneSvg(sceneKey) + '</div>' +
      cast.slice(0, 2).map((c, i) => '<div class="fig ' + (i ? 'right' : 'left') + (i === speaking ? ' talk' : '') + '">' + figure(c || 0, i === speaking) + '</div>').join('');
    return el;
  }

  /* ───────── analyse des dialogues ───────── */
  function parseLine(l) {
    const parts = []; let last = 0; const re = /\{\{([^}]+)\}\}/g; let m;
    while ((m = re.exec(l.t))) {
      parts.push(l.t.slice(last, m.index));
      const seg = m[1].split('::');
      parts.push({ answers: seg[0].split('|'), fr: seg[1] || seg[0].split('|')[0], dis: seg[2] ? seg[2].split('|') : [] });
      last = m.index + m[0].length;
    }
    parts.push(l.t.slice(last));
    return { who: l.who, fr: l.fr || '', parts };
  }
  const plain = (pl) => pl.parts.map((p) => (typeof p === 'string' ? p : p.answers[0])).join('');
  function seedOf(id) { let s = 0; for (let i = 0; i < id.length; i++) s += id.charCodeAt(i); return s; }

  function buildPanel(U, u, d, line, castIdx, content) {
    const { h } = U;
    const speakerIdx = castIdx.indexOf(line.who);
    const seed = seedOf(u.id);
    const sideOf = (i) => (i % 2 === 0 ? 'left' : 'right');
    const figs = castIdx.slice(0, 2).map((who, i) => h('div', { class: 'fig ' + sideOf(i) + (i === speakerIdx ? ' talk' : ''), html: figure(seed + i * 2 + (i ? 1 : 0), i === speakerIdx) }));
    const side = sideOf(Math.min(speakerIdx, 1) === 0 && speakerIdx === 0 ? 0 : speakerIdx % 2);
    return h('div', { class: 'panel' }, h('div', { class: 'art', html: sceneSvg(u.scene) }), figs,
      h('div', { class: 'bubble ' + side }, h('span', { class: 'who' }, line.who), content));
  }
  const castOf = (d) => Array.from(new Set(d.lines.map((l) => l.who)));

  /* ───────── lecture ───────── */
  function read(U, u) {
    const { h } = U;
    const root = h('div', { class: 'stack' });
    (u.dialogues || []).forEach((d) => {
      const cast = castOf(d);
      const strip = h('div', { class: 'strip' }, d.lines.map((raw) => {
        const line = parseLine(raw); const text = plain(line);
        const fr = line.fr ? h('p', { class: 'bfr', hidden: true }, line.fr) : null;
        const content = h('div', {}, h('p', { class: 'btext' }, text), fr,
          h('span', { class: 'btools' }, U.sndBtn(text), fr ? h('button', { class: 'snd', type: 'button', 'aria-label': 'Afficher la traduction', title: 'Traduction', onclick: () => { fr.hidden = !fr.hidden; } }, 'FR') : null));
        return buildPanel(U, u, d, line, cast, content);
      }));
      root.append(h('h3', {}, d.title), strip);
    });
    root.append(h('p', { class: 'note' }, 'Touche « FR » dans une bulle pour voir la traduction, ou 🔊 pour l’écouter.'));
    return root;
  }

  /* ───────── BD à compléter (QCM dans les bulles) ───────── */
  const NUDGE = ['¡Casi ! Essaie une autre option.', 'Pas encore, tu y es presque.', '¡Ánimo ! Relis la phrase pour trouver le sens.'];
  function complete(U, u, opts) {
    opts = opts || {};
    const { h, S, shuffle, pick } = U;
    const pool = [];
    (u.dialogues || []).forEach((d) => d.lines.forEach((l) => parseLine(l).parts.forEach((p) => { if (typeof p !== 'string') pool.push(p.answers[0]); })));
    const root = h('div', { class: 'stack' });
    const status = h('p', { class: 'note', role: 'status', 'aria-live': 'polite' });
    const outro = h('div', {});
    let total = 0, solved = 0, first = 0, helped = 0;
    const dlgLeft = {};
    const plan = (u.dialogues || []).map((d) => d.lines.map(parseLine));
    plan.forEach((lines, di) => lines.forEach((l) => l.parts.forEach((p) => { if (typeof p !== 'string') { total++; dlgLeft[di] = (dlgLeft[di] || 0) + 1; } })));
    const refresh = () => { status.textContent = solved + ' / ' + total + ' bulles complétées'; };

    plan.forEach((lines, di) => {
      const d = u.dialogues[di]; const cast = castOf(d);
      const strip = h('div', { class: 'strip' }, lines.map((line, li) => {
        const slots = []; const rows = [];
        const content = h('div', {}); const p = h('p', { class: 'btext' }); content.append(p);
        let bi = 0;
        line.parts.forEach((part) => {
          if (typeof part === 'string') { p.append(part); return; }
          const blank = part; const bKey = U.key(u, 'd' + di + 'b' + li + '_' + (bi++));
          const slot = h('span', { class: 'slot' }, '______'); p.append(slot);
          const others = shuffle(pool.filter((a) => a !== blank.answers[0] && blank.answers.indexOf(a) < 0));
          const dis = (blank.dis.length >= 2 ? blank.dis : blank.dis.concat(others)).slice(0, 2);
          const opts = shuffle([blank.answers[0]].concat(dis));
          const msg = h('span', { class: 'qmsg', role: 'status' });
          let attempts = 0;
          const row = h('div', { class: 'qrow' }, h('span', { class: 'qhint' }, 'Sens : ' + blank.fr), h('span', { class: 'qopts' }, opts.map((o) => {
            const b = h('button', { class: 'qopt', type: 'button', onclick: () => {
              attempts++;
              if (o === blank.answers[0]) {
                slot.textContent = o; slot.classList.add('done'); row.classList.add('solved'); [].forEach.call(row.querySelectorAll('button'), (x) => { x.disabled = true; });
                msg.textContent = attempts === 1 ? '¡Muy bien !' : 'Tu l’as eu !';
                if (attempts === 1) first++; else helped++;
                if (attempts > 1 && !opts.embedded) S.release(bKey);
                solved++; dlgLeft[di]--;
                if (dlgLeft[di] === 0 && !opts.embedded) S.master(u.id, U.key(u, 'd' + di));
                refresh(); if (!opts.embedded) U.updateExploreCount();
                if (solved === total) finish();
              } else {
                b.classList.add('again'); b.disabled = true; msg.textContent = pick(NUDGE);
                if (attempts === 1 && !opts.embedded) {
                  const q = line.parts.map((x) => (typeof x === 'string' ? x : x === blank ? '___' : x.answers[0])).join('');
                  S.miss(bKey, { unitId: u.id, unit: u.title, q: q, a: blank.answers[0] }); U.updateExploreCount();
                }
              }
            } }, o);
            return b;
          })), msg);
          rows.push(row); slots.push(slot);
        });
        content.append(h('div', { class: 'qrows' }, rows));
        return buildPanel(U, u, d, line, cast, content);
      }));
      root.append(h('h3', {}, d.title), strip);
    });
    function finish() {
      if (opts.embedded) { if (opts.onComplete) opts.onComplete({ first, helped }); return; }
      outro.append(h('div', { class: 'card stack' }, h('h2', {}, '¡Bien hecho !'),
        h('p', {}, first + ' bulle' + (first > 1 ? 's' : '') + ' trouvée' + (first > 1 ? 's' : '') + ' du premier coup, ' + helped + ' avec un petit coup de pouce. Chaque essai fait avancer.'),
        h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => U.go({ v: 'bdquiz', id: u.id }) }, 'Refaire la BD'),
          h('button', { class: 'btn', type: 'button', onclick: () => U.go({ v: 'unit', id: u.id }) }, 'Retour à la leçon'))));
      outro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    refresh();
    root.append(status, outro);
    return root;
  }

  g.ESP = g.ESP || {};
  g.ESP.Comic = { read, complete, stage, figure, sceneSvg };
})(window);
