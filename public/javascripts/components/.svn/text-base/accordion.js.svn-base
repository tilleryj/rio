rio.Application.require("components/box");

rio.components.Accordion = rio.Component.create(rio.components.Box, "Accordion", {
	requireCss: "accordion",
	attrReaders: ["panes", "accordionPanes"],
	attrAccessors: [["selectedPaneIndex", 0]],
	methods: {
		initialize: function() {
			if (!this.getAccordionPanes()) {
				this._accordionPanes = this.getPanes().map(function(pane) {
					var accordionPane = new rio.components.AccordionPane({
						header: pane.header,
						body: pane.body,
						onSelect: pane.onSelect
					});
			
			
					return accordionPane;
				}.bind(this));
			} else if (!Object.isArray(this.getAccordionPanes())) {
				this._accordionPanes = [this.getAccordionPanes()];
			}
			
			this.getAccordionPanes().each(function(accordionPane) {
				accordionPane.bind("selected", function(selected) {
					if (selected) {
						this.setSelectedPaneIndex(this.getAccordionPanes().indexOf(accordionPane));
					}
				}.bind(this));
			}.bind(this));
		
			this.resize.bind(this).defer();
		},

		buildHtml: function() {
			var accordionHtml = this.boxHtml();
			this.getAccordionPanes().each(function(ap) { return accordionHtml.insert(ap.html()); });
			accordionHtml.addClassName("accordion");
		
			this.bind("selectedPaneIndex", function(index) {
				var toShow = this.getAccordionPanes()[index];
				var toHide = this.getAccordionPanes().detect(function(ap) { return ap.getSelected() && ap != toShow; });
			
				if (!toHide) { 
					toShow.bodyHtml().show();
					toShow.setSelected(true);
					return;
				}

				this.getAccordionPanes().each(function(ap) { ap.setSelected(false); });
			
				toShow.setSelected(true);
				toShow.bodyHtml().show();
				toHide.bodyHtml().hide();
			
				// (function() {
				// 	var effects = [new Effect.BlindDown(toShow.bodyHtml(), {
				// 		duration: 0.5,
				// 		sync: true,
				// 		// transition: Effect.Transitions.sinoidal
				// 	})];
				// 	if (toHide) {
				// 		effects.push(new Effect.BlindUp(toHide.bodyHtml(), {
				// 			duration: 0.5,
				// 			sync: true,
				// 			// transition: Effect.Transitions.sinoidal
				// 		}));
				// 	}
				// 	new Effect.Parallel(effects, {
				// 		duration: 0.5, 
				// 		queue: {
				// 			position: 'end', 
				// 			scope: 'accordionAnimation'
				// 		},
				// 		afterUpdate: function() {
				// 		}.bind(this),
				// 		afterFinish: function() {
				// 			toShow.setSelected(true);
				// 			toHide.setSelected(false);
				// 			this.resize();
				// 		}.bind(this)
				// 	});
				// 
				// }).bind(this).defer();
			}.bind(this));

			Element.observe(window, "resize", this.resize.bind(this));

			return accordionHtml;
		},
	
		resize: function() {
			this.getAccordionPanes().each(function(pane) {
				pane.setBodyHeight(this.bodyHeight());
			}.bind(this));
		},
	
		bodyHeight: function() {
			var bodyHeight = this.html().getHeight();
			var headersHeight = this.getAccordionPanes().inject(0, function(acc, pane) {
				return acc + pane.getHeaderHeight();
			}.bind(this));
			return bodyHeight - headersHeight;
		}
	}
});

rio.components.AccordionPane = rio.Component.create(rio.components.Base, "AccordionPane", {
	attrReaders: ["header", "body", ["onSelect", Prototype.emptyFunction]],
	attrAccessors: [["selected", false]],
	attrHtmls: ["header", "body"],
	methods: {
		buildHtml: function() {
			return rio.Tag.div([this.headerHtml(), this.bodyHtml()], { className: "pane" });
		},

		buildHeaderHtml: function() {
			var headerHtml = rio.Tag.h1(this.getHeader(), { className: "paneHeader" });
			this.bind("selected", function(selected) {
				headerHtml[(selected ? "addClassName" : "removeClassName")]("selected");
				if (selected) {
					this.getOnSelect()();
				}
			}.bind(this));
			headerHtml.observe("click", function() { this.setSelected(true); }.bind(this));
			return headerHtml;
		},

		buildBodyHtml: function() {
			var bodyHtml = rio.Tag.div(this.getBody(), { className: "paneBody" });
			if (this.getSelected()) { bodyHtml.show(); } else { bodyHtml.hide(); }
			return bodyHtml;
		},

		getHeaderHeight: function() {
			return this.headerHtml().totalHeight();
		},

		setBodyHeight: function(height) {
			this.bodyHtml().style.height = height;
		}
	}
});

