// Configuration PM2 pour le déploiement sur LWS (VPS ou hébergement Node.js)
module.exports = {
  apps: [
    {
      name: 'tousgether',
      script: './dist/server/entry.mjs',
      instances: 'max', // Utilise tous les CPU disponibles
      exec_mode: 'cluster', // Mode cluster pour la haute disponibilité
      
      // Variables d'environnement
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 4321,
      },
      
      // Redémarrage automatique
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      
      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      
      // Gestion des erreurs
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};








