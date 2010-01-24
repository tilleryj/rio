rio.Application.require("components/box");

rio.components.Panel = rio.Component.create(rio.components.Box, "Panel", {
	require: ["components/splitter", "components/container"],
	requireCss: "panel",
	attrAccessors: [
		["items", []]
	],
	attrReaders: [
		["resizable", false],
		"maxWidth",
		"minWidth",
		"maxHeight",
		"minHeight",
		"splitterImage",
		["invisible", false],
		["layout", false],
		"title"
	],
	attrHtmls: ["inner", "outer", "title"],
	methods: {
		buildHtml: function() {
			var html = this.boxHtml();
			
			html.addClassName("panel");
			if (this.getInvisible()) {
				html.addClassName("invisiblePanel");
			}
			
			var outerHtml = this.outerHtml();
			
			var region = this.getRegion();
			if (this.getResizable() && region && region != "center") {
				var dimension = (region == "east" || region == "west") ? "width" : "height";
				var placements = (region == "east" || region == "west") ? ["left", "right"] : ["top", "bottom"];
				var primaryPosition = region == "west" || region == "north";
				
				var originalSize = this[("get-" + dimension).camelize()]().stripPx();
				var splitterOptions = {
					horizontal: dimension == "width",
					position: "absolute",
					splitterImage: this.getSplitterImage()
				};

				var maxSize = this[("getMax-" + dimension).camelize()]();
				if (maxSize) {
					maxSize = maxSize.stripPx();
					if (primaryPosition) {
						splitterOptions.maxDelta = maxSize - originalSize;
					} else {
						splitterOptions.minDelta = originalSize - maxSize;
					}
				}
				var minSize = this[("getMin-" + dimension).camelize()]();
				if (minSize) {
					minSize = minSize.stripPx();
					if (primaryPosition) {
						splitterOptions.minDelta = minSize - originalSize;
					} else {
						splitterOptions.maxDelta = originalSize - minSize;
					}
				}
				var splitter = new rio.components.Splitter(splitterOptions);

				splitter.delta.bind(function(delta) {
					var style = {};
					style[dimension] = (primaryPosition ? originalSize + delta : originalSize - delta) + "px";
					html.setStyle(style);
					rio.ContainerLayout.resize();
				}.bind(this));
				
				html.insert(outerHtml);
				html.insert(splitter);
				var outerHtmlStyle = {};
				
				// Instead of using 8px we should add a size attr to splitter and use that here.
				outerHtmlStyle[("margin-" + placements[primaryPosition ? 1 : 0]).camelize()] = "8px";
				outerHtml.setStyle(outerHtmlStyle);
				
				var splitterStyle = {};
				splitterStyle[placements[primaryPosition ? 1 : 0]] = "0px";
				if (dimension == "width") {
					splitterStyle.top = "0px";
				}
				splitter.html().setStyle(splitterStyle);
			} else {
				html.insert(outerHtml);
			}
			
			return html;
		},
		
		buildTitleHtml: function() {
			if (this.getTitle()) {
				return rio.Tag.div(this.getTitle(), { className: "panelTitle" });
			} else {
				return rio.Tag.span();
			}
		},
		
		buildInnerHtml: function() {
			var container = new rio.components.Container({
				items: this.items,
				layout: this.getLayout(),
				height: "100%"
			});
			var html = rio.Tag.div(container, { className: "panelInside" });
			if (this.getInvisible()) {
				html.addClassName("invisiblePanelInside");
			}
			return html;
		},
		
		buildOuterHtml: function() {
			var html = rio.Tag.div([this.titleHtml(), this.innerHtml()], { className: "panelOutside" });
			if (this.getInvisible()) {
				html.addClassName("invisiblePanelOutside");
			}
			return html;
		},
		
		resize: function() {
			var region = this.getRegion();
			if (region) {
				this.outerHtml().setStyle({ height: "auto" });
				var otherHeight = this.html().verticalMBP() + this.outerHtml().verticalMBP();

				this.outerHtml().setStyle({
					height: (this.html().getHeight() - otherHeight) + "px"
				});
				
				this.innerHtml().setStyle({
					height: (this.html().getHeight() - this.titleHtml().getHeight() - this.innerHtml().verticalMBP() - this.outerHtml().verticalMBP()) + "px"
				});
			} 
			if (region && (region == "west" || region == "east")) {
				this.outerHtml().setStyle({ width: "auto" });
				
				var otherWidth = this.outerHtml().horizontalMBP();
				this.outerHtml().setStyle({
					width: (this.html().getWidth() - otherWidth) + "px"
				});
			}
		}
	}
});
