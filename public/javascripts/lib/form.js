rio.Form = {
	
	build: function(options) {
		var attributes = options.attributes || {};
		var attr = rio.Attr.create({ 
			attrAccessors: Object.keys(attributes),
			methods: {
				reset: function() {
					Object.keys(attributes).each(function(attribute) {
						var initialValue = attributes[attribute].initialValue || "";
						initialValue = initialValue.constructor == rio.Binding ? initialValue.value() : initialValue;
						this[attribute].update(initialValue || "");
						this.errors[attribute].update("");
					}.bind(this));
				},
				
				values: function() {
					var values = {};
					Object.keys(attributes).each(function(attribute) {
						values[attribute] = this[attribute].value();
					}.bind(this));
					return values;
				},
				
				commit: function() {
					if (this.valid()) {
						(options.onCommit || Prototype.emptyFunction)(this.values());
					}
				},
				
				errorsFor: function(field) {
					return this.errors[field];
				},
				
				valid: function() {
					return this.validate();
				},
				
				validate: function() {
					var valid = true;
					Object.keys(attributes).each(function(attribute) {
						(attributes[attribute].validates || []).uniq().each(function(validate) {
							var errorMessage = Object.isString(validate) ? 
								rio.Validators[validate](this[attribute].value()) :
								validate(this.values());
							errorMessage = errorMessage || "";
							if (!errorMessage.blank()) {
								valid = false;
							}
							this.errors[attribute].update(errorMessage);
						}.bind(this));
					}.bind(this));
					return valid;
				}
			}
		});
		var form = new attr();
		
		
		var errorAttr = rio.Attr.create({
			attrAccessors: Object.keys(attributes).map(function(attribute) { return [attribute, ""]; })
		});
		form.errors = new errorAttr();
		form.reset();

		Object.keys(attributes).each(function(attribute) {
			form[attribute].bind(form.validate.bind(form), true);
		});
		
		
		return form;
	}
	
	
};
rio.Form.toString = function() { return "Form"; };

rio.Validators = {
	email: function(value) {
		return value.validEmail() ? "" : "not a valid email address";
	},
	
	presence: function(value) {
		return value && !value.blank() ? "" : "cannot be blank";
	},
	
	toString: function() { return "Validators"; }
};