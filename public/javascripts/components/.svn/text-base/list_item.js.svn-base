rio.components.ListItem = rio.Component.create(rio.components.Base, "ListItem", {
	attrAccessors: [["selected", false]],
	attrReaders: [
		"item", 
		"renderer",
		["className", "listItem"],
		["hoverClassName", "listItemHover"],
		["selectedClassName", "listItemSelected"],
		["stopClickPropogation", false]
	],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var listItemHtml = this.getRenderer()(this.getItem());

			listItemHtml.observe("mouseover", function() {
				listItemHtml.addClassName(this.getHoverClassName());
			}.bind(this));
			listItemHtml.observe("mouseout", function() {
				listItemHtml.removeClassName(this.getHoverClassName());
			}.bind(this));
			listItemHtml.observe("click", function(e) { 
				this.click();
				if (this.getStopClickPropogation()) {
					e.stop();
				}
			}.bindAsEventListener(this));
			
			this.bind("selected", function(selected) {
				listItemHtml[selected ? "addClassName" : "removeClassName"](this.getSelectedClassName());
			}.bind(this));
			
			return listItemHtml;
		},
		
		click: function() {
			this.fire("click");	
		},
		
		scrollTo: function() {
			this.fire("scrollTo");
		}
	}
});