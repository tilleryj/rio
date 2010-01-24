rio.Undo = {
	setQueue: function(queue) {
		if (!this._bindingPoints) {
			this._bindingPoints = new (rio.Attr.create({
				attrAccessors: [
					"queue", 
					["hasUndos", false], 
					["hasRedos", false]
				]
			}))();
			
			this._bindingPoints.bind("queue.undos", {
				empty: function(empty) {
					this._bindingPoints.setHasUndos(!empty);
				}.bind(this)
			});
			this._bindingPoints.bind("queue.redos", {
				empty: function(empty) {
					this._bindingPoints.setHasRedos(!empty);
				}.bind(this)
			});
			
			this.hasUndos = this._bindingPoints.hasUndos;
			this.hasRedos = this._bindingPoints.hasRedos;
		}
		
		this._bindingPoints.setQueue(queue);
		this._queue = queue;
	},
	
	undoQueueEmpty: function() {
		return this._queue.getUndos().empty();
	},
	
	redoQueueEmpty: function() {
		return this._queue.getRedos().empty();
	},
	
	isProcessingUndo: function() {
		return this._queue.getProcessingUndo();
	},
	
	isProcessingRedo: function() {
		return this._queue.getProcessingRedo();
	},
	
	setProcessingUndo: function(val) {
		this._queue.setProcessingUndo(val);
	},

	setProcessingRedo: function(val) {
		this._queue.setProcessingRedo(val);
	},
	
	registerUndo: function(undo, dontClearRedos) {
		if (!dontClearRedos) {
			this._queue.getRedos().clear();
		}
		this._queue.getUndos().push(function() {
			rio.Undo.setProcessingUndo(true);
			try {
				undo();
			} finally {
				rio.Undo.setProcessingUndo(false);
			}
		});
	},

	registerRedo: function(redo) {
		this._queue.getRedos().push(function() {
			rio.Undo.setProcessingRedo(true);
			try {
				redo();
			} finally {
				rio.Undo.setProcessingRedo(false);
			}
		});
	},
	
	undo: function() {
		this._doAction("undo");
	},
	
	redo: function() {
		this._doAction("redo");
	},

	_actionProgress: false,
	_actionQueue: [],
	_doAction: function(action) {
		if (this._actionProgress) {
			this._actionQueue.push(this[action].bind(this));
			return;
		}
		this._actionProgress = true;
		try {
			var toDo = this._queue[("get-" + action + "s").camelize()]().pop();
			if (toDo) { 
				rio.Attr.transaction(function() {
					toDo();
				});
			}
		} finally {
			this._afterAction();
		}
	},
	
	_doAfterAction: function() {
		(function() {
			this._afterAction();
		}.bind(this)).defer();
	},
	
	_afterAction: function() {
		var next = this._actionQueue.shift();
		this._actionProgress = false;
		if (next) {
			next();
		}
	},
	
	toString: function() { return "Undo"; }
};

rio.UndoQueue = rio.Attr.create({
	attrAccessors: [
		["undos", []],
		["redos", []],
		["processingUndo", false],
		["processingRedo", false]
	]
});

rio.Undo.setQueue(new rio.UndoQueue());
