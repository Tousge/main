import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://tousgether.com',
  
  // Mode hybride : pages statiques par défaut, SSR pour les API
  output: 'hybrid',
  
  // Adapter Vercel pour le déploiement serverless
  adapter: vercel(),
  
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Personnalisation des priorités par page
      serialize(item) {
        // Pages principales avec haute priorité
        if (item.url === 'https://tousgether.com/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (item.url === 'https://tousgether.com/devis') {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/mentions-legales') || 
                   item.url.includes('/cgv') || 
                   item.url.includes('/politique-confidentialite')) {
          // Pages légales avec basse priorité
          item.priority = 0.1;
          item.changefreq = 'yearly';
        }
        return item;
      },
      // Exclure les pages admin
      filter: (page) => !page.includes('/admin'),
    }),
  ],
  
  compressHTML: true,
  
  build: {
    inlineStylesheets: 'always',
    format: 'directory',
    // Optimisation des assets
    assets: '_assets',
  },
  
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  
  // Optimisations Vite avancées
  vite: {
    build: {
      cssMinify: 'lightningcss',
      minify: 'esbuild',
      // Target navigateurs modernes pour des bundles plus petits
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: undefined,
          // Noms de fichiers optimisés pour le cache
          assetFileNames: '_assets/[name].[hash][extname]',
          chunkFileNames: '_assets/[name].[hash].js',
          entryFileNames: '_assets/[name].[hash].js',
        },
      },
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        // Optimisations CSS avancées
        drafts: {
          customMedia: true,
        },
      },
    },
    // Optimisation des dépendances
    optimizeDeps: {
      exclude: ['@astrojs/vercel'],
    },
  },
  
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
