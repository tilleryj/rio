// Copyright 2008, Thinklink
// Adapted from:
//  - sleight.js by Aaron Boodman
//  - bgsleight.js by nater@naterkane.com
//
// dependencies - [builder, utils]

rio.PngFix = Class.create();
rio.PngFix.prototype = {
	initialize: function() {
		var platformIE = navigator.platform == "Win32" && navigator.appName == "Microsoft Internet Explorer" && window.attachEvent;
		var browserIE = navigator.appVersion.match(/MSIE (\d+\.\d+)/, '');
		var browserIEGT5 = (browserIE != null && Number(browserIE[1]) < 5.5);
		var browserIELT7 = (browserIE != null && Number(browserIE[1]) < 7);

		this._applicable = platformIE && browserIEGT5 && browserIELT7;
	},
	
	loadPngs: function() {
		if (this.isApplicable()) {
			this.loadForegroundPngs();
			this.loadBackgroundPngs();
		}
	},
	
	loadBackgroundPngs: function() {
		for (var i = document.all.length - 1, obj = null; (obj = document.all[i]); i--) {
			if (obj.currentStyle.backgroundImage.match(/\.png/i) != null) {
				this.fixPng(obj);
				obj.attachEvent("onpropertychange", this.propertyChanged);
			}
		}
	},
	
	loadForegroundPngs: function() {
		for (var i = document.images.length - 1, img = null; (img = document.images[i]); i--) {
			if (img.src.match(/\.png$/i) != null) {
				var imgHtml = rio.Tag.div('');
				$(imgHtml).setStyle({
					filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + img.src + "', sizing='scale')",
					width: img.width + "px",
					height: img.height + "px"
				});
				Element.body().insert(imgHtml);
				$(img).replace(imgHtml);
			}
		}
	},

	propertyChanged: function() {
		if (window.event.propertyName == "style.backgroundImage") {
			var el = window.event.srcElement;
			if (!el.currentStyle.backgroundImage.match(/transparent\.gif/i)) {
				var bg	= el.currentStyle.backgroundImage;
				var src = bg.substring(5,bg.length-2);
				el.filters.item(0).src = src;
				el.style.backgroundImage = "url(/images/blank.gif)";
			}
		}
	},

	fixPng: function(obj) {
		var bg	= obj.currentStyle.backgroundImage;
		var src = bg.substring(5,bg.length-2);
		var sizingMethod = (obj.currentStyle.backgroundRepeat == "no-repeat") ? "crop" : "scale";
		obj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='" + sizingMethod + "')";
		obj.style.backgroundImage = "url(/images/blank.gif)";
	},
	
	isApplicable: function() {
		return this._applicable;
	}
};

Event.observe(window, "load", function() { new rio.PngFix().loadPngs(); });
