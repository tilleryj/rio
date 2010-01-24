rio.pages.ConsolePage = rio.Page.create("ConsolePage", {
	require: [
		"lib/dependencies",
		"components/tab_bar",
		"lib/console/components/dependencies_list",
		"lib/console/components/console",
		"lib/console/components/docs",
		"lib/console/components/playground",
		"lib/console/components/benchmark",
		"components/image"
	],
	template: "console_page",
	methods: {
	
		render: function() {
			this.getConsoleTab().selected.bind(function(selected) { 
				this.getConsole()[selected ? "show" : "hide"]();
				this.getConsole().focus.bind(this.getConsole()).defer();
			}.bind(this));
			this.getPlaygroundTab().selected.bind(function(selected) { 
				this.getPlayground()[selected ? "show" : "hide"]();
				this.getPlayground().focus.bind(this.getPlayground()).defer();
			}.bind(this));
			this.getBenchmarkTab().selected.bind(function(selected) { 
				this.getBenchmark()[selected ? "show" : "hide"]();
			}.bind(this));
			this.getDependenciesTab().selected.bind(function(selected) { 
				this.getDependenciesList()[selected ? "show" : "hide"]();
			}.bind(this));
			this.getDocsTab().selected.bind(function(selected) { 
				this.getDocs()[selected ? "show" : "hide"]();
			}.bind(this));

			var loadedMessage = "Booted: " + opener.rio.boot.appName + (opener.rio.boot.bootCompressed ? " (compressed)" : "");
			this.log(loadedMessage);
			opener.rio.console.onload();
			this.getConsole().focus.bind(this.getConsole()).defer();
			
			if (opener.rio.push) {
				opener.rio.push.live.bind(function(live) {
					this.getPushConnectionIndicator().setSrc(live ? "green-circle.png" : "red-circle.png");
				}.bind(this));
			}
			
			Event.observe(window, "load", function() {
				(function() { rio.ContainerLayout.resize();	}).defer();
				(function() { rio.ContainerLayout.resize();	}).delay(1);
			});
		},
	
		setApplication: function(options) {
			var dependencies = this.checkDependencies({
				app: "apps/" + options.name,
				loadedScripts: options.scripts,
				loadedStylesheets: options.stylesheets,
				loadedTemplates: options.templates,
				onFailure: function() {
					this.getDependenciesTab().setName("Dependencies (out of sync)");
					this.getDependenciesTab().html().setStyle({ color: "#B41C00", fontWeight: 700 });
				}.bind(this)
			});
			this.getDependenciesList().setContent(dependencies.yaml());
			
			this.checkDependencies({
				app: "lib/console/apps/console",
				loadedScripts: rio.boot.appScripts(),
				loadedStylesheets: rio.boot.loadedStylesheets,
				loadedTemplates: rio.boot.loadedTemplates
			});
		},
		
		checkDependencies: function(options) {
			var dependencies = new rio.Dependencies({ 
				app: options.app, 
				loadedScripts: options.loadedScripts,
				loadedStylesheets: options.loadedStylesheets,
				loadedTemplates: options.loadedTemplates
			});
			
			var syncInProgress = rio.Tag.img("", { 
				src: "/javascripts/lib/console/loading.gif",
				style: "display: none; position: relative; top: 3px;"
			});
			var syncComplete = rio.Tag.span("[synchronized]", { style: "display: none; color: #999; font-size: 11px" });
			var syncButton = new rio.components.Button({ 
				text: "synchronize",
				onClick: function() {
					syncButton.hide();
					syncInProgress.show();
					dependencies.synchronize({
						onSuccess: function() {
							syncInProgress.hide();
							syncComplete.show();
						}
					});
				}
			});
			
			dependencies.matchLoadedFiles({
				onFailure: function() {
					if (opener.rio.boot.bootCompressed) { return; }
					this.logHtml([
						"> " + options.app + ": Dependencies out of sync. ", 
						rio.Tag.span([syncButton, syncInProgress, syncComplete])
					], "errorLogItem");
					(options.onFailure || Prototype.emptyFunction)();
				}.bind(this)
			});
			
			return dependencies;
		},
		
		keyPress: function(e) {
			switch(e.keyCode) {
			case Event.KEY_LEFT:
				if (e.ctrlKey && e.shiftKey) {
					this.getTabs().selectPrevious();
					e.stop();
				}
				break;
			case Event.KEY_RIGHT:
				if (e.ctrlKey && e.shiftKey) {
					this.getTabs().selectNext();
					e.stop();
				}
			}
		},
	
		log: function(msg, className, prefix) {
			this.getConsole().log(msg, className, prefix);
		},
		
		logHtml: function(msg, className) {
			this.getConsole().logHtml(msg, className);
		},
		
		touch: function(files) {
			this.getConsole().touch(files);
		},

		selectDependenciesPane: function() {
			this.getDependenciesTab().setSelected(true);
		},	

		selectPlaygroundPane: function() {
			this.getPlaygroundTab().setSelected(true);
		}
	}
});
