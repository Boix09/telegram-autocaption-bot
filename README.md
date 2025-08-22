# 🎬 Telegram AutoCaption Bot

Un bot Telegram qui ajoute automatiquement des sous-titres français aux vidéos grâce à [AutoCaption API](https://developers.autocaption.io).

## 🚀 Installation locale

1. Clone le repo et installe les dépendances :
   ```bash
   npm install
   ```

2. Crée un fichier `.env` :
   ```env
   TELEGRAM_TOKEN=ton-token-telegram
   AUTOCAPTION_API_KEY=ta-cle-autocaption
   ```

3. Lance le bot :
   ```bash
   npm start
   ```

## 🌍 Déploiement gratuit

Tu peux utiliser [Render](https://render.com) ou [Railway](https://railway.app) gratuitement.

### Exemple Render

1. Ajoute un projet Node.js
2. Mets tes variables d'environnement :
   - `TELEGRAM_TOKEN`
   - `AUTOCAPTION_API_KEY`
3. Commande de lancement :
   ```bash
   npm start
   ```

## 📌 Fonctionnement

- Envoie une vidéo au bot dans Telegram
- Le bot :
  1. Télécharge la vidéo
  2. L'upload vers AutoCaption
  3. Génère les sous-titres en français
  4. Te renvoie la vidéo sous-titrée
