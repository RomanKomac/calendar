var app = angular.module("calendar", []);

app.controller("calctrl", ['$scope', function(_scope){
	_scope.token = "";
	_scope.user = "";
	_scope.locale = {};
	console.log("started");
	var cookies = document.cookie.split(";");
	for(var x in cookies){
		var cook = cookies[x].split("=");
		if(cook[0] === "token"){
			_scope.token = cook[1];
		}
		else if(cook[0] === "user"){
			_scope.user = cook[1];
		}
	}
	
	_scope.logout = function(){
		document.cookie = "token" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		window.location.href = "./";
	}
	
}]);

app.directive("enabler", function(){
	return {
		scope : false,
		link : function(_scope, _elem, _attrs){
			_scope.$parent.openDialog = function(){
				_elem[0].checked = true;
			}
		}
	}
});

app.directive("dynamic", ['$http', '_EZintersocket', function(_http, _EZsocket){
	return {
		scope : false,
		link : function(_scope, _elem, _attrs){
			console.log(_elem);
			_scope.getData = function(callback){
				// GET circles and events
				var req = {
					method: 'GET',
					url: 'event'
				}
				_http(req).then(
					function(data){
					var response = data.data;
					if(response.status==="ok"){
						console.log(response.circles);
						_scope.circles = response.circles;
						_scope.circlesmob = response.circles;
						
						_scope.circlesmob = response.circles;
						_scope.events = response.events;
						
						_scope.today = [];
						var msPerDay = 1000 * 60 * 60 * 24;
						for(var k in _scope.events){
							var ds = new Date(_scope.events[k].start);
							var de = new Date(_scope.events[k].end);
							if(ds.getTime() - Date.now() < msPerDay || de.getTime() - Date.now() < msPerDay){
								_scope.today.push(_scope.events[k]);
							}
						}
						
						if(callback)
							callback();
					} else {
						_EZsocket.send("warning", {content : response.message});
						if(response.referral){
							setTimeout(function(){window.location.href = response.referral}, 4000);
						}
					}
				}, function(data){
					console.log(data);
				}
			)};
			
			_scope.circles = [];
			_scope.circlesmob = [];
			_scope.events = [];
			_scope.today = [];
			_scope.period = "";
			_scope.colHeight = "";
			_scope.days = [];
			_scope.flow = "hidden";
			
			_scope.startev = "";
			_scope.endev = "";
			_scope.evlocation = "";
			_scope.evname = "";
			_scope.evdesc = "";
			
			_scope.startup = true;
			
			_scope.searchEvents = function(event){
				if(event)event.preventDefault();
				var searchfunc = function(){
					var ms = 0;
					var lendays = 1;
					_scope.gridWidth = "";
					_scope.flow = "hidden";
					if(_scope.period === "day"){
						ms = 1000 * 60 * 60 * 24;
						lendays = 1;
						_scope.gridWidth = "1200%";
						_scope.flow = "scroll";
					}
					else if(_scope.period === "week"){
						ms = 7 * 1000 * 60 * 60 * 24;
						lendays = 7;
					}
					else if(_scope.period === "month"){
						var dt = new Date(_scope.date);
						var m = dt.getMonth();
						if(m > 7){m-1}
						lendays = 30 + m%2;
						var ms = lendays * 1000 * 60 * 60 * 24;
						//visina stolpcev le 1/5 visine zaslona
						_scope.colHeight = "20%";
					}
					else if(_scope.period === "agenda"){
						//procesiraj posebej
						_scope.days = [[]];
						var chosen = new Date(_scope.date);
						var count = 0;
						for(var i in _scope.events){
							var ds;
							if(_scope.events[i].datestart)
								ds = new Date(_scope.events[i].start);
							else
								ds = new Date(_scope.events[i].end);
							if(ds > chosen){
								_scope.days[0].push(_scope.events[i]);
								count++;
							}
						}
						if(!count)
							_EZsocket.send("warning", {content : "No events available", color : "#f5d511"});
						_scope.gridWidth = "1200%";
						_scope.flow = "scroll";
						return;
					}
					
					var chosen = new Date(_scope.date);
					
					_scope.days = [];
					for (var i = 0; i < lendays; i++) {
					  _scope.days.push([]);
					}
					
					var count = 0;
					for(var i in _scope.events){
						var ds;
						if(_scope.events[i].datestart)
							ds = new Date(_scope.events[i].start);
						else
							ds = new Date(_scope.events[i].end);
						
						if(lendays >= 28 && ds.getMonth() == chosen.getMonth() && ds.getYear() == chosen.getYear()){
							_scope.days[ds.getDate()%7].push(_scope.events[i]);
							count++;
						}
						if(ds - chosen < ms){
							count++;
							if(lendays == 7){
								_scope.days[ds.getDay()].push(_scope.events[i]);
							}
							else if(lendays == 1){
								_scope.days[0].push(_scope.events[i]);
							}
						}
					}
					if(!count && !_scope.startup){
						_EZsocket.send("warning", {content : "No events available in the selected " + _scope.period, color : "#f5d511"});
					}
					_scope.startup = false;
				}
				if(!_scope.events || _scope.events.length === 0){
					console.log("loading data");
					_scope.getData(searchfunc);
				} else {
					searchfunc();
				}
			};
			
			_scope.searchEvents();
			
			_scope.addEvent = function(event){
				if(event)event.preventDefault();
				_scope.events.push({
					name : _scope.evname,
					desc : _scope.evdesc,
					datestart : _scope.startev,
					dateend : _scope.endev
				});
				_scope.searchEvents();
			}
			
		}
	}
}]);