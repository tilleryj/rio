rio.ConsoleMixin = {
	
	"_": function() {
		return this._lastResults;
	},
	
	k: function() {
		return Object.keys;
	},

	page: function() {
		return opener.rio.app.getCurrentPage();
	},
	
	cwindow: function() {
		return window;
	},
	
	cow: function() {
		return "         (__)" + "\n" + "         (oo)" + "\n" + "  /-------\\/ " + "\n" + " / |     ||  " + "\n" + "*  ||----||  " + "\n" +	"   ~~    ~~  ";
	}
};