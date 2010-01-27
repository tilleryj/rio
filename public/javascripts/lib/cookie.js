/**
	@namespace 
	
	Methods for managing cookies.
*/
rio.Cookie = {

	key: "_RIO_",
	bindings: {},
	observers: {},

	/**
		Gets the value of a cookie.
		
		@param {String} name The name of the cookie to get.
	*/
	get: function(name) {
		var cookies = document.cookie.match(this.key + name + '=(.*?)(;|$)');
		return (cookies) ? unescape(cookies[1]) : null;
	},

	/**
		Sets the value of a cookie.
		
		@param {String} name The name of the cookie to set.
		@param {Object} value The value to set in the cookie.
	*/
	set: function(name, value) {
		// Set to 5000 days
		var expires = new Date(new Date().getTime()+(1000*60*60*24*5000)).toGMTString();
		var cookie = this.key + name + "=" + escape((value || "").toString());
		try {
			document.cookie = cookie + "; expires=" + expires;
			this["_" + name] = value;
			(this.observers[name] || []).each(function(observer) { observer(value); });
		} catch (e) {
			rio.log("Cookie.js - " + e);
		}
	},
	
	/**
		Set a default value for a cookie if the cookie is not yet defined
		
		@param {String} name The name of the cookie to set.
		@param {Object} value The default value to set in the cookie.
	*/
	setDefault: function(name, value) {
		if (document.cookie.match(this.key + name + '=(.*?)(;|$)') == undefined) {
			this.set(name, value);
		}
	},
	
	bind: function(name, observer) {
		if (this.observers[name] == undefined) { this.observers[name] = []; }
		
		this.observers[name].push(observer);
		observer(this.get(name));
	},
	
	binding: function(name, defaultValue) {
		if (defaultValue) {
			this.setDefault(name, defaultValue);
		}
		if (this.bindings[name]) { return this.bindings[name]; }
		
		this["_" + name] = this.get(name);
		this.bindings[name] = new rio.Binding(this, name);
		
		this[("get-" + name).camelize()] = this.get.curry(name).bind(this);
		this[("set-" + name).camelize()] = this.set.curry(name).bind(this);
		
		return this.bindings[name];
	}
};