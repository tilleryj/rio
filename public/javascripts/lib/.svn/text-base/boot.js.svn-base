/**
                            iiii                                       jjjj                  
                           i::::i                                     j::::j                 
                            iiii                                       jjjj                  
                                                                                             
       rrrrr   rrrrrrrrr  iiiiiii    ooooooooooo                     jjjjjjj    ssssssssss   
       r::::rrr:::::::::r i:::::i  oo:::::::::::oo  ::::::           j:::::j  ss::::::::::s  
       r:::::::::::::::::r i::::i o:::::::::::::::o ::::::            j::::jss:::::::::::::s 
       rr::::::rrrrr::::::ri::::i o:::::ooooo:::::o ::::::            j::::js::::::ssss:::::s
        r:::::r     r:::::ri::::i o::::o     o::::o                   j::::j s:::::s  ssssss 
        r:::::r     rrrrrrri::::i o::::o     o::::o                   j::::j   s::::::s      
        r:::::r            i::::i o::::o     o::::o                   j::::j      s::::::s   
        r:::::r            i::::i o::::o     o::::o ::::::            j::::jssssss   s:::::s 
        r:::::r           i::::::io:::::ooooo:::::o ::::::            j::::js:::::ssss::::::s
        r:::::r           i::::::io:::::::::::::::o ::::::            j::::js::::::::::::::s 
        r:::::r           i::::::i oo:::::::::::oo                    j::::j s:::::::::::ss  
        rrrrrrr           iiiiiiii   ooooooooooo                      j::::j  sssssssssss    
                                                                      j::::j                 
                                                            jjjj      j::::j                 
                                                           j::::jj   j:::::j                 
                                                           j::::::jjj::::::j                 
                                                            jj::::::::::::j                  
                                                              jjj::::::jjj                   
                                                                 jjjjjj                      
       

	@name rio
	@namespace
	
	The rio namespace is the root of the entire framework, through which you can access all of the classes and 
	namespaces.
	
	<br />
	
	<h2>Namespaces</h2>
	
	<ul>
		<li>apps - contains instances of rio.Application</li>
		<li>components - contains instances of rio.Component</li>
		<li>models - contains instances of rio.Model</li>
		<li>pages - contains instances of rio.Page</li>
		<li>environment - configuration for the current environment</li>
		<li>environments - configurations varying by environment</li>
		<li>console - stuff related to the development console</li>
		<li>boot - configuration related to the application boot process</li>
	</ul>
	
	<h2>Classes</h2>
	
	<ul>
		<li>AIM - manages AJAX file uploads</li>
		<li>Application - root of application instances</li>
		<li>Attr - root of most rio classes (Application, Component, Model, Page)</li>
		<li>Binding - represents a bindable attribute</li>
		<li>Tag - a collection of methods for building HTML tags</li>
		<li>Utils - a collection of random helper methods</li>
	</ul>
	
	<h2>Methods</h2>
	<ul>
		<li>log - adds a log message to the rio console</li>
	</ul>
	
	<h2>Fields</h2>
	<ul>
		<li>app - the currently running application instance</li>
	</ul>

	@author Jason Tillery
	@copyright 2008-2009 Thinklink LLC
*/
var w = window;
(function() {
	if (!window.console) { window.console = { log: Prototype.emptyFunction }; }
	
	var initialWindowKeys = Object.keys(window);
	
	var bootOptions = window.bootOptions || {};

	Object.extend(rio, {
		url: function(url) {
			return url + "?" + rio.cacheKey;
		},
		components: {},
		models: {},
		apps: {},
		pages: {},
		console: {},
		log: Prototype.emptyFunction,
		warn: Prototype.emptyFunction,
		error: Prototype.emptyFunction,
		boot: {
			errors: [],
			isMac: navigator.appVersion.toLowerCase().indexOf("mac") != -1,
			root: "/javascripts/",
			appRoot: bootOptions.appRoot || "",
			rioPath: bootOptions.rioPath || "lib/",
			prototypePath: bootOptions.prototypePath || "prototype/",
			prototypePollution: [
				"$", "$$", "$A", "$F", "$H", "$R", "$break", "$continue", "$w", "_eventID", "Abstract", "Ajax", "Autocompleter", "Builder", "Class", "Draggable", "Draggables", "Droppables", "Effect", "Element", "Enumerable", "Field", "Form", "Hash", "Insertion", "ObjectRange", "PeriodicalExecuter", "Position", "Prototype", "Selector", "Sortable", "SortableObserver", "Template", "Toggle", "Try"
			],
			googleAnalyticsPollution: ["gaGlobal", "gaJsHost", "_gat", "pageTracker"],
			noConsole: bootOptions.noConsole,
			initialWindowKeys: initialWindowKeys,
			prototypeScripts: [],
			rioScripts: [],
			rioScriptsDigest: {},
			appScriptsDigest: {},
			prototypeScriptsDigest: {},
			loadedFiles: [],
			loadedStylesheets: [],
			loadedTemplates: [],
			loadFunctions: {},
			
			appScripts: function() {
				return rio.boot.loadedFiles.reject(function(f) {
					return rio.boot.prototypeScripts.include(f) || rio.boot.rioScripts.include(f);
				});
			},
			
			pollution: function() {
				return Object.keys(window).reject(function(key) {
					return rio.boot.initialWindowKeys.include(key) || 
						rio.boot.prototypePollution.include(key) || 
						rio.boot.googleAnalyticsPollution.include(key);
				}.bind(this));
			},
			
			failBoot: function() {
				if (rio.environment.bootFailedUrl) {
					document.location.href = rio.environment.bootFailedUrl;					
				} else {
					rio.boot.printErrors();
				}
			},
			
			printErrors: function() {
				$$("body")[0].update();

				var msg = "<h1 style='font-size: 24px; color: #670800;'>Boot failed</h1>";
				msg += "<style>.errorLine{font-size:16px; padding:0px 2px; background-color:yellow}</style>";

				rio.boot.errors.each(function(e) {
					if (e.e) {
						msg += "<br /><br />";
						msg += "<p style='font-weight: 700'>" + e.msg + "<br /><br />" + e.e + "</p>";
						msg += "<br />";
					} else if (e.lint) {
						e.lint.each(function(err) {
							msg += err.toHtml() + "<br />";
						});
					}
				});

				$$("body")[0].insert("<div style='padding: 20px'>" + msg + "</div>");
			}
		}
	});

	$$("script").each(function(script) {
		var src = script.src;
		if(src.match(/boot\.js/) && src.indexOf('?') != -1) {
			var options = src.split('?')[1].split(',');
			if (options.length >= 1) { rio.boot.appName = options[0]; }
			if (options.length >= 2) { rio.boot.environment = options[1]; }
			if (options.length >= 3) { rio.boot.bootCompressed = (options[2] == "compressed"); }
		}
	});
	
	Object.extend(rio.environment, rio.environments[rio.boot.environment]);
	Object.extend(rio.boot, rio.environment.boot);

	if (bootOptions.noConsole === undefined) {
		rio.boot.noConsole = (rio.environment.console == undefined) ? false : !rio.environment.console;
	}
	
	rio.require = function(fileName, options) {
		options = Object.extend({
			force: false,
			track: true
		}, options || {});

		if (!rio.boot.loadedFiles.include(fileName)) {
			if (rio.boot.bootCompressed && options.force) {
				if (options.track) { rio.boot.loadedFiles.push(fileName); }
				document.write('<script type="text/javascript" src="' + (options.noPrefix ? "" : rio.assetPrefix) + rio.url(rio.boot.root + fileName + '.js') + '"></script>');
			} else if (!rio.boot.bootCompressed) {
				if (rio.boot.loadFunctions[fileName]) {
					rio.boot.loadFunctions[fileName]();
				} else {
					var path = rio.boot.root + fileName + ".js";
					new Ajax.Request(rio.url(path), {
						asynchronous: false,
						method: "get",
						evalJSON: false,
						evalJS: false,
						onSuccess: function(response) {
							try {
								w.eval(response.responseText);
							} catch(e) {
								rio.error(e, "Failed parsing file: " + path);

								if (!rio.app) {
									if (fileName != "lib/rio_lint") {
										rio.require("lib/rio_lint", { track: false });
									}
									
									var lintIt = function(fileName) {
										rio.RioLint.checkFileSyntax(fileName, {
											onComplete: function(errors) {
												rio.boot.errors.push({ lint: errors });
											}
										});
									};
									if (fileName == "lib/rio_concat") {
										new Ajax.Request(rio.url("/javascripts/lib/rio.build"), {
											asynchronous: false,
											method: "get",
											evalJSON: false,
											evalJS: false,
											onSuccess: function(response) {
												var files = response.responseText.split("\n");
												files.without("lib/swfobject").each(function(f) {
													lintIt(f);
												});
											}
										});
									} else if (fileName == "apps/" + rio.boot.appName + "_concat") {
									} else {
										rio.boot.errors.push({ e: e, msg: "Failed parsing file: " + path });
										lintIt(fileName);
									}
									
								}
								throw(e);
							}
						},
						onFailure: function() {
							rio.log("Failed loading file: " + path);
						}
					});					
				}
				if (options.track) { rio.boot.loadedFiles.push(fileName); }
			}
		}
	};

	if (rio.boot.bootCompressed) {
		// rio.require(rio.boot.appRoot + "prototype/compressed/prototype", { force: true });
		rio.require(rio.boot.rioPath + "compressed/rio", { force: true });
		rio.require(rio.boot.appRoot + "apps/compressed/" + rio.boot.appName, { force: true });
		if (rio.boot.environment == "development") {
			rio.require(rio.boot.rioPath + "rio_development_concat", { force: true });
		}
	} else {
		try {
			rio.require(rio.boot.appRoot + "prototype/prototype_concat", { track: false });
			rio.require(rio.boot.rioPath + "rio_concat", { track: false });
			rio.require(rio.boot.appRoot + "apps/" + rio.boot.appName + "_concat", { track: false });
			rio.require(rio.boot.appRoot + "apps/" + rio.boot.appName);
		} catch(e) {
			// Let the errors print on load
		}
	}
	if (rio.environment.autoConcatCss) {
		if (rio.boot.bootCompressed) {
			document.write('<script type="text/javascript">' + 'rio.Application.injectCss();' + '</script>')
		} else {
			rio.Application.injectCss();
		}
	}
	
	if (rio.environment.supportSelenium) {
		rio.require(rio.boot.rioPath + "event.simulate", { force: true, noPrefix: true });
		rio.require(rio.boot.rioPath + "selenium_extensions", { force: true, noPrefix: true });
	}

	document.observe('dom:loaded', function() {
		if (rio.environment.push && !rio.push) {
			rio.Push.boot();
		}

		if (rio.preloadTemplates) {
			rio.JsTemplate.preload("apps/" + (rio.boot.bootCompressed ? "compressed/" + rio.boot.appName : rio.boot.appName + "_concat"));
		}

		if (rio.environment.failOnBootError && rio.boot.errors.length > 0) {
			rio.boot.failBoot();
			return;
		}
		try {
			window.initialOptions = window.initialOptions || {};
			rio.app = new rio.apps[rio.boot.appName.camelize()](initialOptions);
			rio.app.launch();
		} catch(e) {
			rio.boot.errors.push({ e: e, msg: "Failed inititializing or launching application" });
			rio.boot.failBoot();
		}
	}.bind(this));
})();
