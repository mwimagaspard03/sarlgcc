# GCC Sarl – site vitrine

Projet pour un site 3D SarlGcc.

Next.js (App Router) + TypeScript, français et anglais (`/fr`, `/en`).

## Lancer
```bash
npm install
npm run dev      # http://localhost:3000
```

## Modifier le contenu
- Textes : `content/fr.json` et `content/en.json`
- Réalisations : déposer la photo dans `public/realisations/`, puis ajouter une entrée dans `content/realisations.json` (`"image": "nom-du-fichier.jpg"`)
- Témoignages (réels) : `content/temoignages.json`, la section apparaît dès qu'il y a une entrée
- Coordonnées : `lib/content.ts` (objet `CONTACT`)
- Couleurs et polices : début de `app/globals.css`

## Mettre en ligne
Pousser sur GitHub, puis importer le dépôt sur vercel.com.
