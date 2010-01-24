describe(rio.components.Checkbox, {
	beforeEach: function() {
		this.checkbox = rio.components.Checkbox.example("checked");
		insertComponent(this.checkbox);
	},
	
	"should have an html checkbox element": function() {
		this.checkbox.html().childElements()[0].tagName.shouldEqual("INPUT");
		this.checkbox.html().childElements()[0].type.shouldEqual("checkbox");
	},
	
	"should have a checked html element": function() {
		this.checkbox.html().childElements()[0].checked.shouldBeTrue();
	},
	
	"should update the checked attribute when updating the html checkbox": function() {
		this.checkbox.html().childElements()[0].simulate("click");
		this.checkbox.getChecked().shouldBeFalse();
	},
	
	"should update the html checked attribute when update the checked attribute": function() {
		this.checkbox.setChecked(false);
		this.checkbox.html().childElements()[0].checked.shouldBeFalse();
	}

});