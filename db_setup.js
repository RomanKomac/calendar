const Sequelize = require('sequelize');
const crypto = require('crypto');
var sha = crypto.createHash('sha1');
sequelize = new Sequelize('calendar', 'root', 'root', {
	dialect: 'mysql',
	port: 3306
});

sequelize.authenticate()
  .then(function(err) {
    console.log('Povezava vzpostavljena');
  }, function (err) { 
    console.log('Povezave ni bilo moc vzpostaviti: ', err);
  });