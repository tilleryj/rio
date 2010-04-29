rio.components.Textarea = rio.Component.create(rio.components.Base, "Textarea", {
	requireCss: "textarea",
	attrReaders: [
		["className", "textarea"], 
		["hoverClassName", ""],
		["focusClassName", ""],
		["sync", "blur"], // options are "blur", "type", "none", "always"
		["typeSyncDelay", 250],
		["tabIndex", 0],
		["revertOnEscape", false],
		["stopEnterEvent", false],
		["autoGrow", false],
		["rioUndo", false]
	],
	attrAccessors: [
		["value", ""], 
		["focus", false],
		["readOnly", false]
	],
	attrEvents: ["enter", "keyPress", "keyDown", "keyUp", "focus", "blur", "resize"],
	attrHtmls: ["textarea"],
	methods: {
		buildHtml: function() {
			var html = rio.Tag.div(this.textareaHtml(), { 
				className: this.getClassName(),
				style: "padding-bottom: 1px;"
			});
			var hoverClass = this.getHoverClassName();
			if (hoverClass && !hoverClass.blank()) {
				html.addHoverClass(hoverClass);
			}
			html.rioComponent = this;
			return html;
		},
		
		buildTextareaHtml: function() {
			var textareaHtml = rio.Tag.textarea("", {
				href: "",
				onclick: "return false;",
				tabIndex: this.getTabIndex(),
				rows: 1,
				style: "backgroundColor: transparent; border: none; width: 100%;"
			});
			
			this.readOnly.bind(function(readOnly) {
				textareaHtml.readOnly = readOnly;
			});
			
			var updateHeight = Prototype.emptyFunction;
			if (this.getAutoGrow()) {
				updateHeight = this.resize.bind(this, textareaHtml);
				updateHeight.defer();
				Event.observe(window, "resize", updateHeight);
			} else {
				textareaHtml.setStyle({ height: "100%" });
			}
			
			this.bind("value", function(value) {
				if (textareaHtml.value != value) {
					textareaHtml.value = value;
					updateHeight();
				}
			});
			// this.cursorEnd.bind(this).defer();
			this.bind("focus", function(focus){
				if(focus){
					if (!this._nativeFocus) {
						textareaHtml.focus();
					}
				} else {
					// if this is a native blur we shouldn't follow it up with another call to blur.  It will result in weird behavior.
					if (!this._nativeBlur) {
						textareaHtml.blur();
					}
				}
			}.bind(this));

			textareaHtml.observe('blur', function(){
				this.html().removeClassName(this.getFocusClassName());
				this._nativeBlur = true;
				this.setFocus(false);
				this.fire("blur");
				this._nativeBlur = false;
				this._valueAtLastBlur = textareaHtml.value;
			}.bind(this));
			textareaHtml.observe('focus', function(){
				this.html().addClassName(this.getFocusClassName());
				this._nativeFocus = true;
				this.setFocus(true);
				this.fire("focus");
				this._nativeFocus = false;
			}.bind(this));

			textareaHtml.observe('change', function() { 
				if (this.getSync() != "none") {
					this.setValue(textareaHtml.value);
				}
				updateHeight();
				this.fire("change");
			}.bind(this));
			textareaHtml.observe('keypress', function(e) {
				if (e.keyCode == Event.KEY_RETURN) {
					this.fire('enter');
					if (this.getStopEnterEvent()) { e.stop(); }
				}
				if (e.keyCode == Event.KEY_ESC && this.getRevertOnEscape()) {
					this.revert();
					textareaHtml.blur();
				}
				this.fire("keyPress", e);
			}.bindAsEventListener(this));
			
			var undoKeyMap = rio.KeyMap.build([
				{
					mac: { meta: true, alt: false, shift: false, key: "z" },
					win: { ctrl: true, alt: false, key: "z" },
					handler: function(e) {
						if (this.getRioUndo() && (this.getValue() == textareaHtml.value)) {
							rio.Undo.undo();
							e.stop();
						}
					}.bind(this)
				},
				{
					mac: { meta: true, alt: false, shift: true, key: "z" },
					win: { ctrl: true, alt: false, key: "y" },
					handler: function(e) {
						if (this.getRioUndo() && (this.getValue() == textareaHtml.value)) {
							rio.Undo.redo();
							e.stop();
						}
					}.bind(this)
				}
			]);
			
			textareaHtml.observe('keydown', function(e) {
				if (!this.getReadOnly()) {
					undoKeyMap.handle(e);
				}
				
				if (this.getSync() == "type") {
					if (!this._syncAfter) { this._syncAfter = new rio.DelayedTask(); }
					this._syncAfter.delay(this.getTypeSyncDelay(), function() {
						this.setValue(textareaHtml.value);
					}, this);
				} else if (this.getSync() == "always") {
					(function() {
						this.setValue(textareaHtml.value);
					}.bind(this)).defer();
				}
				updateHeight();
				this.fire("keyDown", e);
			}.bindAsEventListener(this));

			return textareaHtml;			
		},
		
		keyUp: function() {
			this.resize(this.textareaHtml());
			this.fire("keyUp");
		},
		
		clear: function() {
			this.setValue("");
		},
		cursorEnd: function() {
			this.setSelectionRange(this.getValue().length, this.getValue().length);
		},
		forceFocus: function() {
			this.setFocus(true);
			this.textareaHtml().focus();
		},
		revert: function() {
			this.textareaHtml().value = this.getValue();
		},
		commit: function() {
			this.setValue(this.textareaHtml().value);
		},
		resize: function(html) {
			if (this.getAutoGrow()) {
				var textareaHtml = html || this.textareaHtml();
				if (!textareaHtml.rows || textareaHtml.rows < 1) { textareaHtml.rows = 1; }
				var rowCount = textareaHtml.rows;
			    while (textareaHtml.clientHeight >= textareaHtml.scrollHeight && textareaHtml.rows > 1) { textareaHtml.rows -= 1; }
			    while (textareaHtml.clientHeight + 1 < textareaHtml.scrollHeight) { textareaHtml.rows += 1; }
				if (textareaHtml.rows != rowCount) { 
					this.fire("resize"); 
				}
			}
		},
		backingValue: function() {
			return this.textareaHtml().value;
		},
		getCursorLocation: function() {
			try {
				return this.textareaHtml().selectionStart;
			} catch(e) {
				return 0;
			}
		},
		setCursorLocation: function(location) {
			return this.setSelectionRange(location, location);
		},
		hasSelectedText: function() {
			return this.textareaHtml().selectionStart != this.textareaHtml().selectionEnd;
		},
		selectEnd: function() {
			this.setCursorLocation(this.backingValue().length);
		},
		selectAll: function() {
			this.setSelectionRange(0, this.textareaHtml().value.length);
		},
		setSelectionRange: function(selectionStart, selectionEnd) {
			var input = this.textareaHtml();
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