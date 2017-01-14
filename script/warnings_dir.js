
app.service('_EZintersocket', function _EZintersocket() {
	var subscribed = {};
	this.subscribe = function(port, callback){
		if(!subscribed[port])
			subscribed[port] = [];
		subscribed[port].push(callback);
	}

	this.send = function(port, message){
		if(subscribed[port]){
			for(var i = 0; i < subscribed[port].length; i++){
				subscribed[port][i](message);
			}
		}
	}
});

app.directive("warnings", ["_EZintersocket", function(_EZsocket){
	return {
		scope : true,
		link : function(_scope, _elem, _attrs){
			var max = 5;
			var num = 0;
			for( var x = 0; x < _attrs.length; x++ ){
				if( _attrs[x].name.match(/^\s*([a-z]*-)?warnings\s*$/i) ){
					max = parseInt(_attrs[x].value);
					break;
				}
			}
			var warnel = '<div class="warning"></div>';
			var warns = [];
			_EZsocket.subscribe("warning", function(message){
				//create new warning with message
				if(num >= max){
					//if too many, queue
					warns.push(message.content);
					return;
				}
				var warnel_copy = document.createElement('div');
				warnel_copy.className = "warning";
				warnel_copy.innerHTML = message.content;
				if(message.color)
					warnel_copy.style.background = message.color;
				_elem[0].appendChild(warnel_copy);
				num++;
				setTimeout(function(){
					_elem[0].removeChild(warnel_copy);
					num--;
					if(warns.length > 0){
						var m = warns[0];
						warns.shift();
						_EZsocket.send("warning", m);
					}
				}, 4000);
			});
		}
	}
}]);