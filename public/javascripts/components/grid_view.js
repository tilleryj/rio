rio.Application.require("components/list_view");

rio.components.GridView = rio.Component.create(rio.components.ListView, "GridView", {
	requireCss: "grid_view",
	attrAccessors: [
		["columns", []] // e.g. [{ header: "Name", renderer: function... }, { header: "Description", renderer: function... }]
	],
	attrReaders: [
		["header", true],
		["rowClassName", ""],
		["rowHoverClassName", "gridItemHover"],
		["rowSelectedClassName", "gridItemSelected"]
	],
	attrHtmls: ["header"],
	methods: {
		initialize: function($super, options) {
			$super(options);
			this._listItemBuilder = function(item, renderer) {
				return new rio.components.GridItem({
					item: item,
					columns: this.getColumns(),
					rowClassName: this.getRowClassName(),
					hoverClassName: this.getRowHoverClassName(),
					selectedClassName: this.getRowSelectedClassName()
				});
			}.bind(this);
		},


		buildHtml: function() {
			var boxHtml = this.boxHtml();
			var gridBody = rio.Tag.tbody();
			var gridHtml = rio.Tag.table([gridBody], { className: "listView", style: "width: 100%" });
			
			this.addBindings(gridBody);
			if (this.getHeader()) {
				var gridHead = rio.Tag.thead();
				gridHtml.insert({ top: gridHead });
				gridHead.insert(this.headerHtml());
			}

			boxHtml.insert(gridHtml);
			
			boxHtml.addClassName("gridView");
			
			return boxHtml;
		},
		
		buildHeaderHtml: function() {
			return rio.Tag.tr(
				this.getColumns().map(function(column) {
					return rio.Tag.td(column.header);
				}.bind(this)),
				{ className: "gridViewHeaderRow" }
			);
		}
	}
});


rio.components.GridItem = rio.Component.create(rio.components.ListItem, "GridItem", {
	attrAccessors: [["columns", []], ["selected", false]],
	attrReaders: ["rowClassName"],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var rowClassName = this.getRowClassName();
			var className = Object.isFunction(rowClassName) ? rowClassName(this.getItem()) : rowClassName;
			var html = rio.Tag.tr(
				this.getColumns().map(function(column) {
					var cell = rio.Tag.td(column.renderer(this.getItem()));
					cell.setStyle({
						width: column.width,
						textAlign: column.align || "left",
						padding: (column.padding != undefined) ? column.padding : this.padding
					});
					return cell;
				}.bind(this)),
				{
					className: className
				}
			);
			
			html.addHoverClass(this.getHoverClassName());
			html.observe("click", function() {
				this.fire("click");
			}.bind(this));
			
			this.bind("selected", function(selected) {
				html[selected ? "addClassName" : "removeClassName"](this.getSelectedClassName());
			}.bind(this));
			
			
			return html;
		}
	}
});