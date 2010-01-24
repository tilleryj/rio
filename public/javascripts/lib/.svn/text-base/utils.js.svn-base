/**
	@namespace Random utility methods
*/
rio.Utils = {
	/**
		Alternates returning the two input arguments.
	*/
	cycle: function(var1, var2) {
		if (!this._CYCLE_COUNT) { this._CYCLE_COUNT = 0; }
		this._CYCLE_COUNT++;
		return this._CYCLE_COUNT % 2 == 1 ? var1 : var2;
	},

	/**
		Navigates to a given URL, allowing you to set the Rails-style HTTP method.
		
		@param {String} location The url to goto
		@param {String} action (optional) The HTTP verb to use. (currently supports get|delete)
		@param {String} token (optional) A Rails-style authenticity token
	*/
	navigateTo: function(location, action, token) {
		if (action == "delete") {
			var f = document.createElement('form'); 
			f.style.display = 'none'; 
			Element.body().appendChild(f); 
			f.method = 'POST'; 
			f.action = location;
			var m = document.createElement('input'); 
			m.setAttribute('type', 'hidden'); 
			m.setAttribute('name', '_method'); 
			m.setAttribute('value', 'delete'); 
			f.appendChild(m);
			var s = document.createElement('input'); 
			s.setAttribute('type', 'hidden'); 
			s.setAttribute('name', 'authenticity_token'); 
			s.setAttribute('value', token); 
			f.appendChild(s);
			f.submit();
		} else {
			document.location.href = location;
		}
	},

	/**
		Returns the singular argument if num == 1, otherwise returns the plural argument.
		
		@param {Number} num The number to be evaluated for plurality
		@param {Object} singular The return value if num == 1
		@param {Object} plural The return value if num != 1
	*/
	pluralize: function(num, singular, plural) {
		return (num == 1) ? singular : plural;
	},
	
	browserFromUserAgent: function(agt) {
		agt = agt.toLowerCase();
		if (agt.indexOf("opera") != -1) { return 'Opera'; }
		if (agt.indexOf("firefox") != -1) { return 'Firefox'; }
		if (agt.indexOf("safari") != -1) { return 'Safari'; }
		if (agt.indexOf("msie") != -1) { return 'IE'; }
		if (agt.indexOf("chrome") != -1) { return 'Chrome'; }
		return "Unknown";
	},
	
	osFromUserAgent: function(agt) {
		agt = agt.toLowerCase();
		if (agt.indexOf("win") != -1) { return 'Windows'; }
		if (agt.indexOf("mac") != -1) { return 'Mac'; }
		if (agt.indexOf("linux") != -1) { return 'Linux'; }
		return "Unknown";
	},
	
	baseUrl: function() {
		return document.location.protocol + "//" + document.location.host;
	},
	
	urlWithoutHash: function() {
		return this.baseUrl() + document.location.pathname;
	}
};