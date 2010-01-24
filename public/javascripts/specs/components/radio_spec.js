describe(rio.components.Radio, {
	beforeEach: function() {
		this.radio1 = rio.components.Radio.example("a1");
		this.radio2 = rio.components.Radio.example("a2");
		insertComponent(this.radio1);
		insertComponent(this.radio2);
	},
	
	"should have an html radio element": function() {
		this.radio1.html().childElements()[0].tagName.shouldEqual("INPUT");
		this.radio1.html().childElements()[0].type.shouldEqual("radio");
	},
	
	"should have the proper checked attribute": function() {
		this.radio1.html().childElements()[0].checked.shouldBeFalse();
		this.radio2.html().childElements()[0].checked.shouldBeTrue();
	},
	
	"should update the checked attribute when updating the html checkbox": function() {
		this.radio1.html().childElements()[0].simulate("click");
		this.radio1.getChecked().shouldBeTrue();
	},
	
	"should update the html checked attribute when update the checked attribute": function() {
		this.radio1.setChecked(true);
		this.radio1.html().childElements()[0].checked.shouldBeTrue();
	},

	"should update the other radio buttons html checked attributes when updating the checked attribute": function() {
		this.radio1.setChecked(true);
		this.radio2.html().childElements()[0].checked.shouldBeFalse();
	},

	"should update the other radio buttons checked attributes when updating the checked attribute": function() {
		this.radio1.html().childElements()[0].simulate("click");
		this.radio2.getChecked().shouldBeFalse();
	}
	

});