describe(rio.Spec, {
	"should add assertions for": {
		"shouldEqual": {
			builder: function() {
				var specs = {};
				[
					{ name: "String", yes: "asdf", no: "qwer" },
					{ name: "Boolean", yes: true, no: false },
					{ name: "Number", yes: 1, no: 2 },
					{ name: "Function", yes: Prototype.emptyFunction, no: function() {} },
					{ name: "Array", yes: [1, 2, 3], no: [3, 2, 1] },
					{ name: "Id", yes: new rio.Id(1), no: new rio.Id(2) }
				].each(function(data) {
					specs["to " + data.name] = function() {
						data.yes.shouldEqual(data.yes);
						var failed;
						try {
							data.yes.shouldEqual(data.no);
						} catch(e) {
							failed = true;
						}
						failed.shouldBeTrue();
					};
				});
				return specs;
			}
		},

		"shouldNotEqual": {
			builder: function() {
				var specs = {};
				[
					{ name: "String", yes: "asdf", no: "qwer" },
					{ name: "Boolean", yes: true, no: false },
					{ name: "Number", yes: 1, no: 2 },
					{ name: "Function", yes: Prototype.emptyFunction, no: function() {} },
					{ name: "Array", yes: [1, 2, 3], no: [3, 2, 1] },
					{ name: "Id", yes: new rio.Id(1), no: new rio.Id(2) }
				].each(function(data) {
					specs["to " + data.name] = function() {
						data.yes.shouldNotEqual(data.no);
						var failed;
						try {
							data.yes.shouldNotEqual(data.yes);
						} catch(e) {
							failed = true;
						}
						failed.shouldBeTrue();
					};
				});
				return specs;
			}
		},

		"shouldBeTrue": {
			builder: function() {
				var specs = {};
				[
					{ name: "String", yes: "asdf", no: "" },
					{ name: "Boolean", yes: true, no: false },
					{ name: "Number", yes: 1, no: 0 },
					{ name: "Function", yes: Prototype.emptyFunction },
					{ name: "Array", yes: [1, 2, 3] },
					{ name: "Id", yes: new rio.Id(1) }
				].each(function(data) {
					specs["to " + data.name] = function() {
						data.yes.shouldBeTrue();
						var failed = false;
						
						if (data.no) {
							try {
								data.no.shouldBeTrue();
							} catch(e) {
								failed = true;
							}
							failed.shouldEqual(true);
						}
					};
				});
				return specs;
			}
		},

		"shouldNotBeTrue": {
			builder: function() {
				var specs = {};
				[
					{ name: "String", yes: "", no: "asdf" },
					{ name: "Boolean", yes: false, no: true },
					{ name: "Number", yes: 0, no: 1 },
					{ name: "Function", no: Prototype.emptyFunction },
					{ name: "Array", no: [1, 2, 3] },
					{ name: "Id", no: new rio.Id(1) }
				].each(function(data) {
					specs["to " + data.name] = function() {
						if (data.yes) { data.yes.shouldNotBeTrue(); }

						var failed = false;
						try {
							data.no.shouldNotBeTrue();
						} catch(e) {
							failed = true;
						}
						failed.shouldEqual(true);
					};
				});
				return specs;
			}
		},

		"shouldBeFalse": {
			builder: function() {
				var specs = {};
				[
					{ name: "String", yes: "", no: "asdf" },
					{ name: "Boolean", yes: false, no: true },
					{ name: "Number", yes: 0, no: 1 },
					{ name: "Function", no: Prototype.emptyFunction },
					{ name: "Array", no: [1, 2, 3] },
					{ name: "Id", no: new rio.Id(1) }
				].each(function(data) {
					specs["to " + data.name] = function() {
						if (data.yes) { data.yes.shouldBeFalse(); }

						var failed = false;
						try {
							data.no.shouldBeFalse();
						} catch(e) {
							failed = true;
						}
						failed.shouldEqual(true);
					};
				});
				return specs;
			}
		},
		
		"shouldStartWith to String": function() {
			"hello world".shouldStartWith("hello");
			var failed;
			try {
				"hello world".shouldStartWith("world");
			} catch(e) {
				failed = true;
			}
			failed.shouldBeTrue();
		},

		"shouldMatchWith to String": function() {
			"hello world".shouldMatch(/.*lo world$/);
			var failed;
			try {
				"hello world".shouldMatch(/^world/);
			} catch(e) {
				failed = true;
			}
			failed.shouldBeTrue();
		},
		
		"shouldInclude to Array": function() {
			[1,2,3].shouldInclude(1);
			var failed;
			try {
				[1,2,3].shouldInclude(4);
			} catch(e) {
				failed = true;
			}
			failed.shouldBeTrue();
		},
		
		"shouldNotInclude to Array": function() {
			[1,2,3].shouldNotInclude(4);
			var failed;
			try {
				[1,2,3].shouldNotInclude(1);
			} catch(e) {
				failed = true;
			}
			failed.shouldBeTrue();
		},

		"shouldBeEmpty to Array": function() {
			[].shouldBeEmpty();
			var failed;
			try {
				[1,2,3].shouldBeEmpty();
			} catch(e) {
				failed = true;
			}
			failed.shouldBeTrue();
		},
		
		"shouldNotBeEmpty to Array": function() {
			[1,2,3].shouldNotBeEmpty();
			var failed;
			try {
				[].shouldNotBeEmpty();
			} catch(e) {
				failed = true;
			}
			failed.shouldBeTrue();
		},
		
		"shouldEqual to Id that considers Id objects equal to their underlying integer value": function() {
			new rio.Id(1).shouldEqual(1);
		}
	},
	
	"should add mock expectations to Function for": {
		"shouldBeCalled": function() {
			var fcn = function() {}.shouldBeCalled();
			fcn();
			rio.mockManager.verifyAll();
			
			(function() {}).shouldBeCalled();
			var failed;
			try {
				rio.mockManager.verifyAll();
			} catch(e) {
				failed = true;
			} finally {
				rio.mockManager.releaseAll();
			}
			failed.shouldBeTrue();
		},

		"shouldBeCalled.once": function() {
			var fcn = function() {}.shouldBeCalled().once();
			fcn();
			rio.mockManager.verifyAll();
			rio.mockManager.releaseAll();
			
			var fcn2 = function() {}.shouldBeCalled().once();
			fcn2();
			fcn2();
			var failed;
			try {
				rio.mockManager.verifyAll();
			} catch(e) {
				failed = true;
			} finally {
				rio.mockManager.releaseAll();
			}
			failed.shouldBeTrue();
		},

		"shouldBeCalled.times": function() {
			var fcn = function() {}.shouldBeCalled().times(2);
			fcn();
			fcn();
			rio.mockManager.verifyAll();
			
			var fcn2 = function() {}.shouldBeCalled().times(2);
			fcn2();
			var failed;
			try {
				rio.mockManager.verifyAll();
			} catch(e) {
				failed = true;
			} finally {
				rio.mockManager.releaseAll();
			}
			failed.shouldBeTrue();
		},

		"shouldNotBeCalled": function() {
			(function() {}).shouldNotBeCalled();
			rio.mockManager.verifyAll();
			
			var fcn = function() {}.shouldNotBeCalled();
			fcn();
			var failed;
			try {
				rio.mockManager.verifyAll();
			} catch(e) {
				failed = true;
			} finally {
				rio.mockManager.releaseAll();
			}
			failed.shouldBeTrue();
		}
	},
	
	"stubs": {
		"should replace an object property with a function without a return value": function() {
			var obj = { f: function() { return 1; }.shouldNotBeCalled() };
			new rio.Stub(obj, "f");
			shouldBeUndefined(obj.f());
		},
		
		"should replace the old property value after releasing the stub": function() {
			var obj = { f: function() { return 1; }.shouldBeCalled() };
			var s = new rio.Stub(obj, "f");
			s.release();
			obj.f().shouldEqual(1);
		},
		
		"should delete the property if it was undefined when stubbed": function() {
			var obj = {};
			var s = new rio.Stub(obj, "f");
			s.release();
			Object.keys(obj).shouldNotInclude("f");
		},

		"should allow a return value to be provided": function() {
			var obj = { f: function() {} };
			new rio.Stub(obj, "f").andReturn(12);
			obj.f().shouldEqual(12);
		},
		
		"should allow a custom function to be called on the stub": function() {
			var obj = { f: function() {} };
			new rio.Stub(obj, "f").andDo(function(val) { return val + 1; }.shouldBeCalled());
			obj.f(10).shouldEqual(11);
		},
		
		"should allow any value to be used as the stub": function() {
			var obj = { f: function() {} };
			new rio.Stub(obj, "f").withValue("hello");
			obj.f.shouldEqual("hello");
		},
		
		"should provide concise syntax for adding a shouldBeCalled expectation to the stub": function() {
			var obj = { f: function() {} };
			new rio.Stub(obj, "f").shouldBeCalled();
			obj.f();
			rio.mockManager.verifyAll();

			new rio.Stub(obj, "f").shouldBeCalled();
			var failed;
			try {
				rio.mockManager.verifyAll();
			} catch(e) {
				failed = true;
			} finally {
				rio.mockManager.releaseAll();
			}
			failed.shouldBeTrue();
		},

		"should provide concise syntax for adding a shouldNotBeCalled expectation to the stub": function() {
			var obj = { f: function() {} };
			new rio.Stub(obj, "f").shouldNotBeCalled();
			rio.mockManager.verifyAll();

			new rio.Stub(obj, "f").shouldNotBeCalled();
			obj.f();
			var failed;
			try {
				rio.mockManager.verifyAll();
			} catch(e) {
				failed = true;
			} finally {
				rio.mockManager.releaseAll();
			}
			failed.shouldBeTrue();
		},
		
		"provide a StubManager that": {
			beforeEach: function() {
				this.stubManager = new rio.StubManager();
			},

			"should provide a stub method that creates stubs": function() {
				var obj = { f: function() { return 1; }.shouldNotBeCalled() };
				this.stubManager.stub(obj, "f");
				shouldBeUndefined(obj.f());
			},

			"should provide a releaseAll method that releases the stubs it creates": function() {
				var obj = { f: function() { return 1; }, g: function() { return 2; } };
				this.stubManager.stub(obj, "f");
				this.stubManager.stub(obj, "g");
				this.stubManager.releaseAll();
				obj.f().shouldEqual(1);
				obj.g().shouldEqual(2);
			}
		}
	},
	
	"should provide a MockManager": {
		beforeEach: function() {
			this.mockManager = new rio.MockManager();
		},

		"that can collect expectations to be verified": function() {
			this.mockManager.expect(function() {
				return true;
			});
			this.mockManager.verifyAll();
			this.mockManager.expect(function() {
				return false;
			});
			var failed;
			try {
				this.mockManager.verifyAll();
			} catch(e) {
				failed = true;
			}
			failed.shouldBeTrue();
		},

		"that can release expectations": function() {
			this.mockManager.expect(function() {
				return false;
			});
			this.mockManager.releaseAll();
			this.mockManager.verifyAll();
		}
	},
	
	"#executeSpec": {
		beforeEach: function() {
			this.env = {
				rio: rio,
				Ajax: Ajax,
				Function: { prototype: {} }
			};
		},

		"should evaluate the spec": function() {
			var specVal;
			var doEval = function(spec) {
				specVal = spec;
			}.shouldBeCalled();
			rio.Spec.executeSpec("'SPEC'", function() {}, this.env, {}, { addComponent: function() {} }, doEval);
			specVal.shouldEqual("'SPEC'");
		},
		
		"should add spec values to the env": function() {
			var envSpecPage, envDescribe, envStub, envPending, envFail, envInsertComponent, envFunctionActive, envShouldBeDefined, envShouldBeUndefined, envShouldEqual, envMockManager;
			var doEval = function() {
				envSpecPage = this.env.specPage;
				envDescribe = this.env.describe;
				envStub = this.env.stub;
				envPending = this.env.pending;
				envFail = this.env.fail;
				envInsertComponent = this.env.insertComponent;
				envFunctionActive = this.env.Function.prototype.active;
				envShouldBeDefined = this.env.shouldBeDefined;
				envShouldBeUndefined = this.env.shouldBeUndefined;
				envShouldEqual = this.env.shouldEqual;
				envMockManager = this.env.rio.mockManager;
			}.bind(this);
			rio.Spec.executeSpec("'SPEC'", function() {}, this.env, {}, { addComponent: function() {} }, doEval);
			shouldBeDefined(envSpecPage);
			Object.isFunction(envDescribe).shouldBeTrue();
			Object.isFunction(envStub).shouldBeTrue();
			envPending.shouldEqual("PENDING");
			Object.isFunction(envFail).shouldBeTrue();
			Object.isFunction(envInsertComponent).shouldBeTrue();
			Object.isFunction(envFunctionActive).shouldBeTrue();
			Object.isFunction(envShouldBeDefined).shouldBeTrue();
			Object.isFunction(envShouldBeUndefined).shouldBeTrue();
			Object.isFunction(envShouldEqual).shouldBeTrue();
			shouldBeDefined(envMockManager);
		},

		"should only add spec values to the env temporarily": function() {
			rio.Spec.executeSpec("'SPEC'", function() {}, this.env, {}, { addComponent: function() {} }, function() {});
			shouldBeUndefined(this.env.specPage);
			shouldBeUndefined(this.env.describe);
			shouldBeUndefined(this.env.stub);
			shouldBeUndefined(this.env.pending);
			shouldBeUndefined(this.env.fail);
			shouldBeUndefined(this.env.insertComponent);
			shouldBeUndefined(this.env.Function.prototype.active);
			shouldBeUndefined(this.env.shouldBeDefined);
			shouldBeUndefined(this.env.shouldBeUndefined);
		}
	},
	
	"#describe": {
		beforeEach: function() {
			this.specPage = { 
				reset: function() {},
				addComponent: function() {}
			};
			this.output = [];
			var stdout = function(message, className) {
				this.output.push({ message: message, className: className });
			}.bind(this);
			this.context = {
				examples: 0,
				failures: 0,
				pendings: 0
			};
			this.describe = function(cls, spec) {
				var doEval = function() {
					describe(cls, spec);
				};
				rio.Spec.executeSpec("", stdout, window, this.context, this.specPage, doEval);
			}.bind(this);
		},

		"should run a spec and print the results": function() {
			this.describe("Class", {
				"should do nothing": function() {}
			});
			this.output.first().message.shouldEqual("- Class should do nothing");
			this.output.first().className.shouldEqual("passed");
		},
		
		"should print results with className 'failed' if the spec fails": function() {
			this.describe("Class", {
				"should fail": function() {
					"hello".shouldEqual("world");
				}
			});
			this.output.first().message.shouldStartWith("- Class should fail");
			this.output.first().className.shouldEqual("failed");
		},

		"should increase the context example counter with the number of specs that are run": function() {
			this.describe("Class", {
				"should be 1": function() {},
				"should be 2": function() {},
				"should be 3": function() {}
			});
			this.context.examples.shouldEqual(3);
		},

		"should increase the context failures counter with the number of specs that fail": function() {
			this.describe("Class", {
				"should be 1": function() { "hello".shouldEqual("world"); },
				"should be 2": function() {},
				"should be 3": function() { "hello".shouldEqual("world"); }
			});
			this.context.failures.shouldEqual(2);
		},

		"should run a spec and then release all of the stubs": function() {
			var obj = { a: 1 };
			this.describe("Class", {
				"should do nothing": function() {
					stub(obj, "a").withValue(2);
					obj.a.shouldEqual(2);
				}
			});
			this.context.failures.shouldEqual(0);
			obj.a.shouldEqual(1);
		},

		"should run a spec and then reset the specPage": function() {
			this.specPage.reset = function() {}.shouldBeCalled();
			this.describe("Class", {
				"should do nothing": function() {}
			});
		},
		
		"should call an optional beforeEach method before each spec": function() {
			var counter = 0;
			var specNumber = 0;
			this.describe("Class", {
				beforeEach: function() {
					counter = specNumber + 1;
				}.shouldBeCalled().times(2),

				"should do nothing": function() {
					counter.shouldEqual(1);
					specNumber++;
				},
				
				"should do nothing again": function() {
					counter.shouldEqual(2);
				}
			});
			this.context.failures.shouldEqual(0);
		},

		"should call an optional afterEach method after each spec": function() {
			var counter = 0;
			var specNumber = 0;
			this.describe("Class", {
				afterEach: function() {
					counter = specNumber + 1;
				}.shouldBeCalled().times(2),

				"should do nothing": function() {
					counter.shouldEqual(0);
					specNumber++;
				},
				
				"should do nothing again": function() {
					counter.shouldEqual(2);
				}
			});
			this.context.failures.shouldEqual(0);
		},
		
		"should not run a spec if there are specs marked active and it is not": function() {
			var called = false;
			this.describe("Class", {
				"should not get called": function() {
					called = true;
				},
				"should be active": function() {}.active()
			});
			called.shouldBeFalse();
		},

		"should run active specs": function() {
			var counter = 0;
			this.describe("Class", {
				"should not get called": function() {},
				"should be active": function() { counter++; }.active(),
				"should be active 2": function() { counter++; }.active()
			});
			counter.shouldEqual(2);
		},

		"should only keep track of active spec context statistics if provided": function() {
			this.describe("Class", {
				"should not get called": function() { "asdf".shouldEqual("qwer"); },
				"should be active": function() { "asdf".shouldEqual("qwer"); }.active(),
				"should be active 2": function() {}.active(),
				"should be pending": pending
			});
			this.context.examples.shouldEqual(2);
			this.context.pendings.shouldEqual(0);
			this.context.failures.shouldEqual(1);
		},
		
		"should use an optional builder method to generate specs": function() {
			this.describe("Class", {
				builder: function() {
					return {
						"should be tall": function() {},
						"should be wider than tall": function() {}
					};
				}
			});
			this.output.first().message.shouldEqual("- Class should be tall");
			this.output.last().message.shouldEqual("- Class should be wider than tall");
		},

		"should temporarily remove the deferral of model transaction preparation": function() {
			var projectModel = rio.Model.create("Project", {
				resource: "/projects"
			});
			stub(rio.models, "Project").withValue(projectModel);
			
			this.describe("Class", {
				"should call executeTransaction": function() {
					stub(projectModel, "executeTransaction").shouldBeCalled();
					projectModel.prepareTransaction();
				}
			});
			this.context.failures.shouldEqual(0);
		},

		"should mark new instances of existing models as __example": function() {
			var projectModel = rio.Model.create("Project", {});
			stub(rio.models, "Project").withValue(projectModel);

			var project;
			this.describe("Class", {
				"should do nothing": function() {
					project = new projectModel();
				}
			});
			project.__example.shouldBeTrue();
		},
		
		"should not mark new instances of new models as __example": function() {

			var project;
			this.describe("Class", {
				"should do nothing": function() {
					var projectModel = rio.Model.create("Project", {});
					stub(rio.models, "Project").withValue(projectModel);
					project = new projectModel();
				}
			});
			shouldBeUndefined(project.__example);
		},
		
		"for pending specs": {
			"should print results with className 'pending'": function() {
				this.describe("Class", {
					"should be implemented after I drink a beer": pending
				});
				this.output.first().message.shouldEqual("- Class should be implemented after I drink a beer");
				this.output.first().className.shouldEqual("pending");
			},
			
			"should increase the context examples counter": function() {
				this.describe("Class", {
					"should be implemented after I drink a beer": pending
				});
				this.context.examples.shouldEqual(1);
			},

			"should increase the context pendings counter": function() {
				this.describe("Class", {
					"should be implemented after I drink a beer": pending
				});
				this.context.pendings.shouldEqual(1);
			}
		},
		
		"for nested specs": {
			"should print results with a composite spec name": function() {
				this.describe("Class", {
					"with cheese": {
						"should do nothing": function() {}
					}
				});
				this.output.first().message.shouldEqual("- Class with cheese should do nothing");
			},
			
			"should call the before specs in outer-to-inner order": function() {
				var counter = 0;
				this.describe("Class", {
					beforeEach: function() {
						counter.shouldEqual(0);
						counter++;
					},
					
					"with cheese": {
						beforeEach: function() {
							counter.shouldEqual(1);
							counter++;
						},

						"should do nothing": function() {
							counter.shouldEqual(2);
						}
					}
				});
				this.context.failures.shouldEqual(0);
			},

			"should call the after specs in inner-to-outer order": function() {
				var counter = 0;
				this.describe("Class", {
					afterEach: function() {
						counter.shouldEqual(2);
					},
					
					"with cheese": {
						afterEach: function() {
							counter.shouldEqual(1);
							counter++;
						},

						"should do nothing": function() {
							counter.shouldEqual(0);
							counter++;
						}
					}
				});
				this.context.failures.shouldEqual(0);
			}
		},
		
		"should provide a fixture-backed server proxy": {
			beforeEach: function() {
				stub(rio, "models").withValue({});
				var projectModel = rio.Model.create("Project", {
					resource: "/projects",
					attrAccessors: ["id", "unit", "name"],
					methods: {
						parameters: function() { return ""; }
					}
				});
				
				stub(rio.models, "Project").withValue(projectModel);

				projectModel.setExamples({
					project1: {
						id: 1,
						unit: 3,
						name: "ABC"
					},

					project2: {
						id: 2,
						unit: 5,
						name: "DEF"
					},

					project3: {
						id: 3,
						unit: 5,
						name: "GHI"
					}
				});
			},
			
			"that feeds model.find": function() {
				var found;
				this.describe("Class", {
					"should find a Project": function() {
						found = rio.models.Project.find(1);
					}
				});
				found.getId().shouldEqual(1);
				found.getName().shouldEqual("ABC");
			},
			
			"that does not add anything to the identity cache": function() {
				this.describe("Class", {
					"should find a Project": function() {
						var found = rio.models.Project.find(2);
						(rio.models.Project.getFromCache(2) == found).shouldBeTrue();
					}
				});
				this.context.failures.shouldEqual(0);
				shouldBeUndefined(rio.models.Project.getFromCache(2));
			},
			
			"that feeds model.findAll": function() {
				var results;
				this.describe("Class", {
					"should find all Projects": function() {
						results = rio.models.Project.findAll({});
					}
				});
				results.length.shouldEqual(3);
				results[0].getId().shouldEqual(1);
				results[0].getName().shouldEqual("ABC");
				results[1].getId().shouldEqual(2);
				results[1].getName().shouldEqual("DEF");
				results[2].getId().shouldEqual(3);
				results[2].getName().shouldEqual("GHI");
			},
			
			"that feeds model.findAll and honors parameters": function() {
				var results;
				this.describe("Class", {
					"should find all Projects": function() {
						results = rio.models.Project.findAll({ parameters: { unit: 5 } });
					}
				});
				results.length.shouldEqual(2);
				results[0].getId().shouldEqual(2);
				results[0].getName().shouldEqual("DEF");
				results[1].getId().shouldEqual(3);
				results[1].getName().shouldEqual("GHI");
			},

			"that does not add anything to the collection entities": function() {
				this.describe("Class", {
					"should find a Project": function() {
						var found = rio.models.Project.findAll({});
						Object.values(rio.models.Project._collectionEntities).first().shouldEqual(found);
					}
				});
				this.context.failures.shouldEqual(0);
				Object.values(rio.models.Project._collectionEntities).shouldBeEmpty();
			},
			
			"that prevents synchronicity of finders from creating infinite loops in model initializers": function() {
				var thingModel = rio.Model.create("Thing", {
					resource: "/things",
					attrAccessors: ["id", "name"],
					methods: {
						initialize: function() {
							rio.models.Thing.findAll({
								onSuccess: function(results) {
									this.allThings = results;
								}.bind(this)
							});
						}
					}
				});
				stub(rio.models, "Thing").withValue(thingModel);

				thingModel.setExamples({
					thing1: {
						id: 1,
						name: "ABC"
					},

					thing2: {
						id: 2,
						name: "DEF"
					}
				});
				
				var thing;
				this.describe("Class", {
					"should not stack overflow": function() {
						preloadFixtures();

						thing = thingModel.find(1);
					}
				});
				this.context.failures.shouldEqual(0);
				thing.allThings.length.shouldEqual(2);
			},
			
			"that uses the identityCache to feed calls to model.example": function() {
				this.describe("Class", {
					"should feed identity cache": function() {
						(rio.models.Project.find(1) == rio.models.Project.example("project1")).shouldBeTrue();
						(rio.models.Project.example("project1") == rio.models.Project.example("project1")).shouldBeTrue();
					}
				});
				this.context.failures.shouldEqual(0);
			},
			
			"that be able to preloads the fixtures": function() {
				this.describe("Class", {
					"should preload": function() {
						preloadFixtures();

						rio.models.Project.getFromCache(rio.models.Project.id(1)).getName().shouldEqual("ABC");
						rio.models.Project.getFromCache(rio.models.Project.id(2)).getName().shouldEqual("DEF");
						rio.models.Project.getFromCache(rio.models.Project.id(3)).getName().shouldEqual("GHI");
					}
				});
				this.context.failures.shouldEqual(0);
			},

			"that reloads the fixtures between each spec": function() {
				this.describe("Class", {
					"should preload": function() {
						try {
							preloadFixtures();
						} catch(e) {
							rio.warn(e);
						}

						rio.models.Project.example("project1").setName("ASDF");
					},

					"should preload again": function() {
						preloadFixtures();

						rio.models.Project.example("project1").getName().shouldEqual("ABC");
					}
				});
				this.context.failures.shouldEqual(0);
			}
		}
	}
	
});



