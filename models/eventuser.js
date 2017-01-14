module.exports = function(sequelize, DataTypes) {
	return sequelize.define('eventuser', {
		uid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'user',
				key: 'uid'
			}
		},
		eid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'event',
				key: 'eid'
			}
		}
	}, {
		tableName: 'eventuser'
	});
};
