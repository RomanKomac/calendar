module.exports = function(sequelize, DataTypes) {
	return sequelize.define('circleuser', {
		uid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'user',
				key: 'uid'
			}
		},
		cid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'circle',
				key: 'cid'
			}
		},
		add: {
			type: DataTypes.INTEGER(1),
			allowNull: false
		},
		edit: {
			type: DataTypes.INTEGER(1),
			allowNull: false
		},
		remove: {
			type: DataTypes.INTEGER(1),
			allowNull: false
		}
	}, {
		tableName: 'circleuser'
	});
};
