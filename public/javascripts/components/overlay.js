// Copyright 2008, Thinklink
rio.components.Overlay = rio.Component.create("Overlay", {
	requireCss: "overlay",
	attrAccessors: [["active", false]],
	attrReaders: [
		["opacity", 0.8],
		["deactivateOnEscape", true],
		["deactivateOnClick", true]
	],
	attrHtmls: ["overlay"],
	methods: {
		yPos : 0,
		xPos : 0,

		initialize: function(options) {
			this._ie = Prototype.Browser.IE;
			this._keyDown = this.keyDown.bind(this);
		},

		activate: function() {
			this.setActive(true);
			if (this.isIE()){
				this.getScroll();

				this._initialStyle = {
					height: Element.body().style.height || "auto",
					overflow: Element.body().style.overflow || "auto"
				};
				this.prepareIE('100%', 'hidden');
				this.setScroll(0,0);
				this.hideSelects('hidden');
			}
			Event.observe(document, 'keydown', this._keyDown);
			if (this.getDeactivateOnClick()) {
				Event.observe(this.overlayHtml(), 'click', this._deactivate);
			}

			Element.setOpacity(this.overlayHtml(), this.getOpacity());

			if (this.isIE()) {
				this.overlayHtml().show();
			} else {
				this.overlayHtml().appear({
					from: 0.0,
					to: this.getOpacity(),
					duration: 0.5
				});
			}
		},

		deactivate: function(skipFade) {
			if (this.isIE()){
				this.setScroll(0,this.yPos);
				var managingLayout = (rio.app.getCurrentPage() && rio.app.getCurrentPage().isManagingLayout());
				if (managingLayout) {
					this.prepareIE("100%", "hidden");
				} else {
					this.prepareIE(this._initialStyle.height, this._initialStyle.overflow);
				}
				this.hideSelects("visible");
			}
			Event.stopObserving(document, 'keydown', this._keyDown);
			if (this.getDeactivateOnClick()) {
				Event.stopObserving(this.overlayHtml(), 'click', this._deactivate);
			}

			if (skipFade || this.isIE()) {
				this.overlayHtml().hide();
			} else {
				this.overlayHtml().fade({
					from: this.getOpacity(),
					to: 0.0,
					duration: 0.5
				});
			}
			this.setActive(false);
		},

		// Taken from lightbox implementation found at http://www.huddletogether.com/projects/lightbox/
		getScroll: function() {
			if (self.pageYOffset) {
				this.yPos = self.pageYOffset;
			} else if (document.documentElement && document.documentElement.scrollTop){
				this.yPos = document.documentElement.scrollTop; 
			} else if (document.body) {
				this.yPos = document.body.scrollTop;
			}
		},

		setScroll: function(x, y) {
			window.scrollTo(x, y); 
		},

		// In IE, select elements hover on top of the lightbox
		hideSelects: function(visibility){
			selects = document.getElementsByTagName('select');
			for(i = 0; i < selects.length; i++) {
				selects[i].style.visibility = visibility;
			}
		},

		// Ie requires height to 100% and overflow hidden or else you can scroll down past the lightbox
		prepareIE: function(height, overflow) {
			Element.body().setStyle({
				height: height,
				overflow: overflow
			});

			Element.html().setStyle({
				height: height,
				overflow: overflow
			});
		},

		keyDown: function(e) {
			if (this.isDeactivateOnEscape() && e.keyCode == Event.KEY_ESC) {
				this.deactivate();
				e.stop();
			}
		},

		buildOverlayHtml: function() {
			var position = Prototype.Browser.IE ? "absolute" : "fixed";
			var overlay = rio.Tag.div('', { className: 'overlay', style: 'display: none; position: ' + position });
			Element.insert(Element.body(), { bottom: overlay });
			return overlay;
		},

		isIE: function() {
			return this._ie;
		}
	}
});
