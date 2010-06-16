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
		["rowSelectedClassName", "gridItemSelected"],
		["handleContextMenu", false],
		
		/**
			The item object must have a unique toString value to be used as a cache key
		*/
		["cacheGridItems", false]
	],
	attrHtmls: ["header"],
	attrEvents: ["contextMenu"],
	methods: {
		initialize: function($super, options) {
			$super(options);

			var cacheGridItems = this.getCacheGridItems();
			if (cacheGridItems) {
				this._gridItemCache = {};
			}
			this._listItemBuilder = function(item, renderer) {
				if (cacheGridItems && this._gridItemCache[item]) { return this._gridItemCache[item]; }
				var gridItem = new rio.components.GridItem({
					item: item,
					columns: this.getColumns(),
					rowClassName: this.getRowClassName(),
					hoverClassName: this.getRowHoverClassName(),
					selectedClassName: this.getRowSelectedClassName()
				});
				
				if (this.getHandleContextMenu()) {
					gridItem.observe("contextMenu", this.fire.bind(this, "contextMenu"));
				}
				
				if (cacheGridItems) { this._gridItemCache[item] = gridItem; }
				return gridItem;
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

			boxHtml.observe("click", function(e) {
				var target = e.target;
				while(target && target != boxHtml) {
					if (target.rioComponent && Object.isFunction(target.rioComponent.click)) {
						target.rioComponent.click(e);
					}
					target = target.parentNode;
				}
			}.bindAsEventListener(this));
			
			if (this.getHandleContextMenu()) {
				boxHtml.observe("contextmenu", function(e) {
					var target = e.target;
					while(target && target != boxHtml) {
						if (target.rioComponent && Object.isFunction(target.rioComponent.contextMenu)) {
							target.rioComponent.contextMenu(e);
							e.stop();
							return;
						}
						target = target.parentNode;
					}
				}.bindAsEventListener(this));
			}
			
			
			return boxHtml;
		},
		
		buildHeaderHtml: function() {
			return rio.Tag.tr(
				this.getColumns().map(function(column) {
					var td = rio.Tag.td(column.header);
					if (column.width) {
						td.setStyle({
							width: column.width
						});
					}
					return td;
				}.bind(this)),
				{ className: "gridViewHeaderRow" }
			);
		}
	}
});


rio.components.GridItem = rio.Component.create(rio.components.ListItem, "GridItem", {
	attrAccessors: [["columns", []], ["selected", false]],
	attrReaders: ["rowClassName"],
	attrEvents: ["click", "contextMenu"],
	methods: {
		buildHtml: function() {
			var rowClassName = this.getRowClassName();
			var className = Object.isFunction(rowClassName) ? rowClassName(this.getItem()) : rowClassName;


			var columns = this.getColumns();
			var column, cell;
			var html = rio.Tag.tr("", { className: className });
			
			html.rioComponent = this;
			
			var deferRendering = function(cell, column) {
				var contents = column.renderer(this.getItem(), this, html);
				if (Object.isArray(contents)) {
					cell.update();
					contents.each(function(content) {
						cell.insert(content);
					});
				} else {
					cell.update();
					cell.insert(contents);
				}
			};
			
			for (var i=0, length=columns.length; i<length; i++) {
				column = columns[i];

				if (column.deferRendering) {
					cell = rio.Tag.td(" ");
					rio.Thread.fork(deferRendering.bind(this, cell, column), column.deferOptions);
				} else {
					cell = rio.Tag.td(column.renderer(this.getItem(), this, html));
				}
				
				cell.setStyle({
					width: column.width,
					textAlign: column.align || "left",
					padding: (column.padding != undefined) ? column.padding : this.padding
				});
				html.insert(cell);
			}

			var hoverClassName = this.getHoverClassName();
			if (hoverClassName) {
				html.addHoverClass(hoverClassName);
			}

			this.bind("selected", function(selected) {
				html[selected ? "addClassName" : "removeClassName"](this.getSelectedClassName());
			}.bind(this));
			
			
			return html;
		},
		
		click: function(e) {
			this.fire("click", e);
		},
		
		contextMenu: function(e) {
			this.fire("contextMenu", this, e);
		}
	}
});