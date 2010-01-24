rio.components.Link = rio.Component.create(rio.components.Base, "Link", {
	requireCss: "link",
	attrAccessors: ["content", "href"],
	attrReaders: ["className", ["realLink", false]],
	attrEvents: ["click"],
	styles: ["color"],
	methods: {
		buildHtml: function() {
			var linkHtml = rio.Tag.a("", {
				href: "",
				className: this.getClassName() || "link"
			});

			this.bind("href", function(href) {
				linkHtml.href = href || "";
			});

			this.bind("content", function(content) {
				if (Object.isArray(content)) {
					linkHtml.update();
					for (var i=0, length=content.length; i<length; i++) {
						linkHtml.insert(content[i]);
					}
				} else {
					linkHtml.update(content);
				}
			}.bind(this));

			linkHtml.observe("click", function(e) {
				this.fire("click");
				if(this.getRealLink()) {
					rio.Utils.navigateTo(this.getHref());
				} else {
					e.stop();
				}
			}.bindAsEventListener(this));
			
			linkHtml.applyStyle({ color: this.color });

			return linkHtml;
		}
	}
});
