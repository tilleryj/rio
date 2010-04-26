/**
	@class
	@extends rio.Attr
	
	Page is used to create page classes in a rio application.  It handles css dependencies, rendering, templating, 
	layout management, and popup management.
	
	@author Jason Tillery
	@copyright 2008-2009 Thinklink LLC
*/
rio.Page = {
	create: function() {
		var args = $A(arguments);
		if (args.length > 0 && args.last() != undefined && !args.last().ATTR) {
			args[args.size() - 1] = Object.extend({ noExtend: true }, args.last());
		}
		var page = rio.Attr.create.apply(this, args);

		Object.extend(page, {
			requireCss: function(name) {
				rio.Application.includeCss("pages/" + name);
			},
			template: function(name) {
				rio.boot.loadedTemplates.push(rio.boot.appRoot + "pages/" + name);

				this._templateName = name;
			},
			applyTemplate: function() {
				if (this._templateName && !this._templateApplied) {
					var template = rio.JsTemplate.build("pages/" + this._templateName);
					page.addMethods(template.mixinMethods());

					this._templateApplied = true;
				}
			},
			manageLayout: function() {
				this.__manageLayout = true;
			},
			manageUndo: function() {
				this.__manageUndo = true;
			}
		});
		
		page.addMethods({
			html: function() {
				if (!this._html) { this._html = this.buildHtml(); }
				return this._html;
			},
			
			popup: function() {
				if (!this.__popup) { 
					this.__popup = new rio.components.Popup({
						content: this.html()
					});
				}
				this.__popup.activate();
				this.render();
			},
			
			resizePopup: function() {
				this.__popup.resize();
			},
			
			closePopup: function(skipFade) {
				this.__popup.deactivate(skipFade);
			},
			
			isManagingLayout: function() {
				return page.__manageLayout;
			},
			
			_manageLayout: function() {
				if (page.__manageLayout) { 
					this.__lm = new rio.LayoutManager(this.html());
				}
			},
			
			layoutManager: function() {
				return this.__lm;
			},
			
			_afterRender: function() {
				if (this.isManagingLayout()) {
					(function() { this.__lm.resize(); }.bind(this)).defer();
					(function() { this.__lm.resize(); }.bind(this)).delay(2);
					(function() { this.__lm.resize(); }.bind(this)).delay(5);
				}
			},
			
			render: function() {
				this._manageLayout();
				this._afterRender();
			},
			
			show: function() {
				this.html().show();
				this.resizePopup();
			},
			
			hide: function() {
				this.html().hide();
			},
			
			addHistoryEntry: function(location, isTransient) {
				rio.app.addHistoryEntry(location, isTransient);
			},
			
			applyHistoryEntry: function() {
				// Meant to be overriden
			},
			
			keyPress: function(e) {
				// Meant to be overriden
			},
			
			keyDown: function(e) {
				// Meant to be overriden
			},
			
			resize: function() {
				// Meant to be overriden
			},
			
			getKeyMap: function() {
				if (!this._keyMap) {
					var maps = this.keyMap ? this.keyMap() : [];

					if (page.__manageUndo) {
						maps.push({
							mac: { meta: true, shift: false, alt: false, key: "z" },
							win: { ctrl: true, alt: false, key: "z" },
							handler: function(e) {
								if (e.target.value == undefined && this.undoShortcutsEnabled()) {
									rio.Undo.undo();
								}
							}.bind(this)
						});
						maps.push({
							mac: { meta: true, shift: true, alt: false, key: "z" },
							win: { ctrl: true, alt: false, key: "y" },
							handler: function(e) {
								if (e.target.value == undefined && this.undoShortcutsEnabled()) {
									rio.Undo.redo();
									e.stop();
								}	
							}.bind(this)
						});
					}
					this._keyMap = rio.KeyMap.build(maps);
				}
				return this._keyMap;
			},
			
			enableUndoKeyboardShortcuts: function() {
				this._undoShortuctsEnabled = true;
			},

			disableUndoKeyboardShortcuts: function() {
				this._undoShortuctsEnabled = false;
			},
			
			undoShortcutsEnabled: function() {
				if (this._undoShortuctsEnabled == undefined) { this._undoShortuctsEnabled = true; }
				return this._undoShortuctsEnabled;
			},
			
			_keyDown: function(e) {
				this.getKeyMap().handle(e);
				this.keyDown(e);
			},
			
			navigateTo: function(path) {
				rio.app.navigateTo(path);
			},
			
			refresh: function() {
				rio.app.refresh();
			},
			
			rootUrl: function() {
				return rio.app.rootUrl();
			},
			
			getCurrentLocation: function() {
				return rio.app.getCurrentLocation();
			},
			
			toString: function() {
				return "[rio.pages.*]";
			}
		});
		
		// if (last arg is a concise syntax initializer)
		if (args.length > 0 && args.last() != undefined && !args.last().ATTR) {
			var initializers = args.last();
			if (Object.isString(initializers.requireCss)) {
				page.requireCss(initializers.requireCss);
			}

			if (Object.isString(initializers.template)) {
				page.template(initializers.template);
			}
			if (Object.isString(initializers.jstemplate)) {
				page.template(initializers.jstemplate);
			}
			
			if (initializers.manageLayout) {
				page.manageLayout();
			}

			if (initializers.manageUndo) {
				page.manageUndo();
			}

			rio.Page.extend(page, initializers.methods || {});
		}
		
		return page;
	},
	
	extend: function(page, extension) {
		extension._render = extension.render || Prototype.emptyFunction;
		extension.render = function() {
			this._manageLayout();
			this._render();
			this._afterRender();
		};

		extension.__initialize = extension.initialize || Prototype.emptyFunction;
		extension.initialize = function(options) {
			page.applyTemplate();
		
			(this.__initialize.bind(this))(options);
		};

		rio.Attr.extend(page, extension);
	}
};
