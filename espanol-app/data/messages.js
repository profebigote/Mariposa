/* Bibliothèque de messages (modifiable). Chaque message : key unique, kind, es, fr.
   Filtres facultatifs : activity (liste), errorKind (liste), level (liste).
   kinds :
     err1    première erreur (court, encourageant, suivi d'un indice)
     err2    erreur répétée (explication plus détaillée)
     err3    plusieurs erreurs (la solution expliquée est proposée)
     ok1     réussite du premier coup
     okAfter réussite après une ou plusieurs erreurs
     almost  presque juste (détail à corriger)
     mission fin de mission ; {skill} est remplacé par la compétence
     hint    indice générique, selon errorKind (utilisé si le module n'en fournit pas)
     explain explication générique, selon errorKind
     ui      libellés de boutons et d'étiquettes
   errorKind : situation, register, grammar, spelling, gender, meaning, order, missing, other */
window.ESP = window.ESP || {};
window.ESP.MESSAGES = [
  /* ───── première erreur ───── */
  { key: 'err1.situation', kind: 'err1', errorKind: ['situation', 'meaning'], es: '¡Casi! Fíjate en la situación.', fr: 'Presque ! Regarde bien la situation.' },
  { key: 'err1.generic.a', kind: 'err1', es: 'No pasa nada. Mira la pista y vuelve a intentarlo.', fr: 'Ce n’est pas grave. Regarde l’indice et réessaie.' },
  { key: 'err1.generic.b', kind: 'err1', es: '¡Casi! Prueba otra vez.', fr: 'Presque ! Essaie encore.' },
  { key: 'err1.generic.c', kind: 'err1', es: 'Todavía no, pero vas bien.', fr: 'Pas encore, mais tu es sur la bonne voie.' },
  { key: 'err1.register', kind: 'err1', errorKind: ['register'], es: 'Casi. ¿Con quién hablas? Piensa en el tono.', fr: 'Presque. À qui parles-tu ? Pense au ton à adopter.' },
  { key: 'err1.spelling', kind: 'err1', errorKind: ['spelling'], es: '¡Muy cerca! Revisa cómo se escribe.', fr: 'Très proche ! Vérifie l’orthographe.' },
  { key: 'err1.gender', kind: 'err1', errorKind: ['gender'], es: 'Casi. Fíjate en el género de la palabra.', fr: 'Presque. Regarde le genre du mot.' },
  { key: 'err1.order', kind: 'err1', activity: ['build', 'order'], es: 'Ya casi. Cambia el orden de alguna palabra.', fr: 'Presque. Change l’ordre de quelques mots.' },
  { key: 'err1.missing', kind: 'err1', errorKind: ['missing'], es: 'Falta algo. Vuelve a leer la consigna.', fr: 'Il manque quelque chose. Relis la consigne.' },
  { key: 'err1.match', kind: 'err1', activity: ['match', 'classify'], es: 'Algún par no encaja. Mira otra vez.', fr: 'Une association ne convient pas. Regarde encore.' },

  /* ───── erreur répétée : explication ───── */
  { key: 'err2.a', kind: 'err2', es: 'Parece que esto cuesta un poquito. Vamos a verlo de otra manera.', fr: 'Cela semble un peu difficile. Regardons-le autrement.' },
  { key: 'err2.b', kind: 'err2', es: 'Tranquilo/a, es normal. Mira esta explicación.', fr: 'Pas de souci, c’est normal. Lis cette explication.' },
  { key: 'err2.grammar', kind: 'err2', errorKind: ['grammar'], es: 'Esta estructura es difícil al principio. Mira cómo funciona.', fr: 'Cette structure est difficile au début. Regarde comment elle fonctionne.' },
  { key: 'err2.register', kind: 'err2', errorKind: ['register'], es: 'El tono importa mucho aquí. Mira la diferencia.', fr: 'Le ton compte beaucoup ici. Regarde la différence.' },

  /* ───── plusieurs erreurs : la solution est proposée ───── */
  { key: 'err3.a', kind: 'err3', es: 'Ya has probado varias veces: ¡eso cuenta! Puedes ver la solución explicada y seguir.', fr: 'Tu as déjà essayé plusieurs fois, et ça compte ! Tu peux voir la solution expliquée et continuer.' },
  { key: 'err3.b', kind: 'err3', es: '¡Ánimo! Mira la solución, léela con calma y sigue adelante.', fr: 'Courage ! Regarde la solution, lis-la tranquillement et avance.' },

  /* ───── réussite du premier coup (sobre) ───── */
  { key: 'ok1.a', kind: 'ok1', es: '¡Muy bien!', fr: 'Très bien !' },
  { key: 'ok1.b', kind: 'ok1', es: '¡Exacto!', fr: 'Exactement !' },
  { key: 'ok1.c', kind: 'ok1', es: 'Perfecto.', fr: 'Parfait.' },
  { key: 'ok1.d', kind: 'ok1', es: 'Eso es.', fr: 'C’est ça.' },
  { key: 'ok1.situation', kind: 'ok1', errorKind: ['situation'], es: '¡Exactamente! Esta frase funciona perfectamente aquí.', fr: 'Exactement ! Cette phrase convient parfaitement ici.' },
  { key: 'ok1.register', kind: 'ok1', errorKind: ['register'], es: '¡Muy bien! Ese tono es el adecuado.', fr: 'Très bien ! C’est le bon ton.' },

  /* ───── réussite après erreur(s) : on valorise le raisonnement ───── */
  { key: 'okAfter.a', kind: 'okAfter', es: '¡Ahora sí!', fr: 'Cette fois, c’est ça !' },
  { key: 'okAfter.b', kind: 'okAfter', es: '¡Lo has conseguido!', fr: 'Tu y es arrivé(e) !' },
  { key: 'okAfter.c', kind: 'okAfter', es: '¡Eso! Has encontrado la respuesta tú solo/a.', fr: 'Voilà ! Tu as trouvé la réponse par toi-même.' },
  { key: 'okAfter.d', kind: 'okAfter', es: 'Así se aprende: probando.', fr: 'C’est comme ça qu’on apprend : en essayant.' },

  /* ───── presque ───── */
  { key: 'almost.a', kind: 'almost', es: '¡Casi perfecto!', fr: 'Presque parfait !' },
  { key: 'almost.b', kind: 'almost', es: 'Se entiende muy bien. Solo un detalle:', fr: 'On comprend très bien. Juste un détail :' },

  /* ───── fin de mission ───── */
  { key: 'mission.a', kind: 'mission', es: '¡Misión cumplida! Ya sabes {skill}.', fr: 'Mission accomplie ! Tu sais maintenant {skill}.' },
  { key: 'mission.b', kind: 'mission', es: '¡Bien hecho! Has dado un paso más: {skill}.', fr: 'Bien joué ! Tu as fait un pas de plus : {skill}.' },

  /* ───── indices génériques (si le module n'en fournit pas) ───── */
  { key: 'hint.situation', kind: 'hint', errorKind: ['situation', 'meaning'], es: 'Piensa: ¿qué necesita decir la persona en esta situación?', fr: 'Pense : que doit dire la personne dans cette situation ?' },
  { key: 'hint.register', kind: 'hint', errorKind: ['register'], es: 'Con un desconocido o en un sitio formal, usa «usted».', fr: 'Avec un inconnu ou dans un lieu formel, on emploie « usted ».' },
  { key: 'hint.grammar', kind: 'hint', errorKind: ['grammar'], es: 'Mira la terminación del verbo.', fr: 'Regarde la terminaison du verbe.' },
  { key: 'hint.spelling', kind: 'hint', errorKind: ['spelling'], es: 'Revisa las letras y los acentos.', fr: 'Vérifie les lettres et les accents.' },
  { key: 'hint.gender', kind: 'hint', errorKind: ['gender'], es: '¿La palabra es masculina o femenina?', fr: 'Le mot est-il masculin ou féminin ?' },
  { key: 'hint.order', kind: 'hint', errorKind: ['order'], es: 'Empieza por quién hace la acción.', fr: 'Commence par celui qui fait l’action.' },
  { key: 'hint.missing', kind: 'hint', errorKind: ['missing'], es: 'Vuelve a leer: ¿falta alguna palabra importante?', fr: 'Relis : manque-t-il un mot important ?' },
  { key: 'hint.other', kind: 'hint', errorKind: ['other'], es: 'Vuelve a mirar los ejemplos de la lección.', fr: 'Regarde à nouveau les exemples de la leçon.' },

  /* ───── explications génériques ───── */
  { key: 'explain.grammar', kind: 'explain', errorKind: ['grammar'], es: 'Fíjate en el modelo: la forma del verbo cambia según la estructura.', fr: 'Regarde le modèle : la forme du verbe change selon la structure.' },
  { key: 'explain.register', kind: 'explain', errorKind: ['register'], es: '«Tú» es para amigos y personas cercanas; «usted» para desconocidos y situaciones formales.', fr: '« Tú » s’emploie avec les amis et les proches ; « usted » avec les inconnus et dans les situations formelles.' },
  { key: 'explain.other', kind: 'explain', errorKind: ['other', 'situation', 'meaning', 'spelling', 'gender', 'order', 'missing'], es: 'Compara tu respuesta con la solución y busca la diferencia.', fr: 'Compare ta réponse avec la solution et cherche la différence.' },

  /* ───── libellés de l'interface ───── */
  { key: 'ui.continue', kind: 'ui', es: 'Seguir', fr: 'Continuer' },
  { key: 'ui.check', kind: 'ui', es: 'Comprobar', fr: 'Vérifier' },
  { key: 'ui.retry', kind: 'ui', es: 'Intentarlo otra vez', fr: 'Réessayer' },
  { key: 'ui.hint', kind: 'ui', es: 'Pista', fr: 'Indice' },
  { key: 'ui.showSolution', kind: 'ui', es: 'Ver la solución explicada', fr: 'Voir la solution expliquée' },
  { key: 'ui.skip', kind: 'ui', es: 'Seguir con la solución', fr: 'Continuer avec la solution' },
  { key: 'ui.solution', kind: 'ui', es: 'Solución', fr: 'Solution' },
  { key: 'ui.example', kind: 'ui', es: 'Ejemplo', fr: 'Exemple' },
  { key: 'ui.resume', kind: 'ui', es: 'Retomar', fr: 'Reprendre' },
  { key: 'ui.restart', kind: 'ui', es: 'Empezar de nuevo', fr: 'Recommencer' },
  { key: 'ui.start', kind: 'ui', es: 'Empezar', fr: 'Commencer' },
  { key: 'ui.finish', kind: 'ui', es: 'Terminar', fr: 'Terminer' },
  { key: 'ui.translate', kind: 'ui', es: 'Ver en francés', fr: 'Voir en français' }
];
