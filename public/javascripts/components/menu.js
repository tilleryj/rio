rio.components.Menu = rio.Component.create("Menu", {
	requireCss: "menu",
	
	attrAccessors: [
		["items", []],
		"menuItems",
		"left",
		"right",
		["top", 0]
	],
	attrReaders: [
		"className"
	],
	methods: {
		initialize: function() {
			this.setMenuItems(this.getItems().map(function(item) {
				var menuItem = new rio.components.MenuItem(Object.extend(item, { menuClassName: this.getClassName() }));
				
				menuItem.observe("privateClick", function() {
					this.fire("privateClick");
					this.close();
				}.bind(this));
				menuItem.observe("hideDescendantSubMenus", this.hideDescendantSubMenus.bind(this));
				
				return menuItem;
			}.bind(this)));
		},

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
			
			this.getMenuItems().each(function(menuItem) {
				menuHtml.insert(menuItem);
			}.bind(this));
			
			return menuHtml;
		},
		
		hideDescendantSubMenus: function(noDelay) {
			this.getMenuItems().each(function(menuItem) {
				menuItem.hideDescendantSubMenus(noDelay);
			});
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
	attrAccessors: ["label", "iconSrc", ["items", []]],
	attrReaders: ["menuClassName"],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var content = [this.getLabel()];
			if (this.getIconSrc()) {
				content.unshift(new rio.components.Image({ src: this.getIconSrc(), className: "menuIcon" }));
			}
			var itemHtml = rio.Tag.div(content, { className: "menuItem" });

			var hasSubMenu = !this.getItems().empty();
			if (hasSubMenu) {
				this._subMenu = new rio.components.Menu({
					className: this.getMenuClassName(),
					items: this.getItems(),
					top: -2
				});
				this._subMenu.observe("privateClick", this.fire.bind(this, "privateClick"));

				var subMenuHtml = this._subMenu.html();
				subMenuHtml.hide();
				itemHtml.insert(subMenuHtml);
				itemHtml.insert(new rio.components.Image({ src: "/images/sub-menu-indicator.png", className: "subMenuIndicator" }));
			}
			itemHtml.observe("mouseover", function() {
				if (this._subMenu) {
					this.fire("hideDescendantSubMenus");
					var subMenuHtml = this._subMenu.html();
					subMenuHtml.setStyle({ left: itemHtml.getWidth() + "px" });
					subMenuHtml.show();
				} else {
					this.fire("hideDescendantSubMenus");
				}
			}.bind(this));

			itemHtml.observe("click", function() {
				if (!hasSubMenu) {
					this.fire("privateClick");
				}
				this.fire("click");
			}.bind(this));

			return itemHtml;
		},
		
		hideDescendantSubMenus: function() {
			if (this._subMenu) {
				this._subMenu.hideDescendantSubMenus();
				this._subMenu.html().hide();
			}
		}
	}
});
