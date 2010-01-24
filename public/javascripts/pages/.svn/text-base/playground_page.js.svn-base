rio.pages.PlaygroundPage = rio.Page.create("Playground", {
	methods: {
		buildHtml: function() {
			return rio.Tag.div("", { style: "height: 100%" });
		},

		render: function() {
			try {
				eval(rio.Cookie.get("playgroundContent") || "");
			} catch(e) {
				this.html().update(e);
			}
		}
	}
});