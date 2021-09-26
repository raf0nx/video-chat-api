'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class OAuthUser extends Model {
		static associate(models) {}
	}
	OAuthUser.init(
		{
			id: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'OAuthUser',
		}
	);
	return OAuthUser;
};
