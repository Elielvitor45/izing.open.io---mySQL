require("../app/config-env");

module.exports = {
  define: {
    charset: "latin1",
    collate: "latin1_swedish_ci",
    timestamps: false
  },
  useUTC: true,
  dialect: process.env.ASTERISK_DIALECT,
  timezone: '-03:00',
  host: process.env.ASTERISK_HOST,
  port: process.env.ASTERISK_PORT,
  database: process.env.ASTERISK_DB,
  username: process.env.ASTERISK_USER,
  password: process.env.ASTERISK_PASSWORD,
  logging: false
};
