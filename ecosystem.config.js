// PM2 Ecosystem Configuration for Next.js Frontend
// Install PM2: npm install -g pm2
// Start: pm2 start ecosystem.config.js
// Stop: pm2 stop care_frontend
// Restart: pm2 restart care_frontend
// Logs: pm2 logs care_frontend
// Monitor: pm2 monit

module.exports = {
  apps: [{
    name: 'care_frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/carefoundation/frontend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Auto restart on crash
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Memory limit (restart if exceeds)
    max_memory_restart: '1G',
    
    // Watch mode (disable in production)
    watch: false,
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
    
    // Important: Ensure Next.js can serve static assets
    interpreter: 'node',
  }]
};
