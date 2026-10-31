/* Évolution de Mariposa. Les seuils sont des « points de croissance » :
   niveaux de compétence atteints (Aprendizaje 1, Progreso 2, Adquirido 4, Consolidado 6)
   + étapes des leçons historiques. Les points ne diminuent jamais : aucune régression, quelle que soit l'absence. */
window.ESP = window.ESP || {};
window.ESP.BUTTERFLY = {
  stages: [
    { n: 1, name: 'La pequeña oruga', fr: 'La petite chenille', threshold: 0, desc: 'Curieuse, elle découvre ses premiers mots.', msg: { es: 'Mariposa empieza su viaje contigo.', fr: 'Mariposa commence son voyage avec toi.' } },
    { n: 2, name: 'La oruga exploradora', fr: 'La chenille exploratrice', threshold: 6, desc: 'Elle grandit et gagne des couleurs.', msg: { es: '¡Mariposa está creciendo y tiene colores nuevos!', fr: 'Mariposa grandit et a de nouvelles couleurs !' } },
    { n: 3, name: 'La crisálida', fr: 'La chrysalide', threshold: 16, desc: 'Elle se prépare : ce que tu as appris se consolide.', msg: { es: 'Mariposa descansa en su crisálida: lo aprendido se está consolidando.', fr: 'Mariposa se repose dans sa chrysalide : ce que tu as appris se consolide.' } },
    { n: 4, name: 'La mariposa joven', fr: 'Le jeune papillon', threshold: 30, desc: 'Ses premières ailes se déploient.', msg: { es: '¡Mariposa ha salido de la crisálida!', fr: 'Mariposa est sortie de sa chrysalide !' } },
    { n: 5, name: 'La mariposa viajera', fr: 'Le papillon voyageur', threshold: 48, desc: 'Ses ailes se parent de motifs : elle part explorer le monde hispanophone.', msg: { es: '¡Mariposa vuela lejos y tú contigo!', fr: 'Mariposa s’envole loin, et toi avec elle !' } }
  ]
};
