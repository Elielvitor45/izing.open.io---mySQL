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
  dialect: 'mysql',
  timezone: '-03:00',
  host: '192.168.0.148',
  port: '3306',
  database: 'Playlist',
  username: 'root',
  password: 'root',
  logging: false
};
