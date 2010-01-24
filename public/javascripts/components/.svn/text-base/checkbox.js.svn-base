rio.components.Checkbox = rio.Component.create(rio.components.Base, "Checkbox", {
	require: ["components/label"],
	requireCss: "checkbox",
	attrAccessors: [
		"checked", 
		"label",
		["disabled", false]
	],
	attrReaders: [],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var randomId = "_rio_label_" + Math.random();

			var checkboxHtml = rio.Tag.input("", {
				id: randomId,
				type: "checkbox"
			});
			var labelHtml = rio.Tag.label("", { 
				htmlFor: randomId,
				className: "checkboxLabel"
			});
			
			this.label.bind(function(label) {
				labelHtml.update(label);
			});
			
			this.bind("checked", function(checked) {
				checkboxHtml.checked = checked;
			});
			
			this.bind("disabled", function(disabled) {
				checkboxHtml.disabled = disabled;
			});
			
			checkboxHtml.observe("click", function() {
				this.setChecked(checkboxHtml.checked);
				this.fire("click");
			}.bind(this));
			
			return rio.Tag.span([checkboxHtml, labelHtml], { className: "checkbox" });
		}
	}
});
