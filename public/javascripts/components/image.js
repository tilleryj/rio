rio.components.Image = new rio.Component.create(rio.components.Base, "Image", {
	attrAccessors: ["src", ["title", ""]],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var imgHtml = rio.Tag.img("");
			this.src.bind(function(src) { 
				imgHtml.src = rio.url(src);
			});
			this.title.bind(function(title) {
				imgHtml.title = title;
			});
			imgHtml.observe("click", function() {
				this.fire("click");
			}.bind(this));
			return imgHtml;
		}
	}
});