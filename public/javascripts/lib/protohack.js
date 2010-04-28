if (Prototype.Browser.WebKit) {
	Object.extend(Event, {
		// This does not appear to be the case now
		// KEY_LEFT:     63234,
		// KEY_UP:       63232,
		// KEY_RIGHT:    63235,
		// KEY_DOWN:     63233,
		// KEY_DELETE:   63272,
		KEY_HOME:     63273,
		KEY_END:      63275,
		KEY_PAGEUP:   63276,
		KEY_PAGEDOWN: 63277
	});
}

Object.extend(Element, {
	body: function() {
		return $$('body')[0];
	},
	
	head: function() {
		return $$('head')[0];
	},
	
	html: function() {
		return $$('html')[0];
	},
	
	isRendered: function(elt) {
		return elt.descendantOf(Element.body());
	},
	
	toPixels: function(val) {
		if (!val) { return val; }
		
		if (Object.isNumber(val)) { return val + "px"; }
		if (Object.isString(val) && val.match(/^-?\d*$/)) { return val + "px"; }
		
		return val;
	},
	
	pixeledAttributes: [
		"width", "height",
		"padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
		"margin", "marginTop", "marginRight", "marginBottom", "marginLeft",	
		"top", "bottom", "left", "right",
		"fontSize"
	]
});

Element.addMethods({
	totalHeight: function(elt) {
		return ["height", "margin-top", "margin-bottom", "padding-top", "padding-bottom", "border-top-width", "border-bottom-width"].inject(0, function(acc, prop) {
			return acc + (parseInt(elt.getStyle(prop), 0) || 0);
		});
	},
	
	addHoverClass: function(elt, hoverClass, focusClass) {
		elt = $(elt);
		elt.observe('mouseover', function() {
			elt.addClassName(hoverClass);
		});
		elt.observe('mouseout', function() {
			elt.removeClassName(hoverClass);
		});
		if (focusClass) {
			elt.observe('focus', function() {
				elt.addClassName(focusClass);
				elt.removeClassName(hoverClass);
			});
			elt.observe('blur', function() {
				elt.removeClassName(focusClass);
			});
		}
	},
	
	insert: Element.insert.wrap(function(proceed, elt, insertions) {
		var newInsertions;
		if (insertions.html) {
			newInsertions = insertions.html();
		} else if (insertions.top || insertions.bottom || insertions.before || insertions.after) {
			newInsertions = {};
			Object.keys(insertions).each(function(position) {
				newInsertions[position] = insertions[position].html ? insertions[position].html() : insertions[position];
			});
		} else {
			newInsertions = insertions;
		}
		
		proceed(elt, newInsertions);
	}),
	
	applyStyle: function(elt, styles) {
		var toApply = {};
		var styleBinding = function(val) {
			var style = {};
			style[styleName] = Element.pixeledAttributes.include(styleName) ? Element.toPixels(val) : val;
			elt.setStyle(style);
		};
		for (styleName in styles) {
			var val = styles[styleName]; //.THEME ? styles[styleName]() : styles[styleName];
			if (val == undefined) {
				// Do nothing
			} else if (val.BINDING) {
				val.bind(styleBinding, true);
				var newValue = Element.pixeledAttributes.include(styleName) ? Element.toPixels(val.value()) : val.value();
				if (newValue !== undefined) {
					toApply[styleName] = newValue;
				}
			} else {
				toApply[styleName] = Element.pixeledAttributes.include(styleName) ? Element.toPixels(val) : val;
			}
		}
		elt.setStyle(toApply);
	},

	horizontalMBP: function(elt) {
		return elt.totalPixelsForStyles(["marginLeft", "marginRight", "borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"]);
	},
	
	verticalMBP: function(elt) {
		return elt.totalPixelsForStyles(["marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"]);
	},
	
	totalPixelsForStyles: function(elt, styles) {
		return styles.inject(0, function(acc, s) {
			var val = parseInt(elt.getStyle(s).stripPx() || 0, 10);
			if (isNaN(val)) {  // Test for IE!!
				val = 0;
			}
			return acc + val;
		});
	}
	
});

if (rio.environment.logEventErrors) {
	rio.eventCounts = {};
	Event.observe = Event.observe.wrap(function(proceed, element, eventName, handler) {
		rio.eventCounts[eventName] = (rio.eventCounts[eventName] || 0) + 1;
		var newHandler = handler.wrap(function(proceed) {
			try {
				proceed.apply(proceed, $A(arguments).slice(1));
			} catch(e) {
				rio.error(e, "Error processing event: " + element + "#" + eventName);
				throw(e);
			}
		});
		proceed(element, eventName, newHandler);
	});
	
	Element.addMethods({
	  observe: Event.observe
	});

	Object.extend(document, {
	  observe: Element.Methods.observe.methodize()
	});
	
	Ajax.Request.prototype.dispatchException = Ajax.Request.prototype.dispatchException.wrap(function(proceed, exception) {
		rio.error(exception, "Error processing Ajax callback: ");
		proceed(exception);
	});
}

Object.extend(Date.prototype, {
	strftime: function(format) {
		var day = this.getDay(), month = this.getMonth();
		var hours = this.getHours(), minutes = this.getMinutes();
		function pad(num) { return num.toPaddedString(2); }

		return format.gsub(/\%([aAbBcdDeHiImMnpPSwyY])/, function(part) {
			switch(part[1]) {
				case 'a': return $w("Sun Mon Tue Wed Thu Fri Sat")[day];
				case 'A': return $w("Sunday Monday Tuesday Wednesday Thursday Friday Saturday")[day];
				case 'b': return $w("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec")[month];
				case 'B': return $w("January February March April May June July August September October November December")[month];
				case 'c': return this.toString();
				case 'd': return pad(this.getDate());
				case 'D': return pad(this.getDate());
				case 'e': return this.getDate();
				case 'H': return pad(hours);
				case 'i': return (hours === 12 || hours === 0) ? 12 : (hours + 12) % 12;
				case 'I': return pad((hours === 12 || hours === 0) ? 12 : (hours + 12) % 12);
				case 'm': return pad(month + 1);
				case 'M': return pad(minutes);
				case 'n': return month + 1;
				case 'p': return hours > 11 ? 'PM' : 'AM';
				case 'P': return hours > 11 ? 'pm' : 'am';
				case 'S': return pad(this.getSeconds());
				case 'w': return day;
				case 'y': return pad(this.getFullYear() % 100);
				case 'Y': return this.getFullYear().toString();
			}
		}.bind(this));
	},

	prettyTime: function() {
		return this.getHours() + ":" + 
		this.getMinutes().toPaddedString(2) + ":" + 
		this.getSeconds().toPaddedString(2);
	}
});

Object.extend(Date, {
	/*
		Adapted from (http://delete.me.uk/2005/03/iso8601.html)
	*/
	parseISO: function(string) {
	    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(/.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
	    var d = string.match(new RegExp(regexp));

	    var offset = 0;
	    var date = new Date(d[1], 0, 1);

	    if (d[3]) { date.setMonth(d[3] - 1); }
	    if (d[5]) { date.setDate(d[5]); }
	    if (d[7]) { date.setHours(d[7]); }
	    if (d[8]) { date.setMinutes(d[8]); }
	    if (d[10]) { date.setSeconds(d[10]); }
	    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
	    if (d[14]) {
	        offset = (Number(d[16]) * 60) + Number(d[17]);
	        offset *= ((d[15] == '-') ? 1 : -1);
	    }

		// I had to add the * 2 to get it to work
	    offset -= date.getTimezoneOffset();
	    time = (Number(date) + (offset * 60 * 1000));
		
		return new Date(Number(time));
	}
});

Object.extend(String.prototype, {
	camelize: function() {
		var parts = this.split(/_|-/), len = parts.length;
		if (len == 1) { return parts[0]; }

		var camelized = this.charAt(0) == '-' || this.charAt(0) == '_' ? 
			parts[0].charAt(0).toUpperCase() + parts[0].substring(1) : parts[0];

		for (var i = 1; i < len; i++) {
			camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
		}

		return camelized;
	},
	
	stripPx: function() {
		return Number(this.endsWith("px") ? this.match(/(.*)px/)[1] : this);
	},
	
	classize: function() {
		if (this.length == 0) { return ""; }
		if (this.length == 1) { return this.capitalize(); }
		
		return this.capitalize().slice(0,1) + this.camelize().slice(1);
	},
	
	isNumeric: function() {
	  return parseFloat(this) + '' == parseFloat(this);
	},
	
	toBoolean: function() {
		return this.toLowerCase() == "true";
	},
	
	validEmail: function() {
		return this.match(/^([^@\s]+)@((?:[\-a-z0-9]+\.)+[a-z]{2,})$/i);
	}
});

Object.extend(Number.prototype, {
	stripPx: function() {
		return this;
	}
});

Object.extend(Array.prototype, {
	destroy: function(item) {
		this.splice(this.indexOf(item), 1);
		item.destroy();
	},
	
	empty: function() {
		return this.size() == 0;
	}
});

// This is a superior implementation, developed by Douglas Crockford
// this function unfortunately treats the HTMLSelectElement as an array :(
Object.isArray = function(testObject) {
	return testObject && !(testObject.propertyIsEnumerable != undefined && testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number' && !(testObject.tagName == "SELECT");
};

Prototype.Browser.IE6 = Prototype.Browser.IE && parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5), 10)==6;
Prototype.Browser.IE7 = Prototype.Browser.IE && parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5), 10)==7;
Prototype.Browser.IE8 = Prototype.Browser.IE && parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5), 10)==8;



