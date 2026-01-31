# Déploiement sur LWS

Ce guide détaille le déploiement de Tousgether sur un hébergement LWS (VPS ou Hébergement Node.js).

## 📋 Prérequis

- Un hébergement LWS avec Node.js (VPS recommandé)
- Accès SSH à votre serveur
- Node.js 18+ installé sur le serveur
- PM2 installé globalement (`npm install -g pm2`)

## 🏗️ Type d'hébergement LWS recommandé

### Option 1 : VPS LWS (Recommandé)

Un VPS vous donne un contrôle total sur l'environnement :
- **LWS Starter** : Pour les sites à faible trafic
- **LWS Pro** : Pour les sites à trafic modéré
- **LWS Business** : Pour les sites à fort trafic

### Option 2 : Hébergement Node.js LWS

Si LWS propose un hébergement Node.js managé, vérifiez qu'il supporte :
- Node.js 18 ou supérieur
- Les modules ESM (type: "module")
- Les ports personnalisés ou le reverse proxy

## 🚀 Déploiement étape par étape

### 1. Préparer le serveur (VPS)

```bash
# Connexion SSH
ssh user@votre-serveur-lws.com

# Installer Node.js (si pas déjà fait)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 globalement
sudo npm install -g pm2

# Créer le dossier du projet
mkdir -p /var/www/tousgether
cd /var/www/tousgether
```

### 2. Transférer les fichiers

**Option A : Via Git (recommandé)**

```bash
# Sur le serveur
cd /var/www/tousgether
git clone https://github.com/votre-repo/tousgether.git .
```

**Option B : Via SFTP/SCP**

```bash
# Depuis votre machine locale
scp -r ./dist ./package.json ./package-lock.json ./ecosystem.config.cjs user@serveur:/var/www/tousgether/
```

**Option C : Via FileZilla**

1. Connectez-vous en SFTP
2. Transférez les dossiers : `dist/`, `node_modules/` (ou faire npm install sur serveur)
3. Transférez les fichiers : `package.json`, `package-lock.json`, `ecosystem.config.cjs`

### 3. Installer les dépendances (si besoin)

```bash
cd /var/www/tousgether
npm install --production
```

### 4. Configurer les variables d'environnement

```bash
# Créer le fichier .env
nano /var/www/tousgether/.env
```

Contenu du fichier `.env` :

```env
# Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-cle-anon

# Admin
ADMIN_PASSWORD=votre-mot-de-passe-admin-securise
SLUG_SECRET=votre-secret-pour-les-slugs

# Turnstile (CAPTCHA)
PUBLIC_TURNSTILE_SITE_KEY=votre-site-key
TURNSTILE_SECRET_KEY=votre-secret-key

# Resend (Emails)
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=Tousgether <noreply@tousgether.com>
ADMIN_EMAIL=contact@tousgether.com
SITE_URL=https://tousgether.com

# Serveur
HOST=0.0.0.0
PORT=4321
NODE_ENV=production
```

### 5. Créer le dossier de logs

```bash
mkdir -p /var/www/tousgether/logs
```

### 6. Démarrer avec PM2

```bash
cd /var/www/tousgether

# Démarrer l'application
pm2 start ecosystem.config.cjs

# Vérifier le statut
pm2 status

# Voir les logs
pm2 logs tousgether

# Sauvegarder la configuration PM2 (redémarrage auto après reboot)
pm2 save
pm2 startup
```

## 🔧 Configuration Nginx (Reverse Proxy)

Sur un VPS, configurez Nginx comme reverse proxy :

```bash
sudo nano /etc/nginx/sites-available/tousgether
```

```nginx
server {
    listen 80;
    server_name tousgether.com www.tousgether.com;

    # Redirection HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tousgether.com www.tousgether.com;

    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tousgether.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tousgether.com/privkey.pem;
    
    # Configuration SSL sécurisée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # Fichiers statiques (cache long)
    location /_assets/ {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Cache 1 an pour les assets avec hash
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Toutes les autres requêtes
    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/tousgether /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

## 🔐 Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d tousgether.com -d www.tousgether.com

# Renouvellement automatique (déjà configuré par Certbot)
sudo certbot renew --dry-run
```

## 📊 Commandes PM2 utiles

```bash
# Statut de l'application
pm2 status

# Voir les logs en temps réel
pm2 logs tousgether

# Redémarrer l'application
pm2 restart tousgether

# Recharger sans downtime
pm2 reload tousgether

# Arrêter l'application
pm2 stop tousgether

# Supprimer l'application de PM2
pm2 delete tousgether

# Moniteur en temps réel
pm2 monit
```

## 🔄 Mise à jour du site

### Script de mise à jour automatique

Créez un script `update.sh` sur votre serveur :

```bash
#!/bin/bash
cd /var/www/tousgether

echo "📥 Récupération des dernières modifications..."
git pull origin main

echo "📦 Installation des dépendances..."
npm install --production

echo "🔨 Build du site..."
npm run build

echo "🔄 Redémarrage du serveur..."
pm2 reload tousgether

echo "✅ Mise à jour terminée !"
```

```bash
chmod +x update.sh
./update.sh
```

## 🐛 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
pm2 logs tousgether --lines 100

# Vérifier que le build est correct
ls -la dist/server/

# Tester manuellement
node dist/server/entry.mjs
```

### Erreur de port déjà utilisé

```bash
# Trouver le processus utilisant le port
sudo lsof -i :4321

# Tuer le processus
sudo kill -9 <PID>
```

### Problèmes de permissions

```bash
# Donner les droits à l'utilisateur
sudo chown -R $USER:$USER /var/www/tousgether
chmod -R 755 /var/www/tousgether
```

### Nginx ne proxy pas correctement

```bash
# Vérifier que Nginx est démarré
sudo systemctl status nginx

# Tester la configuration
sudo nginx -t

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log
```

## 📝 Checklist de déploiement

- [ ] Serveur LWS configuré avec Node.js 18+
- [ ] PM2 installé globalement
- [ ] Fichiers transférés sur le serveur
- [ ] Dépendances installées (`npm install --production`)
- [ ] Fichier `.env` configuré avec toutes les variables
- [ ] Dossier `logs/` créé
- [ ] Application démarrée avec PM2
- [ ] PM2 configuré pour démarrer au boot (`pm2 startup` + `pm2 save`)
- [ ] Nginx configuré comme reverse proxy
- [ ] Certificat SSL installé (Let's Encrypt)
- [ ] Domaine pointé vers l'IP du serveur
- [ ] Tests de fonctionnement :
  - [ ] Page d'accueil accessible
  - [ ] Formulaire de devis fonctionnel
  - [ ] Emails envoyés (confirmation + admin)
  - [ ] Interface admin accessible

## 🆘 Support LWS

- Documentation LWS : https://aide.lws.fr
- Support technique : Depuis votre espace client LWS

---

© 2025 Tousgether








