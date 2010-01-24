rio.ConsoleCommands = {
	clear: {
		description: "Clears the console",
		alias: ["cls"],
		action: function() {
			this.getConsoleLog().innerHTML = "";
		}
	},
	
	lint: {
		description: "Checks the syntax of one or more javascript files",
		action: function(prompt) {
			var pathMatch = prompt.match(/^lint (.*)$/);
			if (pathMatch) {
				if (pathMatch[1] == "rio") {
					this.checkRioSyntax();
				} else {
					this.checkFileSyntax(pathMatch[1]);
				}
			} else {
				this.checkProgramSyntax();
			}
		}
	},

	spec: {
		description: "Execute one or all of the specs",
		action: function(prompt) {
			var pathMatch = prompt.match(/^spec (.*)$/);
			this.runSpecs(pathMatch && eval(pathMatch[1]));
		}
	},

	examples: {
		description: "Renders examples of a component as defined in its fixture",
		action: function(prompt) {
			var pathMatch = prompt.match(/^examples (.*)$/);
	
			rio.SpecRunner.renderExamples(opener.eval(pathMatch[1]), {
				env: opener
			});
		}
	},
	
	play: {
		description: "Navigates to the development playground",
		action: function() {
			opener.rio.app.navigateTo("playground");
			this.log("Entering the playground");
			this.fire("navigateToPlayground");
		}
	},

	work: {
		description: "Navigates back to the root of your application",
		action: function() {
			opener.rio.app.navigateTo("#");
			this.log("Leaving the playground");
		}
	},
	
	history: {
		description: "Print out the console command history",
		action: function() {
			this.log(rio.Cookie.get("promptHistory"), "", "");
		}
	},
	
	clearHistory: {
		description: "Clear console history (* won't need this after console cleans itself)",
		action: function() {
			rio.Cookie.set("promptHistory", "");
			this.log("History cleared");
		}
	},
	
	reboot: {
		description: "Reboots the app",
		action: function() {
			opener.rio.app.reboot();
		}
	},
	
	bind: {
		description: "Set the execution binding to something other than window",
		action: function(prompt) {
			this.setBoundTo(opener.eval(prompt.match(/^bind (.*)$/)[1]));
			this.log("Console binding set to: " + this.getBoundTo());
		}
	},

	unbind: {
		description: "Resets the execution binding to the window",
		action: function() {
			this.setBoundTo(opener.window);
			this.log("Console binding reset");
		}
	},
	
	components: {
		description: "Show the component heirarchy",
		action: function() {
			var lines = [];
			var printComponents = function(component, depth) {
				lines.push("--".times(depth) + component);
				component.subclasses.each(function(c) {
					printComponents(c, depth + 1);
				});
			};
			Object.keys(opener.rio.components).select(function(c) {
				return opener.rio.components[c].superclass == undefined;
			}).each(function(c) {
				printComponents(opener.rio.components[c], 0);
			});
			this.log(lines.join("\n"), "", "");
		}
	},

	autospec: {
		description: "Check the status of, turn on, and turn off autospec",
		alias: ["autotest"],
		action: function(prompt) {
			if (prompt.strip().match(/^auto(spec|test) on$/)) {
				this.log("Autospec set to ON");
				if (!this.getAutospec()) {
					this.runSpecs();
				}
				this.setAutospec(true);
			} else if (prompt.strip().match(/^auto(spec|test) off$/)) {
				this.log("Autospec set to OFF");
				this.setAutospec(false);
			} else {
				this.log("Autospec is " + (this.getAutospec() ? "ON" : "OFF"));
			}
		}
	},

	autocss: {
		description: "Check the status of, turn on, and turn off autocss",
		action: function(prompt) {
			if (prompt.strip().match(/^autocss on$/)) {
				this.log("Autocss set to ON");
				this.setAutocss(true);
			} else if (prompt.strip().match(/^autocss off$/)) {
				this.log("Autocss set to OFF");
				this.setAutocss(false);
			} else {
				this.log("Autocss is " + (this.getAutocss() ? "ON" : "OFF"));
			}
		}
	},
	
	// perf: {
	// 	description: "Check the status of, turn on, and turn off autocss",
	// 	action: function(prompt) {
	// 		this.log("Benchmarking...");
	// 		var stub = function(obj, method) {
	// 			return new opener.rio.Stub(obj, method);
	// 		};
	// 		
	// 		var stubs = [];
	// 		stubs.push(stub(opener.rio.models.Outline, "_identityCache").withValue({}));
	// 		stubs.push(stub(opener.rio.models.Outline, "_collectionEntities").withValue({}));
	// 		stubs.push(stub(opener.rio.models.LineItem, "_identityCache").withValue({}));
	// 		stubs.push(stub(opener.rio.models.LineItem, "_collectionEntities").withValue({}));
	// 		stubs.push(stub(opener.rio.components.LineItem, "_lineItemCache").withValue({}));
	// 
	// 		// var count = "Model#initialize";
	// 		opener.rio.Benchmark.start();
	// 
	// 		try {
	// 			// TODO: remove method
	// 			var olv = new opener.rio.components.OutlineListView({
	// 				items: opener.rio.models.Outline.find(41).getRootNodes().sortedLineItems
	// 			});
	// 			
	// 			var startTime = new Date();
	// 			// opener.rio.models.LineItem.findAll({ parameters: { outlineId: 196 } });
	// 			// opener.rio.models.Outline.find(196).getLineItems()
	// 			// opener.rio.models.Outline.find(196).getRootNodes().getSortedLineItems();
	// 			// new opener.rio.components.OutlineListView({
	// 			// 	items: opener.rio.models.Outline.find(196).getRootNodes().sortedLineItems
	// 			// });
	// 			// html = new opener.rio.components.OutlineListView({
	// 			// 	items: opener.rio.models.Outline.find(196).getRootNodes().sortedLineItems
	// 			// }).html();
	// 			olv.html();
	// 			// rio.log(html)
	// 			
	// 			// var o = new opener.rio.models.Outline();
	// 			// (200).times(function() {
	// 			// 	new opener.rio.models.LineItem({ outline: o });
	// 			// });
	// 			
	// 			this.log(new Date() - startTime + " ms");
	// 
	// 			opener.rio.Benchmark.stop();
	// 			opener.rio.Benchmark.getInstallations().each(function(installation) {
	// 				this.log(
	// 					installation.getObjectString() + "#" + 
	// 					installation.getMethodName() + " - " + 
	// 					installation.getInvocations() + ", " +
	// 					installation.getTime()
	// 				);
	// 			}.bind(this));
	// 			// this.log(opener.rio.Benchmark.installationFor(count).getInvocations());
	// 		} catch(e) {
	// 			this.log("FAILED BENCHMARK", "errorLogItem");
	// 		} finally {
	// 			stubs.invoke("release");
	// 		}
	// 	}
	// },
	
	fixtures: {
		description: "Force the fixtures to reload",
		action: function() {
			this.loadFixtures();
			this.log("Fixtures reloaded!");
		}
	},
	
	pollution: {
		description: "Enumerate the pollution to the global namespace",
		action: function() {
			var pollution = opener.rio.boot.pollution();
			if (pollution.empty()) {
				this.log("The global namespace is clean!", "passed");
			} else {
				this.log("The global namespace is polluted with " + pollution.size() + " keys:", "errorLogItem", "> ");
				pollution.each(function(k) {
					this.log("  " + k, "warningLogItem", "");
				});
			}
		}
	},
	
	logout: {
		description: "Logout by destroying the session",
		action: function() {
			this.log("Logging out...");
			opener.rio.Utils.navigateTo('/session', 'delete', opener.rio.Application.getToken());
		}
	},
	
	layout: {
		description: "Generate template code for a layout (e.g. layout west south)",
		action: function(prompt) {
			var match = prompt.match(/^layout\s(.*)$/);
			var regions = (match ? match[1].split(" ") : []) + ["center"];
			var containers = "";
			["north", "west", "center", "east", "south"].each(function(r) {
				if (regions.include(r)) {
					containers += "" +
						"		<rio:Container region=\"" + r + "\">" + "\n" +
						"			<items>" + "\n" +
						"			</items>" + "\n" +
						"		</rio:Container>" + "\n"
				}
			});
			var output = "" + "\n" +
				"<rio:Container layout=\"{true}\">" + "\n" +
				"	<items>" + "\n" +
				containers +
				"	</items>" + "\n" +
				"</rio:Container>";
			this.log(output);
		}
	},

	help: {
		description: "Shows this help message",
		action: function() {
			var msg = "\nThe follow commands are available to you:\n\n";
			
			msg += Object.keys(rio.ConsoleCommands).map(function(c) {
				var numTabs = 3 - (c.length / 8).floor();
				return c + "\t".times(numTabs) + "# " + rio.ConsoleCommands[c].description;
			}).join("\n");
			
			msg += "\n\n\nThe following variables are available to you:\n\n";
			msg += "(" + Object.keys(rio.ConsoleMixin).join(", ") + ")"
			
			this.log(msg, "", "");
		}
	}
};