# Configuration du formulaire de devis

Ce guide vous explique comment configurer le système de formulaire de demande de devis avec Supabase.

## 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# URL de votre projet Supabase
SUPABASE_URL=https://votre-projet.supabase.co

# Clé anonyme (anon/public)
SUPABASE_ANON_KEY=votre-cle-anonyme-ici

# Mot de passe admin pour accéder à /admin
ADMIN_PASSWORD=votre-mot-de-passe-admin-securise

# Secret pour générer les slugs sécurisés (optionnel, utilise ADMIN_PASSWORD par défaut)
# Recommandé: une chaîne aléatoire d'au moins 32 caractères
SLUG_SECRET=votre-secret-pour-les-slugs-securises

# =============================================================================
# Resend (Emails de confirmation et notifications)
# =============================================================================

# Clé API Resend - Obtenez-la sur https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxx

# Email d'expédition (doit être vérifié sur Resend)
# Format: "Nom <email@domaine.com>" ou simplement "email@domaine.com"
FROM_EMAIL=Tousgether <noreply@tousgether.com>

# Email de l'administrateur qui recevra les notifications de nouveaux devis
ADMIN_EMAIL=contact@tousgether.com

# URL du site (utilisée pour les liens dans les emails)
SITE_URL=https://tousgether.com
```

### À propos des slugs sécurisés

Les URLs de l'interface admin utilisent des **slugs sécurisés** au lieu des UUIDs de la base de données :
- ❌ Ancien format : `/admin/devis/d92fc9e5-c5e4-457d-84bb-0c5859c078ac`
- ✅ Nouveau format : `/admin/devis/xK9mPqR2nL5j`

Avantages :
- Les UUIDs de la base de données ne sont jamais exposés dans les URLs
- Les slugs sont non-devinables et courts (12 caractères)
- Impossible d'énumérer les demandes en incrémentant les IDs

> ⚠️ **Important** : Ne commitez jamais votre fichier `.env` !

## 2. Configuration Supabase

### Créer la table dans Supabase

Allez dans le SQL Editor de votre projet Supabase et exécutez cette requête :

```sql
CREATE TABLE demandes_devis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Informations générales
  nom_prenom TEXT NOT NULL,
  entreprise TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  site_web TEXT,
  
  -- Projet MLM
  type_business TEXT NOT NULL,
  type_business_autre TEXT,
  integration_mlm TEXT[] NOT NULL DEFAULT '{}',
  modele_mlm TEXT[] NOT NULL DEFAULT '{}',
  objectif_mlm TEXT NOT NULL,
  objectif_mlm_autre TEXT,
  
  -- Fonctionnalités
  fonctionnalites TEXT[] NOT NULL DEFAULT '{}',
  fonctionnalites_autre TEXT,
  
  -- Informations techniques
  technologie TEXT NOT NULL,
  base_donnees_existante BOOLEAN DEFAULT FALSE,
  base_donnees_details TEXT,
  
  -- Budget & Délais
  budget TEXT NOT NULL,
  delai TEXT NOT NULL,
  
  -- Description
  description_projet TEXT NOT NULL,
  
  -- Consentement
  recontact_telephone BOOLEAN DEFAULT FALSE,
  acceptation_rgpd BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Métadonnées
  ip_address TEXT,
  user_agent TEXT
);

-- Index pour améliorer les performances
CREATE INDEX idx_demandes_devis_email ON demandes_devis(email);
CREATE INDEX idx_demandes_devis_created_at ON demandes_devis(created_at DESC);
```

### Configurer Row Level Security (RLS)

```sql
-- Activer Row Level Security
ALTER TABLE demandes_devis ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion anonyme (formulaire public)
CREATE POLICY "Permettre insertion anonyme" ON demandes_devis
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture (admin via API sécurisée par mot de passe)
CREATE POLICY "Permettre lecture" ON demandes_devis
  FOR SELECT USING (true);

-- Politique pour permettre la suppression (admin via API sécurisée par mot de passe)
CREATE POLICY "Permettre suppression" ON demandes_devis
  FOR DELETE USING (true);
```

> 💡 **Note** : La sécurité de l'administration est gérée par le mot de passe `ADMIN_PASSWORD` côté API, pas par Supabase RLS. Pour une sécurité renforcée en production, vous pouvez utiliser la `service_role` key pour l'API admin.

## 3. Récupérer les clés Supabase

1. Connectez-vous à [Supabase](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

## 4. Configuration de Resend (Emails)

Le système envoie automatiquement des emails lors de la soumission d'une demande de devis :
- **Email de confirmation** → envoyé à l'utilisateur pour confirmer la réception de sa demande
- **Email de notification** → envoyé à l'admin pour l'informer d'une nouvelle demande

### 4.1 Créer un compte Resend

1. Inscrivez-vous sur [resend.com](https://resend.com)
2. Créez votre clé API dans **API Keys**
3. Copiez la clé (`re_xxxxxxxx`) dans votre `.env` → `RESEND_API_KEY`

### 4.2 Vérifier un domaine (recommandé en production)

Pour envoyer depuis votre propre domaine (ex: `noreply@tousgether.com`) :

1. Allez dans **Domains** sur Resend
2. Ajoutez votre domaine
3. Configurez les enregistrements DNS (SPF, DKIM, DMARC)
4. Une fois vérifié, mettez à jour `FROM_EMAIL` dans votre `.env`

> 💡 **Astuce** : En développement, vous pouvez utiliser l'adresse `onboarding@resend.dev` fournie par Resend pour tester.

### 4.3 Contenu des emails

- **Email de confirmation** : Récapitulatif de la demande avec référence, type de projet, budget et délai
- **Email admin** : Toutes les informations détaillées du devis avec un lien direct vers l'interface admin

## 5. Installation des dépendances

```bash
npm install
```

## 6. Lancer le projet

```bash
npm run dev
```

Le formulaire sera accessible à l'adresse : `http://localhost:4321/devis`

La page d'administration : `http://localhost:4321/admin`

## 7. Page d'administration

Une interface d'administration est disponible pour consulter les demandes de devis.

### Accès

1. Allez sur `/admin`
2. Entrez le mot de passe défini dans `ADMIN_PASSWORD`
3. Vous aurez accès à :
   - **Tableau de bord** avec statistiques (total, aujourd'hui, cette semaine, budget moyen)
   - **Liste des demandes** triées par date
   - **Recherche** par nom, email, entreprise ou téléphone
   - **Détails complets** de chaque demande
   - **Suppression** des demandes

### Sécurité

- La page n'est pas indexée par les moteurs de recherche (noindex)
- L'authentification est gérée côté serveur
- Le mot de passe n'est jamais stocké côté client de façon permanente (sessionStorage)
- Choisissez un mot de passe fort pour `ADMIN_PASSWORD`

### API Admin

L'API `/api/admin` supporte les actions suivantes (toutes requièrent le mot de passe) :

**POST `/api/admin`**

```json
// Lister toutes les demandes
{ "password": "xxx", "action": "list" }

// Récupérer une demande spécifique
{ "password": "xxx", "action": "get", "id": "uuid" }

// Supprimer une demande
{ "password": "xxx", "action": "delete", "id": "uuid" }
```

## Structure des fichiers créés

```
src/
├── components/
│   └── DevisForm.astro       # Composant du formulaire
├── lib/
│   └── supabase.ts           # Client Supabase
├── pages/
│   ├── api/
│   │   ├── admin.ts          # API admin (lecture/suppression)
│   │   └── devis.ts          # Endpoint API POST (création)
│   ├── admin.astro           # Page d'administration
│   └── devis.astro           # Page du formulaire
└── types/
    └── devis.ts              # Types TypeScript
```

## API Endpoint

### POST `/api/devis`

Envoie une demande de devis.

**Headers requis :**
```
Content-Type: application/json
```

**Body (exemple) :**
```json
{
  "nom_prenom": "Jean Dupont",
  "entreprise": "Ma Société SAS",
  "email": "jean@exemple.com",
  "telephone": "0612345678",
  "type_business": "marketplace",
  "integration_mlm": ["site_web_existant"],
  "modele_mlm": ["binaire", "unilevel"],
  "objectif_mlm": "augmenter_ca",
  "fonctionnalites": ["tableau_bord_mlm", "systeme_affiliation"],
  "technologie": "wordpress",
  "base_donnees_existante": false,
  "budget": "3000_6000",
  "delai": "1_2_mois",
  "description_projet": "Je souhaite créer un système MLM pour ma marketplace...",
  "recontact_telephone": true,
  "acceptation_rgpd": true
}
```

**Réponse succès (201) :**
```json
{
  "success": true,
  "message": "Votre demande de devis a été envoyée avec succès !",
  "id": "uuid-de-la-demande"
}
```

**Réponse erreur validation (400) :**
```json
{
  "success": false,
  "message": "Veuillez corriger les erreurs du formulaire",
  "errors": {
    "email": "L'email n'est pas valide",
    "acceptation_rgpd": "Vous devez accepter les conditions RGPD"
  }
}
```

## Déploiement

Pour le déploiement en production avec le mode hybride (SSR pour l'API) :

### Vercel
```bash
npm i @astrojs/vercel
```
Puis modifier `astro.config.mjs` pour utiliser l'adapter Vercel.

### Netlify
```bash
npm i @astrojs/netlify
```
Puis modifier `astro.config.mjs` pour utiliser l'adapter Netlify.

### Node.js standalone (actuel)
Le projet est configuré avec `@astrojs/node` pour un déploiement standalone.

## Support

Pour toute question, contactez contact@tousgether.com

