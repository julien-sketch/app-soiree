# Les Boss — Passeport Voyageur

Prototype Next.js pour écran tactile horizontal.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000

## Configuration Supabase

Renseigner dans `.env.local` les variables de `.env.example` :
`NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Utiliser uniquement une clé publique anon/publishable, jamais service_role.
Redémarrer le serveur et refaire le build après modification de ces variables.

La table existante `quiz_results` doit avoir `id` généré automatiquement,
`profile`, `destination`, et `created_at` avec la valeur par défaut `now()`.
Le code transmet uniquement `profile` et `destination`.

Les noms affichés restent inchangés. Les identifiants enregistrés sont :
`commandant`, `explorateur`, `jet-setter`, `digital-nomad`, `bon-vivant`, `stratege`.
La destination conserve son nom existant, par exemple `RIO`.

### Policies de la base

La connexion et les policies fonctionnent : le test réel du 18 septembre 2026 a
validé deux participations, exactement deux nouvelles lignes et les six parts
affichées à partir des comptes Supabase. Aucune modification des policies n'est
nécessaire pour la répartition complète.

Pour configurer une autre base, utiliser `supabase/quiz_results_policies.sql` dans le SQL Editor.
Ce script autorise INSERT pour les six identifiants et SELECT pour les comptes.
Il conserve les autres policies : vérifier les éventuelles policies RESTRICTIVE
et contraintes CHECK qui limiteraient les valeurs aux anciens noms affichés.
Vérifier les valeurs par défaut de `id` et `created_at` ; si `id` utilise une
séquence, `anon` doit avoir USAGE sur cette séquence précise.

Si des participations historiques utilisent les noms complets, les convertir vers
les identifiants stables avant utilisation des statistiques, sans les supprimer.
La policy SELECT autorise la lecture publique des résultats anonymes ; le script
n'ajoute aucune policy UPDATE ou DELETE.

Références : [comptes Supabase](https://supabase.com/docs/reference/javascript/select)
et [policies RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Fonctionnalités

- Format passeport horizontal
- 4 questions
- Animation de page tournée entre les questions
- Scoring séparé profil / destination
- 6 profils et 10 destinations
- Animation finale de tampon de passeport
- Bouton de redémarrage pour le participant suivant

## Fonctionnement de l'enregistrement

La dernière réponse déclenche une seule soumission par partie. Une référence et une
promesse partagée empêchent doubles clics, animations et re-renders de la répéter.
Recommencer réinitialise la protection ; recharger la page retourne à l'accueil.

Après insertion, sept requêtes HEAD avec `count: 'exact'` récupèrent le total et les
comptes des six profils sans télécharger les lignes. Chaque part est calculée à
partir de `count / total * 100`, nouvelle participation incluse. La méthode du plus
grand reste attribue les points manquants après arrondi inférieur aux plus grandes
fractions ; les égalités sont départagées par l'ordre fixe des profils. La somme
affichée vaut exactement 100 %, y compris quand certains profils ont zéro résultat.
Le profil du participant porte la mention « Votre profil » et chaque barre utilise
exactement le pourcentage entier affiché.

Les lectures ne forment pas un snapshot transactionnel. Si leur somme ne correspond
pas au total, elles sont relancées une fois, sans nouvelle insertion. Si les comptes
restent incohérents, la répartition est masquée plutôt que de montrer des chiffres
erronés. Deux colonnes compactes sont utilisées sur grand écran, avec défilement
vertical de la page droite si nécessaire sur les tailles plus petites.

La comparaison affiche « Calcul des profils des Boss... » puis les six profils. En cas d'erreur, elle
disparaît, l'erreur est loguée et le résultat ainsi que les animations restent
disponibles. Une insertion dont la réponse est perdue n'est jamais retentée, pour
éviter un doublon : la protection garantit une seule tentative par partie dans
cette page, pas la livraison en cas de panne réseau.

## Tests

```sh
npm test
npm run build
npm run start -- --port 3100
```

Dans un second terminal : `npm run test:browser`. Les tests utilisent Chrome et
simulent Supabase pour vérifier deux parties, absence de doublons, arrondi,
chargement, erreurs INSERT/SELECT, animations et réponses tardives.
Capture finale : `test-results/results-with-comparison.png`.
Sous PowerShell, utiliser `npm.cmd` si l'exécution des scripts est désactivée.

Le test réel est désactivé par défaut car il crée **deux participations conservées
dans la base**. Après correction des policies, avec le serveur sur 3100 :

```powershell
$env:QUIZ_LIVE_TEST='1'
npm.cmd run test:browser -- tests/browser/quiz-live.spec.cjs
Remove-Item Env:QUIZ_LIVE_TEST
```

Lancer sans autres participants simultanés : le test vérifie exactement +1 puis
+2 lignes et compare le pourcentage aux comptes réels. Un échec après insertion
peut laisser une participation ; ne pas relancer aveuglément.

Aucun déploiement n'a été effectué.
