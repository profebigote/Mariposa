/* Configuration du site Proyecto Mariposa.
   Ce fichier ne contient ni mot de passe ni clé secrète : il est public. */
window.ESP = window.ESP || {};
window.ESP.CONFIG = {
  siteName: 'Proyecto Mariposa',

  /* PHASE DE TEST : tant que les modules sont des brouillons à relire, ils sont visibles.
     Mettre false avant d'ouvrir le site aux élèves : seuls les modules « publié » seront alors visibles
     (l'enseignant peut les voir avec Réglages > « Afficher les brouillons »). */
  showDraftsByDefault: true,

  levels: ['A1', 'A1+', 'A2', 'A2+', 'B1'],
  statuses: ['brouillon', 'validé', 'publié'],

  /* Les 5 rubriques. `legacyCats` : anciennes catégories de content.js rattachées à chaque rubrique
     (leurs identifiants ne changent pas, pour ne rien perdre de la progression existante). */
  rubriques: [
    { id: 'situaciones', title: 'Situaciones reales', fr: 'Situations réelles', icon: '🗺️', desc: 'Des mini-aventures et des scènes de la vie quotidienne, à jouer.', legacyCats: ['situaciones'] },
    { id: 'gramatica', title: 'Gramática en acción', fr: 'Grammaire en action', icon: '🧩', desc: 'Des leçons courtes et visuelles : observer, comprendre, manipuler.', legacyCats: ['gramatica', 'conjugacion'] },
    { id: 'palabras', title: 'Mi universo de palabras', fr: 'Mon univers de mots', icon: '🍎', desc: 'Le vocabulaire par thèmes, avec images, mémorisation et réemploi.', legacyCats: ['vocabulario'] },
    { id: 'clase', title: 'Mi clase', fr: 'Ma classe', icon: '🎒', desc: 'Les listes et activités proposées par ton enseignant(e).', legacyCats: ['clase'] },
    { id: 'lecturas', title: 'Lecturas y descubrimientos', fr: 'Lectures et découvertes', icon: '📰', desc: 'Lire, comprendre et découvrir le monde hispanophone.', legacyCats: ['cultura', 'metodos'] }
  ],

  /* Classes : l'enseignant définit un code et la liste des modules / listes à travailler.
     L'élève saisit le code dans « Mi clase ». Aucune donnée personnelle n'est envoyée ni stockée en ligne.
     (Le suivi individuel par l'enseignant viendra avec les comptes Supabase.) */
  classes: [
    { code: 'DEMO', name: 'Classe de démonstration', modules: ['m-desayuno-madrid', 'm-frigorifico-lucia'], units: ['k-personalidades-1'], note: 'Exemple à remplacer par tes propres classes.' }
  ]
};
