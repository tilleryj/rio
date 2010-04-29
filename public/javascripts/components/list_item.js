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
			listItemHtml.rioComponent = this;

			var hoverClass = this.getHoverClassName();
			if (hoverClass && !hoverClass.blank()) {
				listItemHtml.observe("mouseover", function() {
					listItemHtml.addClassName(hoverClass);
				});
				listItemHtml.observe("mouseout", function() {
					listItemHtml.removeClassName(hoverClass);
				});
			}
			
			this.bind("selected", function(selected) {
				listItemHtml[selected ? "addClassName" : "removeClassName"](this.getSelectedClassName());
			}.bind(this));
			
			return listItemHtml;
		},
		
		click: function(e) {
			this.fire("click");	
			if (this.getStopClickPropogation()) {
				e.stop();
			}
		},
		
		scrollTo: function() {
			this.fire("scrollTo");
		}
	}
});