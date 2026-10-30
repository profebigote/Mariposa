# Comptes, classes et suivi enseignant — préparation Supabase (NON branché)

État actuel : **aucun compte, aucun serveur**. La progression vit dans le navigateur de l'élève (`localStorage`, clé `esp.v1`), les classes sont des codes déclarés dans `data/config.js`, et l'enseignant ne voit pas les résultats individuels.
`js/store.js` est le seul fichier qui lit/écrit la progression : c'est le point de branchement prévu.

## Principes (mineurs)
- Pseudo + mot de passe (Supabase Auth, e-mail factice généré `pseudo@mariposa.invalid`) : **aucun nom réel, aucun e-mail, aucune photo**.
- Pas de classement, pas de page « classe » visible des élèves : chaque élève ne lit que ses propres lignes (RLS).
- L'enseignant lit uniquement les élèves de ses classes ; il voit des **états de compétence** (Por descubrir → Consolidado) et les difficultés récurrentes, pas des notes.
- Suppression du compte = suppression de toutes les lignes (`on delete cascade`).
- Prévenir élèves et familles de la finalité ; vérifier les règles de l'établissement / du délégué à la protection des données avant ouverture.

## Schéma proposé (à exécuter dans l'éditeur SQL de Supabase)
```sql
create table profiles (id uuid primary key references auth.users on delete cascade, pseudo text unique not null, role text not null default 'student' check (role in ('student','teacher')));
create table classes (id uuid primary key default gen_random_uuid(), code text unique not null, name text not null, teacher uuid references profiles(id));
create table memberships (student uuid references profiles(id) on delete cascade, class uuid references classes(id) on delete cascade, primary key (student, class));
create table assignments (class uuid references classes(id) on delete cascade, module_id text, unit_id text, check (module_id is not null or unit_id is not null));
create table progress (student uuid references profiles(id) on delete cascade, key text, value jsonb not null, updated_at timestamptz default now(), primary key (student, key)); -- reprend les clés de esp.v1 : skills, mods, srs, butterfly…

alter table profiles enable row level security; alter table classes enable row level security; alter table memberships enable row level security; alter table assignments enable row level security; alter table progress enable row level security;
create policy "own profile" on profiles for select using (id = auth.uid());
create policy "own progress" on progress for all using (student = auth.uid()) with check (student = auth.uid());
create policy "own membership" on memberships for select using (student = auth.uid());
create policy "teacher reads class progress" on progress for select using (exists (select 1 from memberships m join classes c on c.id = m.class where m.student = progress.student and c.teacher = auth.uid()));
create policy "members read assignments" on assignments for select using (exists (select 1 from memberships m where m.student = auth.uid() and m.class = assignments.class) or exists (select 1 from classes c where c.id = assignments.class and c.teacher = auth.uid()));
create policy "teacher manages assignments" on assignments for all using (exists (select 1 from classes c where c.id = assignments.class and c.teacher = auth.uid()));
```
⚠️ Ce schéma et ces règles n'ont **pas été testés** sur un vrai projet Supabase : à relire et à essayer avec deux faux comptes (un élève ne doit jamais lire la ligne d'un autre) avant tout usage.

## Étapes pour brancher
1. Créer le projet Supabase (formule gratuite), exécuter le SQL, créer le compte enseignant.
2. Ajouter dans `data/config.js` l'URL du projet et la clé **anon** (publique par conception ; la sécurité repose sur les règles RLS, jamais sur le secret de cette clé). Ne jamais y mettre la clé `service_role`.
3. Remplacer `js/store.js` par une version qui garde `localStorage` comme cache et synchronise `progress` ; écran de connexion (pseudo / mot de passe).
4. Écran enseignant : lecture de `progress` des élèves de la classe → barres de compétences agrégées et « mots les plus ratés » (sans classement).
5. Publication / dépublication des modules depuis l'Atelier : champ `status` stocké dans une table `module_status` (lecture publique, écriture enseignant).
