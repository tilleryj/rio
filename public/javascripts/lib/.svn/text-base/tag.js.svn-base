rio.Tag = {
	build: function (tag, body, args) {
	    args = args || {};
		if (Object.isArray(body)) {
			for (var i=body.length; i--;) {
				var elt = body[i];
				body[i] = elt.html ? elt.html() : elt;
			}
		} else if (body && body.html) {
			body = body.html();
		}
		
	    var node = Builder.node(tag, args, body);

	    return $(node);
	},

	tags: [
		"span", 
		"div", 
		"table", 
		"thead", 
		"tbody", 
		"tr", 
		"td",
		"th", 
		"h1", 
		"h2", 
		"hr", 
		"br",
		"a", 
		"p", 
		"textarea",
		"label",
		"input",
		"button",
		"img",
		"option",
		"pre",
		"ul",
		"li",
		"iframe",
		"link",
		"script",
		"select"
	]
};
(function() {
	rio.Tag.tags.each(function(tag) {
		rio.Tag[tag] = rio.Tag.build.curry(tag);
	});
})();
