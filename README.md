# ProManage

Application de gestion financière et comptable avec tableau de bord avancé.

## Architecture

L'application est composée de :
- **Backend** : API Node.js/Express avec TypeScript
- **Frontend** : Application Angular avec interface utilisateur moderne
- **Base de données** : PostgreSQL

## Déploiement Continu (CI/CD)

Cette application est configurée pour un déploiement continu sur Docker Hub via GitHub Actions.

### Workflows CI/CD

Trois workflows GitHub Actions sont configurés :

1. **Backend CI/CD** (.github/workflows/backend-ci-cd.yml)
   - Déclenché lors des modifications dans le dossier `back-end`
   - Exécute les tests
   - Construit et pousse l'image Docker sur Docker Hub

2. **Frontend CI/CD** (.github/workflows/frontend-ci-cd.yml)
   - Déclenché lors des modifications dans le dossier `front-end`
   - Exécute les tests
   - Construit l'application Angular
   - Construit et pousse l'image Docker sur Docker Hub

3. **Déploiement** (.github/workflows/deploy.yml)
   - Déclenché après la réussite des workflows backend et frontend
   - Met à jour le fichier docker-compose.yml avec les dernières versions des images
   - Prêt pour le déploiement sur un serveur de production

### Configuration Requise

Pour que les workflows fonctionnent, vous devez configurer les secrets GitHub suivants :

- `DOCKERHUB_USERNAME` : Votre nom d'utilisateur Docker Hub
- `DOCKERHUB_TOKEN` : Votre token d'accès Docker Hub

Pour le déploiement sur un serveur distant, décommentez et configurez les étapes SSH dans le fichier deploy.yml et ajoutez ces secrets :
- `DEPLOY_HOST` : Adresse IP ou nom d'hôte du serveur
- `DEPLOY_USER` : Utilisateur SSH
- `DEPLOY_KEY` : Clé SSH privée

## Exécution Locale

```bash
# Cloner le dépôt
git clone https://github.com/GerardFevill/ProManage.git
cd ProManage

# Lancer l'application avec Docker Compose
docker-compose up -d
```

L'application sera accessible à :
- Frontend : http://localhost
- Backend API : http://localhost:3000
- Base de données : localhost:5432
