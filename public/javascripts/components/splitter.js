rio.components.Splitter = rio.Component.create(rio.components.Base, "Splitter", {
	requireCss: "splitter",
	attrReaders: [
		["horizontal", true],
		"minDelta",
		"maxDelta",
		"splitterImage"
	],
	attrAccessors: [
		["delta", 0]
	],
	methods: {
		buildHtml: function() {
			var horizontal = this.getHorizontal();
			var html = rio.Tag.div("", { className: horizontal ? "splitterH" : "splitterV" });
			
			var defaultSplitterImage = horizontal ? "/images/splitter-handle-horizontal.png" : "/images/splitter-handle-vertical.png";
			var handleImage = new rio.components.Image({ src: this.getSplitterImage() || defaultSplitterImage });
			var handle = handleImage.html();
			var handleWrapper = rio.Tag.div(handle);
			
			var stopEvent = function(e) { e.stop(); return false; }.bindAsEventListener(this);
			handle.observe("dragstart", stopEvent);

			var dragging = false;
			var dragStart = 0;
			var deltaStart = 0;
			html.observe("mousedown", function(e) {
				dragging = true;
				dragStart = e[horizontal ? "pointerX" : "pointerY"]();
				deltaStart = this.getDelta();
				
				e.stop();
			}.bindAsEventListener(this));
			
			var updateDelta = function(pointer) {
				var newDelta = deltaStart + (pointer - dragStart);
				if (this.getMinDelta() != undefined) {
					newDelta = Math.max(newDelta, this.getMinDelta());
				}
				if (this.getMaxDelta() != undefined) {
					newDelta = Math.min(newDelta, this.getMaxDelta());
				}
				this.setDelta(newDelta);
			}.bind(this);
			
			document.observe("mousemove", function(e) {
				if (dragging) {
					updateDelta(e[horizontal ? "pointerX" : "pointerY"]());
				}
			}.bindAsEventListener(this));
			
			document.observe("mouseup", function(e) {
				if (dragging) {
					updateDelta(e[horizontal ? "pointerX" : "pointerY"]());
					dragging = false;
				}
			}.bindAsEventListener(this));
			
			html.insert(handleWrapper);
			
			return html;
		}
	}
});