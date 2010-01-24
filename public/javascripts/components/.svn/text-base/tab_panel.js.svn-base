rio.Application.require("components/box");

rio.components.TabPanel = rio.Component.create(rio.components.Box, "TabPanel", {
	require: ["components/panel", "components/tab_bar"],
	requireCss: "tab_panel",
	attrReaders: [
		["resizable", false],
		"maxWidth",
		"minWidth",
		"maxHeight",
		"minHeight",
		["layout", false],
		["tabs", []],
		"panel"
	],
	attrHtmls: ["tab"],
	methods: {
		initialize: function() {
			this._panel = new rio.components.Panel({
				resizable: this.getResizable(),
				maxWidth: this.getMaxWidth(),
				minWidth: this.getMinWidth(),
				maxHeight: this.getMaxHeight(),
				minHeight: this.getMinHeight(),
				layout: this.getLayout(),
				region: this.getRegion(),
				className: "tabPanel"
			});
		},
		
		buildHtml: function() {
			this.getPanel().buildTitleHtml = function() {
				return this.tabHtml();
			}.bind(this);
			return this.getPanel().html();
		},
		
		buildTabHtml: function() {
			return new rio.components.TabBar({ 
				className: "tabPanelTabBar",
				tabs: this.getTabs().map(function(tab) {
					var tabComponent = new rio.components.Tab({ name: tab.title, selected: tab.selected });
					tabComponent.selected.bind(function(selected) {
						if (selected) {
							this.getPanel().setItems(tab.items);
						}
					}.bind(this));
					return tabComponent;
				}.bind(this))
			}).html();
		},

		resize: function() {
			this.getPanel().resize();
		}
	}
});
