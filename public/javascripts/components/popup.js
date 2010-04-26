$$('.popupOverlay').invoke("remove");
rio.components.Popup = rio.Component.create("Popup", {
	requireCss: "popup",
	attrAccessors: [
		"content",
		["deactivateOnEscape", true],
		["deactivateOnClick", true],
		["opacity", 0.8],
		["autoCenter", true],
		["wrapContent", true],
		["animateOverlay", true]
	],
	attrReaders: [],
	attrHtmls: ["overlay"],
	attrEvents: ["deactivate"],
	methods: {
		buildHtml: function() {
			if (this.getWrapContent()) {
				return rio.Tag.div(this.getContent(), { className: "popupContent" });
			} else {
				return this.getContent();
			}
		},
		
		buildOverlayHtml: function() {
			this._overlayHtml = rio.Tag.div("", { className: "popupOverlay", style: "display: none" });

			if (this.getDeactivateOnClick()) {
				this._overlayHtml.observe("click", function() {
					this.deactivate();
				}.bind(this));
				this._overlayHtml.observe("contextmenu", function(e) {
					this.deactivate();
					e.stop();
				}.bind(this));
			}

			return this._overlayHtml;
		},
		
		activate: function() {
			rio.components.Popup.activate(this);
		},
		
		deactivate: function(skipAnimation) {
			rio.components.Popup.deactivate(this, skipAnimation);
			this.fire("deactivate");
		},
		
		resize: function() {
			if (!this.getAutoCenter()) { return; }

			var pHeight = this.html().getHeight();
			var pWidth = this.html().getWidth();
			var wHeight = document.viewport.getHeight();
			var wWidth = document.viewport.getWidth();
	
			this.html().setStyle({
				top: Math.max(wHeight - pHeight, 0) / 2 + "px",
				left: Math.max(wWidth - pWidth, 0) / 2 + "px"
			});
		}
	},
	classMethods: {
		_activePopups: [],
		_activeAnimations: [],
	
		activate: function(popup) {
			this.cancelActiveAnimations();

			this._activePopups.push(popup);
			this.updateZIndices();
			
			this.resetOverlay(!popup.getAnimateOverlay());

			Element.body().insert(popup.html());
			Element.body().insert(popup.overlayHtml());

			popup.resize();
			this.addObservers();
		},
		
		deactivate: function(popup, forceSkipAnimation) {
			try {
				popup.html().remove();

				this._activePopups.splice(this._activePopups.indexOf(popup), 1);
				this.updateZIndices();
				var popupOverlay = popup.overlayHtml();
				if (popup.getAnimateOverlay() && !forceSkipAnimation) {
					this._activeAnimations.push(new Effect.Fade(popupOverlay, {
						from: popupOverlay.getStyle("opacity"),
						to: 0.0,
						duration: 0.5,
						afterFinish: function() {
							popupOverlay.remove();
						}
					}));

					this.resetOverlay();
				} else {
					popupOverlay.remove();
					this.resetOverlay(true);
				}
			} catch(e) {
				try {
					popupOverlay.remove();
					popup.remove();
				} catch(e2) {}

				throw(e);
			}
		},
		
		cancelActiveAnimations: function() {
			// this._activeAnimations.invoke("cancel");
			// TODO: We need a reliable way of handling simultaneous popup activations/deactivations
			this._activeAnimations.clear();
		},
		
		updateZIndices: function() {
			var existingPopups = this._activePopups;
			for (var i=0, length=this._activePopups.length; i<length; i++) {
				this._activePopups[i].overlayHtml().setStyle({ zIndex: 5000 + i * 2 });
				this._activePopups[i].html().setStyle({ zIndex: 5000 + i * 2 + 1 });
			}
		},
		
		resize: function() {
			if (this.activePopup()) { this.activePopup().resize(); }
		},
		
		resetOverlay: function(skipAnimation) {
			if (!this.activePopup()) { return; }

			var i;
			var totalOpacity = this._activePopups.max(function(p) { return p.getOpacity(); });

			var foregroundOpacity = this.activePopup().getOpacity();
			if (totalOpacity > foregroundOpacity) {
				
				for (i = 0; i<this._activePopups.length-2; i++) {
					this._activePopups[i].overlayHtml().setStyle({ opacity: 0.0 });
				}

				var nextPopup = this._activePopups[this._activePopups.length - 2];
				nextPopup.overlayHtml().setStyle({ opacity: totalOpacity });
				
				var backgroundOpacity = 1 - (1 - totalOpacity)/(1 - foregroundOpacity);
				if (skipAnimation) {
					nextPopup.overlayHtml().setStyle({ opacity: backgroundOpacity });
				} else {
					this._activeAnimations.push(new Effect.Appear(nextPopup.overlayHtml(), {
						from: totalOpacity,
						to: backgroundOpacity,
						duration: 0.5
					}));
				}
			} else {
				var opacity, p;
				for (i=0; i<this._activePopups.length - 1; i++) {
					p = this._activePopups[i];
					opacity = p.overlayHtml().getStyle("opacity");
					if (opacity > 0.0) {
						if (skipAnimation) {
							p.overlayHtml().setStyle({ opacity: 0.0 });
						} else {
							this._activeAnimations.push(new Effect.Fade(p.overlayHtml(), {
								from: opacity,
								to: 0.0,
								duration: 0.5
							}));
						}
					}
				}
			}
			if (this.activePopup().overlayHtml().getStyle("display") == "none") {
				this.activePopup().overlayHtml().setStyle({ opacity: 0.0 });
			}

			if (skipAnimation) {
				this.activePopup().overlayHtml().show();
				this.activePopup().overlayHtml().setStyle({ opacity: foregroundOpacity });
			} else {
				this._activeAnimations.push(new Effect.Appear(this.activePopup().overlayHtml(), {
					from: this.activePopup().overlayHtml().getStyle("opacity"),
					to: foregroundOpacity,
					duration: 0.5
				}));
			}
		},
		
		activePopup: function() {
			return this._activePopups.last();
		},
		
		addObservers: function() {
			
			if (this._hasObservers) { return; }
			document.observe("keydown", function(e) {
				if (e.keyCode == Event.KEY_ESC && this.activePopup() && this.activePopup().getDeactivateOnEscape() && e.target.tagName.toLowerCase() != "input") {
					this.activePopup().deactivate();
				}
			}.bindAsEventListener(this));
			
			Event.observe(window, "resize", this.resize.bind(this));
			
			this._hasObservers = true;
		}
	}
});


