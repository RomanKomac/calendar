module.exports = function(sequelize, DataTypes) {
	return sequelize.define('eventcircle', {
		cid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'circle',
				key: 'cid'
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
		tableName: 'eventcircle'
	});
};
