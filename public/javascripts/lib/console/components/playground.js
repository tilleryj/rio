rio.Application.require("components/box");

rio.components.Playground = rio.Component.create(rio.components.Base, "Playground", {
	methods: {
		buildHtml: function() {
			var textarea = rio.Tag.textarea(opener.rio.Cookie.get("playgroundContent"), { className: "scripts" });

			var delayedRender = new rio.DelayedTask();
			var render = function() {
				delayedRender.delay(1000, function() {
					opener.rio.Cookie.set("playgroundContent", textarea.value);
					if (opener.rio.app.getCurrentPage().constructor = opener.rio.pages.PlaygroundPage) {
						opener.rio.app.reboot();
					}
				});
			};
			textarea.observe("keypress", render);
			
			if (Prototype.Browser.IE) {
				textarea.setStyle({ height: "500px" });
			}
			
			return textarea;
		},
		
		focus: function() {
			this.html().focus();
		}
	}
});