rio.components.Image = new rio.Component.create(rio.components.Base, "Image", {
	attrAccessors: ["src", ["title", ""]],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var imgHtml = rio.Tag.img("");
			this.src.bind(function(src) { 
				imgHtml.src = rio.components.Image.fullPath(src);
			});
			this.title.bind(function(title) {
				imgHtml.title = title;
			});
			imgHtml.observe("click", function() {
				this.fire("click");
			}.bind(this));
			
			return imgHtml;
		}
	},
	
	classMethods: {
		fullPath: function(src) {
			if (src.startsWith("/") || src.match(/http.?\:/)) {
				return src;
			} else {
				var baseUrl = rio.environment.imageBaseUrl == undefined ? "/images/" : rio.environment.imageBaseUrl;
				return baseUrl + src;
			}
		}
	}
});