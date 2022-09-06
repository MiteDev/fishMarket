module.exports = {
  apps : [{
    name: 'fishMarket',
    script: './bin/www.js',
    watch: true,
    instance: 0,
    autorestart: true,
    exec_mode: "cluster",
    env: {
      Server_PORT:8000,//Express PORT
      NODE_ENV: 'development',
    },
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
