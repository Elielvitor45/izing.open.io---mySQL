module.exports = [
  {
    script: "dist/server.js",
    name: "backend",
    exec_mode: "cluster",
    cron_restart: "00 00 * * *",
    instances: 1,
    watch: false
  }
];