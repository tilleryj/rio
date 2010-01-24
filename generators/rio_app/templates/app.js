<%- app_name = class_name.sub(/./) {|a| a.downcase } %>
<%- page_method_name = app_name + "Page" %>
rio.apps.<%= app_name %> = rio.Application.create({
	require: ["pages/<%= file_name %>_page"],
	requireCss: ["css_reset", "<%= file_name %>"],
	routes: {
		"": "<%= page_method_name %>"
	},
	attrAccessors: [],
	attrReaders: [],
	methods: {
		initialize: function(options) {
		},
	
		<%= page_method_name %>: function() {
			return new rio.pages.<%= class_name %>Page();
		}
	}
});

