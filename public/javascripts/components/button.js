rio.components.Button = rio.Component.create(rio.components.Base, "Button", {
	require: ["components/tooltip"],
	requireCss: "button",
	attrAccessors: [
		"text",
		"tip",
		"imageSrc", 
		"hoverImageSrc",
		"disabledImageSrc",
		"iconSrc",
		["enabled", true]
	],
	attrReaders: [
		["useNative", true]
	],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var buttonHtml;
			if (this.getImageSrc() != undefined) {
				var image = new rio.components.Image({ src: this.getImageSrc() });
				buttonHtml = image.html();

				this.enabled.bind(function(enabled) {
					buttonHtml.setStyle({ cursor: enabled ? "pointer" : "default" });
					if (this.getDisabledImageSrc()) {
						image.setSrc(enabled ? this.getImageSrc() : this.getDisabledImageSrc());
					}
				}.bind(this));
				
				if (this.getHoverImageSrc()) {
					buttonHtml.observe("mouseover", function() {
						if (this.getDisabledImageSrc() && !this.getEnabled()) { return; }
						image.setSrc(this.getHoverImageSrc());
					}.bind(this));
					buttonHtml.observe("mouseout", function() {
						if (this.getDisabledImageSrc() && !this.getEnabled()) { return; }
						image.setSrc(this.getImageSrc());
					}.bind(this));
				}
			} else {
				if (this.getUseNative()) {
					buttonHtml = rio.Tag.button("");
					this.enabled.bind(function(enabled) {
						buttonHtml.disabled = !enabled;
					});
					
					this.bind("text", function(text) {
						buttonHtml.update(text);
					});
				} else {
					buttonHtml = rio.Tag.div("", { className: "button" });
					buttonHtml.addHoverClass("buttonHover");
					
					var updateContent = function() {
						var iconSrc = this.getIconSrc("/images/icons/plus.png");
						buttonHtml.update();
						if (iconSrc) {
							buttonHtml.insert(rio.Tag.img("", { src: rio.url(iconSrc) }));
						}
						buttonHtml.insert(this.getText());
					}.bind(this);
					
					this.text.bind(updateContent);
					this.iconSrc.bind(updateContent);
					
					buttonHtml.observe("mousedown", function() {
						buttonHtml.addClassName("buttonDown");
					});
					buttonHtml.observe("mouseup", function() {
						buttonHtml.removeClassName("buttonDown");
					});
					buttonHtml.observe("mouseout", function() {
						buttonHtml.removeClassName("buttonDown");
					});
					
					this.enabled.bind(function(enabled) {
						buttonHtml[enabled ? "removeClassName" : "addClassName"]("buttonDisabled");
					});
				}
			}

			this.bind("tip", function(tip) {
				if (tip && !tip.blank() && !this._tooltip) {
					new rio.components.Tooltip({ elt: buttonHtml, tip: this.tip, fixed: true });
				}
			}.bind(this));

			buttonHtml.observe("click", function(e) {
				if (!this.getEnabled()) { return; }
				this.fire("click");
				e.stop();
			}.bindAsEventListener(this));

			return buttonHtml;
		}
	}
});
