var app = angular.module("mainpage", []);

app.controller("register", ['$scope', '$http', '_EZintersocket', function(_scope, _http, _EZsocket){
	_scope.username  = "";
	_scope.password1 = "";
	_scope.password2 = "";
	_scope.mail = "";
	_scope.gender = "";
	_scope.gend = "";
	_scope.submit = function(event){
		event.preventDefault();
		var req = {
			method: 'POST',
			url: 'register',
			data: {
				'username' : _scope.username.trim(), 
				'password1' : _scope.password1,
				'password2' : _scope.password2,
				'mail' : _scope.mail,
				'gender' : (_scope.gend !== "other")? _scope.gend : _scope.genderopt
			}
		}
		_http(req).then(
			function(data){
				if(data.data.status === "ok"){
					document.cookie = "token=" + data.data.cookie + "; path=.";
					document.cookie = "user="  + data.data.user   + "; path=.";
					window.location.href = data.data.referal;
				}
				else if(data.data.status === "nok"){
					_EZsocket.send("warning", {content : data.data.message});
				}
			}, function(data){
				console.log(data);
			}
		);
	};
}]);

app.controller("login", ['$scope', '$http', '_EZintersocket', function(_scope, _http, _EZsocket){
	_scope.username = "";
	_scope.password = "";
	_scope.submit = function(event){
		event.preventDefault();
		var req = {
			method: 'POST',
			url: 'login',
			data: {
				'username' : _scope.username.trim(), 
				'password' : _scope.password
			}
		}
		_http(req).then(
			function(data){
				if(data.data.status === "ok"){
					document.cookie = "token=" + data.data.cookie + "; path=.";
					document.cookie = "user="  + data.data.user   + "; path=.";
					window.location.href = data.data.referal;
				}
				else if(data.data.status === "nok"){
					_EZsocket.send("warning", {content : data.data.message});
				}
			}, function(data){
				console.log(data);
			}
		);
	}
}]);