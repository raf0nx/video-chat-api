const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("video_chat", "root", "Gracz1609", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;