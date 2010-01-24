rio.components.Tooltip = rio.Component.create("Tooltip", {
	requireCss: "tooltip",
	attrReaders: [
		["offsetX", 12],
		["offsetY", 8],
		"elt",
		["fixed", false]
	],
	attrAccessors: [
		["tip", ""]
	],
	methods: {
		initialize: function(options) {
			
			this._showAfter = new rio.DelayedTask();
			
			this.getElt().observe('mouseover', function() {
				this._showAfter.delay(500, this.show.bind(this));
			}.bind(this));
			this.getElt().observe('mouseout', this.hide.bind(this));
			this.getElt().observe('mousemove', this.move.bindAsEventListener(this));

			Element.body().insert(this.html());
		},
	
		buildHtml: function() {
			var html = rio.Tag.div("", { className: "tooltip", style: "display: none" });
			this.tip.bind(function(tip) {
				html.update(tip);
			});
			return html;
		},

		show: function() {
			if (this.blank()) { return; }
			
			if (this.getFixed()) {
				var offset = this.getElt().viewportOffset();
				this.html().setStyle({
					top: offset.top + this.getElt().getHeight() + 5 + "px",
					left: offset.left + (this.getElt().getWidth() / 2) + "px"
				});
			}

			this.html().show();
			this.resetHideDelay();
		},

		hide: function() {
			if (this.blank()) { return; }
			this._showAfter.cancel();
			this.html().hide();
		},
		
		blank: function() {
			if (!this.getTip()) { return true; }
			if (Object.isString(this.getTip())) {
				if (this.getTip().blank()) { return true; }
			}
			return false;
		},
	
		move: function(e) {
			if (this.getFixed()) { return; }
			this.html().setStyle({
				left: e.pointerX() + this.getOffsetX() + 'px',
				top: e.pointerY() + this.getOffsetY() + 'px'
			});
			this.resetHideDelay();
		},
	
		resetHideDelay: function() {
			if (!this._hideAfter) { this._hideAfter = new rio.DelayedTask(); }
			this._hideAfter.delay(5000, function() {
				this.hide();
			}, this);
		}
	}
});

