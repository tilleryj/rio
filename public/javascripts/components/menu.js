rio.components.Menu = rio.Component.create("Menu", {
	requireCss: "menu",
	
	attrAccessors: [
		["items", []],
		["left", 0],
		["top", 0]
	],
	
	attrHtmls: ["overlay"],
	
	methods: {
		buildHtml: function() {
			var menuHtml = rio.Tag.div("", { className: "menu" });
			
			menuHtml.setStyle({
				left: this.getLeft() + "px",
				top: this.getTop() + "px"
			});
			
			var insertItem = function(item) {
				menuHtml.insert(item.html());
				item.observe("click", this.click.bind(this));
			}.bind(this);
			
			var removeItem = function(item) {
				item.html().remove();
			}.bind(this);
			
			this.bind("items", {
				set: function(items) {
					if (items) {
						items.each(function(item) {
							insertItem(item);
						}.bind(this));
					}
				}.bind(this),

				insert: insertItem,
				remove: removeItem
			});
			
			return menuHtml;
		},
		
		buildOverlayHtml: function() {
			var overlayHtml = rio.Tag.div("", { className: "menuOverlay" });
			Event.observe(overlayHtml, "mousedown", this.click.bind(this));
			return overlayHtml;
		},
		
		render: function() {
			Element.body().insert(this.overlayHtml());
			Element.body().insert(this.html());
		},
		
		click: function() {
			this.close();
		},
		
		close: function() {
			this.html().remove();
			this.overlayHtml().remove();
		}
	}
});

rio.components.MenuItem = rio.Component.create("MenuItem", {
	attrAccessors: ["text"],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var itemHtml = rio.Tag.div("", { className: "menuItem" });
			itemHtml.addHoverClass("menuItemHover");

			this.bind("text", function(text) {
				itemHtml.update(text);
			});

			itemHtml.observe("click", this.click.bind(this));

			return itemHtml;
		},
		
		click: function() {
			this.fire("click");
		}
	}
});