var app = new mingular.app("my-app");

app.controller("my-ctrl", function(_scope){
	_scope.detailed = "./server/users/admin.jpg";
	_scope.token = "";
	var cookies = document.cookie.split(";");
	for(var x in cookies){
		var cook = cookies[x].split("=");
		if(cook[0] === "token"){
			_scope.token = cook[1];
		}
	}
	_scope.logout = function(){
		document.cookie = "token" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		window.location.href = "./index.html";
	}
	
});

app.directive("innert", function(){
	return {
		scope : false,
		link : function(_scope, _elem, _attrs){
			console.log(_scope);
			_elem.onclick = function(event){
				if(event.preventDefault)
					event.preventDefault();
				console.log(_scope);
				
			}
		}
	}
});

app.directive("adminamic", ['_http', '_EZintersocket', function(_http, _EZsocket){
	return {
		scope : {},
		link : function(_scope, _elem, _attrs){
			
			_scope.getData = function(callback){
				_http.get("./server/getAdmin.php", {"token" : _scope.parent.scope.token}, function(result){
					var response = JSON.parse(result.responseText);
					if(response.status==="ok"){
						console.log(response);
						_scope.circles = response.circles;
						_scope.events = [];
						_scope.users = [];
						
						for(var c in response.circles){
							for(var e in response.circles[c].events){
								response.circles[c].events[e].owner = response.circles[c].name;
								_scope.events.push(response.circles[c].events[e]);
							}
						}
						
						for(var e in response.events){
							for(var l in response.events[e]){
								response.events[e][l].owner = e;
								_scope.events.push(response.events[e][l]);
							}
						}
						
						var us = response.users.users;
						for(var u in us){
							us[u].username = u;
							_scope.users.push(us[u]);
						}
						
						if(callback)
							callback();
					} else {
						_EZsocket.send("warning", {content : response.message});
						if(response.referral){
							setTimeout(function(){window.location.href = response.referral}, 4000);
						}
					}
				});
			};
			
			_scope.users = [];
			_scope.circles = [];
			_scope.events = [];
			
			_scope.curuser = {
				username : "USERNAME",
				password : "PASSWORD",
				mail : "MAIL"
			};
			
			_scope.curevent = {
				name : "NAME",
				desc : "DESCRIPTION",
				location : "LOCATION",
				start : "START",
				end : "END",
				owner : "OWNER"
			};
			
			_scope.curcircle = {
				name : "NAME",
				desc : "DESCRIPTION"
			};
			
			_scope.show = [];

			_scope.getData();
			
			
		}
	}
}]);
