# Proyecto Mariposa

Webapp statique d'apprentissage de l'espagnol (HTML / CSS / JavaScript sans compilation), hébergeable gratuitement sur GitHub Pages.

## Publier sur GitHub Pages
1. Dépôt public sur GitHub avec tout le contenu de ce dossier.
2. Settings > Pages > « Deploy from a branch » > `main`, dossier `/ (root)`.

## Organisation
- `index.html`, `css/` : interface (`style.css` historique, `mariposa.css` V2).
- `modules/` : modules pédagogiques en JSON (+ `manifest.json`). **C'est ici que se déposent les nouveaux contenus.**
- `data/` : configuration (`config.js` : rubriques, classes, brouillons visibles), bibliothèque de messages (`messages.js`), compétences (`skills.js`), papillon (`butterfly.js`).
- `js/content.js` : leçons historiques (conservées telles quelles, progression inchangée).
- `js/` : moteur de correction (`engine.js`, `feedback.js`), progression (`store.js`, `progress.js`), activités, lecteur de modules, Atelier, import.
- `tools/modele_mariposa.xlsx` : classeur modèle (6 onglets) ; `tools/make_template.py` le régénère.
- `docs/FORMAT_MODULES.md` : **format exact des fiches** ; `docs/SUPABASE.md` : comptes et suivi enseignant (préparé, non branché).

## Ajouter un module
Voir `docs/FORMAT_MODULES.md` §7 : Réglages > Atelier enseignant > Importar, relire, puis déposer le JSON dans `modules/` et l'ajouter à `modules/manifest.json`.

## Données
Progression dans le navigateur de l'élève uniquement (clé `esp.v1`, jamais supprimée par une mise à jour ; les nouvelles clés s'ajoutent). Atelier : clé `esp.atelier.v1`.
