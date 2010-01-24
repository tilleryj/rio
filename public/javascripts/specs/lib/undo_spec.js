describe(rio.Undo, {
	beforeEach: function() {
		this._oldQueue = rio.Undo._queue;
		
		this.queue = new rio.UndoQueue();
		rio.Undo.setQueue(this.queue);
	},
	
	"should demeter the current queue's isProcessing data": function() {
		this.queue.setProcessingUndo(true);
		rio.Undo.isProcessingUndo().shouldBeTrue();
		rio.Undo.setProcessingUndo(false);
		this.queue.getProcessingUndo().shouldBeFalse();
	},
	
	"should put something in the undo queue that can be executed with undo": function() {
		rio.Undo.registerUndo(function() {}.shouldBeCalled());
		rio.Undo.undo();
	},
	
	"should put something in the redo queue that can be redone": function() {
		rio.Undo.registerRedo(function() {}.shouldBeCalled());
		rio.Undo.redo();
	},
	
	"should be processingUndo when the registered undo function is called": function() {
		rio.Undo.registerUndo(function() {
			rio.Undo.isProcessingUndo().shouldBeTrue();
		}.shouldBeCalled());
		
		rio.Undo.undo();
		rio.Undo.isProcessingUndo().shouldBeFalse();
	},
	
	"should be processingRedo when the registered redo function is called": function() {
		rio.Undo.registerRedo(function() {
			rio.Undo.isProcessingRedo().shouldBeTrue();
		}.shouldBeCalled());
		
		rio.Undo.redo();
		rio.Undo.isProcessingRedo().shouldBeFalse();
	},
	
	"should clear the redo queue when you register an undo": function() {
		rio.Undo.registerRedo(function() {}.shouldNotBeCalled());
		rio.Undo.registerUndo(Prototype.emptyFunction());
		rio.Undo.redo();
	},
	
	"should not clear the redo queue when registering an undo and specifically asking to clear the queue": function() {
		rio.Undo.registerRedo(function() {}.shouldBeCalled());
		rio.Undo.registerUndo(Prototype.emptyFunction(), true);
		rio.Undo.redo();
	},
	
	"should remove an undo from the queue when calling it": function() {
		rio.Undo.registerUndo(function() {}.shouldBeCalled().once());
		rio.Undo.undo();
		rio.Undo.undo();
	},

	"should remove a redo from the queue when calling it": function() {
		rio.Undo.registerRedo(function() {}.shouldBeCalled().once());
		rio.Undo.redo();
		rio.Undo.redo();
	},
	
	"should process undos as attr transactions": function() {
		var attrInstance = new (rio.Attr.create({ attrAccessors: ["a"] }))();
		var aLastSetWith;
		attrInstance.a.bind(function(val) {
			aLastSetWith = val;
		});
		
		shouldBeUndefined(aLastSetWith);
		rio.Undo.registerUndo(function() {
			attrInstance.setA(5);
			shouldBeUndefined(aLastSetWith);
		});
		rio.Undo.undo();
		
		aLastSetWith.shouldEqual(5);
	},

	"should process redos as attr transactions": function() {
		var attrInstance = new (rio.Attr.create({ attrAccessors: ["a"] }))();
		var aLastSetWith;
		attrInstance.a.bind(function(val) {
			aLastSetWith = val;
		});
		
		shouldBeUndefined(aLastSetWith);
		rio.Undo.registerRedo(function() {
			attrInstance.setA(5);
			shouldBeUndefined(aLastSetWith);
		});
		rio.Undo.redo();
		
		aLastSetWith.shouldEqual(5);
	},
	
	afterEach: function() {
		rio.Undo.setQueue(this._oldQueue);
	}
});