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
						var errorMessage = "";
						(attributes[attribute].validates || []).uniq().each(function(validate) {
							var newErrorMessage = "";
							if (Object.isString(validate)) {
								newErrorMessage = rio.Validators[validate](this[attribute].value());
							} else if (Object.isArray(validate)) {
								newErrorMessage = rio.Validators[validate[0]](this[attribute].value(), validate[1]);
							} else {
								newErrorMessage = validate(this.values());
							}

							if (!(newErrorMessage || "").blank()) {
								valid = false;
								errorMessage = newErrorMessage;
							}
						}.bind(this));

						this.errors[attribute].update(errorMessage);
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
	
	length: function(value, options) {
		var blank = value == undefined || value.blank();

		if (options.allowBlank && blank) { return ""; }

		if (blank) { return this.presence(value); }

		if (options.minimum && value.length < options.minimum) {
			return "must be at least " + options.minimum + " characters long";
		}
		if (options.maximum && value.length > options.maximum) {
			return "can't be more than " + options.maximum + " characters long";
		}
		
		return "";
	},
	
	toString: function() { return "Validators"; }
};