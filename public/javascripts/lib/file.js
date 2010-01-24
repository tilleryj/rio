rio.File = {
	open: function(path, options) {
		var file;
		var asynchronous = (options.asynchronous != undefined ? options.asynchronous : true); 
		new Ajax.Request(rio.url(path), {
			asynchronous: asynchronous,
			method: "get",
			evalJSON: false,
			evalJS: false,
			onSuccess: function(response) {
				file = response.responseText;
				(options.onSuccess || Prototype.emptyFunction)(file);
			},
			onFailure: function() {
				if(options.onFailure) {
					options.onFailure();
				} else {
					rio.Application.fail("Failed loading file: " + path);
				}
			}
		});
		if (!asynchronous) { return file; }
	},
	
	json: function(path, options) {
		new Ajax.Request(rio.url(path), {
			asynchronous: true,
			method: "get",
			evalJSON: true,
			evalJS: false,
			onSuccess: function(response) {
				options.onSuccess(response.responseJSON);
			},
			onFailure: function() {
				rio.Application.fail("Failed loading file: " + path);
			}
		});
	},
	
	execute: function(path, options) {
		new Ajax.Request(rio.url(path), {
			asynchronous: (options.asynchronous != undefined ? options.asynchronous : true),
			method: "get",
			evalJSON: false,
			evalJS: true,
			onSuccess: function(response) {
			},
			onFailure: function() {
				rio.Application.fail("Failed loading file: " + path);
			}
		});
	},
	
	write: function(path, content, options) {
		new Ajax.Request("/rio/file", {
			asynchronous: (options.asynchronous != undefined ? options.asynchronous : true),
			method: "post",
			evalJSON: false,
			evalJS: false,
			parameters: {
				path: path,
				content: content
			},
			onSuccess: function(response) {
				options.onSuccess(response);
			},
			onFailure: function() {
				rio.Application.fail("Failed writing file: " + path);
			}
		});
	}
};
