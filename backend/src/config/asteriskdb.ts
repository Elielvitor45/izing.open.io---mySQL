require("../bootstrap");

module.exports = {
  define: {
    charset: "latin1",
    collate: "latin1_swedish_ci"
  },
  useUTC: true,
  dialect: "mysql",
  timezone: "-03:00",
  host: "localhost",
  port: "3306",
  database: "Playlist",
  username: "root",
  password: "root",
  logging: false
};
