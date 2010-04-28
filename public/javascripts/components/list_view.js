rio.Application.require("components/box");
rio.Application.require("components/list_item");

rio.components.ListView = rio.Component.create(rio.components.Box, "ListView", {
	requireCss: "list_view",
	attrAccessors: [
		"items",
		"selectedItem",
		["listItems", []],
		["overflow", "auto"]
	],
	attrReaders: [
		['className', 'listView'],
		["itemRenderer", function(val) { return rio.Tag.div(val); }],
		["listItemBuilder", function(item, renderer){ return new rio.components.ListItem({item: item, renderer: renderer}); }],
		["autoSelectFirstItem", false],
		["handleClickSelection", true]
	],
	attrEvents: ["selectNext", "selectPrevious", "itemClick"],
	methods: {
		buildHtml: function() {
			var listHtml = this.boxHtml();
			// listHtml.addClassName("listView");
			this.addBindings(listHtml);
		
			return listHtml;
		},
		
		addBindings: function(listHtml) {
			if (!this._unbindings) { this._unbindings = []; }
			var unbindItems = this.bind("items", {
				set: function(items) {
					listHtml.hide();
					listHtml.update();
					this.setListItems([]);
					if (items) {
						for (var i=0, len=items.length; i < len; i++) {
							this.insertItem(items[i], this.getListItems().size(), listHtml);
						}
					}
					listHtml.show();
				}.bind(this),
				insert: function(val, atIndex) {
					this.insertItem(val, atIndex, listHtml);
				}.bind(this),
				remove: function(val) {
					this.removeItem(val, listHtml);
				}.bind(this)
			});
			this._unbindings.push(unbindItems);
			
			this.bind("selectedItem", function(item) {
				if(item) {
					this.getListItems().each(function(li) { 
						if (li.getItem() != item) {
							li.setSelected(false);
						}
					});
					if(this.getListItemForItem(item)){
						this.getListItemForItem(item).setSelected(true);
					}
				}
			}.bind(this));
		},
		
		insertItem: function(val, atIndex, insertInto) {
			insertInto = insertInto || this.html();
			var listItem = this.getListItemBuilder()(val, this.getItemRenderer());
			if (this.getSelectedItem() == listItem.getItem()) {
				listItem.setSelected(true);
			}
			listItem.bind("selected", function(selected) {
				if (selected) {
					this.setSelectedItem(listItem.getItem());
				} else {
					if (listItem.getItem() == this.getSelectedItem()) {
						this.setSelectedItem(null);
					}
				}
			}.bind(this));
			
			listItem.observe("click", function(e) {
				if (this.getHandleClickSelection()) {
					this.setSelectedItem(listItem.getItem());
				}
				this.fire("itemClick", listItem.getItem(), e);
			}.bind(this));
			listItem.observe("scrollTo", function() {
				var listItemHtml = listItem.html();
				var listItemTop = listItemHtml.positionedOffset().top;
				var listItemBottom = listItemTop + listItemHtml.getDimensions().height;
				var bottomOfList = insertInto.scrollTop + insertInto.getDimensions().height;
				if (bottomOfList < listItemBottom || listItemTop < insertInto.scrollTop) {
					insertInto.scrollTop = listItemTop;
				}
			}.bind(this));
			
			if (atIndex == 0) {
				if (this.getListItems().size() == 0) {
					insertInto.insert(listItem);
				} else {
					this.getListItems()[atIndex].html().insert({ before: listItem.html() });
				}
			} else {
				this.getListItems()[atIndex - 1].html().insert({ after: listItem.html() });
			}

			this.getListItems().splice(atIndex, 0, listItem);
			
			if (this.getAutoSelectFirstItem() && this.getListItems().size() == 1) {
				this.setSelectedItem(listItem.getItem());
			}
		},
		
		removeItem: function(val, removeFrom) {
			removeFrom = removeFrom || this.html();
			var foundItem = this.getListItems().detect(function(listItem) { return listItem.getItem() == val; });
			if (foundItem) {
				var index = this.getListItems().indexOf(foundItem);
				if (foundItem.html().parentNode == removeFrom) {
					var foundWasSelected = this.getSelectedIndex() == index;
					foundItem.html().remove();
					if(foundWasSelected) {
						this.pendingSelect(index);
					}
				}
				this.getListItems().splice(index, 1);
			}
		},
		
		pendingSelect: function(index) {
			this._pendingId = (function() { 
				this.selectIndex(index); 
				delete this._pendingId;
			}.bind(this)).defer();
		},
		
		clearPendingSelect: function() {
			if (this._pendingId != undefined) {
				clearTimeout(this._pendingId);
			}
		},
		
		getSelectedIndex: function(){
			return this.getListItems().indexOf(this.getSelectedListItem());
		},
		
		selectNext: function(){
			this.selectIndex(this.getSelectedIndex() + 1);
		},
		
		selectLast: function() {
			this.selectIndex(this.getListItems().length - 1);
		},
		
		selectFirst: function() {
			this.selectIndex(0);
		},
		
		selectAfterItem: function(item) {
			this.selectIndex(this.getIndexOfItem(item) + 1);
		},
		
		selectPrevious: function(){
			this.selectIndex(this.getSelectedIndex() - 1);
		},
		
		selectIndex: function(indexToSelect){
			if(this.getListItems().length == 0){return;}
			if(indexToSelect < 0){
				this.fire("selectPrevious");
				return;
			}
			if(indexToSelect >= this.getListItems().length){
				this.fire("selectNext");
				return;
			}
			
			this.setSelectedItem(this.getListItems()[indexToSelect].getItem());
		},
		getIndexOfItem: function(item){
			return this.getListItems().indexOf(this.getListItemForItem(item));
		},
		getIndexOfListItem: function(listItem){
			return this.getListItems().indexOf(listItem);
		},
		getSelectedListItem: function(){
			return this.getListItemForItem(this.getSelectedItem());
		},
		getListItemForItem: function(item){
			return this.getListItems().detect(function(listItem){
				return listItem.getItem() == item;
			});
		}
	}
});

