rio.apps.console = rio.Application.create("Console", {
	require: ["lib/console/pages/console_page"],
	requireCss: ["css_reset", "console"],
	routes: {
		"": "consolePage"
	},
	methods: {
		initialize: function() {
			rio.log = opener.rio.log;
		},

		consolePage: function() {
			var consolePage = new rio.pages.ConsolePage();
		
			window.log = function(msg, className, prefix) {
				consolePage.log(msg, className, prefix);
			}
			window.setApplication = function(options) {
				consolePage.setApplication(options);
			}
			window.touch = function(files) {
				consolePage.touch(files);
			}

			return consolePage;
		}
	}
});
