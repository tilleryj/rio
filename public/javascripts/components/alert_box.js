rio.components.AlertBox = rio.Component.create("AlertBox", {
	require: ["components/popup", "components/button"],
	requireCss: "alert_box",
	attrReaders: [
		"content", 
		["title", "Alert"],
		["buttons", [{ text: "OK" }]],
		["deactivateOnEscape", true],
		["deactivateOnClick", true],
		"width"
	],
	attrHtmls: ["content"],
	attrEvents: ["close"],
	methods: {
		initialize: function() {
			this._popup = new rio.components.Popup({ 
				content: this.contentHtml(), 
				deactivateOnClick: this.getDeactivateOnClick(),
				deactivateOnEscape: this.getDeactivateOnEscape(),
				onDeactivate: this.fire.bind(this, "close")
			});
			this._popup.activate();
		},
	
		buildContentHtml: function() {
			var contentHtml = rio.Tag.div("", { className: "alertBoxBody" });

			contentHtml.update(this.getContent());

			var buttons = this.getButtons().map(function(b) {
				return new rio.components.Button({ 
					text: b.text, 
					iconSrc: b.iconSrc,
					useNative: false, 
					onClick: this.close.bind(this, b.value) 
				});
			}.bind(this));

			var buttonsHtml = rio.Tag.div(buttons, { className: "alertButtons" });
			
			var headerHtml = rio.Tag.div(this.getTitle(), {
				className: "alertBoxTitle"
			});
			
			var innerHtml = rio.Tag.div([
				headerHtml,
				contentHtml, 
				buttonsHtml
			], { 
				className: "alertBoxInner" 
			});

			var html = rio.Tag.div(innerHtml, {
				className: "alertBox"
			});
			
			if (this.getWidth()) {
				html.setStyle({ width: this.getWidth() });
			}
			
			return html;
		},
	
		close: function(value) {
			this._popup.deactivate();
			this.fire("close", value);
		}
	}
});