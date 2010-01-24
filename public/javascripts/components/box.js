rio.components.Box = rio.Component.create(rio.components.Base, "Box", {
	requireCss: "box",
	attrAccessors: [
		["showing", true]
	],
	attrReaders: ["region"],
	attrHtmls: ["box"],
	styles: [
		"backgroundColor", 
		"fontSize", "fontWeight",
		"height", "width", 
		"border", "borderTop", "borderRight", "borderBottom", "borderLeft",
		"padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
		"margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
		"overflow", "overflowX", "overflowY"
	],
	methods: {

		buildHtml: function() {
			return this.boxHtml();
		},
		
		buildBoxHtml: function() {
			this.showing.bind(function() {
				rio.ContainerLayout.resize();
			}, true);	
			var boxHtml = rio.Tag.div("");
			boxHtml.applyStyle(this.boxStyles());
			return boxHtml;
		},
		
		resize: function() {
			// This method will be called when the layout manager resizes the Box
		},
		
		boxStyles: function() {
			return {
				height: this.height,
				width: this.width,
				margin: this.margin,
				marginTop: this.marginTop,
				marginRight: this.marginRight,
				marginBottom: this.marginBottom,
				marginLeft: this.marginLeft,
				paddingTop: this.paddingTop,
				paddingRight: this.paddingRight,
				paddingBottom: this.paddingBottom,
				paddingLeft: this.paddingLeft,
				padding: this.padding,
				border: this.border,
				borderTop: this.borderTop,
				borderRight: this.borderRight,
				borderBottom: this.borderBottom,
				borderLeft: this.borderLeft,
				backgroundColor: this.backgroundColor,
				fontSize: this.fontSize,
				overflow: this.overflow,
				overflowX: this.overflowX,
				overflowY: this.overflowY
			};
		}
	}
});
