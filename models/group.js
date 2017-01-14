module.exports = function(sequelize, DataTypes) {
	return sequelize.define('group', {
		gid: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true
		},
		groupname: {
			type: DataTypes.STRING,
			allowNull: false
		},
		useredit: {
			type: DataTypes.INTEGER(1),
			allowNull: false
		},
		circleedit: {
			type: DataTypes.INTEGER(1),
			allowNull: false
		}
	}, {
		tableName: 'group'
	});
};
