describe(rio.Form, {
	"with no validators": {
		beforeEach: function() {
			this.company = new (rio.Attr.create({ attrAccessors: ["name"] }))({ name: "Thinklink" });
		
			this.form = rio.Form.build({
				attributes: { 
					name: {},
					email: { initialValue: "tilleryj@gmail.com" },
					company: { initialValue: this.company.name }
				}
			});
		},

		"should accept a set of attributes and make them available as bindable attributes": function() {
			this.form.getName().shouldEqual("");
			this.form.setName("Hello");
			this.form.getName().shouldEqual("Hello");
		
			(this.form.name.constructor == rio.Binding).shouldBeTrue();
		},
	
		"should accept custom initial values for attributes": function() {
			this.form.getEmail().shouldEqual("tilleryj@gmail.com");
		},
	
		"should reset values back to their initial values": function() {
			this.form.setName("Jason");
			this.form.setEmail("asdf@thinklinkr.com");
			this.form.reset();

			this.form.getName().shouldEqual("");
			this.form.getEmail().shouldEqual("tilleryj@gmail.com");
		},
	
		"should allow bindable initial values": function() {
			this.form.getCompany().shouldEqual("Thinklink");
			this.company.setName("Apple");
			this.form.getCompany().shouldEqual("Thinklink");
			this.form.reset();
			this.form.getCompany().shouldEqual("Apple");
		},
	
		"should provide a commit method that invokes the onCommit function with the forms values": function() {
			var onCommit = function(values) {
				values.email.shouldEqual("tilleryj@gmail.com");
			}.shouldBeCalled();
			var form = rio.Form.build({
				attributes: { 
					email: { initialValue: "tilleryj@gmail.com" }
				},
				onCommit: onCommit
			});
			form.commit();
		},
		
		"should be valid": function() {
			this.form.valid().shouldBeTrue();
		}
	},
	
	"with validators": {
		beforeEach: function() {
			this.form = rio.Form.build({
				attributes: { 
					name: {
						validates: [function(values) {
							if (values.name.length > 5) {
								return "Name cannot be longer than 5 characters.";
							}
						}]
					},
					email: { 
						initialValue: "tilleryj@gmail.com",
						validates: ["email"]
					}
				}
			});
		},
		
		"should be valid initially": function() {
			this.form.valid().shouldBeTrue();
		},
		
		"should not be valid email is not a valid email address": function() {
			this.form.setEmail("");
			this.form.valid().shouldBeFalse();
			this.form.setEmail("asdf");
			this.form.valid().shouldBeFalse();
			this.form.setEmail("asdf@thinklinkr.");
			this.form.valid().shouldBeFalse();
			this.form.setEmail("asdf@thinklinkr.com");
			this.form.valid().shouldBeTrue();
		},
		
		"should not be valid if a validator function returns an error message": function() {
			this.form.setName("Hello World");
			this.form.valid().shouldBeFalse();
			this.form.setName("Hello");
			this.form.valid().shouldBeTrue();
		},
		
		"should not commit if in an invalid state": function() {
			var form = rio.Form.build({
				attributes: { 
					name: {
						validates: [function(values) { return "Never valid"; }]
					}
				},
				onCommit: function() {}.shouldNotBeCalled()
			});
			form.commit();
		},
		
		"should expose bindable error messages": function() {
			var emailErrors = this.form.errorsFor('email');
			(emailErrors.constructor == rio.Binding).shouldBeTrue();
			emailErrors.value().shouldEqual("");
			this.form.setEmail("asdf");
			emailErrors.value().shouldEqual("not a valid email address");
		},
		
		"should remove erros on reset even if the form is still in a bad state": function() {
			this.form = rio.Form.build({
				attributes: { 
					email: { 
						initialValue: "",
						validates: ["email"]
					}
				}
			});
			this.form.validate();
			this.form.errorsFor("email").value().shouldNotEqual("");
			this.form.reset();
			this.form.errorsFor("email").value().shouldEqual("");
		}
	}
});

describe(rio.Validators, {
	"should validate email": function() {
		var emailErrorMessage = "not a valid email address";
		rio.Validators.email("").shouldEqual(emailErrorMessage);
		rio.Validators.email("asdf@").shouldEqual(emailErrorMessage);
		rio.Validators.email("asdf@thinklinkr").shouldEqual(emailErrorMessage);
		rio.Validators.email("asdf@thinklinkr.").shouldEqual(emailErrorMessage);
		rio.Validators.email("@thinklinkr.com").shouldEqual(emailErrorMessage);
		rio.Validators.email("thinklinkr.com").shouldEqual(emailErrorMessage);
		rio.Validators.email("asdf@thinklinkr.com").shouldEqual("");
		rio.Validators.email("asdf+extra@thinklinkr.com").shouldEqual("");
	},
	
	"should validate presence": function() {
		var errorMessage = "cannot be blank";
		rio.Validators.presence().shouldEqual(errorMessage);
		rio.Validators.presence("").shouldEqual(errorMessage);
		rio.Validators.presence(" ").shouldEqual(errorMessage);
		rio.Validators.presence("   ").shouldEqual(errorMessage);
		rio.Validators.presence("anything").shouldEqual("");
	}
});










