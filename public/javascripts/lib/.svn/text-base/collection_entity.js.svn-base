rio.CollectionEntity = {
	create: function(options) {
		options = Object.extend({
			values: [],
			condition: function() { return true; }
		}, options);
		var collectionEntity = $A(options.values);
		
		collectionEntity.getModel = function() {
			return options.model;
		};
		
		collectionEntity.add = function(val) {
			if (val.__model == this.getModel() && !this.include(val) && options.condition(val)) {
				return this.push(val);
			}
		};
		
		collectionEntity.update = function(val) {
			var index = this.indexOf(val);
			if (val.__model == this.getModel() && options.condition(val)) {
				if (index < 0) {
					if (!val.__destroying) {
						this.push(val);
					}
				}
			} else {
				if (index >= 0) {
					this.splice(index, 1);
				}
			}
		};
		
		collectionEntity.remove = function(val) {
			if (this.include(val)) {
				this.splice(this.indexOf(val), 1);
			}
		};
		
		return collectionEntity;
	},

	toString: function() {
		return "CollectionEntity";
	}
};