rio.Application.require("components/box");

rio.components.TabBar = rio.Component.create(rio.components.Box, "TabBar", {
	requireCss: "tab_bar",
	attrReaders: [["tabs", []]],
	attrHtmls: ["tabs"],
	methods: {
		buildHtml: function() {
			var tabBarHtml = rio.Tag.ul(this.tabsHtml(), { className: "tabBar" });
			var tabBarBottom = rio.Tag.div("", { className: "tabBarBottom" });
			var html = rio.Tag.div([tabBarHtml, tabBarBottom], { className: "tabBarWrapper" });
			html.applyStyle(this.boxStyles());
			return html;
		},
		
		buildTabsHtml: function() {
			var tabs = this.getTabs();
			tabs.each(function(tab) {
				tab.selected.bind(function(selected) {
					if (selected) {
						tabs.without(tab).each(function(toDeselect) { toDeselect.setSelected(false); });
					}
				});
			});
			if (!tabs.any(function(tab) { return tab.getSelected();	})) {
				tabs.first().setSelected(true);
			}
			return tabs.map(function(tab) { return tab.html(); });
		},
		
		selectNext: function() {
			this.getTabs()[(this.selectedIndex() + 1) % this.getTabs().length].setSelected(true);
		},
		
		selectPrevious: function() {
			this.getTabs()[(this.selectedIndex() - 1 + this.getTabs().length) % this.getTabs().length].setSelected(true);
		},
		
		selectedIndex: function() {
			return this.getTabs().indexOf(this.getTabs().detect(function(t) { return t.getSelected(); }));
		}
	}
});

rio.components.Tab = rio.Component.create("Tab", {
	attrAccessors: ["name", ["selected", false]],
	methods: {
		buildHtml: function() {
			
			var html = rio.Tag.li("");
			html.addHoverClass("tabHover");
			this.name.bind(function(name) {
				html.update(name);
			});
			this.selected.bind(function(selected) {
				html.className = selected ? "tabSelected" : "tab";
			}.bind(this));
			
			html.observe("click", this.setSelected.bind(this, true));

			return html;
		}
	}
});