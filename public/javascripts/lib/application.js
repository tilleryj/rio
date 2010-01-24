/**
	@class

	Application is used to create new rio application classes.  It provides functionality for dependency management, 
	routing, history management and page management.
	
	@extends rio.Attr
*/
rio.Application = {
	create: function() {
		var args = $A(arguments);
		if (args.length > 0 && args.last() != undefined && !args.last().ATTR) {
			args[args.size() - 1] = Object.extend({ noExtend: true }, args.last());
		}
		var app = rio.Attr.create.apply(this, args);

		app.addMethods({
			initHistory: function() {				
				dhtmlHistory.initialize();
				dhtmlHistory.addListener(this.applyHistoryEntry.bind(this));
			},
			
			applyHistoryEntry: function(location, historyData) {
				if (this.__revertingTransientHistoryEntry) {
					this.addHistoryEntry(this.__revertingTransientHistoryEntry[0], this.__revertingTransientHistoryEntry[1]);
					this.__revertingTransientHistoryEntry = false;
				} else {
					this.navigateTo(location, true);
				}
			},
			
			addHistoryEntry: function(location, transient) {
				if (historyStorage.hasKey(this.getCurrentLocation()) && historyStorage.get(this.getCurrentLocation()).transient) {
					this.__revertingTransientHistoryEntry = [location, transient];
					history.back(1);
				} else {
					dhtmlHistory.add(location, { transient: transient });
				}
			},
			
			resize: function() {
				this.getCurrentPage().resize();
			},
			
			keyPress: function(e) {
				var currentPage = this.getCurrentPage();
				if (currentPage) {
					this.getCurrentPage().keyPress(e);
				}
			},

			keyDown: function(e) {
				var keyMap = this.getKeyMap();
				if (keyMap) {
					keyMap.handle(e);
				}
				var currentPage = this.getCurrentPage();
				if (currentPage) {
					this.getCurrentPage()._keyDown(e);
				}
			},
			
			unload: function() {
				// meant to be overriden
			},
			
			getKeyMap: function() {
				if (this._keyMap) { return this._keyMap; }
				if (!this.keyMap) { return; }
				
				this._keyMap = rio.KeyMap.build(this.keyMap());
				
				return this._keyMap;
			},
			
			launch: function() {
				document.observe("keypress", this.keyPress.bind(this));
				document.observe("keydown", this.keyDown.bind(this));
				Event.observe(window, "beforeunload", this.unload.bind(this));

				if (this.noRoutes()) { return; }

				this.initHistory();
				this.navigateTo(this.getCurrentLocation());

				Event.observe(window, "resize", this.resize.bind(this));
				
				rio.Application._afterLaunchFunctions.each(function(fcn) {
					fcn(this);
				});
				rio.Application._afterLaunchFunctions.clear();
				
				this._launched = true;
			},
			
			launched: function() {
				return this._launched || false;
			},
			
			noRoutes: function() {
				return (app.__routes == undefined) || ($H(app.__routes).keys().size() == 0);
			},
			
			avoidAnimation: function() {
				return Prototype.Browser.IE;
			},
			
			matchRoutePath: function(path) {
				return Object.keys(app.__routes).detect(function(routePath) {
					if (routePath == "") { return true; }
					var routeParts = routePath.split("/");
					var pathParts = path.split("/");
					var match = true;
					for(var i=0; i<routeParts.length; i++) {
						match = match && (routeParts[i].startsWith(":") || routeParts[i].startsWith("*") || routeParts[i] == pathParts[i]);
					}
					return match;
				});
			},
			
			matchRouteTarget: function(path) {
				return app.__routes[this.matchRoutePath(path)];
			},
			
			remainingPath: function(path) {
				var match = this.matchRoutePath(path);
				if (match == "") { return path; }
				
				var matchParts = match.split("/");
				var matchLength = matchParts.last().startsWith("*") ? matchParts.length - 1 : matchParts.length;
				
				return path.split("/").slice(matchLength).join("/");
			},
			
			pathParts: function(path) {
				var parts = {};
				var pathParts = path.split("/");
				var routePathParts = this.matchRoutePath(path).split("/");
				for(var i=0; i<routePathParts.length; i++) {
					var routePathPart = routePathParts[i];
					if (routePathPart.startsWith(":") || routePathPart.startsWith("*")) {
						parts[routePathPart.slice(1)] = pathParts[i];
					}
				}
				return parts;
			},
			
			navigateTo: function(path, noHistoryEntry) {
				var subPath = this.matchRoutePath(path);
				var target = this.matchRouteTarget(path);
				if (!target) { rio.Application.fail("Path not found."); }
				
				if (path != "" && !noHistoryEntry) {
					this.addHistoryEntry(path);
				}
				var remainingPath = this.remainingPath(path);
				var pathParts = this.pathParts(path);
				
				if (!this.__pages) { this.__pages = {}; }
				// Right now the && this.__pages[target] == this.getCurrentPage() prevents double rendering.
				var page;
				if (this.__pages[target] && this.__pages[target] == this.getCurrentPage()) {
					page = this.__pages[target];
				} else {
					page = this[target]();
					this.__pages[target] = page;
				}

				if (page != this.getCurrentPage()) {
					if (this.getCurrentPage()) {
						this.clearPage();
					}
					[Element.body(), Element.html()].each(function(elt) {
						elt.setStyle({
							width: page.isManagingLayout() ? "100%" : "",
							height: page.isManagingLayout() ? "100%" : ""
					// 		overflow: page.isManagingLayout() ? "hidden" : ""
						});
					});
					Element.body().insert(page.html());
					page.render();
					this.setCurrentPage(page);
				}

				page.applyHistoryEntry(remainingPath, pathParts);
			},
			
			clearPage: function() {
				Element.body().childElements().each(function(elt) {
					if (elt.tagName.toLowerCase() == 'iframe' || elt.id == 'rshStorageForm' || elt.id == 'rshStorageField' || elt.id == 'juggernaut_flash' || elt.hasClassName("preserve")) {
						// keep it
					} else {
						elt.remove();
					}
				});
			},
			
			refresh: function() {
				document.location.reload();
			},
			
			reboot: function() {
				this.clearPage();
				this.setCurrentPage(null);
				this.navigateTo(this.getCurrentLocation());
			},
			
			getCurrentLocation: function() {
				return dhtmlHistory.getCurrentLocation();
			},

			getCurrentPage: function() {
				return this._currentPage;
			},

			setCurrentPage: function(page) {
				this._currentPage = page;
			},
			
			rootUrl: function() {
				return document.location.protocol + "//" + document.location.host;
			},
			
			toString: function() {
				return "[rio.apps.*]";
			}
		});
		
		Object.extend(app, {
			route: function(path, target){
				if (!this.__routes) { this.__routes = {}; }
				this.__routes[path] = target;
				
				var parts = path.split("/");
				if (parts.length > 1) {
					for (var i=0; i<parts.length - 1; i++) {
						if (parts[i].startsWith("*")) {
							throw("Only the final part of a route can be designated as optional by the *");
						}
					}
				}
			}
		});
		
		if (args.length > 0 && args.last() != undefined && !args.last().ATTR) {
			var initializers = args.last();
			if (initializers.requireCss) {
				rio.Application.includeCss(initializers.requireCss);
			}
			Object.keys(initializers.routes || {}).each(function(name) {
				app.route(name, initializers.routes[name]);
			});
			
			rio.Application.extend(app, initializers.methods || {});
		}

		return app;
	},
	
	extend: function(app, extension) {
		rio.Attr.extend(app, extension);
	},
	
	include: function(fileName) {
		this.require(fileName);
		// rio.boot.loadFile(fileName);
	},
	
	require: function(fileName) {
		rio.require(fileName);
	},


	injectCss: function() {
		var toLoad = [];
		rio.boot.loadedStylesheets.each(function(s) {
			if (!rio.preloadedStylesheets.include(s)) { toLoad.push(s); }
		});
		if (toLoad.empty()) { return; }

		var query = toLoad.map(function(f) {
			return "files[]=" + f;
		}).join("&");
		var linkHtml = rio.Tag.link("", {
			href: rio.url("/rio/stylesheets?" + query + "&" + rio.cacheKey),
			media: "screen",
			rel: "stylesheet",
			type: "text/css"
		});
		Element.head().insert({ bottom: linkHtml });
	
		if (rio.ContainerLayout) {
			rio.ContainerLayout.resize();
		}	
	},

	/*
		Because of a bug in IE, we need to remove and readd all link tags every time a new one is added.
	*/
	includeCss: function(toInclude) {
		var include = function(fileName) {
			if (rio.boot.loadedStylesheets.include(fileName)) { return; }
			rio.boot.loadedStylesheets.push(fileName);
			if (rio.preloadedStylesheets.include(fileName)) { return; }

			if (rio.environment.autoConcatCss && !(rio.app && rio.app.launched())) {
				// Do nothing
			} else {
				var linkHtml = rio.Tag.link("", {
					href: rio.url("/stylesheets/" + fileName + ".css"),
					media: "screen",
					rel: "stylesheet",
					type: "text/css"
				});
				Element.head().insert({ bottom: linkHtml });
			}
		}.bind(this);
		if (Object.isString(toInclude)) {
			include(toInclude);
		}
		if (Object.isArray(toInclude)) {
			toInclude.reverse().each(function(css) {
				include(css);
			});
		}
	},
	
	getToken: function() {
		return this._token || rio.environment.railsToken;
	},

	setToken: function(token) {
		this._token = token;
	},
	
	_afterLaunchFunctions: [],
	afterLaunch: function(afterLoadFunction) {
		if (rio.app && rio.app.launched()) { 
			afterLoadFunction(rio.app);
		} else {
			this._afterLaunchFunctions.push(afterLoadFunction);
		}
	},
	
	fail: function(msg, description) {
		try {
			if (rio.app && rio.app.fail) {
				rio.app.fail(msg);
				rio.error("FAIL: " + msg, description || "", true);
			} else {
				alert("OOPS: " + msg + "\n\nTry refreshing the page or come back later.");
			}
		} catch(e) {
			// Ignore errors during fail
		}
	},
	
	toString: function() {
		return "Application";
	}
};

if (!window.dhtmlHistoryCreated) {
	window.dhtmlHistory.create({
		toJSON: function(o) {
			return Object.toJSON(o);
		},
		fromJSON: function(s) {
			return s.evalJSON();
		}
	});
	window.dhtmlHistoryCreated = true;
}

