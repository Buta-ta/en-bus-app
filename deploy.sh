#!/bin/bash

# ============================================
# SCRIPT DE DÉPLOIEMENT PWA EN-BUS
# ============================================

echo "🚀 Déploiement En-Bus PWA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Générer les icônes
echo "🎨 Génération des icônes..."
node generate-icons.js

# 2. Build (si nécessaire)
echo "📦 Build de l'application..."
# npm run build (si vous avez un build process)

# 3. Déploiement
echo "📤 Déploiement..."

# Exemples selon votre hébergeur :

# GitHub Pages
# git add .
# git commit -m "Deploy PWA"
# git push origin main

# Netlify
# netlify deploy --prod

# Vercel
# vercel --prod

# Serveur distant (FTP/SSH)
# rsync -avz --delete ./ user@server:/var/www/en-bus/

echo "✅ Déploiement terminé !"