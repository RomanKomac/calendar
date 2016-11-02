var app = new mingular.app("my-app");

app.controller("my-ctrl", function(_scope){
	_scope.somedata="test!";
	
});

app.directive("commented", ['_element', function(_element){
	return {
		template : "<div></div>",
		templateUrl : 'neki.html',
		scope : {},
		link : function(_scope, _elem, _attrs){
			_element.comment(_elem);
		}
	}
}]);

app.directive("simple-dir", function(){
	return {
		template : "<div></div>",
		templateUrl : 'neki.html',
		scope : {},
		link : function(_scope, _elem, _attrs){
			this.message = "compiled!";
		}
	}
});

app.directive("simple-dir2", function(){
	return {
		template : "<div></div>",
		templateUrl : 'neki.html',
		scope : false,
		link : function(_scope, _elem, _attrs){
			
		}
	}
});

app.directive("my-directive", ['my-service', function(my_service){
	return {
		template : "<div></div>",
		templateUrl : 'neki.html',
		scope : true,
		link : function(_scope, _elem, _attrs){
			console.log(_scope);
		}
	}
}]);

app.service("my-service", ["other-factory", function(other_factory){
	return {
		ret_function : function(){
			return other_factory.simple_message();
		},
		log_function : function(){
			console.log(other_factory.simple_message());
		},
		some_value : "value"
	}
}]);

app.service("third-service", function(){
	return {
		simple_message : function(){
			return "Hello World!";
		}
	}
});

app.factory("other-factory", ["third-service", function(third_service){
	this.simple_message = function(){
		return third_service.simple_message();
	}
}]);
