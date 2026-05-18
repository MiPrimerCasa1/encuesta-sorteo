/** PM2 — ejecutar desde la raíz del proyecto: pm2 start deploy/ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "encuesta-landingqr",
      script: "server/index.js",
      cwd: __dirname + "/..",
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  ],
};
