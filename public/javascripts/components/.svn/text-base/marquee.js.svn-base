rio.components.Marquee = rio.Component.create();

rio.components.Marquee.requireCss("marquee");

rio.components.Marquee.attrReader("initLeft");
rio.components.Marquee.attrReader("initTop");
rio.components.Marquee.attrReader("backgroundColor", "#669");
rio.components.Marquee.attrReader("onComplete", Prototype.emptyFunction);

rio.components.Marquee.attrHtml("background", "antsTop", "antsLeft", "antsBottom", "antsRight");

rio.Component.extend(rio.components.Marquee, {
	initialize: function(options) {
		this._marqueeMove = this.marqueeMove.bindAsEventListener(this);
		this._marqueeComplete = this.marqueeComplete.bindAsEventListener(this);
		this._keyPress = this.keyPress.bindAsEventListener(this);
		
		Event.observe(document, "mousemove", this._marqueeMove);
		Event.observe(document, "mouseup", this._marqueeComplete);
		Event.observe(document, "keypress", this._keyPress);

		var bod = Element.body();
		bod.insert(this.html());
	},
	
	buildHtml: function() {
		return rio.Tag.div([this.antsTopHtml(), this.antsLeftHtml(), this.antsBottomHtml(), this.antsRightHtml(), this.backgroundHtml()], {
			style: "z-index: 9999; left: " + this.getInitLeft() + "px; top: " + this.getInitTop() + "px; width: 0px; height: 0px; font-size: 0px;",
			className: "marquee"
		});
	},
	
	buildBackgroundHtml: function() {
		return rio.Tag.div('', { 
			className: "marqueeBackground",
			style: "background-color: " + this.getBackgroundColor()
		});
	},
	
	buildAntsHtml: function(pos) {
		return rio.Tag.span('', { className: pos + "Ants" });
	},

	buildAntsTopHtml: function() { return this.buildAntsHtml("top"); },
	buildAntsLeftHtml: function() { return this.buildAntsHtml("left"); },
	buildAntsBottomHtml: function() { return this.buildAntsHtml("bottom"); },
	buildAntsRightHtml: function() { return this.buildAntsHtml("right"); },
	
	marqueeMove: function(e) {
		var offsets = document.viewport.getScrollOffsets();
		var x = e.clientX + offsets[0];
		var y = e.clientY + offsets[1];
		var initLeft = this.getInitLeft();
		var initTop = this.getInitTop();

		if (initLeft < x) {
			this.setLeft(initLeft);
			this.setWidth(x - initLeft);
		} else {
			this.setLeft(x);
			this.setWidth(initLeft - x);
		}
		
		if (initTop < y) {
			this.setTop(initTop);
			this.setHeight(y - initTop);
		} else {
			this.setTop(y);
			this.setHeight(initTop - y);
		}
	},
	
	setLeft: function(newLeft) {
		this.html().style.left = newLeft + "px";
	},

	getLeft: function() {
		return this.html().cumulativeOffset()[0];
	},
	
	setTop: function(newTop) {
		this.html().style.top = newTop + "px";
	},

	getTop: function() {
		return this.html().cumulativeOffset()[1];
	},
	
	getWidth: function() {
		return this.html().getWidth();
	},

	setWidth: function(newWidth) {
		this.html().style.width = newWidth + "px";
		this.backgroundHtml().style.width = newWidth + "px";
	},

	getHeight: function() {
		return this.html().getHeight();
	},

	setHeight: function(newHeight) {
		this.html().style.height = newHeight + "px";
		this.backgroundHtml().style.height = newHeight + "px";
	},

	marqueeComplete: function(e) {
		this.getOnComplete()({
			left: this.getLeft(),
			top: this.getTop(),
			width: this.getWidth(),
			height: this.getHeight()
		});
		this.killMarquee();
	},
	
	killMarquee: function() {
		Event.stopObserving(document, "mousemove", this._marqueeMove);
		Event.stopObserving(document, "mouseup", this._marqueeComplete);
		Event.stopObserving(document, "keypress", this._keyPress);

		this.html().remove();
	},
	
	keyPress: function(e) {
		if (e.keyCode == Event.KEY_ESC) {
			this.killMarquee();
			e.stop();
		}
	}
});
