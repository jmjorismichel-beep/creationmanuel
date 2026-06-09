# Manuelia AI

**Manuelia AI** est une application web permettant de générer, modifier, corriger, sauvegarder et exporter des manuels pédagogiques longs (jusqu'à 75 pages) à partir d'un simple prompt utilisateur.

> Conçu pour les formateurs, enseignants, organismes de formation et associations.

---

## Fonctionnalités

- **Génération par prompt** : décrivez votre manuel, l'application génère un plan structuré, puis chaque chapitre
- **Éditeur complet** : modifiez titres, sections, exercices, corrections, conclusion
- **Assistant IA** : corrigez, simplifiez, développez, reformulez avec l'aide de l'IA
- **Comparaison avant/après** : visualisez les modifications proposées par l'IA
- **Historique des versions** : restaurez n'importe quelle version précédente
- **Sauvegarde locale** : tous vos manuels sont sauvegardés dans votre navigateur (IndexedDB)
- **Export Markdown** : fonctionne hors ligne
- **Export PDF** : mise en page A4 propre avec page de garde et sommaire
- **Export DOCX** : compatible Microsoft Word
- **Mode hors ligne (PWA)** : l'application fonctionne sans connexion après la première visite
- **File d'attente hors ligne** : les demandes IA sont mémorisées et relancées à la reconnexion
- **Mode démonstration** : testez toutes les fonctionnalités sans clé API

---

## Installation locale

### Prérequis

- Node.js 18 ou supérieur
- npm 9 ou supérieur

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/VOTRE_COMPTE/manuelia-ai.git
cd manuelia-ai

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

---

## Lancement local

```bash
npm run dev      # Serveur de développement (hot reload)
npm run build    # Build de production
npm run preview  # Aperçu du build de production
```

---

## Structure du projet

```
manuelia-ai/
├── src/
│   ├── routes/          # Pages de l'application (React Router)
│   ├── components/      # Composants réutilisables
│   ├── lib/             # Bibliothèques utilitaires
│   └── index.css        # Styles Tailwind
├── netlify/
│   └── functions/       # Fonctions serverless (appels IA)
├── public/              # Fichiers statiques (PWA, icônes)
├── netlify.toml         # Configuration Netlify
└── vite.config.js       # Configuration Vite
```

---

## Déploiement sur GitHub

```bash
# Initialiser git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit — Manuelia AI"

# Créer le dépôt sur GitHub, puis :
git remote add origin https://github.com/VOTRE_COMPTE/manuelia-ai.git
git branch -M main
git push -u origin main
```

---

## Déploiement sur Netlify

1. Connectez-vous sur [netlify.com](https://netlify.com)
2. Cliquez sur **"Add new site" → "Import an existing project"**
3. Sélectionnez **GitHub** et choisissez le dépôt `manuelia-ai`
4. Configurez le build :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
   - **Functions directory** : `netlify/functions` (déjà dans `netlify.toml`)
5. Cliquez sur **"Deploy site"**

---

## Configuration des variables d'environnement

Pour activer l'IA réelle (mode production), ajoutez votre clé API dans Netlify :

1. Dans votre site Netlify : **Site settings → Environment variables**
2. Ajoutez la variable :
   - **Key** : `AI_API_KEY`
   - **Value** : votre clé API Anthropic (ou compatible)
3. Redéployez le site

> ⚠️ **Important** : ne mettez jamais votre clé API dans le code, dans `.env` poussé sur GitHub, ou dans le README. La clé ne doit exister que dans les variables Netlify.

---

## Test du mode démonstration

Sans clé API, l'application fonctionne en **mode démo** :

1. Cliquez sur **"Créer un manuel"**
2. Remplissez le formulaire (ex: "Manuel Excel 2021 pour débutant")
3. Cliquez sur **"Générer le manuel"**
4. Un manuel fictif mais structuré est généré en quelques secondes
5. Vous pouvez l'éditer, le sauvegarder et l'exporter

---

## Test du mode hors ligne

1. Chargez l'application une première fois en étant connecté
2. Coupez votre connexion Internet
3. Rechargez la page : l'application fonctionne toujours
4. Vous pouvez consulter, modifier et exporter vos manuels
5. Les demandes IA sont mises en file d'attente et relancées à la reconnexion

---

## Installation de la PWA

Sur mobile ou bureau, le navigateur proposera d'installer Manuelia AI :

- **Chrome / Edge** : cliquez sur l'icône d'installation dans la barre d'adresse
- **Safari iOS** : "Partager" → "Sur l'écran d'accueil"

---

## Export PDF

L'export PDF utilise `html2pdf.js` (chargé à la demande) :

1. Ouvrez un manuel dans l'**Aperçu** ou l'**Éditeur**
2. Cliquez sur **"PDF"** dans les boutons d'export
3. Le fichier `.pdf` est téléchargé automatiquement

Le PDF inclut : page de garde, sommaire, chapitres, exercices, corrections, conclusion.

---

## Export Markdown

L'export Markdown fonctionne **hors ligne** :

1. Cliquez sur **"Markdown"** dans les boutons d'export
2. Le fichier `.md` est téléchargé immédiatement

---

## Export DOCX (Word)

L'export DOCX utilise la bibliothèque `docx` :

1. Cliquez sur **"DOCX"** dans les boutons d'export
2. Le fichier `.docx` est téléchargé et s'ouvre dans Microsoft Word ou LibreOffice

---

## Fonctionnement de la sauvegarde locale

Tous les manuels sont sauvegardés dans le **navigateur** via IndexedDB (Dexie.js) :

- Les données restent sur votre appareil, pas sur un serveur
- Elles persistent entre les sessions
- Si vous effacez les données du navigateur, les manuels seront perdus
- Pour conserver vos manuels, exportez-les régulièrement en PDF, DOCX ou Markdown

---

## Fonctionnement de l'historique des versions

À chaque sauvegarde, une version est créée :

1. Dans l'**Éditeur**, cliquez sur l'onglet **"Historique"**
2. Vous voyez la liste des versions avec date et type
3. Cliquez sur **"Restaurer"** pour revenir à une version précédente
4. Cliquez sur **"Annuler la dernière"** pour un retour rapide

---

## Limites connues

- La génération de manuels très longs (75 pages) nécessite plusieurs appels API successifs
- L'export PDF sur mobile peut être plus lent
- L'historique des versions est limité par la capacité du navigateur
- Les fonctions IA ne fonctionnent pas hors ligne

---

## Améliorations possibles

- Authentification et synchronisation cloud (Supabase, Firebase)
- Import de fichiers existants (PDF, DOCX, Markdown)
- Modèles de manuels prédéfinis
- Collaboration multi-utilisateurs
- Export vers Google Docs
- Génération d'images pédagogiques
- Mode présentation (diaporama)
- Statistiques pédagogiques

---

## Technologies utilisées

| Technologie       | Usage                              |
|-------------------|------------------------------------|
| React + Vite      | Interface et build                 |
| Tailwind CSS      | Styles                             |
| React Router DOM  | Navigation                         |
| Dexie.js          | Sauvegarde locale IndexedDB        |
| vite-plugin-pwa   | Mode hors ligne (PWA)              |
| html2pdf.js       | Export PDF                         |
| docx              | Export DOCX                        |
| lucide-react      | Icônes                             |
| Netlify Functions | Appels IA sécurisés (serverless)   |

---

## Licence

Projet open-source. Libre d'utilisation et de modification pour usage personnel ou professionnel.

---

*Créé avec Manuelia AI — [pharenumeriquehavre.fr](https://pharenumeriquehavre.fr)*
