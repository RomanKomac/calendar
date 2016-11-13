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
** essentially 
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
		
		/* Controllers, directives services and root element
		*/
		var controllers = {};
		var directives = {
			'mng-repeat' : function(){
				return {
					scope: true,
					link: function(_scope, _elem, _attrs){
						var pscope = _scope.parent;
						console.log(_elem.parentNode);
						console.log(_scope);
						console.log(pscope);
						for( var x = 0; x < _attrs.length; x++ ){
							if( _attrs[x].name.match("mng-repeat") ){
							}
						}
					}
				}
			}
		};
		var services = {};
		var factories = {
			'EZshare' : function(){
				/* Sharing between isolated scopes can be done through this factory
				*/
				this.shared = {};
			},
			'_element' : function(){
				var rgx = /(<\/?.*?>)/g;
				this.comment = function(_el){
					console.log(rgx.exec(_el.outerHTML));
				};
				this.uncomment = function(_el){
					console.log(_el.outerHTML);
				};
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
			var children = node.childNodes
			var found = null;
			for( var i = 0; i < children.length; i++ ){
				if( (found = traverse(children[i], defs)) != null )
					break;
			}
			return found;
		}
		
		var traverseList = function(el, type){
			var list = [];
			if(el.type === type)
				list.push(el);
			var children = el.children;
			var found = null;
			for( var i = 0; i < children.length; i++ ){
				found = traverseList(children[i], type);
				list.push.apply(list, found);
			}
			return list;
		}
		
		var traverseHi = function(p_obj, node, dirs, defs){
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
			
			var children = node.childNodes
			var list = [];
			for( var i = 0; i < children.length; i++ ){
				var f = traverseHi((obj.connected? obj : p_obj), children[i], dirs, defs);
				if( (typeof f) === 'object' && f.length && f.length > 0)
					list.push.apply(list, f);
				else if( (typeof f) === 'object' && !f.length )
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
							console.log(controllers[x]);
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
						else if( (typeof directives[dname]) === 'object' && directives[dname].length ){
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
					/* Insertion of scope and finding elements
					** If scope create individual scope, otherwise bind to parent
					** If scope is object create shared scope with given attrs predefined
					*/
					var instances = [];
					for( var ins in inst ){
						if( inst[ins].name === dname )
							instances.push(inst[ins]);
					}
					directives[dname].instance = [];
					
					var bind = ( !directives[dname].scope || (typeof directives[dname].scope) === 'object' );
					var sc = directives[dname].scope;
					for( var i = 0; i < instances.length; i++ ){
						if( !directives[dname].scope )
							sc = instances[i].parent.scope;
						var elem = instances[i];
							//console.log(elem);
							elem.scope = bind? sc : {};
							elem.scope.parent = elem.parent;
							elem.link = new directives[dname].link(elem.scope, elem.connected, elem.connected.attributes);
						directives[dname].instance.push(elem);
					}
				}
			},
			s : function(sname){
				if( (typeof services[sname]) === 'function' ){
					/* Most low-level service
					** object instance is created
					*/
					return services[sname]();
				}
				else if( (typeof services[sname]) === 'object' && services[sname].length ){
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
				else if( (typeof factories[fname]) === 'object' && factories[fname].length && !factories[fname].compiled ){
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
				var hierarchy = traverseHi(null, root, dirs, defs);
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