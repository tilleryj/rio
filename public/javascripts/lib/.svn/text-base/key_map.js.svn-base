rio.KeyMap = Class.create({
	initialize: function(map, isMac) {
		this.map = map;
		this.isMac = isMac;
	},
	
	handle: function(e) {
		this.map.each(function(m) {
			var map = m.map || (this.isMac ? m.mac : m.win);

			if (Object.isString(map.key)) { 
				map.key = rio.KeyMap.specialKeys()[map.key] || rio.KeyMap.charCode(map.key);
			}

			var effectiveKeyCode = (e.keyCode >= 96 && e.keyCode <= 105) ? e.keyCode - 48 : e.keyCode;
			if (map.key == effectiveKeyCode) {
				if (map.ctrl == undefined || map.ctrl == e.ctrlKey) {
					if (map.alt == undefined || map.alt == e.altKey) {
						if (map.shift == undefined || map.shift == e.shiftKey) {
							if (map.meta == undefined || map.meta == e.metaKey) {
								(m.handler || Prototype.emptyFunction)(e);
								
								if (m.stop) {
									e.stop();
								}
							}
						}
					}
				}
			}
		}.bind(this));
	}
});

Object.extend(rio.KeyMap, {
	build: function(map) {
		return new rio.KeyMap(map, rio.boot.isMac);
	},
	charCode: function(c) {
		return "0123456789_______abcdefghijklmnopqrstuvwxyz".indexOf(c) + 48;
	},
	specialKeys: function() {
		return {
			"left": Event.KEY_LEFT,
			"right": Event.KEY_RIGHT,
			"up": Event.KEY_UP,
			"down": Event.KEY_DOWN,
			"tab": Event.KEY_TAB,
			"enter": Event.KEY_RETURN,
			"home": Event.KEY_HOME,
			"end": Event.KEY_END,
			"backspace": Event.KEY_BACKSPACE,
			"delete": Event.KEY_DELETE,
			"space": 32,
			"esc": Event.KEY_ESC,
			",": 188
		};
	},
	toString: function() { return "KeyMap"; }
});
