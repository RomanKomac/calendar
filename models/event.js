module.exports = function(sequelize, DataTypes) {
	return sequelize.define('event', {
		eid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true
		},
		eventname: {
			type: DataTypes.STRING,
			allowNull: false
		},
		eventdesc: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		start: {
			type: DataTypes.DATE,
			allowNull: true
		},
		end: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		tableName: 'event'
	});
};
