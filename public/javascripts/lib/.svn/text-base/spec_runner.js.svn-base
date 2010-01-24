rio.SpecRunner = {
	rootUrl: "/javascripts/specs/",
	
	SpecPage: rio.Page.create({
		methods: {
			buildHtml: function() {
				return rio.Tag.div();
			},

			addComponent: function(component) {
				this.html().insert(component.html());
			},

			renderExamples: function(attr, env) {
				this.reset();

				var examplesHtml = rio.Tag.div("");

				var exampleGroup = attr.examples();

				Object.keys(exampleGroup).each(function(name) {
					examplesHtml.insert(rio.Tag.hr());
					examplesHtml.insert(rio.Tag.div(name + ":", {
						style: "padding: 10px; font-style: italic; font-color: #555"
					}));
					var exampleHtml = exampleGroup[name].html();
					var examplePosition = exampleHtml.getStyle("position");
					var exampleWrapper = rio.Tag.div(exampleHtml, { style: "padding: 0px 20px 10px;" });

					if (examplePosition == "absolute") {
						exampleHtml.setStyle({
							left: "20px",
							top: "0px"
						});

						exampleWrapper.setStyle({
							position: "relative"
						});
						(function() {
							exampleWrapper.setStyle({
								height: (exampleHtml.totalHeight()) + "px"
							});
						}).defer();
					}

					examplesHtml.insert(exampleWrapper);
				});
				examplesHtml.insert(rio.Tag.hr());
				var backLink = rio.Tag.a("Back to application", {
					href: "#",
					onclick: "return false;"
				});
				backLink.observe("click", function() {
					env.rio.app.reboot();
				});
				examplesHtml.insert(rio.Tag.div(backLink, {
					style: "padding: 10px"
				}));

				this.html().insert(examplesHtml);
			},

			reset: function() {
				this.html().update("");
			}
		}
	}),
	
	specPage: function() {
		if (!this._specPage) { this._specPage = new this.SpecPage(); }
		return this._specPage;
	},
	
	loadSpecPage: function(env) {
		env.rio.app.clearPage();
		env.Element.body().insert(this.specPage().html());
		this.specPage().render();
		env.rio.app.setCurrentPage(this.specPage());
	},
	
	unloadSpecPage: function(env) {
		env.rio.app.reboot();
	},

	renderExamples: function(attr, options) {
		this.loadSpecPage(options.env);
		this.specPage().renderExamples(attr, options.env);
	},
	
	loadFixtures: function(options) {
		rio.Fixtures.loadFixtures(options);
	},
	
	loadFixture: function(options, quietIfNotFound) {
		rio.Fixtures.loadFixture(options, quietIfNotFound);
	},
	
	runAll: function(options) {
		rio.File.open("/rio/specs", {
			onSuccess: function(specData) {
				try {
					specData = eval("[" + specData + "]")[0];
				} catch(e) {
					options.stdout(e);
				}
				this.runSpecs({
					specs: options.env.rio.boot.loadedFiles,
					specData: specData,
					stdout: options.stdout,
					env: options.env,
					context: options.context,
					syntaxChecker: options.syntaxChecker,
					onComplete: options.onComplete
				});
			}.bind(this)
		});
	},
	
	runSpecs: function(options) {
		this.loadSpecPage(options.env);
		
		options.specs.each(function(specName) {

			var specFunction = options.specData[specName + "_spec"];
			if (specFunction) {
				options.stdout("loading spec: " + specName);
				var spec = specFunction();

				try {
					options.syntaxChecker(spec, specName);
					rio.Spec.executeSpec(spec, options.stdout, options.env, options.context, rio.SpecRunner.specPage(), function(c) { 
						if (typeof options.env.execScript != 'undefined') {
							options.env.execScript(c);
						} else {
							options.env.eval(c); 
						}
					});
				} catch (e) {
					options.env.rio.log("Error running spec (" + specName + ") - " + e + " (" + e.fileName + " - " + e.lineNumber + ")", "errorLogItem", "> ");
				}
			}
		}.bind(this));
		
		this.unloadSpecPage(options.env);
		options.onComplete();
	},
	
	run: function(options) {
		options.env.rio.File.execute(
			options.env.rio.boot.root + options.path + ".js", { asynchronous: false }
		);
		this.loadFixture(options, true);
		new Ajax.Request(this.rootUrl + options.path + "_spec.js?" + Math.random(), {
			asynchronous: true,
			method: 'get',
			evalJSON: false,
			evalJS: false,
			onSuccess: function(response) {
				if (!options.skipSpecPage) { this.loadSpecPage(options.env); }
				options.stdout("loading spec: " + options.path);
				var spec = response.responseText;
				
				try {
					options.syntaxChecker(spec, options.path + "_spec");
					rio.Spec.executeSpec(spec, options.stdout, options.env, options.context, rio.SpecRunner.specPage(), function(c) {
						if (typeof options.env.execScript != 'undefined') {
							options.env.execScript(c);
						} else {
							options.env.eval(c); 
						}
					});
				} catch (e) {
					options.env.rio.log("Error running spec (" + specName + ") - " + e + " (" + e.fileName + " - " + e.lineNumber + ")", "errorLogItem", "> ");
				}

				if (!options.skipSpecPage) { this.unloadSpecPage(options.env); }
			}.bind(this),
			onComplete: function() {
				(options.onComplete || Prototype.emptyFunction)();
			}
		});
	}
};

rio.Fixtures = {
	loadFixtures: function(options) {
		rio.File.json("/rio/fixtures", {
			onSuccess: function(fixtures) {
				var oldExample = options.env.example;
				try {
					options.env.example = function(attr, name) {
						return {
							_EXAMPLE: true,
							attr: attr,
							name: name
						};
					};
					options.env.rio.boot.loadedFiles.each(function(file) {
						var fixture = fixtures["fixtures/" + file];
						if (fixture) {
							try {
								options.env.eval(fixture());
							} catch(e) {
								options.env.rio.log("Error loading fixture (" + file + ") - " + e, "errorLogItem", "> ");
							}
						}
					});
				} finally {
					options.env.example = oldExample;
				}
			}.bind(this)
		});
	},
	
	loadFixture: function(options, quietIfNotFound) {
		rio.File.open("/javascripts/specs/fixtures/" + options.path + ".js", {
			asynchronous: false,
			onSuccess: function(fixture) {
				var example = function(attr, name) {
					return {
						_EXAMPLE: true,
						attr: attr,
						name: name
					};
				};
				var exampleStub = new rio.Stub(options.env, "example").withValue(example);
				try {
					options.env.eval(fixture);
				} catch(e) {
					options.env.rio.log("Error loading fixture (" + options.path + ") - " + e, "errorLogItem", "> ");
				} finally {
					exampleStub.release();
				}
			}.bind(this),
			onFailure: function(){
				if (!quietIfNotFound) {
					options.env.rio.log("Error loading fixture (" + options.path + ") - ", "errorLogItem", "> ");
				}
			}
		});
	}
};
