const fs        = require("fs");
const path      = require("path");
const Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
var sequelize = new Sequelize("sp", "root", "root", {define: { timestamps: false } });

var db        = {};

fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.getEventsFromUser = function(username, fun){
	sequelize.query('SELECT e.* FROM user u, event e, eventuser eu WHERE u.username="'+username+'" AND (u.uid = eu.uid AND eu.eid = e.eid)', { model: db.event }).then(function(events1){
		sequelize.query('SELECT e.* FROM user u, event e, circle c, eventcircle ec, circleuser cu WHERE u.username="'+username+'" AND (cu.uid = u.uid AND cu.cid = c.cid AND c.cid = ec.cid AND e.eid = ec.eid)', { model: db.event }).then(function(events2){
			fun(events1.concat(events2));
		}
	)}
)};

db.getCirclesFromUser = function(username, fun){
	sequelize.query('SELECT c.* FROM user u, circle c, circleuser cu WHERE u.username="'+username+'" AND u.uid = cu.uid AND cu.cid = c.cid', { model: db.circle }).then(function(circles){
		fun(circles);
	}
)};

db.getAllCircles = function(fun){
	db.circle.findAll().then(function(data){
		fun(data);
	});
};

db.getAllUsers = function(fun){
	db.user.findAll().then(function(data){
		fun(data);
	});
};

db.getAllEvents = function(fun){
	db.events.findAll().then(function(data){
		fun(data);
	});
};

module.exports = db;