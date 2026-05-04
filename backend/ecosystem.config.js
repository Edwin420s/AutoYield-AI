module.exports = {
  apps: [
    {
      name: 'autoyield-backend',
      script: './src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Production configuration
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Auto-restart on file changes (development only)
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true
    }
  ]
};
