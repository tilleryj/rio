rio.Parameters = Class.create({
	initialize: function(parameters, nonAjaxParameters) {
		this.parameters = parameters;
		this.nonAjaxParameters = nonAjaxParameters || {};
	},
	
	ajaxParameters: function() {
		var ajaxParameters = {};
		Object.keys(this.parameters).each(function(parameter) {
			var val = this.parameters[parameter];
			if (val && val.not) {
				// Do nothing.  Allow Object.toJSON to stringify it.
			} else if (val && val !== true && val.toString) {
				val = val.toString();
			}
			ajaxParameters[parameter.underscore()] = val;
		}.bind(this));
		return ajaxParameters;
	},
	
	// ======================================================
	// = THIS FUNCTION IS CALLED A MASSIVE AMOUNT OF TIMES. =
	// ======================================================
	/*
		BE CAREFUL about what you add to this function.  It has been heavily
		performance optimized.
	*/
	conditionFunction: function() {
		return (function(obj) {
			var evaluate = function(parameters) {
				for (var parameter in parameters) {
					var val = parameters[parameter];
					var objVal = obj["_" + parameter];

					if (val && val.not) {
						if (objVal == val.not) { return false; }
					} else {
						var paramIsAnId = val && val.cacheKey;
						var fieldIsAnId = objVal && objVal.cacheKey;
						if (fieldIsAnId || paramIsAnId) {
							if (fieldIsAnId && paramIsAnId) {
								if (objVal.cacheKey() != val.cacheKey()) { return false; }
							} else if (paramIsAnId) {
								if (objVal != val.value()) { return false; }
							} else {
								if (objVal.value() != val) { return false; }
							}
						} else {
							if (objVal != val) { return false; }
						}
					}
				}
				return true;
			};
			return evaluate(this.parameters) && evaluate(this.nonAjaxParameters);
		}.bind(this));
	}
});
rio.Parameters.toString = function() { return "Parameters"; };