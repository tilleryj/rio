rio.Spec = {
	executeSpec: function(spec, stdout, env, context, specPage, doEval) {
		try {
			var stubManager = new env.rio.StubManager();
			var mockManager = new env.rio.MockManager();
			
			var stub = function(obj, method) {
				return new env.rio.Stub(obj, method);
			};
			var stubs = [
				stub(env, "specPage").withValue(specPage),
				stub(env, "describe").withValue(
					env.rio.Spec.describe.curry(env.rio.Spec, stdout, [], [], context, env.specPage, stubManager, mockManager)
				),
				stub(env, "stub").withValue(stubManager.stub.bind(stubManager)),
				stub(env, "pending").withValue("PENDING"),
				stub(env, "fail").withValue(
					function(msg) {
						throw msg;
					}
				),
				stub(env, "insertComponent").withValue(
					env.specPage.addComponent.bind(env.specPage)
				),
				stub(env.Function.prototype, "active").withValue(
					function() {
						this._activeSpec = true;
						return this;
					}
				),
				stub(Function.prototype, "active").withValue(
					function() {
						this._activeSpec = true;
						return this;
					}
				),
				stub(env, "shouldBeDefined").withValue(
					function(val) {
						rio.Assertions.shouldNot(val == undefined, "expected '" + val + "' to be defined.");
					}
				),
				stub(env, "shouldBeUndefined").withValue(
					function(val) {
						rio.Assertions.should(val == undefined, "expected '" + val + "' to be undefined.");
					}
				),
				stub(env, "shouldEqual").withValue(
					function(val1, val2) {
						rio.Assertions.should(val1 == val2, "expected '" + val1 + "' to equal '" + val2 + "'");
					}
				),
				stub(env.rio, "mockManager").withValue(mockManager),
				stub(rio, "mockManager").withValue(mockManager)
			];

			var instrumentModel = function(model) {
				stubs.push(stub(model, "_idCache").withValue({}));
				stubs.push(stub(model, "_identityCache").withValue({}));
				stubs.push(stub(model, "_collectionEntities").withValue({}));
				stubs.push(stub(model, "_transaction").withValue([]));
				stubs.push(stub(model, "_transactionQueued").withValue(false));
				stubs.push(stub(model, "__transactionInProgress").withValue(false));
				stubs.push(stub(model, "prepareTransaction").withValue(function() {
					this.executeTransaction(rio.Undo.isProcessingUndo(), rio.Undo.isProcessingRedo());
				}.bind(model)));
				
				var newInitialize = model.prototype.initialize.wrap(function(proceed) {
					this.__example = true;
					proceed.apply(this, $A(arguments).slice(1));
				});
				stubs.push(stub(model.prototype, "initialize").withValue(newInitialize));
				
				var newExample = model.example.wrap(function(proceed, exampleName) {
					var json = this._examples[exampleName];
					if (json && this.id) {
						var id = json.id;
						var fromCache = this.getFromCache(this.id(id));
						if (fromCache) {
							return fromCache;
						}
					}
					return proceed.apply(this, $A(arguments).slice(1));
				});
				stubs.push(stub(model, "example").withValue(newExample))
			};
			for (modelName in env.rio.models) {
				instrumentModel(env.rio.models[modelName]);
			}
			stubs.push(stub(env, "instrumentModel").withValue(instrumentModel));
			
			var newRequest = env.Ajax.Request.prototype.request.wrap(function(proceed, url) {
				var resourceUrl = url.match(/^(\/[^\/]*).*$/)[1];
				var model = Object.values(env.rio.models).detect(function(m) {
					return m.url && (m.url() == resourceUrl);
				});
				
				if (model) {
					if (this.options.method == "delete") {
						this.options.onSuccess({});
						return;
					}
					if (this.options.method == "put") {
						return;
					}

					var id = url.match(/^\/[^\/]*\/(.*)$/);
					
					var jsonFromParams = function(json) {
						if (env.rio.environment.includeRootInJson) {
							var newJSON = {};
							newJSON[model.NAME.underscore()] = json;
							json = newJSON;
						}
						return json;
					};
					
					var json;
					if (id) {
						if (!id[1].isNumeric()) {
							return;
						}
						id = id[1];
						var foundName = Object.keys(model._examples).detect(function(exampleName) {
							var exampleJson = model._examples[exampleName];
							return exampleJson.id == id;
						});
						if (!foundName) {
							(this.options.onFailure || Prototype.emptyFunction)();
							return;
						}
						json = jsonFromParams(model.exampleParams(foundName));
					} else if (this.options.method == "get") {
						var parameters = this.options.parameters.conditions.evalJSON();
						
						json = Object.keys(model._examples).select(function(exampleName) {
							var exampleJson = model.exampleParams(exampleName);
							
							return Object.keys(parameters).all(function(parameter) {
								var val = parameters[parameter];
								var jsonVal = exampleJson[parameter.underscore()] || exampleJson[parameter.camelize()];
								if (val && val.not) {
									return jsonVal != val.not;
								} else {
									return jsonVal == val;
								}
							});
							
						}).map(function(exampleName) {
							var exampleJson = model.exampleParams(exampleName);
							var exampleId = exampleJson.id;

							return jsonFromParams(exampleJson);
						});
					} else {
						/*
							This is a very limited handling of 'POST' requests.

							-It doesn't handle transactions
							-It has no tests
						*/
						var newId = Object.values(model._identityCache).min() - 1;
						newId = isNaN(newId) ? -1 : newId;
						json = jsonFromParams({ id: newId });
					}
					this.options.onSuccess({ responseJSON: json, status: 200 });
				} else {
					return proceed(url);
				}
			});
			stubs.push(stub(env.Ajax.Request.prototype, "request").withValue(newRequest));
			
			stubs.push(stub(env, "preloadFixtures").withValue(function() {
				var callbackQueue = [];
				var requestStubMethod = env.Ajax.Request.prototype.request.wrap(function(proceed) {
					var oldOnSuccess = this.options.onSuccess;
					this.options.onSuccess = function() {
						var successArgs = arguments;
						callbackQueue.push(function() {
							oldOnSuccess.apply(this, successArgs);
						});
					};
					return proceed.apply(this, $A(arguments).slice(1));
				});
				var requestStub = stub(Ajax.Request.prototype, "request").withValue(requestStubMethod);
				for (modelName in env.rio.models) {
					var model = env.rio.models[modelName];
					Object.keys(model._examples).each(function(exampleName) {
						model.example(exampleName);
					});
				}
				callbackQueue.each(function(callback) { callback(); });
				requestStub.release();
			}));
			
			stubs.push(stub(env, "render").withValue(function(page) {
				env.rio.app.clearPage();
				env.Element.body().insert(page.html());
				page.render();
				env.rio.app.setCurrentPage(page);
			}));
			
			doEval(spec);
		} catch(e) {
			stdout(e, "warningLogItem");
			// Ignore spec parsing errors. 
		} finally {
			stubs.invoke("release");
		}
	},
	
	describe: function(that, stdout, befores, afters, context, specPage, stubManager, mockManager, cls, content) {
		try {
			var findActiveSpec = function(desc) {
				var activeSpec;
				Object.keys(desc).each(function(k) {
					var v = desc[k];
					if (v == "PENDING") { return; }
					var vActiveSpec = (v._activeSpec && k) || (!Object.isFunction(v) && findActiveSpec(v));
					if (vActiveSpec) {
						activeSpec = vActiveSpec;
					}
				});
				return activeSpec;
			};
			var activeSpec = findActiveSpec(content);
			if (activeSpec) {
				
				var removeNonActiveSpecs = function(desc) {
					Object.keys(desc).each(function(k) {
						var v = desc[k];
						if (v == "PENDING") {
							delete desc[k];
						} else if (Object.isFunction(v)) {
							if (!v._activeSpec && !(k == "beforeEach" || k == "afterEach")) {
								delete desc[k];
							}
						} else {
							removeNonActiveSpecs(v);
						}
					});
				};
				
				removeNonActiveSpecs(content);
			}
		} catch(e) {
			stdout(e, "warningLogItem");
		}
		
		befores = befores.clone();
		if (content.beforeEach) {
			befores.push(content.beforeEach);
		}
		afters = afters.clone();
		if (content.afterEach) {
			afters.unshift(content.afterEach);
		}
		
		if (content.builder) {
			var extraSpecs = content.builder();
			for (extraSpecName in extraSpecs) {
				content[extraSpecName] = extraSpecs[extraSpecName];
			}
		}
		
		Object.keys(content).without("beforeEach").without("afterEach").without("builder").each(function(k) {
			var specName = cls.toString() + " " + k;
			arg = content[k];
			
			
			if (Object.isFunction(content[k]) || content[k].constructor == Function) {
				var specRun = new Object();
				
				(function() {
					try {
						// =============================================================
						// = BEGIN TEST OVERRIDES TO ACCOUNT FOR DEFER NON-DETERMINISM =
						// =============================================================
						stub(rio.Undo, "_doAfterAction").andDo(function() { rio.Undo.afterAction() });
						// =============================================================
						// = END TEST OVERRIDES TO ACCOUNT FOR DEFER NON-DETERMINISM   =
						// =============================================================
						context.examples++;
						
						for (modelName in rio.models) {
							var model = rio.models[modelName];
							model._idCache = {};
							model._identityCache = {};
							model._collectionEntities = {};
							model._transaction = [];
							model._transactionQueued = false;
							model.__transactionInProgress = false;
						}
						
						// preloadFixtures();
						befores.each(function(beforeEach) { beforeEach.bind(this)() }.bind(this));
						content[k].bind(this)();
						mockManager.verifyAll();
						stdout("- " + specName, "passed");
					} catch(e) {
						context.failures++;
						stdout("- " + specName + "\n" + " - (" + (e.message || e) + ") " + (e.detail || ""), "failed");
					} finally {
						try {
							for (var i=0; i<afters.length; i++) {
								var afterEach = afters[i];
								afterEach.bind(this)();
							}
						} finally {
							try {
								mockManager.releaseAll();
								stubManager.releaseAll();
							} catch(e) {
								stdout("Failed to release mocks and stubs", "warningLogItem");
							} finally {
								specPage.reset();
							}
						}
					}
				}.bind(specRun))();
			} else if (Object.isString(content[k]) && content[k] == "PENDING") {
				stdout("- " + specName, "pending");
				context.examples++;
				context.pendings++;
			} else {
				that.describe(that, stdout, befores, afters, context, specPage, stubManager, mockManager, specName, content[k]);
			}
		});
	},

	toString: function() { return "Spec"; }
};

rio.Assertions = {
	shouldEqual: function(val) {
		this.should(val == this, "expected '" + val + "', got '" + this + "'");
	},

	shouldNotEqual: function(val) {
		this.should(val != this, "expected not '" + val + "', got '" + this + "'");
	},
	
	shouldBeTrue: function() {
		var truthy = this.valueOf() ? true : false;
		this.should(truthy, "expected: 'true', got '" + this + "'");
	},

	shouldNotBeTrue: function() {
		var truthy = this.valueOf() ? true : false;
		this.shouldNot(truthy, "expected: 'false', got '" + this + "'");
	},
	
	shouldBeFalse: function() {
		this.shouldNotBeTrue();
	},
	
	should: function(result, msg) {
		if (!result) {
			throw msg;
		};
	},
	
	shouldNot: function(result, msg) {
		if (result) {
			throw msg;
		};
	}
};

Object.extend(rio.Id.prototype, rio.Assertions);
Object.extend(rio.Binding, rio.Assertions);

Object.extend(String.prototype, rio.Assertions);
Object.extend(Boolean.prototype, rio.Assertions);
Object.extend(Number.prototype, rio.Assertions);
Object.extend(Function.prototype, rio.Assertions);
Object.extend(Array.prototype, rio.Assertions);

Object.extend(String.prototype, {
	shouldStartWith: function(val) {
		this.should(this.startsWith(val), "expected '" + this + "' to start with '" + val + "'")
	},

	shouldMatch: function(val) {
		this.should(this.match(val), "expected '" + this + "' to match '" + val + "'");
	}
});

Object.extend(Function.prototype, {
	shouldBeCalled: function() {
		var count = 0;
		var wrapped = this.wrap(function(proceed) {
			count++;
			return proceed.apply(this, $A(arguments).slice(1));
		});
		wrapped.expectation = function() {
			return count > 0;
		};
		var expectation = function() {
			return wrapped.expectation();
		};

		var original = this;
		expectation.message = "\n\n" + original.toString() + "\n\n# should be called";
		wrapped.times = function(times) {
			wrapped.expectation = function() {
				return count == times;
			};
			expectation.message = "\n\n" + original.toString() + "\n\n# should be called " + times + " times.";
			return wrapped;
		};
		wrapped.once = wrapped.times.curry(1);
		rio.mockManager.expect(expectation);
		return wrapped;
	},

	shouldNotBeCalled: function() {
		var wrapped = this.wrap(function(proceed) {
			wrapped._called = true;
			proceed.apply(this, $A(arguments).slice(1));
		});
		var expectation = function() {
			return !wrapped._called;
		};
		expectation.message = "\n\n" + this.toString() + "\n\n# should not be called";
		rio.mockManager.expect(expectation);
		return wrapped;
	}
});

Object.extend(Array.prototype, {
	shouldEqual: function(val) {
		var equal = true;
		if (val.size != undefined && val.length == this.length) {
			for (var i = 0; i < this.length; i++) {
				equal = equal && this[i] == val[i];
			}
		} else {
			equal = false;
		}
		this.should(equal, "expected '" + val + "', got '" + this + "'");
	},
	
	shouldInclude: function(val) {
		this.should(this.include(val), "expected " + this + " to include " + val);
	},
	
	shouldNotInclude: function(val) {
		this.shouldNot(this.include(val), "expected " + this + " not to include " + val);
	},
	
	shouldBeEmpty: function() {
		this.should(this.empty(), "expected " + this + " to be empty");
	},

	shouldNotBeEmpty: function() {
		this.shouldNot(this.empty(), "expected " + this + " to not be empty");
	}
});

rio.Stub = Class.create({
	initialize: function(object, method) {
		this.object = object;
		this.method = method;
		this.oldMethod = this.object[this.method];
		
		this.object[this.method] = function() {};
	},

	release: function() {
		if (this.oldMethod == undefined) {
			delete this.object[this.method];
		} else {
			this.object[this.method] = this.oldMethod;
		}
	},

	andReturn: function(value) {
		this.value = value;
		this.object[this.method] = function() {
			return value;
		}
	},

	andDo: function(func) {
		this.andDo = func;
		this.object[this.method] = function() {
			return func.apply(this, arguments);
		}
	},
	
	withValue: function(value) {
		this.object[this.method] = value;
		return this;
	},

	shouldBeCalled: function() {
		this.andDo(function() {}.shouldBeCalled());
	},

	shouldNotBeCalled: function() {
		this.andDo(function() {}.shouldNotBeCalled());
	}
});

rio.StubManager = Class.create({
	initialize: function() {
		this.stubs = [];
	},

	releaseAll: function() {
		for (var i=0; i<this.stubs.length; i++) {
			var stub = this.stubs[i];
			stub.release();
		}
		this.stubs.clear();
	},

	stub: function(obj, method) {
		var stub = new rio.Stub(obj, method);
		this.stubs.unshift(stub);
		return stub;
	}
});

rio.MockManager = Class.create({
	initialize: function() {
		this.expectations = [];
	},
	expect: function(expectation) {
		this.expectations.push(expectation);
	},
	verifyAll: function() {
		this.expectations.each(function(expectation) {
			if (!expectation()) {
				throw({
					message: "expectation failed",
					detail: expectation.message
				});
			}
		});
	},
	releaseAll: function() {
		this.expectations.clear();
	}
});
