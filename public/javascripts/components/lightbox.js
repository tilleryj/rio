// Copyright 2008, Thinklink
// Adapted from:
//  - lightbox.js by Chris Cambell

rio.Application.require("components/overlay");

rio.components.Lightbox = rio.Component.create(rio.components.Overlay, "Lightbox", {
	requireCss: "lightbox",
	attrAccessors: ["contentUrl"],
	attrReaders: ["content"],
	attrHtmls: ["outer", "lightbox", "loading"],
	attrEvents: ["deactivate"],
	methods: {
		initialize: function($super, options) {
			$super(options);

			this._keyDown = this.keyDown.bindAsEventListener(this);
			this._deactivate = this.deactivate.bind(this);
			this._outerLigthboxClick = this.outerLightboxClick.bindAsEventListener(this);
			this._resize = this.resize.bindAsEventListener(this);

			if (options.ctrl) {
				options.ctrl = $(options.ctrl);
				Event.observe(options.ctrl, 'click', this.activate.bindAsEventListener(this), false);
				options.ctrl.onclick = function(){ return false; };
			}

			if (!this._content) {
				this._contentUrl = options.url || options.ctrl.href;
			}
		},

		buildOuterHtml: function() {
			var position = Prototype.Browser.IE ? "absolute" : "fixed";
			var outerHtml = rio.Tag.div([this.loadingHtml(), this.lightboxHtml()], {className: "lightboxOuter", style: "display: none; position: " + position});
			Element.insert(Element.body(), outerHtml);
			return outerHtml;
		},

		buildLightboxHtml: function() {
			return rio.Tag.div('', { className: 'lightbox' });
		},

		buildLoadingHtml: function() {
			var position = Prototype.Browser.IE ? "absolute" : "fixed";
			return rio.Tag.div(rio.Tag.img('', { src: "/images/lightbox-loading.gif" }), { className: 'lightboxLoading', style: "display: none; position: " + position });
		},

		// Turn everything on - mainly the IE fixes
		activate: function($super){
			if (this.isActive()) { return; }

			if (rio.components.Lightbox.currentLightbox) { rio.components.Lightbox.deactivateCurrentLightbox(); }

			$super();
			rio.components.Lightbox.currentLightbox = this;
			Event.observe(this.outerHtml(), 'click', this._outerLigthboxClick);
			Element.show(this.outerHtml());
			Element.show(this.loadingHtml());
			this.loadInfo();
		},

		outerLightboxClick: function(e) {
			if (this.getDeactivateOnClick() && !Element.descendantOf(e.element(), this.lightboxHtml())) { 
				this._deactivate();
			}
		},

		// Begin Ajax request based off of the href of the clicked linked
		loadInfo: function() {
			if (this.getContent()) {
				this.processInfo(this.getContent());
			} else {
				new Ajax.Request(this.getContentUrl(), {
					method: 'get', 
					parameters: "",
					onComplete: function(response) {
						this.processInfo(response.responseText);
					}.bind(this)
				});
			}
		},

		// Display Ajax response
		processInfo: function(content){
			this._contentHtml = rio.Tag.div('', { style: "visibility: hidden" });
			Element.insert(this._contentHtml, content);
			Element.insert(this.lightboxHtml(), this._contentHtml);

			this.actions();
			Event.observe(window, "resize", this._resize);

			(function() {
					this._contentHtml.style.visibility = "visible";
					Element.hide(this.loadingHtml());
					this.resize();
			}.bind(this)).defer();
		},

		resize: function(e) {
			var lbHeight = Element.getHeight(this.lightboxHtml());
			var lbWidth = Element.getWidth(this.lightboxHtml());
			var wHeight = document.viewport.getHeight();
			var wWidth = document.viewport.getWidth();

			Element.setStyle(this.lightboxHtml(), {
				top: Math.max(wHeight - lbHeight, 0) / 2 + "px",
				left: Math.max(wWidth - lbWidth, 0) / 2 + "px"
			});
		},

		// Search through new links within the lightbox, and attach click event
		actions: function(){
			$$('.lbAction').each(function(a) {
				Event.observe(a, 'click', this[a.rel].bindAsEventListener(this));
				a.onclick = function(){ return false; };
			}.bind(this));
		},

		// Example of creating your own functionality once lightbox is initiated
		deactivate: function($super, skipFade){
			if (Element.isRendered(this._contentHtml)) {
				Element.remove(this._contentHtml);
			}

			$super(skipFade);
			Element.hide(this.outerHtml());
			Event.stopObserving(window, "resize", this._resize);
			Event.stopObserving(this.lightboxHtml(), 'click', this._markLightboxEvent);
			Event.stopObserving(this.outerHtml(), 'click', this._outerLigthboxClick);
			if (rio.components.Lightbox.currentLightbox == this) { rio.components.Lightbox.currentLightbox = null; }

			this.fire("deactivate");
		},

		toggle: function() {
			if (this.isActive()) { this.deactivate(); } else { this.activate(); }
		}
	},
	
	classMethods: {
		deactivateCurrentLightbox: function() {
			if (this.currentLightbox) { this.currentLightbox.deactivate(); }
		},

		registerClassName: function(className) {
			lbox = $$('.' + className).each(function(a) {
				new rio.components.Lightbox({ ctrl: a });
			});
		}
	}
});

/*-----------------------------------------------------------------------------------------------*/

Event.observe(window, 'load', function() { rio.components.Lightbox.registerClassName('lbOn'); });
