rio.components.Radio = rio.Component.create(rio.components.Base, "Radio", {
	require: ["components/label"],
	requireCss: "radio",
	attrAccessors: ["checked", "label"],
	attrReaders: ["name"],
	attrEvents: ["click"],
	methods: {
		buildHtml: function() {
			var randomId = "_rio_radio_" + Math.random();
			
			var radioHtml = rio.Tag.input("", {
				id: randomId,
				type: "radio",
				name: this.getName()
			});
			
			var labelHtml = rio.Tag.label("", { 
				htmlFor: randomId,
				className: "radioLabel"
			});
			
			this.bind("checked", function(checked) {
				radioHtml.checked = checked;
			});
			
			this.label.bind(function(label) {
				labelHtml.update(label);
			});

			radioHtml.observe("change", function() {
				this.setChecked(radioHtml.checked);
			}.bind(this));

			radioHtml.observe("click", function() {
				this.setChecked(radioHtml.checked);
				this.fire("click");
			}.bind(this));
			
			this.getChecked = function() {
				return radioHtml.checked;
			};
			
			return rio.Tag.span([radioHtml, labelHtml], { className: "radio" });
		}
	}
});
