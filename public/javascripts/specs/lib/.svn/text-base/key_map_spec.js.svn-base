describe(rio.KeyMap, {
	beforeEach: function() {
		this.shouldMatchOrNot = function(m, e, h) {
			new rio.KeyMap([
				{ 
					map: m,
					handler: h
				}
			]).handle(e);
		};

		this.shouldMatch = function(map, e) {
			this.shouldMatchOrNot(map, e, function() {}.shouldBeCalled());
		};

		this.shouldNotMatch = function(map, e) {
			this.shouldMatchOrNot(map, e, function() {}.shouldNotBeCalled());
		};
	},

	"should fire the handler if the event keyCode matches the key": function() {
		this.shouldMatch({ key: 65 }, { keyCode: 65 });
	},

	"should not fire the handler if the event keyCode does not match the key": function() {
		this.shouldNotMatch({ key: 65 }, { keyCode: 64 });
	},
	
	"should fire all matching handlers": function() {
		var e = { keyCode: 65, ctrlKey: true };
		new rio.KeyMap([
			{ 
				map: { key: 65 },
				handler: function() {}.shouldBeCalled()
			},
			{ 
				map: { key: 65, ctrl: true },
				handler: function() {}.shouldBeCalled()
			}
		]).handle(e);
	},

	"should fire the handler and pass the event if the event keyCode matches the key": function() {
		var e = { keyCode: 65 };
		new rio.KeyMap([
			{ 
				map: { key: 65 },
				handler: function(ev) { (ev === e).shouldBeTrue(); }.shouldBeCalled()
			}
		]).handle(e);
	},
	
	"should match the windows mappings if provided and isMac is not true": function() {
		new rio.KeyMap([
			{ 
				win: { key: 65 },
				mac: { key: 67 },
				handler: function() {}.shouldBeCalled()
			}
		]).handle({ keyCode: 65 });
	},
	
	"should not match the mac mappings if isMac is not true": function() {
		new rio.KeyMap([
			{ 
				win: { key: 65 },
				mac: { key: 67 },
				handler: function() {}.shouldNotBeCalled()
			}
		]).handle({ keyCode: 67 });
	},

	"should match the mac mappings if isMac is true": function() {
		new rio.KeyMap([
			{ 
				win: { key: 65 },
				mac: { key: 67 },
				handler: function() {}.shouldBeCalled()
			}
		], true).handle({ keyCode: 67 });
	},

	"should not match the windows mappings if isMac is true": function() {
		new rio.KeyMap([
			{ 
				win: { key: 65 },
				mac: { key: 67 },
				handler: function() {}.shouldNotBeCalled()
			}
		], true).handle({ keyCode: 65 });
	},
	
	"should support modifiers by": {
		builder: function() {
			var specs = {};
			["ctrl", "alt", "shift", "meta"].each(function(modifier) {
				var map = { key: 65 };
				var e = { keyCode: 65 };

				specs["matching when the " + modifier + " map is true and the event " + modifier + " is true"] = function() {
					map[modifier] = true;
					e[modifier + "Key"] = true;
					this.shouldMatch(map, e);
				};

				specs["not matching when the " + modifier + " map is true and the event " + modifier + " is false"] = function() {
					map[modifier] = true;
					e[modifier + "Key"] = false;
					this.shouldNotMatch(map, e);
				};

				specs["not matching when the " + modifier + " map is undefined and the event " + modifier + " is true"] = function() {
					delete map[modifier];
					e[modifier + "Key"] = true;
					this.shouldMatch(map, e);
				};

			});
			return specs;
		}
	},
	
	"should fire the handler if the key charCode matches the event keyCode": function() {
		this.shouldMatch({ key: 'a' }, { keyCode: 65 });
	},

	"should not fire the handler if the key charCode does not match the event keyCode": function() {
		this.shouldNotMatch({ key: 'b' }, { keyCode: 65 });
	},

	"should fire the handler if the number matches the event keyCode for the top numbers": function() {
		$R(0, 9).each(function(n) {
			this.shouldMatch({ key: "" + n }, { keyCode: 48 + n });
		}.bind(this));
	},

	"should fire the handler if the number matches the event keyCode for the side numbers": function() {
		$R(0, 9).each(function(n) {
			this.shouldMatch({ key: "" + n }, { keyCode: 96 + n });
		}.bind(this));
	},
	
	"should not fire the handler if the number does not match the event keyCode for the any numbers": function() {
		$R(0, 9).each(function(n) {
			this.shouldNotMatch({ key: "" + n }, { keyCode: 49 + n });
		}.bind(this));
	},

	"should stop the event if the mapping stop parameter is true and the mapping matches the event": function() {
		var e = { keyCode: 65, stop: function() {}.shouldBeCalled() };
		new rio.KeyMap([
			{ 
				map: { key: 65 },
				handler: function() {},
				stop: true
			}
		]).handle(e);
	},

	"should not stop the event if the mapping stop parameter is true and the mapping does not match the event": function() {
		var e = { keyCode: 65, stop: function() {}.shouldNotBeCalled() };
		new rio.KeyMap([
			{ 
				map: { key: 66 },
				handler: function() {},
				stop: true
			}
		]).handle(e);
	},

	"should not stop the event if the mapping stop parameter is false and the mapping matches the event": function() {
		var e = { keyCode: 65, stop: function() {}.shouldNotBeCalled() };
		new rio.KeyMap([
			{ 
				map: { key: 65 },
				handler: function() {},
				stop: false
			}
		]).handle(e);
	},

	"should not stop the event by default": function() {
		var e = { keyCode: 65, stop: function() {}.shouldNotBeCalled() };
		new rio.KeyMap([
			{ 
				map: { key: 65 },
				handler: function() {}
			}
		]).handle(e);
	},
	
	"should still stop an event if stop is true and it matches but has no handler": function() {
		var e = { keyCode: 65, stop: function() {}.shouldNotBeCalled() };
		new rio.KeyMap([
			{ 
				map: { key: 65 },
				stop: false
			}
		]).handle(e);
	},
	
	"should match the key": {
		builder: function() {
			var specs = {};
			[
				{ key: "left", code: Event.KEY_LEFT },
				{ key: "right", code: Event.KEY_RIGHT },
				{ key: "up", code: Event.KEY_UP },
				{ key: "down", code: Event.KEY_DOWN },
				{ key: "tab", code: Event.KEY_TAB },
				{ key: "enter", code: Event.KEY_RETURN },
				{ key: "home", code: Event.KEY_HOME },
				{ key: "end", code: Event.KEY_END },
				{ key: "backspace", code: Event.KEY_BACKSPACE },
				{ key: "delete", code: Event.KEY_DELETE },
				{ key: "space", code: 32 },
				{ key: "esc", code: Event.KEY_ESC },
				{ key: ",", code: 188 }
			].each(function(k) {
				specs["'" + k.key + "' to the keyCode for the " + k.key.toUpperCase() + " key"] = function() {
					this.shouldMatch({ key: k.key }, { keyCode: k.code });
				};
			});
			return specs;
		}
	}
});