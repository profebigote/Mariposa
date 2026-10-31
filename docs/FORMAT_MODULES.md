# Proyecto Mariposa — Format des modules pédagogiques

Un **module** = un fichier JSON dans `modules/` + son nom dans `modules/manifest.json`.
Le même contenu peut être fourni sous forme de **classeur Excel** (6 onglets, voir plus bas) : l'Atelier le convertit en JSON.
Tout module est validé automatiquement (`js/validator.js`) : un module avec erreur n'est jamais joué.

Règle d'or : **les textes sont écrits une seule fois**, en espagnol (`es`) avec une aide française (`fr`). Un champ de texte est soit une chaîne (`"Hola"`), soit `{ "es": "…", "fr": "…" }`.

---------------------------------------------------------------------

## 1. Fiche commune (tous les types)

| Champ | Obligatoire | Valeurs / remarque |
|---|---|---|
| `id` | oui | minuscules, chiffres, tirets : `m-desayuno-madrid` |
| `type` | oui | `adventure` · `lesson` · `vocab` · `reading` |
| `title` | oui | titre affiché |
| `rubrique` | oui | `situaciones` · `gramatica` · `palabras` · `clase` · `lecturas` |
| `theme` | non | sous-rubrique libre (« Café », « Gérondif »…) |
| `level` | oui | `A1` · `A1+` · `A2` · `A2+` · `B1` |
| `duration` | conseillé | minutes (idéal 3 à 7 ; au-delà : avertissement) |
| `status` | oui | `brouillon` · `validé` · `publié` |
| `version` | oui | entier ≥ 1 (à augmenter à chaque correction) |
| `objectives` | conseillé | `{ main, secondary[], outcome, lexicon[], grammar[], prerequisites[] }` |
| `skills` | conseillé | identifiants de `data/skills.js` : alimentent « Mi progreso » |
| `intro` | non | `{ es, fr }` situation initiale |
| `completion` | conseillé | `{ es, fr, review[], next[] }` : message de fin ; `review` = mots à revoir (ids d'items du module ou objets `{id?, es, fr, emoji?}`) ; `next` = ids de modules proposés ensuite |

Pour ajouter une compétence : une ligne dans `data/skills.js` (`id`, `es`, `fr`, `group`).
Aucune note ni pourcentage n'est affiché à l'élève : la compétence passe de « Por descubrir » à « Consolidado » selon la réussite (avec ou sans aide), la régularité et les révisions espacées.

---------------------------------------------------------------------

## 2. Mini-aventure à embranchements (`type: "adventure"`)

Champs en plus : `scene` (décor : `cafe`, `restaurant`, `airport`, `street`, `shop`, `office`, `home`, `plain`), `cast` (personnages), `vars` (variables initiales, facultatif), `start` (id du premier nœud), `nodes[]`.

```json
"cast": { "marta": {"name":"Marta","skin":1,"hair":1,"shirt":0},
          "tu":    {"name":"Tú","player":true,"skin":0,"hair":2,"shirt":1} }
```

Chaque nœud a un `id` unique et un `type` :

| type | rôle | champs |
|---|---|---|
| `say` | réplique d'un personnage | `speaker` (clé de `cast`), `es`, `fr`, `next` |
| `info` | encadré d'aide / culture | `es`, `fr`, `next` |
| `choice` | l'élève choisit | `prompt`, `options[]` |
| `build` | l'élève construit une phrase avec des mots | `prompt`, `tiles[]`, `accept[]`, `solution` |
| `short` | réponse courte écrite | `prompt`, `accept[]`, `solution` |
| `branch` | aiguillage automatique selon une variable | `cases[{ if:{var:valeur}, next }]`, `else` |
| `end` | fin : déclenche le bilan | `es`, `fr` |

**Option de `choice`** : `{ "es", "fr", "ok": true|false, "next", "set": {var:val}, "hint", "why", "explain", "errorKind" }`.
- Plusieurs options peuvent avoir `ok: true` : ce sont des **chemins différents, tous corrects** (ex. « tostada con tomate » / « con mantequilla »).
- `set` mémorise un choix ; il se réutilise dans les répliques avec `{{variable}}`.
- `ok: false` : jamais un blocage. 1ʳᵉ erreur → `hint` ; erreur répétée → `explain` ; ensuite la solution est proposée.
- `why` : phrase qui explique pourquoi la réponse juste est juste (affichée après une réussite).
- `errorKind` : `situation` · `register` · `grammar` · `spelling` · `gender` · `meaning` · `order` · `missing` · `other` → choisit le message générique adapté dans `data/messages.js`.

**`accept` de `build`** : `[{ "text": "Un café con leche, por favor", "next": "n8", "set": {…}, "es", "fr" }, …]` — une entrée par formulation correcte (casse, ponctuation, accents tolérés ou signalés par « ¡Casi ! »).
**`accept` de `short`** : `[{ "all": [["quiero","quisiera"], ["café*"]], "next": "n9" }]` — chaque sous-liste est un groupe de mots : il faut en trouver **au moins un par groupe** (`*` = fin de mot libre) ; `"not": [[…]]` (facultatif) refuse la réponse si un de ces groupes apparaît.
`start` et tous les `next` doivent exister ; au moins un `end` doit être atteignable (le validateur vérifie le graphe et signale les nœuds orphelins).

Niveaux : A1 phrases très courtes, choix et mots à placer ; A1+ + formules de politesse, prix, heures ; A2 plusieurs formulations, réponses courtes ; A2+ registre poli/courant, justification ; B1 réponses ouvertes, plusieurs chemins cohérents.

---------------------------------------------------------------------

## 3. Leçon visuelle (`type: "lesson"`) et lecture (`type: "reading"`)

Une leçon a `screens[]` ; une lecture a `doc` + `phases[]` (voir §4). **Une idée par écran.** Chaque écran : `{ "kind": "…", "title": {es,fr}, … }`.
Déroulement conseillé : `observe` → `schema`/`formula`/`contrast`/`rule` → manipulation (`fill`, `transform`, `match`, `build`, `choice`) → `dialogue` ou `react` (réemploi) → `recap`.

| kind | contenu |
|---|---|
| `observe` | `examples[{es,fr,img,highlight[]}]`, `question`, `conclusion` — découvrir et déduire |
| `schema` | `rows[{stem, from, to, fr}]` : le radical reste, la terminaison `from` disparaît et est remplacée par `to` (hablAR → hablANDO) ; `intro`, `note` |
| `formula` | `parts[{role, text, label}]` (rôles colorés : `subject`, `aux`/`estar`/`haber`, `verb`/`stem`, `gerund`/`participle`/`ending`, `object`), `example{parts[{t,role}], fr, img}`, `note` |
| `contrast` | `columns[{title, badge, items[{es,fr}]}]`, `note` — deux usages côte à côte |
| `rule` | `text`, `examples[]`, **`exceptions[]`** (règle générale + exceptions toujours séparées) |
| `recap` | `points[{es,fr}]` |
| `choice` | `prompt`, `options[{text, ok, errorKind}]`, `hint`, `explain`, `img`, `context` |
| `fill` / `transform` | `prompt` (avec `___` ou non), `answers[]` (formes acceptées), `hint`, `explain`, `errorKind` |
| `build` | `prompt`, `accept[]` (phrases), `tiles[]` (sinon déduits), `extra[]` (mots pièges), `solution` |
| `match` | `pairs[{left, right}]` — associer par touchers (pas de glisser-déposer obligatoire) |
| `order` | `items[]` dans le bon ordre (l'appli les mélange) |
| `classify` | `categories[{id,label}]`, `items[{text, cat}]` |
| `select` | `passages[]`, `correct[]` (indices) — repérer des phrases dans un texte |
| `short` | `prompt`, `accept[{ all:[[…]] }]`, `hint`, `explain`, `solution` |
| `react` | `prompt`, `model`, `checklist[]` — réponse personnelle, auto-vérifiée (jamais notée) |
| `dialogue` | `scene`, `dialogues[{title, lines[{who, t, fr}]}]` ; trou dans `t` : `{{bonne::sens FR::distracteur1|distracteur2}}` |
| `imageMap` | `shelves[[ids d'items]]` — image interactive (le frigo de Lucía) ; nécessite `items` |
| `cards` / `recognize` / `recall` | `items[ids]` — découvrir, reconnaître le mot sur l'image, le retrouver sans aide |

Les exemples réels de chaque écran se trouvent dans `modules/` (ex. `m-que-estas-haciendo.json` pour schema/formula/rule/transform, `m-como-soy.json` pour observe/contrast/match, `m-descubriendo-colombia.json` pour select/classify/order/short).

---------------------------------------------------------------------

## 4. Lecture (`type: "reading"`) — Lecturas y descubrimientos

```json
"doc": { "title": "…", "source": "origine / droits",
         "blocks": [ {"type":"p","text":"…"}, {"type":"heading","text":"…"}, {"type":"quote","text":"…"},
                     {"type":"facts","items":[{"emoji":"🌎","text":"Capital : Bogotá"}]}, {"type":"poster","lines":["Titre","ligne 2"]} ],
         "glossary": [ {"w":"costa","fr":"côte"}, {"w":"altura","fr":"altitude"} ] },
"phases": [ { "id":"comprender",  "title":"Encontrar la información", "steps":[ …écrans… ] },
            { "id":"interpretar", "title":"…", "steps":[…] },
            { "id":"reaccionar",  "title":"…", "steps":[…] } ]
```
Varier les interactions (le validateur avertit si une lecture n'est qu'une suite de QCM). Documents authentiques : indiquer la `source` et respecter les droits (textes courts, ou textes écrits pour l'appli).

---------------------------------------------------------------------

## 5. Vocabulaire (`type: "vocab"`)

```json
"items": [ { "id":"manzana", "es":"la manzana", "fr":"la pomme", "emoji":"🍎",
             "sentence": { "es":"Quiero comprar tres ________.", "fr":"…", "answers":["manzanas"] },
             "example": { "es":"Me como una manzana.", "fr":"…" } } ]
```
Sans `screens`, l'appli enchaîne automatiquement : cartes → reconnaissance → rappel sans aide → phrases à trous (items ayant une `sentence`). Avec `screens`, tu composes ton parcours (`imageMap`, `cards`, `recognize`, `recall`, `fill`, `dialogue`…). Les mots ratés ou dont la solution a été vue alimentent « Mis palabras por revisar » (révision espacée 1-3-7-14-30 jours, sans notification).
Minimum 3 mots. Les mots abstraits (despistado, cariñoso) s'enseignent par des **situations** (`observe` + `match`), pas par une traduction sèche.

---------------------------------------------------------------------

## 6. Classeur Excel (6 onglets) — `tools/modele_mariposa.xlsx`

Ne pas renommer onglets ni colonnes. Une ligne = un élément. Le lien entre onglets = `module_id` (= `id` de `Fiches_modules`).
Listes : séparées par `;` · variables : `cle=valeur;cle2=valeur2` · oui/non : `oui`/`non`/`1`/`0`. Colonne `data_json` : un objet JSON fusionné dans la ligne (structures complexes) ; elle l'emporte sur les autres colonnes.

| Onglet | Une ligne = | Colonnes principales |
|---|---|---|
| `Messages_UI` | un message de la bibliothèque | `key` (unique), `kind` (`err1 err2 err3 ok1 okAfter almost mission hint explain ui`), `es`, `fr`, `activity`, `errorKind`, `level` (filtres facultatifs) |
| `Fiches_modules` | un module (fiche commune) | `id type title rubrique theme level duration status version objective_main objectives_secondary outcome lexicon grammar prerequisites skills intro_es intro_fr scene cast_json doc_json completion_es completion_fr review next data_json` |
| `Scenario_demo` | un nœud d'aventure | `module_id node_id type speaker es fr next cond else prompt_es prompt_fr tiles hint_* explain_* solution_*`, options `o1_…o4_` (`_es _fr _ok _next _set _hint_es _hint_fr _why_es _why_fr _explain_es _explain_fr _kind`), formulations `a1_…a3_` (`_text _es _fr _next _set`), `data_json` |
| `Lecons_visuelles` | un écran de leçon ou de lecture | `module_id step phase kind title_es title_fr prompt_es prompt_fr options answers tiles items pairs points_es points_fr hint_* explain_* why_* img data_json` (`options` : `*bonne;fausse;fausse` ; `pairs` : `gauche=droite;…` ; `phase` : comprender/interpretar/reaccionar pour une lecture) |
| `Evolution_papillon` | une étape (exactement 5) | `stage name_es name_fr threshold desc_fr message_es message_fr` (seuils croissants, étape 1 = 0) |
| `Lexique_demo` | un mot | `module_id id es fr emoji sentence_es sentence_fr answers example_es example_fr tags` |

Un onglet de contenu seul (ex. `Lexique_demo.csv`) **met à jour le contenu** d'un module déjà présent (version +1) sans toucher à sa fiche.
Le classeur sert de format de travail ; pour les écrans complexes (`schema`, `formula`, `contrast`, `rule`, `select`, `classify`, `dialogue`, `observe`), utilise `data_json`.

---------------------------------------------------------------------

## 7. Importer et publier

**Relire et tester sur ton appareil** : Réglages → *Atelier enseignant* → *Importar* → choisir le fichier (.xlsx, .csv, .json) ou coller du JSON → lire le rapport → *Ajouter sur cet appareil*. Le module apparaît en « brouillon » (visible grâce à « Mostrar los borradores »). Corriger les textes dans *Éditer*, changer le statut, *Aperçu* pour jouer.
**Publier pour les élèves** : *Éditer → Télécharger .json* (ou *Copier*), déposer le fichier dans `modules/` sur GitHub, ajouter son nom dans `modules/manifest.json` (*Exportar → Générer manifest.json*), passer `status` à `"publié"`. Avant d'ouvrir aux élèves, mettre `showDraftsByDefault: false` dans `data/config.js`.
**Messages et papillon** : un import `Messages_UI` / `Evolution_papillon` s'applique sur l'appareil ; pour tous les élèves, copier le résultat dans `data/messages.js` / `data/butterfly.js` (*Exportar → Tout exporter*).
**Classes** : *Atelier → Mi clase* prépare l'extrait à coller dans `classes` de `data/config.js`.

## 8. Anticipation : compréhension orale (non développée)
Le format prévoit déjà d'accueillir un champ `audio` (URL ou fichier) sur un nœud, un item ou un écran, et de nouveaux `kind` (`listen`, `dictation`, `minimalPairs`). Rien n'est actif aujourd'hui : un champ inconnu est ignoré, un `kind` inconnu est refusé par le validateur.
