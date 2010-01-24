rio.components.Base = rio.Component.create("Base", {
	attrReaders: [
		["className", ""],
		["seleniumId", ""]
	],
	styles: ["position", "top", "right", "bottom", "left", "display"],
	methods: {
		html: function() {
			if (!this._html) { 
				this._html = this.buildHtml();
				this._html.addClassName(this.getClassName());
				
				if (rio.environment.supportSelenium) {
					this._html.id = this.getSeleniumId();
				}
				
				this._html.applyStyle({
					position: this.position,
					top: this.top,
					right: this.right,
					bottom: this.bottom,
					left: this.left,
					display: this.display
				});
			}
			return this._html;
		},
		
		addClassName: function(className) {
			this.html().addClassName(className);
			this._className = this.html().className;
		},

		removeClassName: function(className) {
			this.html().removeClassName(className);
			this._className = this.html().className;
		},
		
		show: function() {
			this.setDisplay("");
		},
		
		hide: function() {
			this.setDisplay("none");
		}
	}
});