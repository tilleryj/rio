rio.components.AlertBox = rio.Component.create("AlertBox", {
	require: ["components/lightbox", "components/button"],
	requireCss: "alert_box",
	attrReaders: [
		"body", 
		["title", "Alert"],
		["buttonText", "OK"],
		["deactivateOnEscape", true],
		["deactivateOnClick", true]
	],
	attrHtmls: ["body"],
	attrEvents: ["close"],
	methods: {
		initialize: function() {
			this._lightbox = new rio.components.Lightbox({ 
				content: this.bodyHtml(), 
				deactivateOnClick: this.getDeactivateOnClick(),
				deactivateOnEscape: this.getDeactivateOnEscape(),
				deactivate: this.fire.bind(this, "close")
			});
			this._lightbox.activate();
		},
	
		buildBodyHtml: function() {
			var bodyHtml = rio.Tag.div("", { className: "alertBoxBody" });

			bodyHtml.update(this.getBody());

			var okButton = new rio.components.Button({ 
				text: this.getButtonText(), 
				useNative: false, 
				onClick: this.close.bind(this) 
			});

			var okHtml = rio.Tag.div(okButton, { className: "ok" });
			
			var headerHtml = rio.Tag.div(this.getTitle(), {
				className: "alertBoxTitle"
			});
			
			var innerHtml = rio.Tag.div([
				headerHtml,
				bodyHtml, 
				okHtml
			], { 
				className: "alertBoxInner" 
			});

			return rio.Tag.div(innerHtml, {
				className: "alertBox"
			});
		},
	
		close: function() {
			this._lightbox.deactivate();
			this.fire("close");
		}
	}
});