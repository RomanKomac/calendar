module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user', {
		uid: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			primaryKey: true
		},
		gid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'group',
				key: 'gid'
			}
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false
		},
		password: {
			type: DataTypes.STRING(40),
			allowNull: false
		},
		salt: {
			type: DataTypes.STRING(40),
			allowNull: false
		},
		mail: {
			type: DataTypes.STRING,
			allowNull: false
		},
		gender: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		tableName: 'user'
	});
};
