"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OAuthUser extends Model {
    static associate(models) {}
  }
  OAuthUser.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "OAuthUser",
    }
  );
  return OAuthUser;
};
