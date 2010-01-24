rio.Application.require("components/box");

rio.components.Input = rio.Component.create(rio.components.Box, "Input", {
	requireCss: "input",
	attrReaders: [
		["className", ""], 
		["hoverClassName", ""],
		["focusClassName", ""],
		["placeHolderClassName", "inputPlaceHolder"],
		["sync", "blur"], // options are "blur", "type", "none"
		["typeSyncDelay", 250],
		["tabIndex", 0],
		["blurOnEnter", true],
		["revertOnEscape", false],
		["password", false],
		["rioUndo", false],
		["readOnly", false],
		"placeHolderText"
	],
	attrAccessors: [
		["value", ""], 
		["focus", false],
		["enabled", true]
	],
	attrEvents: ["enter", "keyPress", "keyDown", "keyUp", "focus", "blur"],
	methods: {
		buildHtml: function() {
			var inputHtml = rio.Tag.input("", {
				href: "",
				onclick: "return false;",
				tabIndex: this.getTabIndex(),
				className: "input",
				type: this.getPassword() ? "password" : "text"
			});

			inputHtml.addHoverClass(this.getHoverClassName(), this.getFocusClassName());
			
			this.readOnly.bind(function(readOnly) {
				inputHtml.readOnly = readOnly;
			});
			
			var placeHolderApplies = function() {
				return this.getPlaceHolderText() && (this.getValue() == undefined || this.getValue() == "");
			}.bind(this);
			
			var addPlaceHolderIfNeeded = function() {
				if (placeHolderApplies()) {
					inputHtml.addClassName("inputPlaceHolder");
					inputHtml.value = this.getPlaceHolderText();
				}
			}.bind(this);
			
			
			this.bind("value", function(value) {
				inputHtml.value = value;
			});

			addPlaceHolderIfNeeded();

			this.bind("focus", function(focus){
				if(focus){
					if (!this._nativeFocus) {
						inputHtml.focus();
					}
				} else {
					// if this is a native blur we shouldn't follow it up with another call to blur.  It will result in shitty behavior.
					if (!this._nativeBlur) {
						inputHtml.blur();
					}
				}
			}.bind(this));
			this.bind("enabled", function(enabled) {
				inputHtml.disabled = !enabled;
			});

			inputHtml.observe('blur', function() {
				addPlaceHolderIfNeeded();
				this._nativeBlur = true;
				this.setFocus(false);
				this._nativeBlur = false;
				this.fire("blur");
			}.bind(this));
			inputHtml.observe('focus', function(){
				if (placeHolderApplies()) {
					inputHtml.value = "";
					inputHtml.removeClassName("inputPlaceHolder");
				}
				this._nativeFocus = true;
				this.setFocus(true);
				this._nativeFocus = false;
				this.fire("focus");
			}.bind(this));

			inputHtml.observe('change', function() { 
				if (this.getSync() != "none") {
					this.setValue(inputHtml.value);
				}
				this.fire("change");
			}.bind(this));
			inputHtml.observe('keypress', function(e) {
				if (e.keyCode == Event.KEY_RETURN) {
					if(this.getBlurOnEnter()) {
						inputHtml.blur();
					}
					this.fire('enter');
				}
				if (e.keyCode == Event.KEY_ESC && this.getRevertOnEscape()) {
					inputHtml.value = this.getValue();
					inputHtml.blur();
				}
				this.fire("keyPress", e);
			}.bindAsEventListener(this));
			inputHtml.observe('keydown', function(e) {
				if (e.keyCode == 90 && e.metaKey && !this.getReadOnly()) {
					if (this.getRioUndo() && (this.getValue() == inputHtml.value)) {
						if (e.shiftKey) {
							rio.Undo.redo();
						} else {
							rio.Undo.undo();
						}
						e.stop();
					}
				}

				if (this.getSync() == "type") {
					if (!this._syncAfter) { this._syncAfter = new rio.DelayedTask(); }
					this._syncAfter.delay(this.getTypeSyncDelay(), function() {
						this.setValue(inputHtml.value);
					}, this);
				}
				this.fire("keyDown", e);
			}.bindAsEventListener(this));
			inputHtml.observe('keyup', function(e) {
				this.fire("keyUp", e);
			}.bindAsEventListener(this));
			
			
			inputHtml.applyStyle(this.boxStyles());
			
			return inputHtml;
		},
		forceFocus: function() {
			this.setFocus(true);
			this.html().focus();
		},
		clear: function() {
			this.setValue("");
		},
		cursorEnd: function() {
			this.setSelectionRange(this.getValue().length, this.getValue().length);
		},

		focusAndHighlight: function() {
			this.setFocus(true);
			this.setSelectionRange(0, (this.getValue() || "").length);
		},
		
		setSelectionRange: function(selectionStart, selectionEnd) {
			var input = this.html();
			if (input.setSelectionRange) {
				input.setSelectionRange(selectionStart, selectionEnd);
			} else if (input.createTextRange) {
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd('character', selectionEnd);
				range.moveStart('character', selectionStart);
				range.select();
			}
		}
	}
});
