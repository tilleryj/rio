rio.Dependencies = Class.create({
	initialize: function(options) {
		this._app = options.app;
		this._loadedScripts = options.loadedScripts;
		this._loadedStylesheets = options.loadedStylesheets;
		this._loadedTemplates = options.loadedTemplates;
	},
	
	storedDependencies: function(onSuccess) {
		rio.File.open("/javascripts/" + this._app + ".build", {
			onSuccess: function(file) {
				onSuccess(file);
			}
		});
	},
	
	matchLoadedFiles: function(options) {
		
		var checkDependencies = function(stored, loaded) {
			var match = true;
			if (loaded.length == 0) {
				match = match && (stored == undefined);
			} else {
				match = match && loaded.length == stored.length;
				for (var i=0, length = loaded.length; i < length; i++) {
					match = match && loaded[i] == stored[i];
				}
			}
			return match;
		};
		
		this.storedDependencies(function(file) {
			var match = true;
			try {
				var storedDependencies = rio.Yaml.parse(file);

				match = match && checkDependencies(storedDependencies.scripts, this._loadedScripts);
				match = match && checkDependencies(storedDependencies.templates, this._loadedTemplates);
				match = match && checkDependencies(storedDependencies.stylesheets, this._loadedStylesheets);
			} catch(e) {
				match = false;
			}
			
			if (match) {
				(options.onSuccess || Prototype.emptyFunction)();
			} else {
				options.onFailure();
			}
		}.bind(this));
	},
	
	synchronize: function(options) {
		rio.File.write("/javascripts/" + this._app + ".build", this.yaml(), {
			onSuccess: options.onSuccess
		});
	},
	
	yaml: function() {
		var dependenciesFile = rio.File.open("/javascripts/" + this._app + ".build", { asynchronous: false });
		var dependencies = rio.Yaml.parse(dependenciesFile);

		dependencies.scripts = this._loadedScripts;
		if (!this._loadedTemplates.empty()) {
			dependencies.templates = this._loadedTemplates;
		} else {
			delete dependencies.templates;
		}
		if (!this._loadedStylesheets.empty()) {
			dependencies.stylesheets = this._loadedStylesheets;
		} else {
			delete dependencies.stylesheets;
		}

		return rio.Yaml.dump(dependencies);
	}
});