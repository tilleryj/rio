rio.Application.require("components/box");

rio.components.Container = rio.Component.create(rio.components.Box, "Container", {
	requireCss: "container",
	attrAccessors: [["items", []]],
	attrReaders: [
		["layout", false]
	],
	methods: {
		buildHtml: function() {
			var html = this.boxHtml();
			
			html.observe("selectstart", function(e) {
				if (e.target == html) {
					e.stop(); 
				}
			}.bindAsEventListener(this));
			
			html.addClassName("container");
			
			this.items.bind(function(items) {
				items = [items].flatten();
				html.update();
				items.each(function(item) {
					html.insert(item);
				});
				
				if (this.getLayout()) {
					html.setStyle({ overflow: "hidden" });
					if (this.getLayout() == "fit") {
						var fitLayout = new rio.FitLayout({
							parent: html,
							items: items
						});
						this._resize = fitLayout.resize.bind(fitLayout);
					} else {
						var containerLayout = new rio.ContainerLayout({
							parent: html,
							items: items
						});
						this._resize = containerLayout.resize.bind(containerLayout);
					}
				}
			}.bind(this));
			
			return html;
		},
		
		resize: function() {
			if (this._resize) { this._resize(); }
			if (!this.getLayout()) {
				[this.getItems()].flatten().each(function(item) {
					if (item.resize && !(item.getLayout && item.getLayout())) { 
						item.resize();
					}
				});
			}
		}
	}
});

rio.Layout = Class.create({
	initialize: function(options) {
		this.parent = options.parent;
		this.items = options.items;
		this.parent.setStyle({
			position: "relative"
		});
		
		$w("top left right bottom").each(function(key) { 
	      this.parent[key] = this.padding(this.parent, key);
	    }.bind(this));
	},
	
	fullPadding: function(element, s) {   
		return this.padding(element, s) + this.border(element, s) + this.margin(element, s);
	},

	border: function(element, s) {   
		var border = parseInt(element.getStyle("border-" + s + "-width") || 0, 10);
		if (isNaN(border)) { // Test for IE!!
			border = 0;
		}
		return border;
	},

	padding: function(element, s) {   
		var padding = parseInt(element.getStyle("padding-" + s) || 0, 10);
		if (isNaN(padding)) {   // Test for IE!!
			padding = 0;
		}
		return padding;
	},

	margin: function(element, s) {   
		var margin = parseInt(element.getStyle("margin-" + s) || 0, 10);
		if (isNaN(margin)) {  // Test for IE!!
			margin = 0;
		}
		return margin;
	},

	setPositivePxValue:function(objet, key, value) {
		objet[key] =  (value > 0 ? value : 0) + "px";
	},
	
	setPixelMetrics: function(element) {
		element.style.position = "absolute";
		element.paddingWidth   = this.fullPadding(element, "left") + this.fullPadding(element, "right");
		element.paddingHeight  = this.fullPadding(element, "top") + this.fullPadding(element, "bottom");
		element.marginWidth    = this.margin(element, "left") + this.margin(element, "right");
		element.marginHeight   = this.margin(element, "top") + this.margin(element, "bottom");
	}
});

rio.FitLayout = Class.create(rio.Layout, {
	initialize: function($super, options) {
		$super(options);

		if (this.items.length != 1) {
			throw("Fit layouts require exactly one element");
		}
		this.setPixelMetrics(this.element());
	},
	
	element: function() {
		var item = this.items.first();
		return item.html ? item.html() : item;
	},
	
	resize: function() {
		if (!Element.isRendered(this.parent)) { return; }
		
		var element = this.element();
		var parent = this.parent;

		var d = this.parent.getDimensions();

		var leftOffset = this.padding(parent, "left") + this.border(parent, "left");
		var rightOffset = this.padding(parent, "right") + this.border(parent, "right");
		var topOffset = this.padding(parent, "top") + this.border(parent, "top");
		var bottomOffset = this.padding(parent, "bottom") + this.border(parent, "bottom");
		var w = d.width - leftOffset - rightOffset;
		var h = d.height - topOffset - bottomOffset;
		
		var s = element.style;
		s.top = topOffset + "px";
		s.left = leftOffset + "px";
		s.width = (w - element.horizontalMBP()) + "px";
		s.height = (h - element.verticalMBP()) + "px";
	}
});

rio.ContainerLayout = Class.create(rio.Layout, {
	initialize: function($super, options) {
		$super(options);
		this.manageParentHeight = this.parent.getStyle("height") == "100%";

		this.items.each(function(item) {
	      	this.setPixelMetrics(item.html());
			this[item.getRegion()] = item;
		}.bind(this));

		if (!rio.ContainerLayout._containers) { rio.ContainerLayout._containers = []; }
		rio.ContainerLayout._containers.unshift(this);
		rio.ContainerLayout.resize.bind(this).defer();
	},
	
	// This method needs some serious refactoring.
	resize: function() {
		if (!Element.isRendered(this.parent)) { return; }
		if (this.manageParentHeight) {
			this.parent.setStyle({ 
				height: this.parent.ancestors()[0].getHeight() - this.padding(this.parent, "bottom") + "px" 
			});
		}
		
		var d = this.parent.getDimensions();
		var w = d.width - this.parent.left - this.border(this.parent, "left") - this.border(this.parent, "right") - this.padding(this.parent, "right");
		var h = d.height - this.parent.top - this.parent.bottom  - this.border(this.parent, "top") - this.border(this.parent, "bottom") - this.padding(this.parent, "bottom") - this.padding(this.parent, "top");
		var that = this; // To avoid too many binds

		// Set position and size of all top elements  
		var s;
		var top = this.parent.top + this.padding(this.parent, "top");
		var lessTop = (!this.north || this.north.getShowing()) ? 0 : this.north.html().getHeight();
		if (this.north) {
			s = this.north.html().style;   
			that.setPositivePxValue(s, 'width', w - this.north.html().paddingWidth);
			s.top = top - lessTop + "px";
			top += this.north.html().getHeight() + this.north.html().marginHeight + this.border(this.north.html(), "top") + this.border(this.north.html(), "bottom");
		}
		h -= top - this.parent.top - this.padding(this.parent, "top");

		// Set position and size of all bottom elements
		var bottom = this.parent.bottom + this.padding(this.parent, "bottom");
		var lessBottom = (!this.south || this.south.getShowing()) ? 0 : this.south.html().getHeight();
		if (this.south) {
			s = this.south.html().style;   
			that.setPositivePxValue(s, 'width', w - this.south.html().paddingWidth);
			s.bottom = bottom - lessBottom + "px";
			bottom += this.south.html().getHeight() + this.south.html().marginHeight + this.border(this.south.html(), "top") + this.border(this.south.html(), "bottom");
		}
		h -= bottom - this.parent.bottom - this.padding(this.parent, "bottom");

		// Set position and size of all left elements
		var left = this.parent.left;
		var lessLeft = (!this.west || this.west.getShowing()) ? 0 : this.west.html().getWidth();
		if (this.west) {
			s = this.west.html().style;  
			that.setPositivePxValue(s, 'height', h - this.west.html().paddingHeight + lessTop + lessBottom);
			s.top  = top - lessTop + "px";  
			s.left = left - lessLeft + "px";  
			left += this.west.html().getWidth() + this.west.html().marginWidth;
		}
		w -= left - this.padding(this.parent, "left");
		
		// Set position and size of all right elements
		var right = this.parent.right;
		var lessRight = (!this.east || this.east.getShowing()) ? 0 : this.east.html().getWidth() + this.margin(this.east.html(), "left") + this.margin(this.east.html(), "right");
		if (this.east) {
			s = this.east.html().style;
			that.setPositivePxValue(s, 'height', h - this.east.html().paddingHeight + lessTop + lessBottom);
			s.top   = top - lessTop + "px";
			s.right = right - lessRight + "px";
			right += this.east.html().getWidth() + this.east.html().marginWidth;
		}
		w -= right - this.padding(this.parent, "right");

		// Set position and size of all center elements
		// Only one center for this version
		var center = this.center.html();
		s = center.style;
		s.top  = top - lessTop + "px";
		s.left = left - lessLeft + "px";  

		// var extra = 0;
		this.setPositivePxValue(s, 'width', w - center.horizontalMBP() + lessLeft + lessRight);
		this.setPositivePxValue(s, 'height', h - center.paddingHeight + lessTop + lessBottom);
		
		if(this.north) { this.north.resize(); }
		if(this.south) { this.south.resize(); }
		if(this.east) { this.east.resize(); }
		if(this.west) { this.west.resize(); }
		if(this.center) { this.center.resize(); }
	}
});

rio.ContainerLayout.resize = function() {
	if (rio.ContainerLayout._containers) {
		rio.ContainerLayout._containers.invoke("resize");
	}
};
Event.observe(window, "resize", rio.ContainerLayout.resize.bind(rio.ContainerLayout));
Event.observe(window, "load", rio.ContainerLayout.resize.bind(rio.ContainerLayout));










