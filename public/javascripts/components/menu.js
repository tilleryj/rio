rio.components.Menu = rio.Component.create("Menu", {
	requireCss: "menu",
	
	attrAccessors: [
		["items", []],
		"left",
		"right",
		["top", 0]
	],
	attrReaders: [
		"className"
	],
	methods: {
		buildHtml: function() {
			var menuHtml = rio.Tag.div("", { className: "menu" });
			menuHtml.addClassName(this.getClassName());

			var position = { top: parseInt(this.getTop(), 10) + "px" };

			if (this.getRight()) {
				position.right = parseInt(this.getRight(), 10) + "px";
			} else {
				position.left = (parseInt(this.getLeft(), 10) || 0) + "px";
			}
			menuHtml.setStyle(position);
			
			this.getItems().each(function(item) {
				var menuItem = new rio.components.MenuItem(item);
				menuHtml.insert(menuItem);
				menuItem.observe("click", this.close.bind(this));
			}.bind(this));
			
			return menuHtml;
		},
		
		render: function() {
			this.popup().activate();
		},
		
		popup: function() {
			if (!this._popup) {
				this._popup = new rio.components.Popup({
					content: this.html(),
					autoCenter: false,
					wrapContent: false,
					opacity: 0.01,
					animateOverlay: false
				});
			}
			return this._popup;
		},
		
		close: function() {
			this.popup().deactivate();
		}
	}
});

rio.components.MenuItem = rio.Component.create("MenuItem", {
	attrAccessors: ["label", "iconSrc"],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var content = [this.getLabel()];
			if (this.getIconSrc()) {
				content.unshift(new rio.components.Image({ src: this.getIconSrc() }));
			}
			var itemHtml = rio.Tag.div(content, { className: "menuItem" });

			itemHtml.observe("click", this.fire.bind(this, "click"));

			return itemHtml;
		}
	}
});