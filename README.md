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

### Étape restante sur la base

Le test réel du 16 septembre 2026 a rencontré l'erreur RLS `42501` :
`new row violates row-level security policy for table "quiz_results"`.
Le compte anonyme renvoie zéro ligne visible, ce qui ne prouve pas que la table
est vide : une policy SELECT peut masquer les lignes.

Exécuter `supabase/quiz_results_policies.sql` dans le SQL Editor du projet.
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

Après insertion, deux requêtes HEAD avec `count: 'exact'` récupèrent le total et le
compte du profil sans télécharger les lignes. Le pourcentage est calculé avec
`Math.round(sameProfile / totalResults * 100)`, nouvelle participation incluse.
Ces lectures sont séparées : des participations simultanées peuvent arriver entre
les comptes ; elles ne forment pas un snapshot transactionnel.

La comparaison affiche le chargement puis le pourcentage. En cas d'erreur, elle
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
