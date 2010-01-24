/* Test coverage up to about half-way through the save method */
describe(rio.Model, {
	beforeEach: function() {
		this.model = rio.Model.create("SomeModel", {
			attrAccessors: ["id", "name"]
		});
		this.buildResponse = function(json) {
			return rio.environment.includeRootInJson ? { some_test_model: json } : json;
		};
	},
	
	"should keep a reference to itself in it's instances": function() {
		(this.model == new this.model().__model).shouldBeTrue();
	},
	
	"should return false for hasChannel": function() {
		this.model.hasChannel().shouldBeFalse();
	},
	
	"with a backing resource": {
		beforeEach: function() {
			stub(rio.push, "addChannel");
	
			this.model = rio.Model.create("SomeModel", {
				resource: "/resource_url",
				undoEnabled: true,
				attrReaders: ["readOnly"],
				attrAccessors: ["projectId", "clientOnly"],
				clientOnlyAttrs: ["clientOnly"],
				channel: true,
				methods: {
				}
			});
			this.model.prepareTransaction = function() {
				this.executeTransaction(rio.Undo.isProcessingUndo(), rio.Undo.isProcessingRedo());
			};
			stub(rio.models, "SomeModel").withValue(this.model);
		},
	
		"should be new before saving": function() {
			var modelInstance = new this.model();
			modelInstance.isNew().shouldBeTrue();
		},
		
		"should not be new after saving": function() {
			var response = rio.environment.includeRootInJson ? { resource: { id: 1, projectId: 1 } } : { id: 1, projectId: 1 };
			stub(Ajax, "Request").andDo(function(url, options) {
				options.onSuccess({
					responseJSON: response
				});
			});
			var modelInstance = new this.model();
			modelInstance.save();
			modelInstance.isNew().shouldBeFalse();
		},
		
		"should start with an id attrAccessor": function() {
			var modelInstance = new this.model({ id: 3 });
			modelInstance.getId().shouldEqual(3);
			modelInstance.setId(1);
			modelInstance.getId().shouldEqual(1);
			modelInstance.id.constructor.shouldEqual(rio.Binding);
		},
		
		"should be initialized with an unreified id if not provided": function() {
			var modelInstance = new this.model();
			shouldBeDefined(modelInstance.getId());
			modelInstance.getId().temporary().shouldBeTrue();
		},

		"should not be new if initialized with an id": function() {
			var modelInstance = new this.model({ id: 1 });
			modelInstance.isNew().shouldBeFalse();
		},
	
		"should be given an id object from the idCache if initialized with an id": function() {
			var modelInstance = new this.model({ id: 1 });
			modelInstance.getId().constructor.shouldEqual(rio.Id);
			
			this.model.id(1).shouldEqual(modelInstance.getId());
		},
		
		"should not create an id in the idCache when asking for an id": function() {
			this.model.id(14);
			shouldBeUndefined(this.model.id(14));
		},
	
		"should create an id in the idCache when asking for an id and telling it to create if not found": function() {
			var id = this.model.id(14, true);
			this.model.id(14).shouldEqual(id);
		},
		
		"should expose an undoEnabled flag that is false by default": function() {
			var model = rio.Model.create("SomeModel", {
				resource: "/resource_url"
			});
			model.undoEnabled.shouldBeFalse();
		},
	
		"should expose an undoEnabled flag that can be configured to true": function() {
			var model = rio.Model.create("SomeModel", {
				resource: "/resource_url",
				undoEnabled: true
			});
			model.undoEnabled.shouldBeTrue();
		},
		
		"should warn if reifying an id twice": function() {
			stub(rio, "warn").andDo(function() {}.shouldBeCalled());
			var id = this.model.id(14, true);
			this.model.reifyId(id, 14);
		},
		
		"should have an url that matches the models url plus its id": function() {
			var modelInstance = new this.model({ id: 1 });
			modelInstance.url().shouldEqual("/resource_url/1");
		},
		
		"should immediately set the __destroying flag when an entity is destroyed": function() {
			stub(this.model, "prepareTransaction");
			var modelInstance = new this.model({ id: 4 });
			shouldBeUndefined(modelInstance.__destroying);
			modelInstance.destroy();
			modelInstance.__destroying.shouldBeTrue();
		},
		
		"should not attempt to persist an entity that is being destroyed": function() {
			var modelInstance = new this.model();
			modelInstance.__destroying = true;
			stub(Ajax, "Request").andDo(function(url, options) {
				fail("incorrectly attempted to persist");
			});
			modelInstance.save();
		},
		
		"should execute the onSuccess function after a successful Ajax update": function() {
			var modelInstance = new this.model({ id: 1 });
			stub(Ajax, "Request").andDo(function(url, options) {
				options.onSuccess({});
			}.shouldBeCalled());
			modelInstance.save({ onSuccess: function(entity) {
				(entity == modelInstance).shouldBeTrue();
			}.shouldBeCalled() });
		},		
		
		"should execute the onFailure function after a failed Ajax update": function() {
			var modelInstance = new this.model({ id: 1 });
			stub(Ajax, "Request").andDo(function(url, options) {
				options.onFailure();
			}.shouldBeCalled());
			modelInstance.save({ onFailure: function() {}.shouldBeCalled() });
		},
		
		"should perform an Ajax put on update": function() {
			var modelInstance = new this.model({ id: 1 });
			stub(Ajax, "Request").andDo(function(url, options) {
				options.method.shouldEqual("put");
			}.shouldBeCalled());
			modelInstance.save();
		},
		
		"should put updates to the entity url": function() {
			var modelInstance = new this.model({ id: 1 });
			stub(Ajax, "Request").andDo(function(url, options) {
				url.shouldEqual(modelInstance.url());
			}.shouldBeCalled());
			modelInstance.save();
		},
		
		"should allow you to access an entity in the identity cache before the id has been reified": function() {
			var id = this.model.id();
			var modelInstance = new this.model({ id: id });
			(this.model.getFromCache(id) == modelInstance).shouldBeTrue();
		},
		
		"should allow you to access an entity in the identity cache after the id has been reified": function() {
			var id = this.model.id();
			var modelInstance = new this.model({ id: id });
			this.model.reifyId(id, 17);
			(id == this.model.id(17)).shouldBeTrue();
			(this.model.getFromCache(id) == modelInstance).shouldBeTrue();
		},
		
		"should return undefined if you try to get the entity from the identity cache with id undefined": function() {
			shouldBeUndefined(this.model.getFromCache());
		},
		
		"should not attempt to destroy an entity twice": function() {
			stub(Ajax, "Request").andDo(function(url, options) {
				options.method.shouldEqual("delete");
			}.shouldBeCalled().once());
			var modelInstance = new this.model({ id: 3 });
			modelInstance.destroy();
			modelInstance.destroy();
		},
		
		"should call the beforeDestroy method before destroying the entity": function() {
			var val = 1;
			stub(Ajax, "Request").andDo(function() {
				val = 2;
			});
			var modelInstance = new this.model({ id: 3 });
			modelInstance.beforeDestroy = function() {
				val.shouldEqual(1);
			}.shouldBeCalled();
			modelInstance.destroy();
		},
		
		"should provide a destroy event that is fired after destroying": function() {
			stub(Ajax, "Request");
			var modelInstance = new this.model({ id: 3 });
			modelInstance.observe("destroy", function() {}.shouldBeCalled());
			modelInstance.destroy();
		},
		
		"should perform an Ajax delete on destroy": function() {
			var modelInstance = new this.model({ id: 1 });
			stub(Ajax, "Request").andDo(function(url, options) {
				options.method.shouldEqual("delete");
			}.shouldBeCalled());
			modelInstance.destroy();
		},
		
		"should delete to the entity url": function() {
			var modelInstance = new this.model({ id: 1 });
			stub(Ajax, "Request").andDo(function(url, options) {
				url.shouldEqual(modelInstance.url());
			}.shouldBeCalled());
			modelInstance.destroy();
		},
		
		"should remove an entity from the identity cache on destroy": function() {
			stub(Ajax, "Request");
			var modelInstance = new this.model({ id: 1 });
			(this.model.getFromCache(1) == modelInstance).shouldBeTrue();
			modelInstance.destroy();
			(this.model.getFromCache(1) == undefined).shouldBeTrue();
		},
		
		"should remove an entity from the collection entities on destroy": function() {
			var collectionEntity = rio.CollectionEntity.create({
				model: this.model,
				values: [],
				condition: function(e) { return e.getProjectId() == 72; }
			});
			this.model.putCollectionEntity(this.model.url() + "#{project_id: 72}", collectionEntity);
			
			var modelInstance = new this.model({ id: 1, projectId: 72 });
			(collectionEntity.first() == modelInstance).shouldBeTrue();
			
			stub(Ajax, "Request").andDo(function(url, options) {
				options.onSuccess({});
			});
			
			modelInstance.destroy();
			
			collectionEntity.shouldBeEmpty();
		},
		
		"should call the passed in onSuccess method on destroy": function() {
			var modelInstance = new this.model({ id: 1 });
			
			stub(Ajax, "Request").andDo(function(url, options) {
				options.onSuccess({});
			});
			
			modelInstance.destroy({ onSuccess: function() {}.shouldBeCalled() });
		},
		
		"should provide an attribute state method that returns a hash of the persistable attribute values": function() {
			var modelInstance = new this.model({ id: 1, projectId: 2, clientOnly: 3, readOnly: 4 });
			(modelInstance.attributeState().id == undefined).shouldBeTrue();
			modelInstance.attributeState().projectId.shouldEqual(2);
			(modelInstance.attributeState().clientOnly == undefined).shouldBeTrue();
			(modelInstance.attributeState().readOnly == undefined).shouldBeTrue();
		},
		
		"should provide an attributeStateChange methods that returns a hash of the changed persistable attribute values": function() {
			var modelInstance = new this.model({ id: 1, projectId: 2, clientOnly: 3, readOnly: 4 });
			stub(this.model, "prepareTransaction");

			
			Object.keys(modelInstance.attributeStateChange()).shouldNotInclude("projectId");

			modelInstance.setId(6);
			modelInstance.setProjectId(4);
			modelInstance.setClientOnly(7);
			
			modelInstance.attributeStateChange().projectId.shouldEqual(4);
			shouldBeUndefined(modelInstance.attributeStateChange().id);
			shouldBeUndefined(modelInstance.attributeStateChange().clientOnly);
			shouldBeUndefined(modelInstance.attributeStateChange().readOnly);
		},
		
		"should initialize the entity's last saved state when an id is provided": function() {
			var modelInstance = new this.model({ id: 1, projectId: 2, clientOnly: 3, readOnly: 4 });
			modelInstance._lastSavedState.projectId.shouldEqual(2);
		},
		
		"should not initialize the entity's last saved state when an id is provided": function() {
			var modelInstance = new this.model({ projectId: 2, clientOnly: 3, readOnly: 4 });
			(modelInstance._lastSavedState == undefined).shouldBeTrue();
		},
		
		"should be able to remove from caches": function() {
			var all = this.model.findAll();
			var modelInstance = new this.model({ id: 1, projectId: 2, clientOnly: 3, readOnly: 4 });
			(this.model.getFromCache(1) == modelInstance).shouldBeTrue();
			all.shouldInclude(modelInstance);
			
			modelInstance.removeFromCaches();
			shouldBeUndefined(this.model.getFromCache(1));
			all.shouldNotInclude(modelInstance);
		},
		
		"and a channel": {
			beforeEach: function() {
				
			},
			
			"should return true for hasChannel": function() {
				this.model.hasChannel().shouldBeTrue();
			},
			
			"should have a channel name of ModelName.id": function() {
				var modelInstance = new this.model({ id: 1 });
				modelInstance.channelName().shouldEqual("SomeModel.1");
			},
			
			"should subscribe to a channel when the id is specified": function() {
				stub(rio.push, "addChannel").withValue(function(channel) {
					channel.shouldEqual("SomeModel.1");
				}.shouldBeCalled());
	
				new this.model({ id: 1 });
			},
			
			"should not subscribe to a channel for an entity with a temporary id until after reification": function() {
				var id = this.model.id();
				stub(rio.push, "addChannel").shouldNotBeCalled();

				var modelInstance = new this.model({ id: id });
				
				stub(rio.push, "addChannel").withValue(function(channel) {
					channel.shouldEqual("SomeModel.1");
				}.shouldBeCalled());
				id.reify(1);
			}
			/* TODO: Add specs for the broadcast and receive broadcast methods */
		},
		
		"should facilitate undo and redo": {
			beforeEach: function() {
				stub(Ajax, "Request");
				this.oldQueue = rio.Undo._queue;
				rio.Undo.setQueue(new rio.UndoQueue());
			},
	
			"by registering an undo function that rolls back a change": function() {
				var modelInstance = new this.model({ id: 1, projectId: 2, clientOnly: 3, readOnly: 4 });
				modelInstance.setProjectId(5);
				rio.Undo.undo();
				modelInstance.getProjectId().shouldEqual(2);
			},
	
			"by registering a redo function after an undo": function() {
				var modelInstance = new this.model({ id: 1, projectId: 2, clientOnly: 3, readOnly: 4 });
				modelInstance.setProjectId(5);
				modelInstance.getProjectId().shouldEqual(5);
	
				/* Manually remove the last transaction since we are stubbing the AJAX interactions */
				this.model.__queuedTransactions.pop();
				this.model.__transactionInProgress = false;
				
				rio.Undo.undo();
				modelInstance.getProjectId().shouldEqual(2);
				rio.Undo.redo();
				modelInstance.getProjectId().shouldEqual(5);
			},
			
			"by not registering an undo function for a non undoEnabled model": function() {
				this.model.undoEnabled = false;
				var modelInstance = new this.model({ id: 1, projectId: 2, clientOnly: 3, readOnly: 4 });
				modelInstance.setProjectId(5);
				rio.Undo.undo();
				modelInstance.getProjectId().shouldEqual(5);
			},
			
			"by registering an undo function that will destroy a created entity": function() {
				var modelInstance = this.model.create({ id: this.model.id(), projectId: 2, clientOnly: 3, readOnly: 4 });
				stub(modelInstance, "destroy").andDo(function() {}.shouldBeCalled());
				rio.Undo.undo();
			},
	
			"by registering a redo function that will re-destroy an undone destroy": function() {
				var modelInstance = new this.model({ id: 1, projectId: 2, clientOnly: 3, readOnly: 4 });
				modelInstance.destroy();
				
				/* Manually remove the last transaction since we are stubbing the AJAX interactions */
				this.model.__queuedTransactions.pop();
				this.model.__transactionInProgress = false;
				
				rio.Undo.undo();
				
				/* Manually remove the last transaction since we are stubbing the AJAX interactions */
				this.model.__queuedTransactions.pop();
				this.model.__transactionInProgress = false;
				
				/* Need to get the new instance from the cache to add the destroy expectation */
				var newModelInstance = this.model.getFromCache(1);
				
				stub(newModelInstance, "destroy").andDo(function() {}.shouldBeCalled());
				rio.Undo.redo();
			},
			
			"by being able to undo changes to something that was destroyed and then un-destroyed": function() {
				var modelInstance = new this.model({ id: 1, projectId: 2, clientOnly: 3, readOnly: 4 });
				
				modelInstance.setProjectId(7);
				
				/* Manually remove the last transaction since we are stubbing the AJAX interactions */
				this.model.__queuedTransactions.pop();
				this.model.__transactionInProgress = false;
				
				modelInstance.destroy();
	
				/* Manually remove the last transaction since we are stubbing the AJAX interactions */
				this.model.__queuedTransactions.pop();
				this.model.__transactionInProgress = false;
	
				rio.Undo.undo();
				
				/* Manually remove the last transaction since we are stubbing the AJAX interactions */
				this.model.__queuedTransactions.pop();
				this.model.__transactionInProgress = false;
	
				var newInstance = this.model.getFromCache(1);
				newInstance.getProjectId().shouldEqual(7);
				
				rio.Undo.undo();
				
				newInstance.getProjectId().shouldEqual(2);
			},
			
			"by registering an undo function that will create a destroyed entity": function() {
				var modelInstance = this.model.create({ id: this.model.id(), projectId: 2, clientOnly: 3, readOnly: 4 });
				var id = modelInstance.getId();
				/* Manually remove the last transaction since we are stubbing the AJAX interactions */
				this.model.__queuedTransactions.pop();
				this.model.__transactionInProgress = false;
				
				rio.Undo.undo();
	
				/* Manually remove the last transaction since we are stubbing the AJAX interactions */
				this.model.__queuedTransactions.pop();
				this.model.__transactionInProgress = false;
	
				(this.model.getFromCache(id) == undefined).shouldBeTrue();
				
				rio.Undo.redo();
				
				var newModelInstance = this.model.getFromCache(id);
				(newModelInstance != modelInstance).shouldBeTrue();
				newModelInstance.getId().shouldEqual(id);
				newModelInstance.getProjectId().shouldEqual(2);
			},
	
			"by registering a redo function that will re-create an un-created entity": function() {
				var modelInstance = new this.model({ id: 1, projectId: 2, clientOnly: 3, readOnly: 4 });
				modelInstance.destroy();
				
				/* Manually remove the last transaction since we are stubbing the AJAX interactions */
				this.model.__queuedTransactions.pop();
				this.model.__transactionInProgress = false;
				
				rio.Undo.undo();
				
				var newModelInstance = this.model.getFromCache(1);
				(newModelInstance != modelInstance).shouldBeTrue();
				newModelInstance.getId().shouldEqual(1);
				newModelInstance.getProjectId().shouldEqual(2);
			},
			
			afterEach: function() {
				rio.Undo.setQueue(this.oldQueue);
			}
		},
	
		/* 
		
		THIS FUNCTIONALITY IS NO LONGER SUPPORTED
		
		"should bundle updates with a delay of 250 milliseconds": function() {
			/DelayedTask needs to be overriden to prevent this test from failing asynchronously/
			var modelInstance = new this.model({ id: 1, projectId: this.projectId });
			var oldDelayedTask = rio.DelayedTask;
			try {
				rio.DelayedTask = Class.create({
					delay: function(timeout, fcn) {
						timeout.shouldEqual(250);
					}.shouldBeCalled().times(2)
				});
				modelInstance.save();
				modelInstance.save();
			} finally {
				rio.DelayedTask = oldDelayedTask;
			}
		},
	
		"should bundle updates with a customizable delay": function() {
			/DelayedTask needs to be overriden to prevent this test from failing asynchronously/
			var modelInstance = new this.model({ id: 1, projectId: this.projectId });
			var oldDelayedTask = rio.DelayedTask;
			try {
				var delaySave = 500;
				rio.DelayedTask = Class.create({
					delay: function(timeout, fcn) {
						timeout.shouldEqual(delaySave);
					}.shouldBeCalled().times(2)
				});
				modelInstance.save({ delaySave: delaySave });
				modelInstance.save({ delaySave: delaySave });
			} finally {
				rio.DelayedTask = oldDelayedTask;
			}
		},
		*/
		
		"should use the correct AJAX parameters on save": function() {
			this.model.prepareTransaction = Prototype.emptyFunction;

			var modelInstance = new this.model({ projectId: 10 });
			
			stub(Ajax, "Request").andDo(function(url, options) {
				options.parameters["resource_url[project_id]"].shouldEqual(10);
			}.shouldBeCalled());
			
			modelInstance.save();
			
			this.model.executeTransaction();
		},

		"should use overriden AJAX parameters on save": function() {
			this.model.prepareTransaction = Prototype.emptyFunction;

			var modelInstance = new this.model({ projectId: 10 });
			
			modelInstance.parameters = function() {
				return {
					hello: "world"
				};
			};
			
			stub(Ajax, "Request").andDo(function(url, options) {
				shouldBeUndefined(options.parameters["resource_url[project_id]"]);
				
				options.parameters.hello.shouldEqual("world");
			}.shouldBeCalled());
			
			modelInstance.save();
			
			this.model.executeTransaction();
		},

		"should use only the changed AJAX parameters on an update": function() {
			this.model.prepareTransaction = Prototype.emptyFunction;
			
			var modelInstance = new this.model({ id: 1, projectId: 10, hello: "world" });

			modelInstance.setProjectId(4);
			stub(Ajax, "Request").andDo(function(url, options) {
				options.parameters["resource_url[project_id]"].shouldEqual(4);
			}.shouldBeCalled());
			
			modelInstance.save();
			
			this.model.executeTransaction();
		},

		"should not use unchanged AJAX parameters on an update": function() {
			this.model.prepareTransaction = Prototype.emptyFunction;
			
			var modelInstance = new this.model({ id: 1, projectId: 10, hello: "world" });

			stub(Ajax, "Request").andDo(function(url, options) {
				Object.keys(options.parameters).shouldNotInclude("resource_url[project_id]");
			}.shouldBeCalled());
			
			modelInstance.save();
			
			this.model.executeTransaction();
		},

		"should use the correct AJAX parameters on save even if the entity is updated before the transaction is executed": function() {
			this.model.prepareTransaction = Prototype.emptyFunction;

			var modelInstance = new this.model({ projectId: 10 });
			
			stub(Ajax, "Request").andDo(function(url, options) {
				options.parameters["resource_url[project_id]"].shouldEqual(10);
			}.shouldBeCalled());
			
			modelInstance.save();
			
			var doExecuteTransaction = this.model._doExecuteTransaction;
			this.model._doExecuteTransaction = function(transaction) {
				doExecuteTransaction = doExecuteTransaction.curry(transaction);
			};
			this.model.executeTransaction();

		 	modelInstance.setProjectId(5); 

			doExecuteTransaction();
		},
		
		"should provide a default parameters object": {
			beforeEach: function() {
				this.model = rio.Model.create("SomeModel", {
					resource: "/big_projects",
					undoEnabled: true,
					attrReaders: ["readOnly"],
					attrAccessors: ["id", "projectId", "name", "clientOnly"],
					clientOnlyAttrs: ["clientOnly"]
				});
				this.modelInstance = new this.model({ id: 1, projectId: 2, name: "Awesome", clientOnly: 3, readOnly: 4 });
			},
	
			"that should include all of non-id, non-clientOnly attrAccessors that are updated": function() {
				shouldBeUndefined(this.modelInstance.parameters()["big_project[project_id]"]);
				shouldBeUndefined(this.modelInstance.parameters()["big_project[name]"]);

				stub(this.model, "prepareTransaction");

				this.modelInstance.setProjectId(12);
				this.modelInstance.parameters()["big_project[project_id]"].shouldEqual(12);
				shouldBeUndefined(this.modelInstance.parameters()["big_project[name]"]);

				this.modelInstance.setName("Hello");
				this.modelInstance.parameters()["big_project[name]"].shouldEqual("Hello");
			},
	
			"that should not include attrReaders": function() {
				shouldBeUndefined(this.modelInstance.parameters()["big_project[read_only]"]);
			},
	
			"that should not include clientOnlyAttrs": function() {
				shouldBeUndefined(this.modelInstance.parameters()["big_project[client_only]"]);
			},
	
			"that should not include id": function() {
				shouldBeUndefined(this.modelInstance.parameters()["big_project[id]"]);
			}
		},
	
		"should not save if the model provides a valid function and it returns false": function() {
			var modelInstance = new this.model({ projectId: this.projectId });
			modelInstance.valid = function() { return false; };
	
			stub(Ajax, "Request").shouldNotBeCalled();
			
			modelInstance.save();
		},
	
		"should save if the model provides a valid function and it returns true": function() {
			var modelInstance = new this.model({ projectId: this.projectId });
			modelInstance.valid = function() { return true; };
	
			stub(Ajax, "Request").shouldBeCalled();
			
			modelInstance.save();
		},
	
		"should provide an authenticity token on save": function() {
			var modelInstance = new this.model({ projectId: this.projectId });
			
			stub(Ajax, "Request").andDo(function(url, options) {
				options.parameters.authenticity_token.shouldEqual(rio.environment.railsToken);
			}.shouldBeCalled());
			
			modelInstance.save();
		},
		
		"should provide the transaction key on save": function() {
			var modelInstance = new this.model({ projectId: this.projectId });
			
			stub(Ajax, "Request").andDo(function(url, options) {
				options.parameters.transaction_key.shouldEqual(rio.environment.transactionKey);
			}.shouldBeCalled());
			
			modelInstance.save();
		},
	
		"should allow you to override parameters on save": function() {
			var modelInstance = new this.model({ projectId: this.projectId });
			
			stub(Ajax, "Request").andDo(function(url, options) {
				options.parameters.a.shouldEqual(1);
				options.parameters.b.shouldEqual(2);
			}.shouldBeCalled());
			
			modelInstance.save({ parameters: { a: 1, b: 2 } });
		},
		
		"with a temporary id in one of its fields": {
			beforeEach: function() {
				this.projectId = new rio.Id();
				this.modelInstance = new this.model({ projectId: this.projectId });
			},
	
			/*
			
			ALLOW THIS FOR NOW BECAUSE TRANSACTION SHOULD MAKE IT OKAY.
	
			"should not attempt to persist the entity": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					fail("incorrectly attempted to persist");
				});
				this.modelInstance.save();
			},
			*/
			
			"should persist after the temporary id is reified": function() {
				var called = false;
				stub(Ajax, "Request").andDo(function(url, options) {
					called = true;
				});
				this.modelInstance.save();
				this.projectId.reify(5);
				called.shouldBeTrue();
			},
			
			"should not prevent persistence if the id is already reified": function() {
				this.projectId.reify(5);
				stub(Ajax, "Request").andDo(function(url, options) {}.shouldBeCalled());
				this.modelInstance.save();
			}
		},
		
		"with a temporary id, should still persist": function() {
			var modelInstance = new this.model({ id: new rio.Id() });
			var called = false;
			stub(Ajax, "Request").andDo(function(url, options) {
				called = true;
			});
			modelInstance.save();
			called.shouldBeTrue();
		},
		
		"should support transactions": {
			"by bundling multiple updates together in a single AJAX interaction": function() {
				stub(Ajax, "Request").andDo(function(){}.shouldBeCalled().once());
				this.model.prepareTransaction = Prototype.emptyFunction;
				new this.model({ id: 1 }).save();
				new this.model({ id: 2 }).save();
				new this.model({ id: 3 }).destroy();
				this.model.executeTransaction();
			},
			
			"with the proper parameters not including unchanged attributes": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					var p = options.parameters;
					Object.keys(p).shouldNotInclude("transaction[1][project_id]");
					Object.keys(p).shouldNotInclude("transaction[2][project_id]");
					p["transaction[3]"].shouldEqual("delete");
				}.shouldBeCalled());
				this.model.prepareTransaction = Prototype.emptyFunction;
				new this.model({ id: 1, projectId: 15 }).save();
				new this.model({ id: 2, projectId: 13 }).save();
				new this.model({ id: 3, projectId: 13 }).destroy();
				this.model.executeTransaction();
			},

			"with the proper parameters including changed attributes": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					var p = options.parameters;
					p["transaction[1][project_id]"].shouldEqual(10);
					p["transaction[2][project_id]"].shouldEqual(15);
				}.shouldBeCalled());
				this.model.prepareTransaction = Prototype.emptyFunction;
				var m1 = new this.model({ id: 1, projectId: 15 });
				m1.setProjectId(10);
				m1.save();
				var m2 = new this.model({ id: 2, projectId: 13 });
				m2.setProjectId(15);
				m2.save();

				this.model.executeTransaction();
			},
	
			"with the proper parameters including an authenticity_token": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.parameters.authenticity_token.shouldEqual(rio.environment.railsToken);
				}.shouldBeCalled());
				this.model.prepareTransaction = Prototype.emptyFunction;
				new this.model({ id: 1, projectId: 15 }).save();
				new this.model({ id: 2, projectId: 13 }).save();
				new this.model({ id: 3, projectId: 13 }).destroy();
				this.model.executeTransaction();
			},
	
			"with the proper parameters including the transaction key": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.parameters.transaction_key.shouldEqual(rio.environment.transactionKey);
				}.shouldBeCalled());
				this.model.prepareTransaction = Prototype.emptyFunction;
				new this.model({ id: 1, projectId: 15 }).save();
				new this.model({ id: 2, projectId: 13 }).save();
				new this.model({ id: 3, projectId: 13 }).destroy();
				this.model.executeTransaction();
			},
	
			"with the proper parameters not including client only attributes": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					var p = options.parameters;
					(p["transaction[1][client_only]"] == undefined).shouldBeTrue();
					(p["transaction[2][client_only]"] == undefined).shouldBeTrue();
				}.shouldBeCalled());
				this.model.prepareTransaction = Prototype.emptyFunction;
				new this.model({ id: 1, clientOnly: "Hello" }).save();
				new this.model({ id: 2, clientOnly: "World" }).save();
				this.model.executeTransaction();
			},
	
			"with the proper parameters for unreified id's": function() {
				var id = new rio.Id();
	
				stub(Ajax, "Request").andDo(function(url, options) {
					var p = options.parameters;
					p["transaction[" + id + "][project_id]"].shouldEqual(15);
					p["transaction[2][project_id]"].shouldEqual(id.toString());
				}.shouldBeCalled());
				this.model.prepareTransaction = Prototype.emptyFunction;
				new this.model({ id: id, projectId: 15 }).save();
				var m = new this.model({ id: 2 });
				m.setProjectId(id);
				m.save();
				this.model.executeTransaction();
			},
	
			"by postponing the invocation of an AJAX call until the end of the thread": function() {
				/* This test egregiously violates encapsulation */
				var model = rio.Model.create("MyModel", {
					resource: "/resource_url",
					attrAccessors: ["id"]
				});
				model.executeTransaction = { defer: function() {}.shouldBeCalled(), bind: function() { return model.executeTransaction; } };
				new model({ id: 12345 }).save();
			},
	
			"by collecting all changes to an entity into a single AJAX interaction": function() {
				this.model.prepareTransaction = function() {}.shouldBeCalled().once();
				var modelInstance = new this.model({ id: 12345 });
				modelInstance.save();
				modelInstance.save();
			},
			
			"by favoring delete actions when collecting changes to an entity": function() {
				this.model.prepareTransaction = function() {}.shouldBeCalled().once();
				var modelInstance = new this.model({ id: 12345 });
				modelInstance.save();
				modelInstance.destroy();
				modelInstance.save();
				
				this.model._transaction.first().options.destroy.shouldEqual(true);
			},
			
			"using an Ajax post": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.method.shouldEqual("post");
				}.shouldBeCalled().once());
	
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				new this.model({ id: 1 }).save();
				new this.model({ id: 2 }).save();
				new this.model({ id: 3 }).destroy();
				this.model.executeTransaction();
			},
	
			"by posting to the model url": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					url.shouldEqual(this.model.url());
				}.bind(this).shouldBeCalled().once());
	
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				new this.model({ id: 1 }).save();
				new this.model({ id: 2 }).save();
				new this.model({ id: 3 }).destroy();
				this.model.executeTransaction();
			},
			
			"by capturing the state of an entity when queuing a transaction": function() {
				this.model.prepareTransaction = Prototype.emptyFunction;
				var instance = this.model.create({ id: 1 });
				instance.setProjectId(15);
				this.model.create({ id: 2, projectId: 11 });
				
				this.model._doExecuteTransaction = this.model._doExecuteTransaction.wrap(function(proceed) {
					instance.setProjectId(123);
					return proceed.apply(this, $A(arguments).slice(1));
				});
				stub(Ajax, "Request").andDo(function(url, options) {
					p = options.parameters;
					p["transaction[1][project_id]"].shouldEqual(15);
				}.shouldBeCalled());
				this.model.executeTransaction();
			},
	
			"by recapturing the state of an entity in a queued transaction that is updated": function() {
				this.model.prepareTransaction = Prototype.emptyFunction;
				var instance = this.model.create({ id: 1, projectId: 15 });
				this.model.create({ id: 2, projectId: 11 });
				
				instance.setProjectId(321);
				
				this.model._doExecuteTransaction = this.model._doExecuteTransaction.wrap(function(proceed) {
					instance.setProjectId(123);
					return proceed.apply(this, $A(arguments).slice(1));
				});
				stub(Ajax, "Request").andDo(function(url, options) {
					p = options.parameters;
					p["transaction[1][project_id]"].shouldEqual(321);
				}.shouldBeCalled());
				this.model.executeTransaction();
			},
			
			"by marking all new entities as _creating": function() {
				stub(Ajax, "Request");
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				var m1 = this.model.create();
				var m2 = this.model.create();
				this.model.executeTransaction();
				
				m1._creating.shouldBeTrue();
				m2._creating.shouldBeTrue();
			},
			
			"by marking all destroyed entities as __destroying": function() {
				stub(Ajax, "Request");
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				var m1 = new this.model({ id: 1 });
				var m2 = new this.model({ id: 2 });
				m1.destroy();
				m2.destroy();
	
				this.model.executeTransaction();
				
				
				m1.__destroying.shouldBeTrue();
				m2.__destroying.shouldBeTrue();
			},
			
			"by executing all entities onFailure functions after a failure": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onFailure();
				});
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				this.model.create({ onFailure: function() {}.shouldBeCalled() });
				this.model.create({ onFailure: function() {}.shouldBeCalled() });
				new this.model({id: 1}).destroy({ onFailure: function() {}.shouldBeCalled() });
				this.model.executeTransaction();
			},
			
			"by calling Application.fail with 'Connection Failure' when there is a response code of 0": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({ status: 0 });
				});
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				this.model.create();
				
				stub(rio.Application, "fail").andDo(function(m) { m.shouldEqual("Connection Failure"); }.shouldBeCalled());
				this.model.executeTransaction();
			},

			"by executing onConnectionFailure, if provided, when there is a response code of 0": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({ status: 0 });
				});
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				this.model.create({
					onConnectionFailure: function() {}.shouldBeCalled()
				});
				
				stub(rio.Application, "fail").shouldNotBeCalled();
				this.model.executeTransaction();
			},

			"by executing all entities onConnectionFailure functions when there is a response code of 0": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({ status: 0 });
				});
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				this.model.create({ onConnectionFailure: function() {}.shouldBeCalled()	});
				this.model.create({ onConnectionFailure: function() {}.shouldBeCalled()	});
				this.model.create();
				
				stub(rio.Application, "fail").shouldNotBeCalled();
				this.model.executeTransaction();
			},
			
			"by executing Application.fail after a failure when onFailure isn't specified": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onFailure();
				});
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				this.model.create({ onFailure: function() {}.shouldBeCalled() });
				this.model.create();
				
				stub(rio.Application, "fail").andDo(function() {}.shouldBeCalled());
				this.model.executeTransaction();
			},
	
			"by executing all entities onSuccess functions after a success": function() {
				this.model.prepareTransaction = Prototype.emptyFunction;
				var m1 = this.model.create({ onSuccess: function() {}.shouldBeCalled() });
				new this.model({ id: 1 }).save({ onSuccess: function() {}.shouldBeCalled() });
				new this.model({ id: 1 }).destroy({ onSuccess: function() {}.shouldBeCalled() });
	
				var transactionResponse = {};
				transactionResponse[m1.getId()] = { id: 123 };
				transactionResponse[1] = { id: 1 };
				
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({
						responseJSON: { transaction: transactionResponse }
					});
				});
	
				this.model.executeTransaction();
			},
			
			"by removing entities from transactions that are both created and deleted": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					var p = options.parameters;
	
					Object.keys(p).size().shouldEqual(4);
					shouldBeUndefined(p["transaction[2][id]"]);
					p["transaction[2][project_id]"].shouldEqual(11);
					p["transaction[3]"].shouldEqual("delete");
					(p.transaction_key != undefined).shouldBeTrue();
					(p.authenticity_token != undefined).shouldBeTrue();
				}.shouldBeCalled());
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				var model = this.model.create({ id: this.model.id(), projectId: 15 });
				model.destroy();
				var m = new this.model({ id: 2 });
				m.setProjectId(11);
				m.save();
				new this.model({ id: 3, projectId: 13 }).destroy();
				this.model.executeTransaction();
			},
	
			"by removing entities from collection entities that are both created and deleted": function() {
				stub(Ajax, "Request").andDo(function(url, options) {}.shouldNotBeCalled());
				stub(this.model, "removeFromCollectionEntities").andDo(function(item) {
					(item == model).shouldBeTrue();
				}.shouldBeCalled());
	
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				var model = this.model.create({ id: this.model.id(), projectId: 15 });
				model.destroy();
				
				this.model.executeTransaction();
			},
			
			"by waiting to execute subsequent transactions until after the current transaction is complete": function() {
				var onComplete;
				stub(Ajax, "Request").andDo(function(url, options) {
					onComplete = options.onComplete;
				}.bind(this).shouldBeCalled());
	
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				new this.model({ id: 1 }).save();
				new this.model({ id: 2 }).save();
				this.model.executeTransaction();
				
				stub(Ajax, "Request").andDo(function() {}.shouldNotBeCalled());
				var m1 = new this.model({ id: 3 });
				m1.setProjectId(5);
				m1.save();

				var m2 = new this.model({ id: 4 });
				m2.setProjectId(6);
				m2.save();
				this.model.executeTransaction();
				
				stub(Ajax, "Request").andDo(function(url, options) {
					var p = options.parameters;
					p["transaction[3][project_id]"].shouldEqual(5);
					p["transaction[4][project_id]"].shouldEqual(6);
				}.shouldBeCalled());
				onComplete();
			},
			
			"by waiting to process collection entities until after all of the transaction entities have been processed": function() {
				this.model.prepareTransaction = Prototype.emptyFunction;
	
				var id2 = this.model.id();
				var m1 = this.model.create({ id: this.model.id(), onSuccess: function() {}.shouldBeCalled() });
				var m2 = this.model.create({ id: id2, onSuccess: function() {}.shouldBeCalled() });
				
				var buildResponse = function(json) {
					return rio.environment.includeRootInJson ? { resource: json } : json;
				};
			
				stub(rio.models, "Resource").withValue(this.model);
	
				var transactionResponse = {};
				transactionResponse[m1.getId()] = { _set: { self: buildResponse({ id: 1 }), include: [{ parameters: { parentId: 2 }, className: "Resource", json: [buildResponse({ id: 2 })] }] } };
				transactionResponse[m2.getId()] = buildResponse({ id: 2 });
				
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({
						responseJSON: { transaction: transactionResponse }
					});
				});
	
				this.model.executeTransaction();
				
				var collection = this.model.findAll({parameters: { parentId: 2 }});
				
				(collection[0] == m2).shouldBeTrue();
			},
	
			"by processing collection entities after single entity interactions": function() {
				this.model.prepareTransaction = Prototype.emptyFunction;
	
	
				var m1 = this.model.create({ id: this.model.id(), onSuccess: function() {}.shouldBeCalled() });
				var m2 = new this.model({ id: 2 });
				
				var buildResponse = function(json) {
					return rio.environment.includeRootInJson ? { resource: json } : json;
				};
			
				stub(rio.models, "Resource").withValue(this.model);
	
				var response = { _set: { self: buildResponse({ id: 1 }), include: [{ parameters: { parentId: 2 }, className: "Resource", json: [buildResponse({ id: 2 })] }] } };
				
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({
						responseJSON: response
					});
				});
	
				this.model.executeTransaction();
				
				var collection = this.model.findAll({parameters: { parentId: 2 }});
				
				(collection[0] == m2).shouldBeTrue();
			}
		},
		
		"in the process of creating": {
			beforeEach: function() {
				this.modelInstance = new this.model();
				stub(this.model, '_filterAndProcessJsonWhileAccumulatingCollectionEntities').andReturn([{id: '234'}, Prototype.emptyFunction]);
			},
	
			"should not attempt to persist updates": function() {
				stub(Ajax, "Request");
				this.modelInstance.save();
				stub(Ajax, "Request").andDo(function(url, options) {
					fail("incorrectly attempted to persist");
				});
				this.modelInstance.save();
			},
			
			"should persist pending updates after creation is complete": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onComplete();
					this.onSuccess = options.onSuccess;
				}.bind(this));
				this.modelInstance.save();
				stub(Ajax, "Request").andDo(function(url, options) {}.shouldBeCalled());
				this.modelInstance.save();
				this.onSuccess({ responseJSON: { id: 1 } });
			},
	
			"should call the instance's before create": function() {
				stub(this.modelInstance, "beforeCreate").shouldBeCalled();
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({});
				});
				this.modelInstance.save();
			},
			
			"should not call the instance's before create method while already in the process of creating": function() {
				stub(this.modelInstance, "beforeCreate").shouldNotBeCalled();
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({});
				});
				this.modelInstance._creating = true;
				this.modelInstance.save();
			}
		},
		
		"on creation without a fake id": {
			beforeEach: function(){
				this.modelInstance = new this.model();
				stub(this.model, '_filterAndProcessJsonWhileAccumulatingCollectionEntities').andReturn([{id: '234'}, Prototype.emptyFunction]);
			},
			"should send a POST": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.method.shouldEqual("post");
				}.shouldBeCalled());
				this.modelInstance.save();
			},
			"should post to the correct url": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					url.shouldEqual('/resource_url'); 
				}.shouldBeCalled());
				this.modelInstance.save();
			},
			"should set its id from the json response": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({});
				});
				this.modelInstance.save();
				(234 == this.modelInstance.getId()).shouldBeTrue();
			},
			"should put itself in the identity cache": function(){
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({});
				});
				this.modelInstance.save();
				(this.modelInstance == this.model.getFromCache(234)).shouldBeTrue();
			},
			"should call the options on success": function(){
				/* this is a little confusing, but we're making sure the function that's called 
				   on ajax success eventually calls the onSuccess function that's passed into save*/
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({});
				});
				this.modelInstance.save({onSuccess: function(){}.shouldBeCalled()});
			},
			"should call the instance's after create": function(){
				this.modelInstance.afterCreate = function(){}.shouldBeCalled();
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({});
				});
				this.modelInstance.save();
			}
		},
		
		"on creation with a fake id": {
			beforeEach: function(){
				this.modelInstance = new this.model({id: this.model.id()});
				stub(this.model, '_filterAndProcessJsonWhileAccumulatingCollectionEntities').andReturn([{id: '234'}, Prototype.emptyFunction]);
			},
			"should map the number id to the object id": function(){
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({});
				});
				this.modelInstance.save();
				(this.model.id('234') == this.modelInstance.getId()).shouldBeTrue();
				(this.model.id(234) == this.modelInstance.getId()).shouldBeTrue();
			},
			"should reify the id with the number id from the server": function(){
				(this.modelInstance.getId() == 234).shouldNotBeTrue();
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({});
				});
				this.modelInstance.save();
				(this.modelInstance.getId() == 234).shouldBeTrue();
			}
		},
	
		"should create a collection entity during a findAll": {
			beforeEach: function() {
				this.model = rio.Model.create("SomeModel", {
					resource: "/resource_url",
					attrAccessors: ["id", "projectId", "name"]
				});
				
				stub(rio.models, "SomeModel").withValue(this.model);
			
				this.allInstances = [
					new this.model({ id: 1, projectId: 1 }),
					new this.model({ id: 2, projectId: 1 }),
					new this.model({ id: 3, projectId: 1 })
				];
				var buildResponse = function(json) {
					return rio.environment.includeRootInJson ? { resource: json } : json;
				};
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({
						responseJSON: [
							buildResponse({ id: 1, projectId: 1 }),
							buildResponse({ id: 2, projectId: 1 }),
							{
								"_set": {
									"self": buildResponse({ id: 3, projectId: 1 }), 
									"include": [
										{ 
											"json": [
												buildResponse({ id: 14, projectId: 3 })
											], 
											"parameters": {"project_id": 3},
											"className": "SomeModel"
										}
									]
								}
							}
						]
					});
				}.bind(this));
				this.model.findAll({
					onSuccess: function(results) {
						this.findAllResults = results;
					}.bind(this),
					parameters: { projectId: 1 },
					nonAjaxParameters: { name: { not: "Paulie Shore" } }
				});
			},
		
			"with the correct results": function() {
				this.findAllResults.shouldEqual(this.allInstances);
			},
		
			"that is updated as new entities are added": function() {
				var newEntity = new this.model({ id: 3, projectId: 1 });
				this.findAllResults.shouldInclude(newEntity);
			},
		
			"that is not updated when an entity that does not match the parameters is added": function() {
				var newEntity = new this.model({ id: 4, projectId: 2 });
				this.findAllResults.shouldNotInclude(newEntity);
			},
			
			"that uses the nonAjaxParameters to build the condition function": function() {
				var newEntity = new this.model({ id: 5, projectId: 1, name: "Paulie Shore" });
				this.findAllResults.shouldNotInclude(newEntity);
			},
			
			"that supports the _set style response": {
				"and creates an entity for the 'self' item": function() {
					this.model.getFromCache(3).getProjectId().shouldEqual(1);
				},
				
				"and creates a collection entity for the include items": function() {
					stub(Ajax, "Request").shouldNotBeCalled();
					
					var ce = this.model.findAll({ parameters: { projectId: 3 } });
					ce.length.shouldEqual(1);
					ce[0].getProjectId().shouldEqual(3);
				}
			},
			
			"that prevents unnecessary Ajax requests from being made in initializers called while processing collection entities": function() {
				var model = rio.Model.create("ComplexModel", {
					resource: "/complex_url",
					attrAccessors: ["id", "parentId"],
					methods: {
						initialize: function() {
							var results = rio.models.ComplexModel.findAll({
								parameters: { parentId: this.getId() }
							});
							results.each(function(r) {
								this.getId().shouldEqual(r.getParentId());
							}.bind(this));
						}
					}
				});
				stub(rio.models, "ComplexModel").withValue(model);
			
				var buildResponse = function(json) {
					return rio.environment.includeRootInJson ? { resource: json } : json;
				};
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({
						responseJSON: [
							{
								"_set": {
									"self": buildResponse({ id: 3, parentId: 0 }), 
									"include": [
										{ 
											"json": [
												{
													"_set": {
														"self": buildResponse({ id: 14, parentId: 3 }), 
														"include": [
															{
																"json": [],
																"parameters": {"parent_id": 14},
																"className": "ComplexModel"
															}
														]
													}
												}
											], 
											"parameters": {"parent_id": 3},
											"className": "ComplexModel"
										}
									]
								}
							}
						]
					});
				}.bind(this).shouldBeCalled().once());
	
				model.findAll({
					parameters: { parentId: 0 }
				})[0].getParentId().shouldEqual(0);
			},
			
			"that does not double add entities that update themselves in their initializer": function() {
				var model = rio.Model.create("ComplexModel", {
					resource: "/complex_url",
					attrAccessors: ["id", "parentId", "thing"],
					clientOnlyAttrs: ["thing"],
					methods: {
						initialize: function() {
							this.setThing(1);
						}
					}
				});
				stub(rio.models, "ComplexModel").withValue(model);
			
				var buildResponse = function(json) {
					return rio.environment.includeRootInJson ? { resource: json } : json;
				};
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({
						responseJSON: [
							{
								"_set": {
									"self": buildResponse({ id: 3, parentId: 0 }), 
									"include": []
								}
							}
						]
					});
				}.bind(this).shouldBeCalled());
	
				model.findAll({
					parameters: { parentId: 0 }
				}).length.shouldEqual(1);
			},
			
			"with a custom url": {
				beforeEach: function() {
					this.model.findAll({
						onSuccess: function(results) {
							this.findAllResults = results;
						}.bind(this),
						parameters: { projectId: 1 },
						url: "/custom_url"
					});
				},
				
				"that is used for querying": function() {
					var buildResponse = function(json) {
						return rio.environment.includeRootInJson ? { resource: json } : json;
					};
	
					stub(Ajax, "Request").andDo(function(url, options) {
						url.shouldEqual("/custom_url");
					}.bind(this).shouldBeCalled());
					
					this.model.findAll({
						parameters: { projectId: 3 },
						url: "/custom_url"
					});
				},
				
				"that is updated as new matching entities are added": function() {
					var collectionEntity = this.model.findAll({
						parameters: { projectId: 1 },
						url: "/custom_url"
					});
					
					collectionEntity.shouldEqual(this.allInstances);
	
					var newEntity = new this.model({ id: 3, projectId: 1 });
					collectionEntity.shouldInclude(newEntity);
				},
	
				"that is not updated as non-matching entities are added": function() {
					var collectionEntity = this.model.findAll({
						parameters: { projectId: 1 },
						url: "/custom_url"
					});
					
					var newEntity = new this.model({ id: 4, projectId: 2 });
					collectionEntity.shouldNotInclude(newEntity);
				},
	
				"that returns the cached collection entity on subsequent searches": function() {
					var findAll1 = this.model.findAll({
						parameters: { projectId: 1 },
						url: "/custom_url"
					});
					stub(Ajax, "Request").andDo(function() {}.shouldNotBeCalled());
					var findAll2 = this.model.findAll({
						parameters: { projectId: 1 },
						url: "/custom_url"
					});
					(findAll1 === findAll2).shouldBeTrue();
				}
			}
		},
		
		"should support synchronous findAll": {
			beforeEach: function() {
				this.model = rio.Model.create("SomeModel", {
					resource: "/resource_url",
					attrAccessors: ["id", "projectId"]
				});
		
				this.allInstances = [
					new this.model({ id: 1, projectId: 1 }),
					new this.model({ id: 2, projectId: 1 })
				];
				var buildResponse = function(json) {
					return rio.environment.includeRootInJson ? { resource: json } : json;
				};
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({
						responseJSON: [
							buildResponse({ id: 1, projectId: 1 }),
							buildResponse({ id: 2, projectId: 1 })
						]
					});
				}.bind(this));
			},
	
			"when asynchronous is false": function() {
				var results = this.model.findAll({
					asynchronous: false,
					parameters: { projectId: 1 },
					onSuccess: function(values) { values.shouldEqual(this.allInstances); }.bind(this).shouldBeCalled()
				});
			
				results.shouldEqual(this.allInstances);
			
			},
			
			"when asynchronous is false and the collection entities list has a cache hit": function() {
				this.model.findAll({
					asynchronous: false,
					parameters: { projectId: 1 },
					onSuccess: function(values) { values.shouldEqual(this.allInstances); }.bind(this).shouldBeCalled()
				});
				
				var results = this.model.findAll({
					asynchronous: false,
					parameters: { projectId: 1 },
					onSuccess: function(values) { values.shouldEqual(this.allInstances); }.bind(this).shouldBeCalled()
				});
				results.shouldEqual(this.allInstances);
			},
	
			"when no onSuccess function is provided": function() {
				var results = this.model.findAll({
					parameters: { projectId: 1 }
				});
				results.shouldEqual(this.allInstances);
			}
		},
		
		"should support find": {
			beforeEach: function() {
				this.model = rio.Model.create("SomeModel", {
					resource: "/resource_url",
					attrAccessors: ["id", "projectId"]
				});
			},
			
			"by using the passed in ID to fetch the entity from the server": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					url.shouldEqual("/resource_url/28");
				}.shouldBeCalled());
	
				this.model.find(28);
			},
	
			"by getting the entity from the server asynchronously by default and evaluating JSON": function() {
				stub(Ajax, "Request").andDo(function(url, options) {
					options.method.shouldEqual("get");
					options.asynchronous.shouldBeTrue();
					options.evalJSON.shouldBeTrue();
				}.shouldBeCalled());
	
				this.model.find(28, { onSuccess: function() {} });
			},
			
			"by calling the onSuccess function with the found entity": function() {
				var buildResponse = function(json) {
					return rio.environment.includeRootInJson ? { resource: json } : json;
				};
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({
						responseJSON: buildResponse({ id: 28, projectId: 15 })
					});
				}.shouldBeCalled());
	
				this.model.find(28, {
					onSuccess: function(entity) {
						entity.getId().shouldEqual(28);
						entity.getProjectId().shouldEqual(15);
					}.shouldBeCalled()
				});
			},
			
			"by getting the entity synchronously and returning it if no onSuccess method is provided": function() {
				var buildResponse = function(json) {
					return rio.environment.includeRootInJson ? { resource: json } : json;
				};
				stub(Ajax, "Request").andDo(function(url, options) {
					options.onSuccess({
						responseJSON: buildResponse({ id: 28, projectId: 15 })
					});
				}.shouldBeCalled());
				
				var entity = this.model.find(28);
				
				(entity.constructor == this.model).shouldBeTrue();
				entity.getId().shouldEqual(28);
				entity.getProjectId().shouldEqual(15);
			},
			
			"by calling onSuccess with an existing entity if found in the cache": function() {
				var existing = new this.model({ id: 28 });
	
				this.model.find(28, {
					onSuccess: function(entity) {
						(entity == existing).shouldBeTrue();
					}.shouldBeCalled()
				});
			},
	
			"by returning an existing entity if asynchronous is false": function() {
				var existing = new this.model({ id: 28 });
	
				(this.model.find(28, { asynchronous: false }) == existing).shouldBeTrue();
				(this.model.find(28) == existing).shouldBeTrue();
			},
			
			"by returning undefined if id is undefined": function() {
				shouldBeUndefined(this.model.find());
			},
			
			"by not calling onSuccess if id is undefined": function() {
				this.model.find(undefined, {
					onSuccess: function(entity) {}.shouldNotBeCalled()
				});
			},
			
			"by skipping Ajax request if id is undefined": function() {
				stub(Ajax, "Request").shouldNotBeCalled();
				this.model.find();
			}
			
			/* "by waiting for find requests to execute afterActiveQueries": pending */
		},
	
		"should support hasMany association": {
			beforeEach: function() {
				this.model = rio.Model.create("Project", {
					resource: "/projects",
					attrAccessors: ["id"],
					hasMany: [
						"tasks",
						["comments", { parameters: { other: 7 } }]
					]
				});
				this.taskModel = rio.Model.create("Task", {
					resource: "/tasks",
					attrAccessors: ["id", "projectId"]
				});
				this.commentModel = rio.Model.create("Comment", {
					resource: "/comments",
					attrAccessors: ["id", "projectId", "other"]
				});

				stub(rio.models, "Project").withValue(this.model);
				stub(rio.models, "Task").withValue(this.taskModel);
				stub(rio.models, "Comment").withValue(this.commentModel);

				instrumentModel(this.model);
				instrumentModel(this.taskModel);
				instrumentModel(this.commentModel);

				this.modelInstance = new this.model({ id: 192 });
			},
			
			"by provide an attr accessor": function() {
				(this.modelInstance.getTasks != undefined).shouldBeTrue();
				(this.modelInstance.setTasks != undefined).shouldBeTrue();
				this.modelInstance.tasks.constructor.shouldEqual(rio.Binding);
			},
			
			"by adding the new attribute to the clientOnlyAttr list": function() {
				this.model._clientOnlyAttrs.shouldInclude("tasks");
				this.model._clientOnlyAttrs.shouldInclude("comments");
			},
			
			"by lazily executing a synchronous AJAX request to populate it's value": function() {
				
				stub(this.taskModel, "findAll").andDo(function(options) {
					options.asynchronous.shouldBeFalse();
				}.shouldBeCalled());
				
				this.modelInstance.getTasks();
			},
			
			"by lazily executing an AJAX request with it's id as the properly named association id": function() {
				
				stub(this.taskModel, "findAll").andDo(function(options) {
					options.parameters.projectId.shouldEqual(192);
				}.shouldBeCalled());
				
				this.modelInstance.getTasks();
			},
			
			"by lazily executing an AJAX and return it's value": function() {
				var tasks = [1,2,3];
				stub(this.taskModel, "findAll").andDo(function(options) {
					options.onSuccess(tasks);
				}.shouldBeCalled());
				
				this.modelInstance.getTasks().shouldEqual(tasks);
			},
			
			"with more complicated definitions": function() {
				(this.modelInstance.getComments != undefined).shouldBeTrue();
				(this.modelInstance.setComments != undefined).shouldBeTrue();
				this.modelInstance.comments.constructor.shouldEqual(rio.Binding);
			},
			
			"with parameters that limit the set beyond the association id": function() {
				stub(this.commentModel, "findAll").andDo(function(options) {
					options.parameters.projectId.shouldEqual(192);
					options.parameters.other.shouldEqual(7);
				}.shouldBeCalled());
				
				this.modelInstance.getComments();
			},
			
			"with a create method": {
				"that creates an object with the proper association id set": function() {
					var comment = this.modelInstance.comments.create();
					comment.getProjectId().shouldEqual(this.modelInstance.getId());
				},
				
				"that creates an object with extra parameters as well": function() {
					var comment = this.modelInstance.comments.create();
					comment.getOther().shouldEqual(7);
				},
				
				"that adds the created entity to the association": function() {
					this.modelInstance.getComments().length.shouldEqual(0);
					this.modelInstance.comments.create({ id: this.commentModel.id() });
					this.modelInstance.getComments().length.shouldEqual(1);
				}
			},
			
			"for collection entities with unreified id's": {
				"by adding existing entities": function() {
					var project = new this.model({ id: this.model.id() });
					rio.models.Task.create({ id: rio.models.Task.id(), projectId: project.getId() });
					project.getTasks().length.shouldEqual(1);
				},
			
				"by adding new entities": function() {
					var project = this.model.create({ id: this.model.id() });
					var tasks = project.getTasks();
					tasks.length.shouldEqual(0);
					rio.models.Task.create({ id: rio.models.Task.id(), projectId: project.getId() });
					tasks.length.shouldEqual(1);
				},
			
				"by adding new after the id is reified": function() {
					var id = this.model.id();
					var project = new this.model({ id: id });
					var tasks = project.getTasks();
					tasks.length.shouldEqual(0);
					id.reify(12);
					rio.models.Task.create({ id: rio.models.Task.id(), projectId: 12 });
					tasks.length.shouldEqual(1);
				}
			}
		},
		
		"should support belongsTo association": {
			beforeEach: function() {
				this.model = rio.Model.create("Project", {
					resource: "/projects",
					attrAccessors: [
						"id", "userId", "personId", "employerId", "customerId"
					],
					belongsTo: [
						"user",
						["person", { className: "User" }],
						["company", { foreignKey: "employerId" }],
						["client", { className: "Company", foreignKey: "customerId" }]
					]
				});
				this.model.prepareTransaction = function() {
					this.executeTransaction(rio.Undo.isProcessingUndo(), rio.Undo.isProcessingRedo());
				};
				stub(rio.models, "Project").withValue(this.model);
				
				this.modelInstance = new this.model({ id: 101, userId: 14, personId: 91, employerId: 45, customerId: 32 });
				
				this.userModel = rio.Model.create("User", {
					resource: "/users",
					attrAccessors: ["id"]
				});
				stub(rio.models, "User").withValue(this.userModel);
				
				this.companyModel = rio.Model.create("Company", {
					resource: "/companies",
					attrAccessors: ["id"]
				});
				stub(rio.models, "Company").withValue(this.companyModel);
			},
			
			"by providing an attrAccessor": function() {
				(this.modelInstance.getUser != undefined).shouldBeTrue();
				(this.modelInstance.setUser != undefined).shouldBeTrue();
				this.modelInstance.user.constructor.shouldEqual(rio.Binding);
			},
			
			"by adding the new attribute to the clientOnlyAttr list": function() {
				this.model._clientOnlyAttrs.shouldInclude("user");
			},
			
			"by lazily executing a synchronous AJAX request to populate its value": function() {
				stub(this.userModel, "find").andDo(function(id, options) {
					options.asynchronous.shouldBeFalse();
				}.shouldBeCalled());
				
				this.modelInstance.getUser();
			},
				
			"by lazily executing an AJAX request with the proper id to populate its value": function() {
				stub(this.userModel, "find").andDo(function(id, options) {
					id.shouldEqual(14);
				}.shouldBeCalled());
				
				this.modelInstance.getUser();
			},
				
			"by lazily executing an AJAX request and returning the value": function() {
				var user14 = new rio.models.User({ id: 14 });
				(this.modelInstance.getUser() == user14).shouldBeTrue();
			},
			
			"by updating it's value and firing bindings when the association id is changed": function() {
				var user14 = new rio.models.User({ id: 14 });
				var user22 = new rio.models.User({ id: 22 });
			
				(this.modelInstance.getUser() == user14).shouldBeTrue();
				
				this.modelInstance.user.bind(function(u) {
					(u == user22).shouldBeTrue();
				}.shouldBeCalled(), true);
				
				this.modelInstance.setUserId(22);
			},
			
			"by allowing explicitly defined class names": function() {
				var user91 = new rio.models.User({ id: 91 });
				
				(this.modelInstance.getPerson() == user91).shouldBeTrue();
			},
				
			"by allowing explicitly defined foreign keys": function() {
				var company45 = new rio.models.Company({ id: 45 });
				
				(this.modelInstance.getCompany() == company45).shouldBeTrue();
			},
	
			"by allowing explicitly defined class names and foreign keys": function() {
				var company32 = new rio.models.Company({ id: 32 });
				
				(this.modelInstance.getClient() == company32).shouldBeTrue();
			}
		}
	},
	
	
	"should handle push": {
		beforeEach: function() {
			var someTestModel = rio.Model.create("SomeTestModel", {
				resource: "/some_test_model",
				attrAccessors: ["id", "polarBear"],
				undoEnabled: true,
				methods: {
					parameters: function() { return {}; }
				}
			});
			stub(rio.models, "SomeTestModel").withValue(someTestModel);
	
			stub(rio.Undo, "_queue").withValue(new rio.UndoQueue());
			stub(Ajax, "Request");
			rio.models.SomeTestModel.prepareTransaction = function() {
				this.executeTransaction(rio.Undo.isProcessingUndo(), rio.Undo.isProcessingRedo());
			};
		},
	
		"remoteCreate": function() {
			rio.Model.remoteCreate({
				name: "SomeTestModel",
				id: 1,
				json: this.buildResponse({ id: 1, polar_bear: 72 })
			});
			var modelInstance = rio.models.SomeTestModel.getFromCache(rio.models.SomeTestModel.id(1));
			modelInstance.getPolarBear().shouldEqual(72);
		},
	
		"remoteCreate, doing nothing if the transactionKey matches mine": function() {
			rio.Model.remoteCreate({
				name: "SomeTestModel",
				id: 1,
				json: { some_test_model: { id: 1, polar_bear: 72 }},
				transactionKey: rio.environment.transactionKey
			});
			
			shouldBeUndefined(rio.models.SomeTestModel.getFromCache(rio.models.SomeTestModel.id(1)));
		},
	
		"remoteCreate, doing nothing if the entity is found in the cache": function() {
			new rio.models.SomeTestModel({ id: 1, polar_bear: 19 });
	
			rio.Model.remoteCreate({
				name: "SomeTestModel",
				id: 1,
				json: { some_test_model: { id: 1, polar_bear: 72 }}
			});
	
			var modelInstance = rio.models.SomeTestModel.getFromCache(rio.models.SomeTestModel.id(1));
			modelInstance.getPolarBear().shouldEqual(19);
		},
	
		"remoteCreate and register an undo": function() {
			rio.Model.remoteCreate({
				name: "SomeTestModel",
				id: 1,
				json: this.buildResponse({ id: 1, polar_bear: 72 })
			});
			var modelInstance = rio.models.SomeTestModel.getFromCache(rio.models.SomeTestModel.id(1));
			stub(modelInstance, "destroy").shouldBeCalled();
			rio.Undo.undo();
		},
		
		"remoteCreate should not register an undo if the entity is found in the cache": function() {
			new rio.models.SomeTestModel({ id: 1, polar_bear: 19 });
	
			rio.Model.remoteCreate({
				name: "SomeTestModel",
				id: 1,
				json: { some_test_model: { id: 1, polar_bear: 72 }}
			});
	
			var modelInstance = rio.models.SomeTestModel.getFromCache(rio.models.SomeTestModel.id(1));
			modelInstance.getPolarBear().shouldEqual(19);
			stub(modelInstance, "destroy").shouldNotBeCalled();
			rio.Undo.undo();
		},
	
		"remoteUpdate": function() {
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 19 });
	
			rio.Model.remoteUpdate({
				name: "SomeTestModel",
				id: 1,
				json: this.buildResponse({id: 1, polar_bear: 72 })
			});
	
			modelInstance.getPolarBear().shouldEqual(72);
		},
		
		"remoteUpdate, doing nothing if the transactionKey key matches mine": function() {
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 19 });
	
			rio.Model.remoteUpdate({
				name: "SomeTestModel",
				id: 1,
				json: { some_test_model: { id: 1, polar_bear: 72 }},
				transactionKey: rio.environment.transactionKey
			});
	
			modelInstance.getPolarBear().shouldEqual(19);
		},
	
		"remoteUpdate and not resave the entity": function() {
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 19 });
	
			stub(modelInstance, "save").andDo(function() {}.shouldNotBeCalled());
			rio.Model.remoteUpdate({
				name: "SomeTestModel",
				id: 1,
				json: this.buildResponse({id: 1, polar_bear: 72})
			});
		},
		
		"remoteUpdate and register an undo": function() {
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 19 });
	
			rio.Model.remoteUpdate({
				name: "SomeTestModel",
				id: 1,
				json: this.buildResponse({ id: 1, polar_bear: 72 })
			});
			modelInstance.getPolarBear().shouldEqual(72);
	
			rio.Undo.undo();
			modelInstance.getPolarBear().shouldEqual(19);
		},
	
		"remoteUpdate and update the entities _lastSavedState": function() {
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 19 });
	
			rio.Model.remoteUpdate({
				name: "SomeTestModel",
				id: 1,
				json: this.buildResponse({ id: 1, polar_bear: 72 })
			});
	
			modelInstance._lastSavedState.polarBear.shouldEqual(72);
		},
	
		"remoteUpdate and add to the proper collection entities": function() {
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 19 });
			var collectionEntity = rio.CollectionEntity.create({
				model: rio.models.SomeTestModel,
				values: [],
				condition: function(e) { return e.getPolarBear() == 72; }
			});
			
			rio.models.SomeTestModel.putCollectionEntity(rio.models.SomeTestModel.url() + "#{polar_bear: 72}", collectionEntity);
	
			rio.Model.remoteUpdate({
				name: "SomeTestModel",
				id: 1,
				json: this.buildResponse({ id: 1, polar_bear: 72 })
			});
			
			(collectionEntity.first() == modelInstance).shouldBeTrue();
		},
	
		/*
		
		This requirement doesn't make much sense.  We have to have confidence in our push server.
		If something is created the client should know about it.  Delegating to create does not
		work now that we send updates as a diff, rather than the whole entity.
		
		"remoteUpdate and delegate to remoteCreate if there is a cache miss": function() {
			rio.Model.remoteUpdate({
				name: "SomeTestModel",
				id: 1,
				json: this.buildResponse({ id: 7, polar_bear: 145 })
			});
			
			var modelInstance = rio.models.SomeTestModel.getFromCache(rio.models.SomeTestModel.id(7));
			modelInstance.getPolarBear().shouldEqual(145);
		},
		*/
		
		"remoteDestroy and remove the entity from the collection entities": function() {
			var collectionEntity = rio.CollectionEntity.create({
				model: rio.models.SomeTestModel,
				values: [],
				condition: function(e) { return e.getPolarBear() == 72; }
			});
			rio.models.SomeTestModel.putCollectionEntity(rio.models.SomeTestModel.url() + "#{polar_bear: 72}", collectionEntity);
			
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 72 });
			(collectionEntity.first() == modelInstance).shouldBeTrue();
	
			rio.Model.remoteDestroy({
				name: "SomeTestModel",
				id: 1
			});
			
			collectionEntity.shouldBeEmpty();
		},
		
		"remoteDestroy, doing nothing if the transactionKey matches mine": function() {
			var collectionEntity = rio.CollectionEntity.create({
				model: rio.models.SomeTestModel,
				values: [],
				condition: function(e) { return e.getPolarBear() == 72; }
			});
			rio.models.SomeTestModel.putCollectionEntity(rio.models.SomeTestModel.url() + "#{polar_bear: 72}", collectionEntity);
			
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 72 });
			(collectionEntity.first() == modelInstance).shouldBeTrue();
	
			rio.Model.remoteDestroy({
				name: "SomeTestModel",
				id: 1,
				transactionKey: rio.environment.transactionKey
			});
			
			collectionEntity.shouldNotBeEmpty();
		},
	
		"remoteDestroy and remove the entity from identity cache": function() {
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 72 });
	
			(rio.models.SomeTestModel.getFromCache(1) == modelInstance).shouldBeTrue();
	
			rio.Model.remoteDestroy({
				name: "SomeTestModel",
				id: 1
			});
			
			shouldBeUndefined(rio.models.SomeTestModel.getFromCache(1));
		},
	
		"remoteDestroy and fire the destroy event": function() {
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 72 });
	
			(rio.models.SomeTestModel.getFromCache(1) == modelInstance).shouldBeTrue();
	
			modelInstance.observe("destroy", function() {}.shouldBeCalled());
			
			rio.Model.remoteDestroy({
				name: "SomeTestModel",
				id: 1
			});
		},
	
		"remoteDestroy and register an undo": function() {
			var modelInstance = new rio.models.SomeTestModel({ id: 1, polar_bear: 72 });
	
			(rio.models.SomeTestModel.getFromCache(1) == modelInstance).shouldBeTrue();
	
			modelInstance.observe("destroy", function() {}.shouldBeCalled());
			
			rio.Model.remoteDestroy({
				name: "SomeTestModel",
				id: 1
			});
			
			rio.Undo.undo();
			
			var newInstance = rio.models.SomeTestModel.getFromCache(1);
			
			newInstance.getPolarBear().shouldEqual(72);
			shouldBeUndefined(newInstance.getPolarBear()._lastSavedState);
		},
		
		"remoteTransaction by delegating to the proper remote functions": function() {
			stub(rio.Model, "doRemoteCreate").andDo(function(options) {
				options.id.shouldEqual(1);
				options.name.shouldEqual("SomeTestModel");
				options.json.hello.shouldEqual("world");
				return {};
			}.shouldBeCalled());
			stub(rio.Model, "doRemoteUpdate").andDo(function(options) {
				options.id.shouldEqual(2);
				options.name.shouldEqual("SomeTestModel");
				options.json.hello.shouldEqual("somebody");
				return {};
			}.shouldBeCalled());
			stub(rio.Model, "doRemoteDestroy").andDo(function(options) {
				options.id.shouldEqual(3);
				options.name.shouldEqual("SomeTestModel");
				return {};
			}.shouldBeCalled());
			rio.Model.remoteTransaction({
				transaction: [
					{ action: "create", id: 1, name: "SomeTestModel", json: { hello: "world"} },
					{ action: "update", id: 2, name: "SomeTestModel", json: { hello: "somebody"} },
					{ action: "destroy", id: 3, name: "SomeTestModel" }
				]
			});
		},
	
		"remoteTransaction, doing nothing if the transactionKey matches mine": function() {
			stub(rio.Model, "doRemoteCreate").shouldNotBeCalled();
			stub(rio.Model, "doRemoteUpdate").shouldNotBeCalled();
			stub(rio.Model, "doRemoteDestroy").shouldNotBeCalled();
			rio.Model.remoteTransaction({
				transactionKey: rio.environment.transactionKey,
				transaction: [
					{ action: "create", id: 1, name: "SomeTestModel", json: { hello: "world"} },
					{ action: "update", id: 2, name: "SomeTestModel", json: { hello: "somebody"} },
					{ action: "destroy", id: 3, name: "SomeTestModel" }
				]
			});
		},
	
		"remoteTransaction and register an undo": function() {
			var instance2 = new rio.models.SomeTestModel({ id: 2, polar_bear: 72 });
			var instance3 = new rio.models.SomeTestModel({ id: 3, polar_bear: 12 });
			
			var buildResponse = function(json) {
				return rio.environment.includeRootInJson ? { some_test_model: json } : json;
			};
			rio.Model.remoteTransaction({
				transaction: [
					{ action: "create", id: 1, name: "SomeTestModel", json: buildResponse({ id: 1, polar_bear: "world"}) },
					{ action: "update", id: 2, name: "SomeTestModel", json: buildResponse({ id: 2, polar_bear: "somebody"}) },
					{ action: "destroy", id: 3, name: "SomeTestModel" }
				]
			});
			
			rio.Undo.undo();
	
			shouldBeUndefined(rio.models.SomeTestModel.getFromCache(1));
			instance2.getPolarBear().shouldEqual(72);
			rio.models.SomeTestModel.getFromCache(3).getPolarBear().shouldEqual(12);
		}
	},
	
	"should support concise syntax": {
		beforeEach: function() {
			this.model = rio.Model.create("SomeModel", {
				attrReaders: ["name"],
				attrAccessors: [["age", 25]],
				methods: {
					hello: function() {
						return "hello world";
					}
				},
				classMethods: {
					hello: function() {
						return "HELLO WORLD";
					}
				}
			});
		
			this.modelInstance = new this.model({ name: "Jason" });
		},
		
		"for NAME": function() {
			this.model.toString().shouldEqual("SomeModel");
		},
		
		"for attrReader": function() {
			this.modelInstance.getName().shouldEqual("Jason");
		},
	
		"for attrAccessor with default value": function() {
			this.modelInstance.getAge().shouldEqual(25);
			this.modelInstance.setAge(26);
			this.modelInstance.getAge().shouldEqual(26);
		},
	
		"for instance methods": function() {
			this.modelInstance.hello().shouldEqual("hello world");
		},
		
		"for class methods": function() {
			this.model.hello().shouldEqual("HELLO WORLD");
		}
	}
	
});