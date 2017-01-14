module.exports = function(sequelize, DataTypes) {
	return sequelize.define('circle', {
		cid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true
		},
		circlename: {
			type: DataTypes.STRING,
			allowNull: true
		},
		created: {
			type: DataTypes.DATE,
			allowNull: true
		},
		ownerid: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			references: {
				model: 'user',
				key: 'uid'
			}
		}
	}, {
		tableName: 'circle'
	});
};
