describe(rio.components.Input, {

	"with no value or class names": {
		beforeEach: function() {
	 		this.inputBox = rio.components.Input.example("empty");
			insertComponent(this.inputBox);
		},
		
		"should have an empty string for value": function() {
			this.inputBox.getValue().shouldEqual("");
		},
		
		"should have an html input box value of empty string": function() {
			this.inputBox.html().value.shouldEqual("");
		},
		
		"should update the html input box value when the value is set": function() {
			this.inputBox.setValue("new value");
			this.inputBox.html().value.shouldEqual("new value");
		},
		
		"should update the value when the html input box value is updated": function() {
			this.inputBox.html().enterText("some typed in value");
			this.inputBox.getValue().shouldEqual("some typed in value");
		},
		
		"should blur when the enter key is pressed": function() {
			this.inputBox.html().simulate("focus");
			focus();
			this.inputBox.html().observe("blur", function() {}.shouldBeCalled);
			this.inputBox.html().simulate("keypress", { character: "\n" });
		},
		
		"should have a className of input": function() {
			this.inputBox.html().className.strip().shouldEqual("input");
		}
	},
	
	"with a starting value of hello, a class name of world, and hover/focus class names": {
		beforeEach: function() {
	 		this.inputBox = rio.components.Input.example("helloWorld");
			insertComponent(this.inputBox);
		},
		
		"should have a value of 'hello'": function() {
			this.inputBox.getValue().shouldEqual("hello");
		},
		
		"should have an html input box value of hello": function() {
			this.inputBox.html().value.shouldEqual("hello");
		},
		
		"should have a className of 'input world'": function() {
			this.inputBox.html().className.shouldEqual("input world");
		},
		
		"should include the hover className on hover": function() {
			this.inputBox.html().simulate("mouseover");
			this.inputBox.html().hasClassName("hover").shouldBeTrue();
			this.inputBox.html().simulate("mouseout");
			this.inputBox.html().hasClassName("hover").shouldBeFalse();
		},

		"should include the focus className on focus": function() {
			this.inputBox.html().simulate("focus");
			this.inputBox.html().hasClassName("focus").shouldBeTrue();
			this.inputBox.html().simulate("blur");
			this.inputBox.html().hasClassName("focus").shouldBeFalse();
		}
	}
});