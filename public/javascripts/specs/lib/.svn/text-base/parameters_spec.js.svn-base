describe(rio.Parameters, {
	beforeEach: function() {
		this.parameters = new rio.Parameters({ arg: "value", anotherArg: 3 });
	},
	
	"should provide an ajax parameters representation": function() {
		this.parameters.ajaxParameters().arg.shouldEqual("value");
		this.parameters.ajaxParameters().another_arg.shouldEqual(3);
	},
	
	"should provide a condition function that determines if an Attr instance meets the parameters": function() {
		var model = rio.Model.create({ attrReaders: ["arg", "anotherArg", "unrelatedArg"] });
		var meetsConditions = new model({ arg: "value", anotherArg: 3, unrelatedArg: "asdfqwer" });
		this.parameters.conditionFunction()(meetsConditions).shouldBeTrue();
		
		var doesNotMeetConditions = new model({ arg: "asdf", anotherArg: 2, unrelatedArg: "asdfqwer" });
		this.parameters.conditionFunction()(doesNotMeetConditions).shouldBeFalse();
	},
	
	"should provide a condition function that matches two id's by cacheKey": function() {
		var model = rio.Model.create({ 
			resource: "/model", 
			attrReaders: ["arg", "anotherArg", "unrelatedArg"] 
		});
		
		var id = model.id();
		var meetsConditions = new model({ arg: "value", anotherArg: id, unrelatedArg: "asdfqwer" });
		var parameters = new rio.Parameters({ anotherArg: id }).conditionFunction()(meetsConditions).shouldBeTrue();
	},

	"should provide a condition function that matches one id against an integer": function() {
		var model = rio.Model.create({ 
			resource: "/model", 
			attrReaders: ["arg", "anotherArg", "unrelatedArg"] 
		});

		var id = model.id();
		id.reify(13);
		var meetsConditions = new model({ arg: "value", anotherArg: id, unrelatedArg: "asdfqwer" });
		var parameters = new rio.Parameters({ anotherArg: 13 }).conditionFunction()(meetsConditions).shouldBeTrue();
	},
	
	"should not stringify booleans": function() {
		var p = new rio.Parameters({ something: true });
		(typeof p.ajaxParameters().something).shouldEqual("boolean");
	},
	
	"with a 'not' parameter": {
		beforeEach: function() {
			this.parameters = new rio.Parameters({ 
				arg: "value", 
				anotherArg: { not: 3 } 
			});
		},

		"should provide an ajax parameters representation": function() {
			this.parameters.ajaxParameters().arg.shouldEqual("value");
			(this.parameters.ajaxParameters().another_arg.not == 3).shouldBeTrue();
		},

		"should provide a condition function that determines if an Attr instance meets the parameters": function() {
			var model = rio.Model.create({ attrReaders: ["arg", "anotherArg", "unrelatedArg"] });
			var meetsConditions = new model({ arg: "value", anotherArg: 2, unrelatedArg: "asdfqwer" });
			this.parameters.conditionFunction()(meetsConditions).shouldBeTrue();

			var doesNotMeetConditions = new model({ arg: "value", anotherArg: 3, unrelatedArg: "asdfqwer" });
			this.parameters.conditionFunction()(doesNotMeetConditions).shouldBeFalse();
		}
	},
	
	"with nonAjaxParameters specified": {
		beforeEach: function() {
			this.parameters = new rio.Parameters({ 
				arg: "value" 
			}, {
				anotherArg: { not: 3 } 
			});
		},

		"should provide an ajax parameters representation not including the nonAjaxParameters": function() {
			this.parameters.ajaxParameters().arg.shouldEqual("value");
			shouldBeUndefined(this.parameters.ajaxParameters().another_arg);
		},

		"should provide a condition function that determines if an Attr instance meets the parameters including the nonAjaxParameters": function() {
			var model = rio.Model.create({ attrReaders: ["arg", "anotherArg", "unrelatedArg"] });
			var meetsConditions = new model({ arg: "value", anotherArg: 2, unrelatedArg: "asdfqwer" });
			this.parameters.conditionFunction()(meetsConditions).shouldBeTrue();

			var doesNotMeetConditions = new model({ arg: "value", anotherArg: 3, unrelatedArg: "asdfqwer" });
			this.parameters.conditionFunction()(doesNotMeetConditions).shouldBeFalse();
		}
	}
});