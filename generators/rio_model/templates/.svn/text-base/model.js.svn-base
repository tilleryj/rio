rio.models.<%= class_name %> = rio.Model.create("<%= class_name %>", {
	require: [],
	resource: "/<%= file_name %>s",
	attrAccessors: [<%= attributes.map {|attr| "\"#{ attr.camelize.sub(/./) { |a| a.downcase } }\"" }.join(", ") %>],
	attrReaders: [],
	methods: {

	}
});