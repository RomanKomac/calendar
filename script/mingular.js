/* Author: Roman Komac 
** simple implementation, angular-esque data driven js framework
** mingular (minimal angular)
** Does not(as of yet) support dynamic compilation of elements containing directives/controllers
** directive scope.parent will always point to hierarchical parent in DOM
** scope itself will be connected according to passed value scope in object
*/

/* Definitions
** APP 
** creates a new app bound to element with attribute value appname
**
**
** CONTROLLERS
**
**
** DIRECTIVES
**
**
** SERVICES
** A service is a mutable simple injectable provider, calculator, data carrier, etc.
** A service always returns an object(body of a service). 
** This object is not shared. Each time a directive/service/factory requests
** a service a new instance of a service is instantiated
** A service is compiled per request
**
** FACTORIES
** A factory is an immutable simple injectable provider, calculator, data carrier, etc.
** A factory instance is shared between injector callers
** A factory is precompiled
*/


/* These directives/factories/services are to be moved inside when all other parts of app are ready
** These declarations are core to any webapp
*/

if (!Object.prototype.watch) {
	Object.defineProperty(Object.prototype, "watch", {
		enumerable: false,
		configurable: true,
		writable: false,
		value: function (prop, handler) {
			var oldval = this[prop], newval = oldval,
			getter = function () {
				return newval;
			},
			setter = function (val) {
				oldval = newval;
				newval = val;
				handler.call(oldval, val);
			};
			
			if (delete this[prop]) {
				Object.defineProperty(this, prop, {
					get: getter,
					set: setter,
					enumerable: true,
					configurable: true
				});
			}
		}
	});
};


var mingular = {
	app : function(name, conf){
		this.name = name;
		/* Configuration object for renaming html variables
		*/
		this.defaults = {};
		this.defaults.appname  = (conf && conf["appname"])? conf["appname"] : 'mng-app';
		this.defaults.ctrlname = (conf && conf["ctrlname"])? conf["ctrlname"] : 'mng-ctrl';
		//this.defaults.prefixes = ['', 'x-', 'data-'];
		
		var defs = this.defaults;
		defs.name = this.name;
		defs.attrname = defs.appname;
		
		/* find element in DOM with name
		** found element is mingular root
		*/
		var traverse = function(node, defs){
			var attr = node.attributes;
			if(attr != undefined && attr != null){
				for( var i = 0; i < attr.length; i++ ){
					if( attr[i].name.match(defs.attrname) && ((defs.name && attr[i].nodeValue === defs.name) || !defs.name) ){
						return node;
					}
				}
			}
			var children = node.children;
			var found = null;
			for( var i = 0; i < children.length; i++ ){
				if( (found = traverse(children[i], defs)) != null )
					break;
			}
			return found;
		}
		
		var traverseList = function(el, type){
			//BFS
			var list = [];
			var trav = [];
			
			if(Object.prototype.toString.call( el ) === '[object Array]'){
				trav.push.apply(trav, el);
			} else {
				trav.push(el);
			}

			while(trav.length > 0){
				var elem = trav[0];
				if(elem.type === type)
					list.push(elem);
				trav.push.apply(trav, elem.children);
				trav.shift();
			}
			
			return list;
		}
		//copies all but scope values
		var cloneHi = function(obj){
			var cln = {};
			cln.connected = obj.connected.cloneNode();
			obj.parent.connected.appendChild(cln.connected);
			cln.name = obj.name;
			cln.type = obj.type;
			cln.parent = obj.parent;
			cln.scope = {};
			cln.scope.self = cln;
			cln.scope.parent = cln.parent;
			cln.parent = obj.parent;
			obj.parent.children.push(cln);
			return obj;
		}
		
		var traverseHi = function(p_obj, node, dirs, defs, depth){
			if(depth <= 0)
				return undefined;
			var obj = {};
			var attr = node.attributes;
			if(attr != undefined && attr != null){
				attr_found:
				for( var i = 0; i < attr.length; i++ ){
					for( var k = 0; k < dirs.length; k++ ){
						if( attr[i].name.match(dirs[k]) ){
							obj.connected = node;
							obj.name = dirs[k];
							obj.type = 'dir';
							break attr_found;
						}
						else if( attr[i].name.match(defs.ctrlname) ){
							obj.connected = node;
							obj.name = attr[i].nodeValue;
							obj.type = 'ctrl';
							break attr_found;
						}
					}
				}
			}
			
			var children = node.children;
			var list = [];
			for( var i = 0; i < children.length; i++ ){
				var f = traverseHi((obj.connected? obj : p_obj), children[i], dirs, defs, (obj.connected? depth-1 : depth));
				if( (typeof f) === 'object' && Object.prototype.toString.call( f ) === '[object Array]' && f.length > 0)
					list.push.apply(list, f);
				else if( (typeof f) === 'object' && Object.prototype.toString.call( f ) !== '[object Array]' )
					list.push(f);
			}
			if(obj.connected){
				obj.children = list;
				obj.parent = p_obj;
				return obj;
			} else if( list.length > 0 ){
				return list;
			} else {
				return undefined;
			}
		}
		
		/* Callback functions executed after everything has compiled
		*/
		var callbacks = [];
		var compilers = {
			c : function(inst){
				if( !inst.length || inst.length === 0 )
					throw "No controllers found in DOM";
				
				for( var x in controllers ){
					for( var j = 0; j < inst.length; j++ ){
						if(x === inst[j].name){
							var scope_ = {};
							scope_.parent = inst[j].parent;
							var link_ = new controllers[x](scope_);
							controllers[x] = inst[j];
							controllers[x].scope = scope_;
							controllers[x].link = link_;
							break;
						}
					}
					if( !controllers[x].scope )
						throw "Controller '" + x + "' not found in DOM";
				}
			},
			d : function(inst){
				for( var dname in directives ){
					if( directives[dname] ){
						if( (typeof directives[dname]) === 'function' ){
							directives[dname] = directives[dname]();
						}
						else if( (typeof directives[dname]) === 'object' && Object.prototype.toString.call( directives[dname] ) === '[object Array]' ){
							var args = [];
							for( var i = 0; i < directives[dname].length-1; i++ ){
								var sfname = directives[dname][i];
								if( factories[sfname] ){
									/* It is a factory!
									*/
									args.push(compilers.f(sfname));
								}
								else if( services[sfname] ){
									/* It is a service!
									*/
									args.push(compilers.s(sfname));
								}
								else {
									console.warn("Factory/Service " + sfname + " not found");
								}
							}
							var fpos = directives[dname].length - 1;
							directives[dname] = directives[dname][fpos].apply(directives[dname][fpos], args);
						}
					} else {
						throw "Directive " + dname + " not found";
					}
				}
				
				/* Insertion of scope and finding elements
				** If scope create individual scope, otherwise bind to parent
				** If scope is object create shared scope with given attrs predefined
				*/
				var instances = [];
				for( var ins in inst ){
					if(typeof inst[ins] === "function" || Object.prototype.toString.call( inst[ins] ) === '[object Array]')
						continue;
					var dname = inst[ins].name;
					if(!directives[dname].instance)
						directives[dname].instance = [];
					
					var bind = ( !directives[dname].scope || (typeof directives[dname].scope) === 'object' );
					var sc = directives[dname].scope;
					
					
					if( !directives[dname].scope )
						sc = inst[ins].parent.scope;
					var elem = inst[ins];
					if(!elem.scope){
						elem.scope = bind? sc : {};
					}
					elem.scope.parent = elem.parent;
					elem.scope.self = elem;
					elem.link = new directives[dname].link(elem.scope, elem.connected, elem.connected.attributes);
					
					directives[dname].instance.push(elem);
				}
			},
			s : function(sname){
				if( (typeof services[sname]) === 'function' ){
					/* Most low-level service
					** object instance is created
					*/
					return services[sname]();
				}
				else if( (typeof services[sname]) === 'object' && Object.prototype.toString.call( services[sname] ) === '[object Array]' ){
					var args = [];
					for( var i = 0; i < services[sname].length-1; i++ ){
						var sfname = services[sname][i];
						if(services[sfname]){
							args.push(compilers.s(sfname));
						}
						else if(factories[sfname]){
							args.push(compilers.f(sfname));
						}
						else{
							console.warn("Service/Factory " + sfname + " not found");
						}
					}
					var fpos = services[sname].length-1;
					var serv = services[sname][fpos].apply(services[sname][fpos], args);
					return serv;
				}
			},
			f : function(fname){
				if( (typeof factories[fname]) === 'function' && !factories[fname].compiled ){
					/* Most low-level factory
					** function instance is created
					*/
					var f = new factories[fname]();
					f.compiled = true;
					//f.freeze();
					factories[fname] = f;
				}
				else if( (typeof factories[fname]) === 'object' && Object.prototype.toString.call( factories[fname] ) === '[object Array]' && !factories[fname].compiled ){
					var args = [];
					for( var i = 0; i < factories[fname].length-1; i++ ){
						var sfname = factories[fname][i];
						if(services[sfname]){
							args.push(compilers.s(sfname));
						}
						else if(factories[sfname]){
							args.push(compilers.f(sfname));
						}
						else{
							console.warn("Factory/Service " + sfname + " not found");
						}
					}
					var fpos = factories[fname].length-1;
					args.unshift(factories[fname][fpos]);
					var f = new (factories[fname][fpos].bind.apply(factories[fname][fpos], args));
					f.compiled = true;
					factories[fname] = f;
				}
				
				return factories[fname];
			}
		};
		
		
		/* Controllers, directives services and root element
		*/
		var controllers = {};
		var directives = {
			'mng-model' : function(){
				return {
					scope : false,
					link : function(_scope, _elem, _attrs){
						var bound;
						for( var x = 0; x < _attrs.length; x++ ){
							if( _attrs[x].name.match(/^\s*([a-z]*-)?mng-model\s*$/gi) ){
								bound = _attrs[x].value;
								break;
							}
						}
						if(_elem.type && (_elem.type==="text" || _elem.type==="email" || _elem.type==="password")){
							if(!bound)
								bound = _elem.name;
							if(_scope[bound]){
								_elem.value = _scope[bound];
							} else {
								_scope[bound] = _elem.value? _elem.value : _elem.getAttribute("placeholder");
							}

							var cantype = false;
							_elem.onfocus = function(event){
								 if (event.stopPropagation) 
									event.stopPropagation();   
								cantype = true;
							}
							_elem.onblur = function(event){
								 if (event.stopPropagation) 
									event.stopPropagation();   
								cantype = false;
							}
							_elem.onkeydown = function(event){
								if (cantype){
									setTimeout(function(){ _scope[bound] = _elem.value; }, 0);
								}
							}
							
						} else if(_elem.type && _elem.type==="radio"){
							if(!bound)
								bound = _elem.name;
							if(_elem.getAttribute("checked") !== null )
								_scope[bound] = _elem.value;

							_elem.onchange = function(event){
								setTimeout(function(){ _scope[bound] = _elem.value; }, 0);
							}
						} else if(_elem.type==="date"){
							if(!bound)
								bound = _elem.name;
							
							_scope[bound] = _elem.value;

							_elem.onchange = function(event){
								setTimeout(function(){ _scope[bound] = _elem.value; }, 0);
							}
						}
					}
				}
			},
			'mng-click' : function(){
				return {
					scope: false,
					link : function(_scope, _elem, _attrs){
						var bound;
						for( var x = 0; x < _attrs.length; x++ ){
							if( _attrs[x].name.match(/^\s*([a-z]*-)?mng-click\s*$/gi) ){
								bound = _attrs[x].value;
								break;
							}
						}
						_elem.onclick = function(event){
							if(event.preventDefault)
								event.preventDefault();
							_scope[bound](event);
						}
					}
				}
			},
			'buffer-dir' : function(){
				return {
					scope: true,
					link: function(_scope, _elem, _attrs){
						var attrval = "";
						for( var x = 0; x < _attrs.length; x++ ){
							if( _attrs[x].name.match("buffer-dir") ){
								attrval = _attrs[x].value;
								break;
							}
						}
						
						var renderFunc = function(val, caller){
							_elem.innerHTML = val;
						}
						
						/* If target variable in parent
						*/
						var y = _scope.parent.scope;
						var count2 = 0;
						var aspl2 = attrval.split(".");
						var prel2 = aspl2[aspl2.length-1];
						for(var i = 0; i < aspl2.length-1; i++){
							if(y[aspl2[i]]){
								y = y[aspl2[i]];
								count2++;
							}
						}
						
						/* If target variable in same element or sibling
						*/
						var count1 = 0;
						var aspl1 = attrval.split(".");
						var prel1 = aspl1[aspl1.length-1];
						var z = _scope.parent.children;
						var x;
						for(var c in z){
							if(z[c].name === "buffer-holder"){
								
								x = z[c].scope;
								if(x){
								for(var i = 0; i < aspl1.length-1; i++){
									if(x[aspl1[i]]){
										x = x[aspl1[i]];
										count1++;
									}
								}
								}
							} 
						}
						
						if(z && y[prel2] && _scope.parent){
							y.watch(prel2, function(oldval, newval){
								renderFunc(oldval, "reassign");
							});
							renderFunc(y[prel2], "prerender");
						}
						
						if(x && x[prel1]){
							x.watch(prel1, function(oldval, newval){
								renderFunc(oldval, "reassign");
							});
							renderFunc(x[prel1], "prerender");
						}
					}
				}
			},
			'buffer-holder' : function(){
				return {
					scope: true,
					link: function(_scope, _elem, _attrs){
						
						var attrval = null;
						for( var x = 0; x < _attrs.length; x++ ){
							if( _attrs[x].name.match("buffer-holder") ){
								attrval = _attrs[x].value;
								break;
							}
						}
						if(attrval){
							var coms = attrval.split(" ");
							var idx = parseInt(coms[4]);
							if(idx === NaN)
								idx = coms[4];
							var nd = _scope.parent;
							while(nd){
								if(nd.scope[coms[2]]){
									_scope[coms[0]] = (nd.scope[coms[2]])[idx];
									break;
								}
								nd = nd.parent;
							}
						}
					}
				}
			},
			'mng-style' : function(){
				return {
					scope: false,
					link: function(_scope, _elem, _attrs){
						var attrval = "";
						for( var x = 0; x < _attrs.length; x++ ){
							if( _attrs[x].name.match("mng-style") ){
								attrval = _attrs[x].value;
								break;
							}
						}
						
						var regx = (/([a-z0-9-]+)\s*:\s*([a-z0-9]+)/gi);
						var styl = regx.exec(attrval);
						
						_scope.watch(styl[2], function(oldval, newval){
							_elem.style[styl[1]] = oldval;
						});	

							
						
					}
				}
			},
			'mng-src' : function(){
				return {
					scope: false,
					link: function(_scope, _elem, _attrs){
						var attrval = "";
						for( var x = 0; x < _attrs.length; x++ ){
							if( _attrs[x].name.match("mng-src") ){
								attrval = _attrs[x].value;
								break;
							}
						}
						
						var count = 0;
						var aspl = attrval.split(".");
						var prel = aspl[aspl.length-1];
						var y = _scope;
						for(var i = 0; i < aspl.length-1; i++){
							if(y[aspl[i]]){
								y = y[aspl[i]];
								count++;
							}
						}
						if(count == aspl.length-1){
							y.watch(aspl[count], function(oldval, newval){
								_elem.removeAttribute("src");
								_elem.setAttribute("src", oldval);
							});	
							_elem.removeAttribute("src");
							_elem.setAttribute("src", y[aspl[count]]);
						}	
						
					}
				}
			},
			'mng-repeat' : function(){
				return {
					scope: true,
					link: function(_scope, _elem, _attrs){
						var pnode = _elem.parentNode;
						var minpnode = _scope.parent;
						
						var nd = minpnode;
						while(nd){
							if(nd.name === "mng-repeat")
								return;
							nd = nd.parent;
						}
						var attrval = "";
						for( var x = 0; x < _attrs.length; x++ ){
							if( _attrs[x].name.match("mng-repeat") ){
								attrval = _attrs[x].value;
								_elem.removeAttribute(_attrs[x].name);
								break;
							}
						}
						
						var elemcopy = _elem.cloneNode(true);
						_elem.style.display = "none";
						
						var elems = [];
						var n2 = "", n1= "";
						var rgx = /([a-z]+) in ([a-z]+)/gi;
						var sol = rgx.exec(attrval);
						
						if(sol && sol.length > 2){
							n2 = sol[2];
							n1 = sol[1];
							_scope[n1] = [];
							
							var customEvents = function(arr, callback) {
								arr.push =    function(e) { Array.prototype.push.call(arr, e); callback(arr, "push"); };
								arr.pop =     function(e) { Array.prototype.pop.call(arr, e); callback(arr, "pop"); };
								arr.shift =   function(e) { Array.prototype.shift.call(arr, e); callback(arr, "shift"); };
								arr.unshift = function(e) { Array.prototype.unshift.call(arr, e); callback(arr, "unshift"); };
								arr.slice =   function(e) { Array.prototype.slice.call(arr, e); callback(arr, "slice"); };
								arr.splice =  function(e) { Array.prototype.splice.call(arr, e); callback(arr, "splice"); };
								arr.concat =  function(e) { Array.prototype.concat.call(arr, e); callback(arr, "concat"); };
							};
							
							var renderFunc = function(arr, caller){
								
								if(caller === "reassign")
									customEvents(_scope.parent.scope[n2], renderFunc);
								
								for(var j in elems){
									pnode.removeChild(elems[j]);
								}
								elems = [];
								
								for(var ch in minpnode.children){
									if(minpnode.children[ch].name === "buffer-holder"){
										minpnode.children.splice(ch,1);
									}
								}
								
								for(var i in arr){
									if(typeof arr[i] !== "function"){
										var el = elemcopy.cloneNode(true);
										el.setAttribute("buffer-holder", attrval + " by " + i);
										elems.push(el);
										pnode.appendChild(el);
									}
								}
								var dirs = [];
								for(var x in directives)
									dirs.push(x);
								var hi = traverseHi(minpnode, pnode, dirs, defs, 3);
								if(Object.prototype.toString.call( hi ) === '[object Array]'){
									for(var j in hi){
										if(hi[j].name === "mng-repeat"){
											hi.splice(j,1);
										}
									}
								}
								var d_DOM = traverseList(hi, 'dir');
								compilers.d(d_DOM);
								
							}
							if(_scope.parent.scope[n2]){
								_scope.parent.scope.watch(n2, function(oldval, newval){
									renderFunc(_scope.parent.scope[n2], "reassign");
								});
								customEvents(_scope.parent.scope[n2], renderFunc);
								renderFunc(_scope.parent.scope[n2], "prerender");
							}
						}

						return;
					}
				}
			}
		};
		var services = {
			'_http' : function(){
				return {  
					get : function(dir, data, callback){
						var xhttp = new XMLHttpRequest();
						var params = "";
						for (key in data) {
							params += encodeURIComponent(key)+"="+encodeURIComponent(data[key])+"&";
						}
						xhttp.open("GET", dir + "?" + params, true);
						xhttp.onreadystatechange = function(){
							if( xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200){
								callback(xhttp);
							}
						};
						xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
						xhttp.send();
					},
					post : function(dir, data, callback){
						var xhttp = new XMLHttpRequest();
						xhttp.open("POST", dir, true);
						xhttp.onreadystatechange = function(){
							if( xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200){
								callback(xhttp);
							}
						};
						xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
						var params = "";
						for (key in data) {
							params += encodeURIComponent(key)+"="+encodeURIComponent(data[key])+"&";
						}
						xhttp.send(params.slice(0, -1));
					}
				}
			}
		};
		var factories = {
			'_EZintershare' : function(){
				/* Sharing between isolated scopes can be done through this factory
				*/
				this.shared = {};
			},
			'_EZintersocket' : function(){
				/* Sharing between isolated scopes can be done through this factory
				*/
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
			},
			'_eval' : function(){

			}
		};
		var root = null;
		
		/* Controllers and directives in DOM
		*/
		var controllers_DOM = [];
		var directives_DOM = [];
		
		/* Preparing services, directives and controllers pre-initialization
		** Initialization and binding on window.onload
		*/
		this.controller = function(name_, func_){
			controllers[name_] = func_;
		};	
		this.directive = function(name_, func_){
			directives[name_] = func_;
		};
		this.service = function(name_, func_){
			services[name_] = func_;
		};
		this.factory = function(name_, func_){
			factories[name_] = func_;
		};

		
		window.onload = function(){
			var el = traverse(document.body, defs);
			if( el != null ){
				root = el;
				
				/* Compile factories
				** Simple factories are precompiled
				** if in wrong order of use they are compiled in a recursive call
				*/
				/* Simple services are compiled per-request
				** if in wrong order of use they are compiled in a recursive call
				*/
				for( var x in factories ){
					compilers.f(x);
				}
				
				/* Build dependency hierarchy
				** Hierarchy, as of yet, cannot be changed at runtime
				*/
				var dirs = [];
				for(var x in directives)
					dirs.push(x);
				//maximum of 20 sublevels(subcontrollers/subdirectives) in mingular hierarchy
				var hierarchy = traverseHi(null, root, dirs, defs, 20);
				/* Compile controllers
				** Scope of controller is propagated to directives
				*/
				controllers_DOM = traverseList(hierarchy, 'ctrl');
				directives_DOM = traverseList(hierarchy, 'dir');
				compilers.c(controllers_DOM);
				
				/* Compile directives
				*/
				compilers.d(directives_DOM);
				
				
				console.info("Mingular App compiled successfully");
			}
			else
				throw "App attribute " + defs.appname + " with value: " + defs.name + " not found";
		}
	},
	compiler : {
		
	}
};