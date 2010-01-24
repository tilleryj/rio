rio.Application.require("components/box");

rio.components.Console = rio.Component.create(rio.components.Box, "Console", {
	require: ["lib/spec", "lib/spec_runner", "lib/rio_lint", "lib/file", "prototype/sound", "components/container", "lib/console/console_mixin", "lib/console/console_commands"],
	attrReaders: [["promptHistory", []], "consoleLog", "prompt", "consoleHtmlWrapper"],
	attrAccessors: [
		["boundTo"], 
		["currentHistoryPoint", 0], 
		["halfTyped", ""],
		["autospec", false],
		["autocss", false]
	],
	attrEvents: ["navigateToPlayground"],
	methods: {
		initialize: function() {
			this.loadFixtures();
			this.setAutospec(opener.window.rio.environment.autospec);
			this.setAutocss(opener.window.rio.environment.autocss);
			
			this._promptHistory = (rio.Cookie.get("promptHistory") || "").split("\n");
		},
	
		buildHtml: function() {
			this._consoleLog = rio.Tag.div("", { className: "log" });
			this._consoleLog.observe("click", this.focus.bind(this));
			this._prompt = rio.Tag.input("", { className: "prompt" });
			var promptBox = rio.Tag.div([
				rio.Tag.span(">>>", { className: "promptArrows" }), 
				this.getPrompt()
			], { style: "position: relative;" });
		
			this.getPrompt().observe("keypress", function(e) {
				if (e.keyCode == Event.KEY_RETURN) {
					this.executePrompt();
					e.stop();
				}
			}.bindAsEventListener(this));
			this.getPrompt().observe("keydown", function(e) {
				if (e.keyCode == Event.KEY_UP || e.keyCode == 38) {
					this.selectPreviousHistoryItem();
					e.stop();
				}
				if (e.keyCode == Event.KEY_DOWN || e.keyCode == 40) {
					this.selectNextHistoryItem();
					e.stop();
				}
			}.bindAsEventListener(this));
			
			var center = new rio.components.Container({ region: "center", items: [this._consoleLog] });
			var south = new rio.components.Container({ region: "south", items: [promptBox], overflow: "hidden" });
			
			return new rio.components.Container({ layout: true, items: [center, south], height: "100%", width: "100%" }).html();
		},
		
		focus: function() {
			this.getPrompt().setFocus(true);
		},
	
		log: function(msg, className, prefix) {
			prefix = (prefix === undefined) ? ">> " : prefix;
			var logItem = rio.Tag.div(rio.Tag.pre([prefix, (msg == undefined ? "" : msg).toString()]), {
				className: className || "logItem"
			});
			this.getConsoleLog().insert(logItem);
			this.getConsoleLog().scrollTop = this.getConsoleLog().scrollHeight - this.getConsoleLog().getHeight() + 50;
		},
		
		logHtml: function(msg, className) {
			var logItem = rio.Tag.div(msg, {
				className: className || "logItem"
			});
			this.getConsoleLog().insert(logItem);
			this.getConsoleLog().scrollTop = this.getConsoleLog().scrollHeight - this.getConsoleLog().getHeight() + 50;
		},
		
		skipAutotest: [
			"/lib/console/components/console.js",
			/* "/lib/spec.js",  Not sure why this used to be skipped */
			"/lib/boot.js"
		],
		
		skipAutoload: [
			"/lib/boot.js"
		],
		
		touch: function(files) {
			files.each(function(file) {
				if (file.endsWith(".js") && !file.match(/\/specs\//) && !this.skipAutoload.include(file)) {
					if (opener.rio.boot.loadedFiles.include(file.match(/\/?(.*)\.js/)[1])) {
						opener.rio.File.execute("/javascripts" + file, { asynchronous: false });
					}
					if (rio.boot.loadedFiles.include(file.match(/\/?(.*)\.js/)[1])) {
						rio.File.execute("/javascripts" + file, { asynchronous: false });
						// rio.app.reboot();
					}
				}
			}.bind(this));
			if (this.getAutocss()) {
				files.select(function(f) {
					return f.strip().toLowerCase().match(/.css$/);
				}).each(function(f) {
					var css = "/stylesheets" + f.strip().toLowerCase();
					var found = false;
					opener.window.$$("link").each(function(l) {
						if (l.href.include("/rio/stylesheets?")) {
							// l.href += "&" + Math.random();
							// Don't do anything here, it's way too slow
						} else {
							var root = opener.window.location.protocol + "//" + opener.window.location.host;
							var link = l.href.strip().toLowerCase();
							var compare = link.startsWith(root) ? root + css : css;
							if (link == compare || link.startsWith(compare + "?")) {
								l.href = compare + "?" + Math.random();
								found = true;
							}
						}
					});
					// If we can't find the stylesheet but it's loaded, just reload all stylesheets
					if (!found && opener.rio.preloadedStylesheets.include(css.match(/\/stylesheets\/(.*)\.css/)[1])) {
						opener.rio.boot.loadedStylesheets.each(function(s) {
							opener.Element.head().insert({ 
								bottom: opener.rio.Tag.link("", {
									href: "/stylesheets/" + s + ".css?" + Math.random(),
									media: "screen",
									rel: "stylesheet",
									type: "text/css"
								})
							});
						});
					}
				});
			}
			if (this.getAutospec()) {
				var filesToTest = files.select(function(f) {
					return f.strip().toLowerCase().match(/.jst?$/) && !this.skipAutotest.include(f);
				}.bind(this)).map(function(f) {
					var m;
					if (m = f.match(/\/?(.*).jst/)) {
						var allTemplatesList = opener.rio.JsTemplate._allTemplatesList;
						var index = allTemplatesList.indexOf(m[1]);
						if (index >= 0) {
							allTemplatesList.splice(index, 1);
						}
						var page = opener.rio.pages[m[1].split("/").last().classize()];
						page._templateApplied = false;
						page.applyTemplate();
					}
					if (f.strip().toLowerCase().startsWith("/specs/fixtures/")) {
						return f.strip().toLowerCase().match(/^\/specs\/fixtures\/(.*)\.js$/)[1];
					} else if (f.strip().toLowerCase().startsWith("/specs/")) { 
						return f.strip().toLowerCase().match(/^\/specs\/(.*)_spec\.js$/)[1];
					} else {
						return f.strip().toLowerCase().match(/^\/?(.*).jst?$/)[1];
					}
				}).uniq();
				
				filesToTest.each(function(f) {
					this.runSpecs(f);
				}.bind(this));
			}
		},
	
		focus: function() {
			this.getPrompt().focus();
		},

		consoleCommandFor: function(command) {
			if (rio.ConsoleCommands[command]) { return rio.ConsoleCommands[command]; }
			
			return Object.values(rio.ConsoleCommands).detect(function(c) {
				return c.alias && c.alias.include(command);
			});
		},

		_lastResults: null,
		executePrompt: function() {
			var prompt = this.getPrompt().value;
			if (prompt.blank()) { return; }
	
			this.setCurrentHistoryPoint(0);
			this.setHalfTyped("");
			this.getPromptHistory().push(prompt);
			rio.Cookie.set("promptHistory", rio.Cookie.get("promptHistory") + "\n" + prompt);
			this.getPrompt().clear();
	
			var pathMatch;
			
			var command = prompt.split(" ")[0].strip();
			
			var consoleCommand = this.consoleCommandFor(command);
			if (consoleCommand) {
				try {
					consoleCommand.action.bind(this, prompt)();
				} catch(er) {
					this.log(er, "errorLogItem", "> ");
				}
				return;
			}
			
			this.log(prompt, "userLogItem", ">>> ");
			try {
				var mixin = {};
				Object.keys(rio.ConsoleMixin).each(function(key) {
					mixin[key] = rio.ConsoleMixin[key].bind(this)();
				}.bind(this));
				
				var results;
				with(mixin) {
					if (this.getBoundTo()) {
						results = opener.eval("(function() { return eval(\"" + prompt.gsub("\"", "\\\"") + "\"); }.bind(rio.console.window.rio.app.getCurrentPage().getConsole().getBoundTo()))()");
					} else {
						results = opener.eval(prompt);
					}
				}
				this._lastResults = results;

				this.log(results, "userLogItem", "");
			} catch(e) {
				this.log(e, "errorLogItem", "> ");
			}
		},
		
		runSpecs: function(spec) {
			try {
				var startTime = new Date();
				var context = {
					examples: 0,
					failures: 0,
					pendings: 0
				};
				var stdout = function(msg, className) {
					this.log(msg, className, " ");
				}.bind(this);
				
				var summarizer = function() {
					Sound.play("/sounds/" + (context.failures > 0 ? "basso" : "purr") + ".wav");
					var msg = context.examples + " " + rio.Utils.pluralize(context.examples, "example", "examples") + ", " + 
							  context.failures + " " + rio.Utils.pluralize(context.failures, "failure", "failures");
					if (context.pendings > 0) {
						msg = msg + ", " + context.pendings + " pending";
					}
					var logClass = context.failures > 0 ? "summaryFailed" : (context.pendings > 0 ? "summaryPending" : "summaryPassed"); 

					var time = (new Date().getTime() - startTime.getTime()) / 1000.0;
					this.log("Completed in " + time + " seconds", "", "");
					this.log(msg, logClass, "=> ");
				}.bind(this);

				if (!spec) {
					rio.SpecRunner.runAll({
						stdout: stdout,
						env: opener,
						context: context,
						syntaxChecker: this.checkSyntax.bind(this),
						onComplete: summarizer
					});
				} else {
					rio.SpecRunner.run({
						path: spec,
						stdout: stdout,
						env: opener,
						context: context,
						syntaxChecker: this.checkSyntax.bind(this),
						onComplete: summarizer
					});
				}
			} catch(e) {
				this.log(e, "errorLogItem", "> ");
			}
		},

		selectPreviousHistoryItem: function() {
			if (this.getPromptHistory().size() == this.getCurrentHistoryPoint()) {return;}
			if (this.getCurrentHistoryPoint() == 0) { this.setHalfTyped(this.getPrompt().value); }
			this.setCurrentHistoryPoint(this.getCurrentHistoryPoint() + 1);
			this.getPrompt().value = this.getPromptHistory()[this.getPromptHistory().size() - this.getCurrentHistoryPoint()];
		},
	
		selectNextHistoryItem: function() {
			if (0 == this.getCurrentHistoryPoint()) {return;}
			this.setCurrentHistoryPoint(this.getCurrentHistoryPoint() - 1);
			if (this.getCurrentHistoryPoint() == 0) { 
				this.getPrompt().value = this.getHalfTyped(); 
			} else {
				this.getPrompt().value = this.getPromptHistory()[this.getPromptHistory().size() - this.getCurrentHistoryPoint()];
			}
		},
		
		checkRioSyntax: function() {
			var filesToIgnore = [
				"lib/swfobject"
			];
			rio.File.open("../rio.build", {
				onSuccess: function(content) {
					var rioFiles = content.split("\n").map(function(file) { return file.strip(); }).reject(function(file) { return file.blank() || filesToIgnore.include(file); });
					this.checkFilesSyntax(rioFiles);
				}.bind(this)
			});
		},
		
		checkProgramSyntax: function() {
			this.checkFilesSyntax(opener.rio.boot.appScripts());
		},
		
		checkFilesSyntax: function(files) {
			this.checkFileSyntax(files.first(), {
				onComplete: function() {
					if (files.size() > 1) {
						this.checkFilesSyntax(files.without(files.first()));
					}
				}.bind(this)
			});
		},
		
		checkFileSyntax: function(file, options) {
			var onComplete = (options || {}).onComplete || Prototype.emptyFunction;
			rio.RioLint.checkFileSyntax(file, {
				onComplete: function(errors) {
					this.logLintErrors(errors, file);
					
					onComplete();
				}.bind(this)
			});
		},
		
		checkSyntax: function(content, fileName) {
			var errors = rio.RioLint.checkSyntax(content, fileName);
			this.logLintErrors(errors, fileName);
		},
		
		logLintErrors: function(errors, fileName) {
			if (errors.empty()) {
				this.log("Syntax valid: " + fileName, "passed");	
			} else {
				errors.each(function(e) {
					this.log(e, "warningLogItem", "- ");
				}.bind(this));
			}
		},
		
		loadFixtures: function() {
			rio.SpecRunner.loadFixtures({ env: opener });
		}
	}
});







