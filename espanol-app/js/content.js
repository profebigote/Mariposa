/* CONTENUS — c'est le seul fichier à modifier pour alimenter l'application.
   Les contenus ci-dessous sont des EXEMPLES à relire et à adapter.

   Structure d'une unité (leçon) :
     id, cat, title, level, blurb
     blocks    : [{ q: "Question guide ?", a: "<p>réponse en HTML</p>" }]
     items     : [{ es, fr, alt:[autres réponses ES], sig:true si l'accent change le mot, note }]
     exercises : QCM, trous, remise en ordre, écriture libre (voir exemples)
     dialogues : [{ title, lines:[{ who, t }] }] avec trous {{réponse|variante::traduction FR}}
     conj      : { tense, verbs:[...] } -> exercices de conjugaison générés
     test      : true -> « test blanc » de 10 mots proposé
*/
window.ESP = window.ESP || {};

window.ESP.C = {
  categories: [
    { id: 'situaciones', title: 'Situations', desc: 'S’entraîner pour une situation réelle : voyage, restaurant, entretien, rencontre…' },
    { id: 'gramatica', title: 'Grammaire', desc: 'Les règles, les exemples, les pièges.' },
    { id: 'conjugacion', title: 'Conjugaison et temps', desc: 'Les formes, les irréguliers, choisir le bon temps.' },
    { id: 'vocabulario', title: 'Vocabulaire', desc: 'Par thèmes : aliments, sport, nature, voyage, expressions…' },
    { id: 'cultura', title: 'Culture', desc: 'Personnalités, pays, fêtes, art. (bientôt)' },
    { id: 'metodos', title: 'Méthodes', desc: 'Compréhension, expression, traduction. (bientôt)' },
    { id: 'clase', title: 'En classe', desc: 'Les listes de lexique des séquences, avec test blanc de 10 mots.' }
  ],

  /* Règles : écrites une seule fois, réutilisées dans les retours après une erreur. */
  rules: {
    ser_estar: {
      title: 'Ser ou estar ?',
      text: '<b>Ser</b> : identité, origine, profession, caractère, heure. <b>Estar</b> : lieu, état du moment, résultat d’une action, gérondif.',
      example: 'Soy profesora. · Estoy cansada. · Madrid está en España.'
    },
    accent_sig: {
      title: 'Parfois, l’accent change le mot',
      text: 'Un accent peut transformer un mot ou un temps : il faut le mettre.',
      example: 'esta (cette) ≠ está (il est) · si (si) ≠ sí (oui) · canto (je chante) ≠ cantó (il a chanté)'
    },
    usted: {
      title: 'Tutoyer ou vouvoyer ?',
      text: 'Avec un inconnu, une personne plus âgée ou en contexte professionnel, on emploie <b>usted</b> (verbe à la 3e personne). Entre jeunes ou amis : <b>tú</b>.',
      example: '¿Podría ayudarme, por favor? · ¿Puedes ayudarme?'
    },
    cortesia: {
      title: 'Adoucir une demande',
      text: 'Pour demander poliment, on emploie le conditionnel : <b>podría…</b>, <b>quisiera…</b>, <b>me gustaría…</b>. L’impératif seul paraît trop direct.',
      example: 'Quisiera una mesa para dos. · ¿Podría traerme la cuenta?'
    },
    irregular: {
      title: 'Verbes irréguliers au présent',
      text: 'Beaucoup de verbes très fréquents ne suivent pas le modèle régulier : une ou plusieurs personnes changent. Il faut les connaître par cœur.',
      example: 'saber → yo sé · tener → yo tengo · ir → voy, vas, va…'
    },
    diptongo: {
      title: 'Les diphtongues (e→ie, o→ue)',
      text: 'Pour certains verbes, la voyelle du radical change quand elle est accentuée : à toutes les personnes sauf nosotros et vosotros.',
      example: 'querer → quiero, quieres, quiere, queremos, queréis, quieren'
    }
  },

  /* Verbes pour les exercices de conjugaison générés (présent). */
  verbs: {
    ser:    { fr: 'être : identité, origine', forms: ['soy', 'eres', 'es', 'somos', 'sois', 'son'], noRegular: true, rule: 'irregular' },
    estar:  { fr: 'être : lieu, état', forms: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'], rule: 'irregular', sig: ['estás', 'está'] },
    tener:  { fr: 'avoir', forms: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'], rule: 'irregular' },
    ir:     { fr: 'aller', forms: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'], noRegular: true, rule: 'irregular' },
    hacer:  { fr: 'faire', forms: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'], rule: 'irregular' },
    saber:  { fr: 'savoir', forms: ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'], rule: 'irregular', sig: ['sé'] },
    poder:  { fr: 'pouvoir', forms: ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'], rule: 'diptongo' },
    querer: { fr: 'vouloir', forms: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'], rule: 'diptongo' }
  },
  pronouns: ['yo', 'tú', 'él / ella', 'nosotros', 'vosotros', 'ellos / ellas'],

  units: [
    /* ───────────────────────── SITUATIONS ───────────────────────── */
    {
      id: 's-aeropuerto', cat: 'situaciones', scene: 'airport', test: true, icon: '✈️', title: 'En el aeropuerto', level: 'A2',
      blurb: 'Enregistrement, porte d’embarquement, vol annulé, bagages perdus.',
      blocks: [
        { q: 'Quand l’utilise-t-on ?', a: '<p>À l’enregistrement, au contrôle des passeports, à la porte d’embarquement et en cas de problème (retard, annulation, bagage perdu).</p>' },
        { q: 'Quelles formules retenir ?', a: '<p>Pour demander : <b>Quisiera…</b> (je voudrais), <b>¿Podría…?</b> (pourriez-vous…). Pour signaler un problème : <b>He perdido…</b> (j’ai perdu), <b>Ha sido cancelado</b> (il a été annulé).</p>' },
        { q: 'Un piège ?', a: '<p>On dit <b>el pasaporte</b>, <b>el equipaje</b> (toujours au singulier : « les bagages »), <b>la puerta de embarque</b>.</p>' }
      ],
      items: [
        { es: '¿Dónde está la puerta de embarque?', fr: 'Où est la porte d’embarquement ?' },
        { es: 'Quisiera facturar una maleta.', fr: 'Je voudrais enregistrer une valise.' },
        { es: '¿A qué hora sale el vuelo?', fr: 'À quelle heure part le vol ?' },
        { es: 'Mi vuelo ha sido cancelado.', fr: 'Mon vol a été annulé.' },
        { es: '¿Puedo ver su pasaporte, por favor?', fr: 'Puis-je voir votre passeport, s’il vous plaît ?' },
        { es: 'Prefiero un asiento de pasillo.', fr: 'Je préfère un siège côté couloir.' },
        { es: 'He perdido mi equipaje.', fr: 'J’ai perdu mes bagages.' }
      ],
      exercises: [
        { type: 'qcm', prompt: 'Au comptoir, tu veux enregistrer ta valise. Que dis-tu ?',
          options: [
            { t: 'Quisiera facturar una maleta.' },
            { t: 'Facturo una maleta ahora.', why: 'Cette phrase est correcte, mais elle manque de politesse pour une demande : on préfère le conditionnel.' },
            { t: 'Quiero maleta facturar.', why: 'L’ordre des mots n’est pas bon : on dit « facturar una maleta ».' }
          ], answer: 0, rule: 'cortesia' },
        { type: 'qcm', prompt: 'Ton vol est annulé. Tu l’annonces à l’agent :',
          options: [
            { t: 'Mi vuelo ha sido cancelado.' },
            { t: 'Mi vuelo está cancelar.', why: 'Après « estar », on ne met pas l’infinitif : on dit « ha sido cancelado » ou « está cancelado ».' },
            { t: 'Mi vuelo cancela.', why: 'Le sujet « vuelo » ne fait pas l’action : le vol subit l’annulation, d’où « ha sido cancelado ».' }
          ], answer: 0 },
        { type: 'fill', prompt: 'He ___ mi equipaje. (perder, participe passé)', answers: ['perdido'], rule: null },
        { type: 'order', fr: 'Où est la porte d’embarquement ?', words: ['¿Dónde', 'está', 'la', 'puerta', 'de', 'embarque?'] },
        { type: 'free', prompt: 'Ton bagage n’est pas arrivé. Explique la situation à l’agent de la compagnie en 2 ou 3 phrases.',
          model: 'Buenos días. Mi maleta no ha llegado. Venía en el vuelo de París y es una maleta azul. ¿Podría ayudarme, por favor?',
          checklist: ['J’ai salué poliment.', 'J’ai décrit le problème (maleta, vuelo…).', 'J’ai utilisé « usted » ou le conditionnel pour demander.'] }
      ],
      dialogues: [
        { title: 'Au comptoir d’enregistrement', lines: [
          { who: 'Agente', t: 'Buenos días. ¿Puedo ver su {{pasaporte::passeport::billete|equipaje}}, por favor?', fr: 'Bonjour. Puis-je voir votre passeport, s’il vous plaît ?' },
          { who: 'Viajero', t: 'Aquí tiene. {{Quisiera|Querría::je voudrais::Estoy|Hay}} facturar una maleta.', fr: 'Voici. Je voudrais enregistrer une valise.' },
          { who: 'Agente', t: '¿Prefiere un asiento de ventana o de {{pasillo::couloir::puerta|maleta}}?', fr: 'Préférez-vous un siège côté fenêtre ou côté couloir ?' },
          { who: 'Viajero', t: 'De ventana, por favor.', fr: 'Côté fenêtre, s’il vous plaît.' }
        ] }
      ]
    },

    {
      id: 's-restaurante', cat: 'situaciones', scene: 'restaurant', test: true, icon: '🍽️', title: 'En el restaurante', level: 'A2',
      blurb: 'Réserver, commander, signaler une allergie, demander l’addition.',
      blocks: [
        { q: 'Quand l’utilise-t-on ?', a: '<p>À l’entrée du restaurant, pour commander, pour signaler un besoin particulier et pour payer.</p>' },
        { q: 'Comment demander poliment ?', a: '<p>Avec <b>quisiera</b>, <b>me gustaría</b> ou <b>¿Podría traerme… ?</b>. Pour commander, on dit aussi simplement <b>Para mí, …</b> (pour moi, …).</p>' },
        { q: 'Un piège ?', a: '<p><b>La cuenta</b> = l’addition (pas « el compte »). <b>Un menú del día</b> = un menu à prix fixe, très courant en Espagne.</p>' }
      ],
      items: [
        { es: 'Una mesa para dos, por favor.', fr: 'Une table pour deux, s’il vous plaît.' },
        { es: '¿Qué me recomienda?', fr: 'Que me conseillez-vous ?' },
        { es: 'Para mí, la paella.', fr: 'Pour moi, la paella.' },
        { es: 'Soy alérgico a los frutos secos.', fr: 'Je suis allergique aux fruits à coque.' },
        { es: '¿Está incluido el servicio?', fr: 'Le service est-il compris ?' },
        { es: 'La cuenta, por favor.', fr: 'L’addition, s’il vous plaît.' }
      ],
      exercises: [
        { type: 'qcm', prompt: 'Tu veux l’addition. Que dis-tu au serveur ?',
          options: [
            { t: 'La cuenta, por favor.' },
            { t: 'El precio, por favor.', why: 'Compréhensible, mais ce n’est pas la formule habituelle : au restaurant, on demande « la cuenta ».' },
            { t: 'Paga ahora.', why: 'C’est un ordre et il paraît très impoli.' }
          ], answer: 0, rule: 'cortesia' },
        { type: 'qcm', prompt: 'Tu veux savoir ce que le serveur conseille. Tu lui dis (vouvoiement) :',
          options: [
            { t: '¿Qué me recomienda?' },
            { t: '¿Qué me recomiendas?', why: 'Ici, la forme « recomiendas » est un tutoiement. Avec un serveur, on emploie plutôt « usted » : « recomienda ».' }
          ], answer: 0, rule: 'usted' },
        { type: 'fill', prompt: '___ alérgico a los frutos secos. (je suis)', answers: ['soy'], wrong: { estoy: 'Pour une caractéristique permanente comme une allergie, on emploie « ser ».' }, rule: 'ser_estar' },
        { type: 'order', fr: 'Une table pour deux, s’il vous plaît.', words: ['Una', 'mesa', 'para', 'dos,', 'por', 'favor.'] },
        { type: 'free', prompt: 'Tu arrives au restaurant avec un ami. Demande une table, puis commande un plat et une boisson.',
          model: 'Buenas noches. Una mesa para dos, por favor. Para mí, la paella y un agua con gas.',
          checklist: ['J’ai demandé une table.', 'J’ai commandé un plat et une boisson.', 'J’ai dit « por favor ».'] }
      ],
      dialogues: [
        { title: 'Passer commande', lines: [
          { who: 'Camarero', t: 'Buenas tardes. ¿Qué van a {{tomar::prendre::ser|ir}}?', fr: 'Bonsoir. Que prendrez-vous ?' },
          { who: 'Cliente', t: '{{Para mí::pour moi::Con mí|Para yo}}, la paella. ¿Está incluido el {{servicio::service::cuenta|plato}}?', fr: 'Pour moi, la paella. Le service est-il compris ?' },
          { who: 'Camarero', t: 'Sí, está todo incluido.', fr: 'Oui, tout est compris.' },
          { who: 'Cliente', t: 'Perfecto. Y después, la {{cuenta::addition::carta|propina}}, por favor.', fr: 'Parfait. Et ensuite, l’addition, s’il vous plaît.' }
        ] }
      ]
    },

    {
      id: 's-entrevista', cat: 'situaciones', scene: 'office', test: true, icon: '💼', title: 'Entrevista de trabajo', level: 'B1',
      blurb: 'Se présenter, parler de son expérience, poser des questions sur le poste.',
      blocks: [
        { q: 'Quand l’utilise-t-on ?', a: '<p>Pour un entretien d’embauche, un stage ou une candidature, à l’oral comme à l’écrit.</p>' },
        { q: 'Quel registre ?', a: '<p>Toujours <b>usted</b> et un ton posé. On évite les expressions familières.</p>' },
        { q: 'Comment parler de soi ?', a: '<p><b>Tengo experiencia en…</b>, <b>Me considero…</b>, <b>Mi punto fuerte es…</b>. Pour la motivation : <b>Estoy muy motivado/a por…</b></p>' }
      ],
      items: [
        { es: 'Tengo experiencia en ventas.', fr: 'J’ai de l’expérience dans la vente.' },
        { es: 'Me considero una persona organizada.', fr: 'Je me considère comme une personne organisée.' },
        { es: 'Mi punto fuerte es el trabajo en equipo.', fr: 'Mon point fort est le travail en équipe.' },
        { es: 'Estoy muy motivado por este puesto.', fr: 'Je suis très motivé par ce poste.' },
        { es: '¿Cuáles son las condiciones del contrato?', fr: 'Quelles sont les conditions du contrat ?' },
        { es: 'Domino el francés y el inglés.', fr: 'Je maîtrise le français et l’anglais.' }
      ],
      exercises: [
        { type: 'qcm', prompt: 'On vous demande de parler de vous. Quelle phrase convient le mieux ?',
          options: [
            { t: 'Me considero una persona organizada y responsable.' },
            { t: 'Soy un tío muy majo.', why: '« Tío » et « majo » sont familiers : dans un entretien, on garde un registre soutenu.' },
            { t: 'No sé qué decir.', why: 'Cette phrase est correcte, mais ce n’est pas une bonne façon de se présenter à un recruteur.' }
          ], answer: 0 },
        { type: 'fill', prompt: 'Tengo ___ en ventas. (l’expérience)', answers: ['experiencia'], rule: null },
        { type: 'order', fr: 'Mon point fort est le travail en équipe.', words: ['Mi', 'punto', 'fuerte', 'es', 'el', 'trabajo', 'en', 'equipo.'] },
        { type: 'free', prompt: 'Présente-toi en 3 phrases pour un job d’été : qui tu es, une qualité, une expérience ou une compétence.',
          model: 'Me llamo Léa y tengo diecisiete años. Me considero una persona seria y organizada. He trabajado como animadora en un campamento de verano.',
          checklist: ['Je me suis présenté(e).', 'J’ai donné une qualité.', 'J’ai parlé d’une expérience ou d’une compétence.'] }
      ],
      dialogues: [
        { title: 'Pendant l’entretien', lines: [
          { who: 'Reclutadora', t: 'Cuénteme algo sobre usted. ¿Tiene {{experiencia::expérience::tiempo|empresa}} en ventas?', fr: 'Parlez-moi de vous. Avez-vous de l’expérience dans la vente ?' },
          { who: 'Candidato', t: 'Sí, y mi punto {{fuerte::fort::grande|alto}} es el trabajo en equipo.', fr: 'Oui, et mon point fort est le travail en équipe.' },
          { who: 'Reclutadora', t: '¿Por qué le interesa este {{puesto::poste::puerto|piso}}?', fr: 'Pourquoi ce poste vous intéresse-t-il ?' },
          { who: 'Candidato', t: 'Estoy muy {{motivado::motivé::motivación|motivar}} y me gustaría aprender más.', fr: 'Je suis très motivé et j’aimerais apprendre davantage.' }
        ] }
      ]
    },

    {
      id: 's-calle', cat: 'situaciones', scene: 'street', test: true, icon: '📷', title: 'En la calle: una foto', level: 'A2',
      blurb: 'Demander une photo à un inconnu, ou répondre à quelqu’un qui vous en demande une.',
      blocks: [
        { q: 'Quand l’utilise-t-on ?', a: '<p>En voyage, devant un monument : on aborde un inconnu pour qu’il prenne une photo, ou c’est lui qui vous demande ce service.</p>' },
        { q: 'Tutoyer ou vouvoyer ?', a: '<p>Avec un inconnu, on commence par <b>usted</b> : <b>Perdone, ¿podría hacerme una foto?</b> Entre jeunes, le tutoiement est possible, mais mieux vaut rester poli au début.</p>' },
        { q: 'Comment répondre ?', a: '<p>Accepter : <b>Claro, con mucho gusto.</b> Refuser poliment : <b>Lo siento, tengo prisa.</b> Remercier : <b>Gracias, es muy amable.</b></p>' }
      ],
      items: [
        { es: 'Perdone, ¿podría hacerme una foto?', fr: 'Excusez-moi, pourriez-vous me prendre en photo ?' },
        { es: 'Claro, con mucho gusto.', fr: 'Bien sûr, avec plaisir.' },
        { es: '¿Puede salir también el monumento?', fr: 'Pouvez-vous aussi mettre le monument sur la photo ?' },
        { es: 'Lo siento, tengo prisa.', fr: 'Désolé, je suis pressé.' },
        { es: 'Gracias, es muy amable.', fr: 'Merci, vous êtes très aimable.' },
        { es: 'Disculpe, ¿puedo hacerle una foto?', fr: 'Excusez-moi, puis-je vous prendre en photo ?' }
      ],
      exercises: [
        { type: 'qcm', prompt: 'Tu abordes un inconnu pour qu’il te prenne en photo. Quelle formule est la plus appropriée ?',
          options: [
            { t: 'Perdone, ¿podría hacerme una foto, por favor?' },
            { t: '¿Me haces una foto?', why: 'C’est du tutoiement, trop familier avec un inconnu.' },
            { t: 'Hazme una foto.', why: 'L’impératif seul sonne comme un ordre.' }
          ], answer: 0, rule: 'usted' },
        { type: 'qcm', prompt: 'Un touriste te demande de le prendre en photo, mais tu es pressé(e). Que réponds-tu ?',
          options: [
            { t: 'Lo siento, tengo prisa.' },
            { t: 'No.', why: 'Ce n’est pas faux, mais c’est très sec. Un « lo siento » adoucit le refus.' },
            { t: 'Soy prisa.', why: 'Pour exprimer « être pressé », on dit « tener prisa » (avoir hâte), jamais « ser prisa ».' }
          ], answer: 0 },
        { type: 'fill', prompt: 'Perdone, ¿___ hacerme una foto? (pourriez-vous)', answers: ['podría'], sig: true, rule: 'cortesia' },
        { type: 'order', fr: 'Merci, vous êtes très aimable.', words: ['Gracias,', 'es', 'muy', 'amable.'] },
        { type: 'free', prompt: 'Écris la scène en 3 répliques : tu demandes une photo devant un monument, la personne accepte, tu la remercies.',
          model: '— Perdone, ¿podría hacerme una foto, por favor? — Claro, con mucho gusto. ¿Quiere que salga también el monumento? — Sí, por favor. Gracias, es muy amable.',
          checklist: ['J’ai utilisé « usted » (ou le conditionnel).', 'La personne accepte.', 'J’ai remercié.'] }
      ],
      dialogues: [
        { title: 'Une photo devant la cathédrale', lines: [
          { who: 'Turista', t: 'Perdone, ¿{{podría::pourriez-vous::poder|podido}} hacerme una foto, por favor?', fr: 'Excusez-moi, pourriez-vous me prendre en photo, s’il vous plaît ?' },
          { who: 'Transeúnte', t: 'Claro, con mucho {{gusto::plaisir::gustar|gustos}}.', fr: 'Bien sûr, avec plaisir.' },
          { who: 'Turista', t: '¿Puede salir también la {{catedral::cathédrale::catedrático|cartera}}?', fr: 'Pouvez-vous aussi mettre la cathédrale sur la photo ?' },
          { who: 'Transeúnte', t: 'Sí, un momento… Ya está.', fr: 'Oui, un instant… Voilà, c’est fait.' },
          { who: 'Turista', t: 'Gracias, es muy {{amable::aimable::amarillo|alto}}.', fr: 'Merci, vous êtes très aimable.' }
        ] }
      ]
    },

    {
      id: 's-comercio', cat: 'situaciones', scene: 'shop', test: true, icon: '🤝', title: 'En el trabajo: comercio', level: 'B1',
      blurb: 'Devis, délais, remises, rendez-vous : le vocabulaire d’un échange commercial.',
      blocks: [
        { q: 'Quand l’utilise-t-on ?', a: '<p>Dans un échange avec un client ou un fournisseur : demande de devis, négociation, prise de rendez-vous, courriel professionnel.</p>' },
        { q: 'Quel registre ?', a: '<p>Formel : <b>usted</b>, futur et conditionnel de politesse (<b>le enviaré…</b>, <b>quisiera…</b>).</p>' },
        { q: 'Un piège ?', a: '<p><b>El plazo</b> = le délai (pas « el plazo » au sens de place). <b>La factura</b> = la facture ; <b>el presupuesto</b> = le devis (et aussi « le budget »).</p>' }
      ],
      items: [
        { es: 'Le enviaré el presupuesto por correo electrónico.', fr: 'Je vous enverrai le devis par e-mail.' },
        { es: '¿Cuál es el plazo de entrega?', fr: 'Quel est le délai de livraison ?' },
        { es: 'Podemos hacerle un descuento del diez por ciento.', fr: 'Nous pouvons vous faire une remise de dix pour cent.' },
        { es: 'Quedamos el martes a las diez para la reunión.', fr: 'Rendez-vous mardi à dix heures pour la réunion.' },
        { es: 'Adjunto la factura.', fr: 'Je joins la facture.' },
        { es: 'Quisiera concertar una cita.', fr: 'Je voudrais prendre rendez-vous.' }
      ],
      exercises: [
        { type: 'qcm', prompt: 'Tu veux savoir quand la marchandise sera livrée. Que demandes-tu ?',
          options: [
            { t: '¿Cuál es el plazo de entrega?' },
            { t: '¿Cuándo es el plazo de entrega?', why: 'On ne dit pas « cuándo es » pour un délai : on demande « cuál es » (quel est).' },
            { t: '¿Qué es entrega?', why: 'Cette phrase demande ce qu’est une livraison, pas quand elle arrive.' }
          ], answer: 0 },
        { type: 'fill', prompt: 'Le ___ el presupuesto por correo electrónico. (je vous enverrai)', answers: ['enviaré'], sig: true, rule: 'accent_sig' },
        { type: 'order', fr: 'Je joins la facture.', words: ['Adjunto', 'la', 'factura.'] },
        { type: 'free', prompt: 'Écris un court message à un client : tu t’excuses du retard de livraison et tu proposes une remise.',
          model: 'Estimado cliente: lamentamos el retraso en la entrega. Para compensarle, podemos hacerle un descuento del diez por ciento en su próximo pedido. Quedamos a su disposición.',
          checklist: ['J’ai utilisé le vouvoiement.', 'Je me suis excusé(e).', 'J’ai proposé une solution.'] }
      ],
      dialogues: [
        { title: 'Au téléphone avec un client', lines: [
          { who: 'Cliente', t: 'Buenos días. ¿Cuál es el {{plazo::délai::plaza|plato}} de entrega?', fr: 'Bonjour. Quel est le délai de livraison ?' },
          { who: 'Vendedor', t: 'Una semana. Y le {{enviaré::j’enverrai::envié|enviando}} el presupuesto hoy mismo.', fr: 'Une semaine. Et je vous enverrai le devis dès aujourd’hui.' },
          { who: 'Cliente', t: '¿Pueden hacerme un {{descuento::remise::descubrimiento|desayuno}}?', fr: 'Pouvez-vous me faire une remise ?' },
          { who: 'Vendedor', t: 'Sí, del diez por ciento. Adjunto la {{factura::facture::fábrica|ficha}} mañana.', fr: 'Oui, de dix pour cent. Je joins la facture demain.' }
        ] }
      ]
    },

    /* ───────────────────────── GRAMMAIRE ───────────────────────── */
    {
      id: 'g-ser-estar', cat: 'gramatica', title: 'Ser et estar', level: 'A2',
      blurb: 'Deux verbes « être » : savoir lequel choisir.',
      blocks: [
        { q: 'Quand utilise-t-on SER ?', a: '<p>Pour dire <b>ce que l’on est</b> : identité, origine, profession, caractère, matière, heure et date.</p>' },
        { q: 'Quand utilise-t-on ESTAR ?', a: '<p>Pour dire <b>où l’on est</b> et <b>comment on est en ce moment</b> : lieu, état passager, résultat d’une action. Aussi pour le gérondif : <i>estoy comiendo</i>.</p>' },
        { q: 'Un exemple en contexte ?', a: '<p><b>Soy</b> francesa, pero ahora <b>estoy</b> en Sevilla. Hoy <b>estoy</b> cansada porque <b>es</b> un día muy largo.</p>' },
        { q: 'Avec quoi ne pas le confondre ?', a: '<p>Certains adjectifs changent de sens : <i>ser aburrido</i> (être ennuyeux) ≠ <i>estar aburrido</i> (s’ennuyer) ; <i>ser listo</i> (être malin) ≠ <i>estar listo</i> (être prêt).</p>' }
      ],
      items: [
        { es: 'ser aburrido', fr: 'être ennuyeux' },
        { es: 'estar aburrido', fr: 's’ennuyer' },
        { es: 'ser listo', fr: 'être malin' },
        { es: 'estar listo', fr: 'être prêt' }
      ],
      exercises: [
        { type: 'qcm', prompt: 'Elle ___ profesora de español.', options: [
          { t: 'es' }, { t: 'está', why: 'La profession se dit avec « ser » : c’est ce qu’elle est, pas un état passager.' }], answer: 0, rule: 'ser_estar' },
        { type: 'qcm', prompt: 'Madrid ___ en el centro de España.', options: [
          { t: 'es', why: 'Pour situer un lieu, on emploie « estar ».' }, { t: 'está' }], answer: 1, rule: 'ser_estar' },
        { type: 'qcm', prompt: 'Hoy ___ muy cansado.', options: [
          { t: 'soy', why: 'La fatigue est un état du moment : on emploie « estar ».' }, { t: 'estoy' }], answer: 1, rule: 'ser_estar' },
        { type: 'fill', prompt: 'La reunión ___ a las diez. (c’est une heure)', answers: ['es'], wrong: { está: 'Pour donner l’heure, on emploie « ser ».' }, rule: 'ser_estar' },
        { type: 'fill', prompt: 'Mis padres ___ de Lyon. (origine)', answers: ['son'], wrong: { están: 'L’origine se dit avec « ser » : « son de Lyon ».' }, rule: 'ser_estar' },
        { type: 'order', fr: 'Aujourd’hui, je suis fatigué.', words: ['Hoy', 'estoy', 'cansado.'] }
      ]
    },

    /* ───────────────────────── CONJUGAISON ───────────────────────── */
    {
      id: 'c-presente-irr', cat: 'conjugacion', title: 'Présent : verbes irréguliers fréquents', level: 'A2',
      blurb: 'ser, estar, tener, ir, hacer, saber, poder, querer.',
      blocks: [
        { q: 'Quand l’emploie-t-on ?', a: '<p>Pour une action en cours, une habitude, une vérité générale, et souvent pour un futur proche. Mots-signaux : <i>ahora, hoy, siempre, todos los días</i>.</p>' },
        { q: 'Comment ça marche ? (verbes réguliers)', a: '<p>On enlève <b>-ar / -er / -ir</b> et on ajoute les terminaisons : <b>-o, -as, -a, -amos, -áis, -an</b> (-ar) ; <b>-o, -es, -e, -emos, -éis, -en</b> (-er) ; <b>-o, -es, -e, -imos, -ís, -en</b> (-ir).</p>' },
        { q: 'Quels sont les irréguliers ?', a: '<p><b>ser</b> : soy, eres, es, somos, sois, son<br><b>estar</b> : estoy, estás, está, estamos, estáis, están<br><b>tener</b> : tengo, tienes, tiene, tenemos, tenéis, tienen<br><b>ir</b> : voy, vas, va, vamos, vais, van<br><b>hacer</b> : hago, haces, hace…<br><b>saber</b> : sé, sabes, sabe…<br><b>poder</b> : puedo, puedes, puede, podemos, podéis, pueden<br><b>querer</b> : quiero, quieres, quiere, queremos, queréis, quieren</p>' },
        { q: 'Un exemple en contexte ?', a: '<p>—¿<b>Quieres</b> venir al cine? —No <b>puedo</b>: <b>tengo</b> que estudiar y mañana <b>voy</b> al médico.</p>' }
      ],
      conj: { tense: 'Présent', verbs: ['ser', 'estar', 'tener', 'ir', 'hacer', 'saber', 'poder', 'querer'] }
    },

    /* ───────────────────────── VOCABULAIRE ───────────────────────── */
    {
      id: 'v-alimentos', cat: 'vocabulario', title: 'Los alimentos', level: 'A1',
      blurb: 'Fruits, légumes, viandes, produits de base.',
      blocks: [
        { q: 'Un exemple en contexte ?', a: '<p>Para el desayuno, tomo <b>pan</b> con <b>queso</b> y una <b>manzana</b>. Para cenar, suelo comer <b>pescado</b> con <b>verduras</b>.</p>' },
        { q: 'Un piège ?', a: '<p><b>El pan</b> (masc.), <b>la leche</b> (fém.), <b>el queso</b>, <b>la carne</b>. Attention : <b>la ensalada</b> mais <b>el tomate</b>.</p>' }
      ],
      test: true,
      items: [
        { es: 'el pan', fr: 'le pain' }, { es: 'el queso', fr: 'le fromage' }, { es: 'la leche', fr: 'le lait' },
        { es: 'el pescado', fr: 'le poisson' }, { es: 'la carne', fr: 'la viande' }, { es: 'la manzana', fr: 'la pomme' },
        { es: 'el huevo', fr: 'l’œuf' }, { es: 'el arroz', fr: 'le riz' }, { es: 'la verdura', fr: 'le légume / les légumes' },
        { es: 'el jamón', fr: 'le jambon' }, { es: 'la fresa', fr: 'la fraise' }, { es: 'el azúcar', fr: 'le sucre' }
      ],
      exercises: [
        { type: 'qcm', prompt: 'Comment dit-on « le lait » ?', options: [{ t: 'la leche' }, { t: 'el leche', why: '« Leche » est féminin : on dit « la leche ».' }, { t: 'la lechuga', why: '« Lechuga » est la laitue, pas le lait.' }], answer: 0 },
        { type: 'fill', prompt: 'Para desayunar, tomo ___ con mantequilla. (du pain)', answers: ['pan'], rule: null }
      ]
    },

    {
      id: 'v-expresiones-1', cat: 'vocabulario', title: 'Expresiones idiomáticas 1', level: 'B1',
      blurb: 'Cinq expressions courantes pour parler comme un Espagnol.',
      blocks: [
        { q: 'Que signifient-elles ?', a: '<p>Ce sont des expressions imagées dont le sens ne se devine pas mot à mot. Il faut les employer telles quelles.</p>' },
        { q: 'Dans quelle situation les utilise-t-on ?', a: '<p>À l’oral, entre amis ou en famille : registre familier. On les évite dans un courrier officiel.</p>' }
      ],
      test: true,
      items: [
        { es: 'estar en las nubes', fr: 'être dans la lune', note: 'Être distrait, pas concentré.' },
        { es: 'ser pan comido', fr: 'être du gâteau', note: 'Être très facile.' },
        { es: 'tomar el pelo', fr: 'se moquer de quelqu’un', note: 'Aussi : faire marcher quelqu’un.' },
        { es: 'costar un ojo de la cara', fr: 'coûter les yeux de la tête', note: 'Être très cher.' },
        { es: 'meter la pata', fr: 'faire une gaffe', note: 'Dire ou faire quelque chose d’inapproprié.' }
      ],
      exercises: [
        { type: 'qcm', prompt: '« Este examen es pan comido. » Cela veut dire :', options: [
          { t: 'Cet examen est très facile.' }, { t: 'Cet examen est très long.', why: 'Non : « ser pan comido » signifie que quelque chose est très facile.' }], answer: 0 },
        { type: 'fill', prompt: 'Ese móvil cuesta un ___ de la cara. (un œil)', answers: ['ojo'], rule: null }
      ]
    },

    /* ───────────────────────── EN CLASSE ───────────────────────── */
    {
      id: 'k-personalidades-1', cat: 'clase', scene: 'plain', title: 'Personalidades hispánicas 1', level: 'Séquence',
      blurb: 'Exemple de liste de classe : à remplacer par tes propres encadrés de lexique.',
      test: true,
      blocks: [
        { q: 'Que dois-je retenir ?', a: '<p>La liste ci-dessous reprend le lexique de la séquence. Entraîne-toi d’abord dans le sens espagnol → français, puis français → espagnol, puis dans les mini-dialogues.</p>' }
      ],
      items: [
        { es: 'el pintor', fr: 'le peintre', alt: ['la pintora'] },
        { es: 'el autorretrato', fr: 'l’autoportrait' },
        { es: 'surrealista', fr: 'surréaliste' },
        { es: 'el escritor', fr: 'l’écrivain', alt: ['la escritora'] },
        { es: 'el premio Nobel', fr: 'le prix Nobel' },
        { es: 'me suena', fr: 'ça me dit quelque chose' },
        { es: 'ni idea', fr: 'aucune idée' },
        { es: 'nacer', fr: 'naître' },
        { es: 'fallecer', fr: 'décéder' },
        { es: 'la obra', fr: 'l’œuvre' },
        { es: 'el bigote', fr: 'la moustache' },
        { es: 'las cejas', fr: 'les sourcils' }
      ],
      dialogues: [
        { title: 'Borges', lines: [
          { who: 'A', t: '—¿Conoces a Borges?', fr: 'Tu connais Borges ?' },
          { who: 'B', t: '—{{Ni idea::aucune idée::Ni nada|Sin idea}}, pero {{me suena::ça me dit quelque chose::me suele|me sueña}}.', fr: 'Aucune idée, mais ça me dit quelque chose.' },
          { who: 'A', t: '—Era un {{escritor::écrivain::escultor|escuchador}} argentino. Escribió muchas {{obras::œuvres::obreras|ovejas}}, pero nunca ganó el {{premio Nobel::prix Nobel::precio Nobel|primo Nobel}}.', fr: 'C’était un écrivain argentin. Il a écrit beaucoup d’œuvres, mais n’a jamais reçu le prix Nobel.' }
        ] },
        { title: 'Frida y Dalí', lines: [
          { who: 'A', t: '—Frida Kahlo es una {{pintora::peintre::pintada|pintura}} mexicana muy famosa por su {{autorretrato::autoportrait::autobús|autógrafo}} con las {{cejas::sourcils::orejas|cejillas}} unidas.', fr: 'Frida Kahlo est une peintre mexicaine très célèbre pour son autoportrait aux sourcils joints.' },
          { who: 'B', t: '—Y Dalí era {{surrealista::surréaliste::realista|surrealismo}}, con un {{bigote::moustache::boliche|bigotes}} muy original.', fr: 'Et Dalí était surréaliste, avec une moustache très originale.' }
        ] }
      ]
    }
  ]
};
