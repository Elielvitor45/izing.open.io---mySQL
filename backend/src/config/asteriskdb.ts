require("../bootstrap");

module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: false
    // freezeTableName: true
  },
  // pool: {
  //   max: 100,
  //   min: 5
  // },
  useUTC: true,
  dialect: process.env.ASTERISK_DIALECT || 'mysql',
  timezone: '-03:00',
  host: process.env.ASTERISK_HOST || '192.168.0.148',
  port: process.env.ASTERISK_PORT || '3306',
  database: process.env.ASTERISK_DB || 'Playlist',
  username: process.env.ASTERISK_USER || 'root',
  password: process.env.ASTERISK_PASSWORD || 'root',
  logging: false
};
