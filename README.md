# Tousgether - Site Astro

Site web de Tousgether, expert en création et déploiement de systèmes MLM digitaux pour les entreprises.

## 🚀 Stack Technique

- **Framework**: [Astro](https://astro.build) v4.x
- **Styling**: [TailwindCSS](https://tailwindcss.com) v3.x
- **Performance**: 100% statique, zéro JavaScript par défaut
- **SEO**: Meta tags complets, Open Graph, Schema.org

## 📁 Structure du Projet

```
astro-site/
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── sections/          # Sections de pages
│   │   │   ├── Hero.astro
│   │   │   ├── About.astro
│   │   │   ├── WhyMLM.astro
│   │   │   ├── Solutions.astro
│   │   │   ├── Process.astro
│   │   │   ├── Advantages.astro
│   │   │   ├── UseCases.astro
│   │   │   ├── MLMSchema.astro
│   │   │   ├── Testimonials.astro
│   │   │   └── CTA.astro
│   │   ├── Button.astro       # Bouton réutilisable
│   │   ├── Footer.astro       # Pied de page
│   │   ├── Header.astro       # En-tête avec navigation
│   │   ├── Logo.astro         # Logo SVG
│   │   └── SectionHeader.astro
│   ├── layouts/
│   │   └── BaseLayout.astro   # Layout principal avec SEO
│   ├── pages/
│   │   ├── index.astro        # Page d'accueil
│   │   ├── tarifs.astro       # Page tarifs
│   │   ├── mentions-legales.astro
│   │   └── cgv.astro
│   └── styles/
│       └── global.css         # Styles globaux + Tailwind
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## 🛠️ Installation

```bash
# Naviguer vers le dossier
cd astro-site

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Puis éditer .env avec vos propres clés

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## 🎨 Personnalisation

### Couleurs

Les couleurs sont définies dans `tailwind.config.mjs` :

```javascript
colors: {
  primary: {
    DEFAULT: '#803B85',  // Violet principal
    light: '#9B4BA0',
    dark: '#6A2F6E',
  },
  accent: {
    pink: '#E84A8A',
    rose: '#E991B2',
    purple: '#9B59B6',
  }
}
```

### Typographie

La police utilisée est **Outfit** (Google Fonts), chargée dans le layout principal.

## 📱 Responsive Design

Le site est entièrement responsive avec des breakpoints :
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔍 SEO

Chaque page inclut :
- Meta tags complets
- Open Graph pour le partage social
- Twitter Cards
- Schema.org (JSON-LD)
- Sitemap automatique
- Robots.txt

## 🚀 Déploiement

Le site peut être déployé sur :
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- Tout hébergement statique

```bash
# Build de production
npm run build

# Le dossier dist/ contient les fichiers statiques
```

## 📄 Licence

© 2025 Tousgether. Tous droits réservés.

