describe(rio.CollectionEntity, {
	"with no condition function": {
		beforeEach: function() {
			this.model = rio.Model.create({
				resource: "/resource",
				attrAccessors: ["id", "name"]
			});

			this.values = [
				new this.model({ id: 1, name: "apples" }),
				new this.model({ id: 2, name: "oranges" })
			];
			this.collectionEntity = rio.CollectionEntity.create({
				model: this.model,
				values: this.values
			});
		},

		"should have a reference to a rio.Model": function() {
			(this.collectionEntity.getModel() == this.model).shouldBeTrue();
		},
	
		"should allow array style reference of values": function() {
			(this.collectionEntity[0] == this.values[0]).shouldBeTrue();
		},
	
		"should add an object to the collection if the model matches": function() {
			var newEntity = new this.model({ id: 3, name: "banana" });
			this.collectionEntity.add(newEntity);
			this.collectionEntity.shouldInclude(newEntity);
		},
		
		"should not add an object to the collection if the model does not match": function() {
			var differentModel = rio.Model.create();
			var newEntity = new differentModel();
			this.collectionEntity.add(newEntity);
			this.collectionEntity.shouldNotInclude(newEntity);
		}
	},
	
	"with condition function": {
		beforeEach: function() {
			this.model = rio.Model.create({
				resource: "/resource",
				attrAccessors: ["id", "name"]
			});
			stub(rio.models, "Resource").withValue(this.model);
			this.model.prepareTransaction = function() {
				this.executeTransaction(rio.Undo.isProcessingUndo(), rio.Undo.isProcessingRedo());
			};

			this.collectionEntity = rio.CollectionEntity.create({
				model: this.model,
				values: [],
				condition: function(val) {
					return val.getName() == "Jason";
				}
			});
		},
		
		"should add an object to the collection if the model matches and the condition function evaluates true": function() {
			var newEntity = new this.model({ id: 1, name: "Jason" });
			this.collectionEntity.add(newEntity);
			this.collectionEntity.shouldInclude(newEntity);
		},

		"should add an object to the collection on update if the model matches and the condition function evaluates true": function() {
			var newEntity = new this.model({ id: 1, name: "Jason" });
			this.collectionEntity.update(newEntity);
			this.collectionEntity.shouldInclude(newEntity);
		},

		"should remove an object from the collection on update if the model matches but the condition function evaluates false": function() {
			var newEntity = new this.model({ id: 1, name: "Jason" });
			this.collectionEntity.add(newEntity);
			
			newEntity.setName("Bob");
			this.collectionEntity.update(newEntity);

			this.collectionEntity.shouldNotInclude(newEntity);
		},

		"should not add an object to the collection on update if entity is being destroyed": function() {
			var newEntity = new this.model({ id: 1, name: "Jason" });
		
			newEntity.destroy();
			
			this.collectionEntity.update(newEntity);
		
			this.collectionEntity.shouldNotInclude(newEntity);
		},
		
		"should not add an object if the model does not match": function() {
			var differentModel = rio.Model.create({
				resource: "/different_resource",
				attrAccessors: ["id", "name"]
			});
			var newEntity = new differentModel({ id: 2, name: "Jason" });
			this.collectionEntity.add(newEntity);
			this.collectionEntity.shouldNotInclude(newEntity);
		},
		
		"should not add an object if the condition function evaluates false": function() {
			var newEntity = new this.model({ id: 1, name: "Bob" });
			this.collectionEntity.add(newEntity);
			this.collectionEntity.shouldNotInclude(newEntity);
		}
	}
});






















