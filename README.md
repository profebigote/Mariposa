# Español en marcha

Application web statique pour l'entraînement en espagnol (situations, grammaire, conjugaison, vocabulaire, listes de classe).

## Publier sur GitHub Pages
1. Créer un dépôt public sur GitHub et y déposer tout le contenu de ce dossier.
2. Settings > Pages > « Deploy from a branch » > branche `main`, dossier `/ (root)`.
3. Le site est en ligne quelques minutes plus tard.

## Alimenter les contenus
Tout se passe dans `js/content.js` (exemples commentés en tête de fichier). Aucun autre fichier à modifier.

## Ce que fait déjà l'application
- Progression sur l'appareil (localStorage) : 3 étapes (découvert, en cours, bien installé) qui ne baissent jamais.
- Retours bienveillants après une erreur, avec rappel de la règle (écrite une seule fois dans `rules`).
- Barème du test blanc : 1 point/mot, -0,25 par accent ou tilde, -0,25 une lettre, -0,5 deux lettres ou inversion.
- « À explorer à mon rythme » : les points ratés, qui disparaissent une fois réussis.

## Prochaine étape : comptes (Supabase)
`js/store.js` est le seul fichier qui touche au stockage. Il sera remplacé par une version Supabase (pseudo + mot de passe, classes).
