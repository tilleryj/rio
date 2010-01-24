rio.Application.require("components/box");

rio.components.DependenciesList = rio.Component.create(rio.components.Box, "DependenciesList", {
	methods: {
		buildHtml: function() {
			var html = rio.Tag.pre("loading...", { className: "scripts" });
			if (Prototype.Browser.IE) {
				html.setStyle({ height: "500px" });
			}
			return html;
		},

		setContent: function(content) {
			this.html().update(content);
		}		
	}
});
