rio.Id = Class.create({
	initialize: function(id) {
		if (id) {
			this._val = id;
			this._temporary = false;
		} else {
			this._val = (Math.random() * -1000000000).round();
			this._temporary = true;
		}
		this._cacheKey = this._val;
		this._todos = [];
	},
	
	temporary: function() {
		return this._temporary;
	},
	
	cacheKey: function() {
		return this._cacheKey;
	},
	
	reify: function(realId) {
		if (!this._temporary) { return; }
		this._val = realId;
		this._temporary = false;
		this._todos.each(function(todo) { todo(); });
	},
	
	doAfterReification: function(todo) {
		if(!this._temporary) {todo();}
		this._todos.push(todo);
	},

	toString: function() {
		return this._val.toString();
	},
	
	value: function() {
		return this._val;
	}
});

rio.Id.toString = function() { return "Id"; };