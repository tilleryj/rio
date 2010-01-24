rio.components.Label = rio.Component.create(rio.components.Base, {
	requireCss: "label",
	attrAccessors: ["content"],
	attrEvents: ["dblClick"],
	methods: {
		buildHtml: function() {
			var labelHtml = rio.Tag.span();
			this.content.bind(function(content) {
				labelHtml.update(content);
			});
			labelHtml.observe("dblclick", this.fire.curry("dblClick").bind(this));
			return labelHtml;
		}
	}
});