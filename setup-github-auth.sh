#!/bin/bash

# Script de configuration d'authentification GitHub
# Ce script configure l'authentification Git de façon permanente

echo "Configuration de l'authentification GitHub permanente..."

# 1. Configurer le stockage des identifiants
git config --global credential.helper store

# 2. Configurer le nom d'utilisateur et l'email
git config --global user.name "GerardFevill"
git config --global user.email "gerard.nouglozeh@protonmail.com"

# 3. Demander le token d'accès personnel
echo "Veuillez entrer votre token d'accès personnel GitHub:"
read -s token

# 4. Stocker les identifiants
echo "https://GerardFevill:${token}@github.com" > ~/.git-credentials

# 5. Changer l'URL du dépôt pour utiliser le token
git remote set-url origin "https://GerardFevill:${token}@github.com/GerardFevill/ProManage.git"

# 6. Tester la configuration
echo "Test de la configuration..."
git fetch

if [ $? -eq 0 ]; then
    echo "✅ Configuration réussie! Vous pouvez maintenant utiliser git push sans sudo."
    echo "Votre authentification est configurée de façon permanente."
else
    echo "❌ La configuration a échoué. Veuillez vérifier votre token et réessayer."
fi

echo ""
echo "Pour pousser vos modifications, utilisez simplement:"
echo "git push"
