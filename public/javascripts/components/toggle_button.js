rio.components.ToggleButton = rio.Component.create(rio.components.Base, {
	require: ["components/image"],
	attrReaders: ["offImage", "onImage"],
	attrAccessors: ["state"],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var imgHtml = new rio.components.Image();
			this.bind("state", function(state) {
				imgHtml.setSrc(state ? this.getOnImage() : this.getOffImage());
			}.bind(this));
			var linkHtml = rio.Tag.a(imgHtml, {
				href: "",
				onclick: "return false;"
			});
			linkHtml.observe("click", function() {
				this.setState(!this.getState());
				this.fire("toggle");
			}.bind(this));
			return linkHtml;
		}
	}
});
