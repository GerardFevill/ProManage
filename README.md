# ProManage

ProManage est une application de gestion de projets et de finances d'entreprise, composée d'un backend Node.js et d'un frontend Angular.

## Architecture

L'application est divisée en deux parties principales :

1. **Backend (Node.js)** : API RESTful développée avec Express.js et TypeScript, connectée à une base de données PostgreSQL.
2. **Frontend (Angular)** : Interface utilisateur développée avec Angular, Bootstrap et des composants de visualisation de données.

## CI/CD avec GitHub Actions

Le projet utilise un workflow GitHub Actions unifié pour l'intégration et le déploiement continus :

### Workflow CI/CD Complet

Déclenché lors des push sur la branche `main` ou des pull requests :

1. **Construction du Backend** :
   - Installation des dépendances Node.js
   - Construction du code TypeScript

2. **Construction du Frontend** :
   - Installation des dépendances Angular
   - Construction de l'application en mode production

3. **Publication des Images Docker** (uniquement lors des push, pas des PR) :
   - Connexion à Docker Hub avec vos identifiants
   - Construction et publication de l'image backend
   - Construction et publication de l'image frontend
   - Utilisation du cache pour des builds plus rapides

4. **Déploiement** (uniquement lors des push, pas des PR) :
   - Mise à jour du fichier docker-compose.yml avec les dernières images
   - Préparation pour un déploiement automatique sur un serveur (commenté par défaut)

## Secrets GitHub Requis

Pour que le workflow fonctionne correctement, vous devez configurer les secrets suivants dans votre dépôt GitHub :

- `DOCKERHUB_USERNAME` : Votre nom d'utilisateur Docker Hub
- `DOCKERHUB_TOKEN` : Votre token d'accès Docker Hub (généré depuis les paramètres de votre compte Docker Hub)

Pour activer le déploiement automatique (optionnel) :
- `DEPLOY_HOST` : Adresse IP ou nom d'hôte du serveur de déploiement
- `DEPLOY_USER` : Nom d'utilisateur SSH pour le serveur de déploiement
- `DEPLOY_KEY` : Clé SSH privée pour l'authentification
- `REPO_RAW_URL` : URL brute vers votre dépôt GitHub (pour télécharger docker-compose.yml)

## Configuration du Déploiement Automatique

Pour activer le déploiement automatique sur votre serveur de production :

1. Générez une paire de clés SSH sans passphrase :
   ```bash
   ssh-keygen -t rsa -b 4096 -f deploy_key -N ""
   ```

2. Ajoutez la clé publique (`deploy_key.pub`) aux clés autorisées sur votre serveur :
   ```bash
   cat deploy_key.pub >> ~/.ssh/authorized_keys
   ```

3. Ajoutez la clé privée (`deploy_key`) comme secret GitHub `DEPLOY_KEY`

4. Décommentez la section de déploiement dans le fichier workflow

## Exécution Locale

Pour exécuter l'application localement avec Docker Compose :

```bash
docker-compose up -d
```

Cela démarrera les services suivants :
- PostgreSQL sur le port 5432
- Backend Node.js sur le port 3000
- Frontend Angular sur le port 80

## Tableau de Bord

Le tableau de bord de l'application comprend plusieurs composants sophistiqués :

- **Vue de Trésorerie** : Affiche l'évolution de la trésorerie avec graphiques et prévisions
- **Résumé Financier** : Présente les indicateurs clés de performance financière
- **Objectifs Financiers** : Suivi des objectifs avec progression visuelle
- **Alertes** : Notifications importantes concernant les finances

Les visualisations utilisent des couleurs d'accent bleu (#2196F3) pour une expérience utilisateur cohérente.

L'application sera accessible à :
- Frontend : http://localhost
- Backend API : http://localhost:3000
- Base de données : localhost:5432
