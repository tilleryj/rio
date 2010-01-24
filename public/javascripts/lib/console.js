rio.require("components/notification", { track: false });

rio.console.loaded = false;
rio.console.logQueue = [];

rio.log = function(msg, className, prefix) {
	if (rio.console.loaded) {
		rio.console.window.log(msg, className, prefix);
	} else {
		rio.console.logQueue.push({ msg: msg, className: className, prefix: prefix});
	}
};

rio.error = function(e, msg) {
	try {
		if (e.errorLogged) { return; }
		var fullMessage = (msg ? msg + "\n\n" : "") + e
		rio.log(fullMessage, "errorLogItem", "> ");
		e.errorLogged = true;

		var htmlMessage = rio.Tag.div("", { style: "text-align: left; padding: 0px 10px; line-height: 24px" });
		htmlMessage.update(fullMessage.replace(/\n/g, "<br />"));
		new rio.components.Notification({
			iconSrc: "/images/icons/error-big.png",
			body: htmlMessage
		});
	} catch(e) {
		// ignore errors writing errors
	}
};

rio.warn = function(msg) {
	rio.log(msg, "warningLogItem", "- ");
};

rio.console.launch = function() {
	rio.console.loaded = false;
	rio.console.window = window.open('/javascripts/lib/console/console.html', "rio_console:" + document.location.host, "width=900,height=800,scrollbars=yes,resizable=yes");
	rio.console.initializePlayground();
};

rio.console.initializePlayground = function() {
	rio.require("pages/playground_page", { track: false });
	
	rio.Application.afterLaunch(function() {
		var appClass = rio.app.constructor;
		if (appClass.__routes) {
			delete appClass.__routes.playground;
			appClass.__routes = Object.extend({ playground: "playground" }, appClass.__routes);
			rio.app.playground = function() {
				return new rio.pages.PlaygroundPage();
			};
		}
	});
};

rio.console.touch = function(files) {
	rio.console.window.touch(files);
};

rio.console.onload = function() {
	rio.console.loaded = true;
	rio.console.window.setApplication({
		name: rio.boot.appName, 
		scripts: rio.boot.appScripts(), 
		stylesheets: rio.boot.loadedStylesheets,
		templates: rio.boot.loadedTemplates
	});
	rio.console.logQueue.each(function(msg) { rio.log(msg.msg, msg.className, msg.prefix); });
	rio.console.logQueue = [];
}

if (rio.boot.environment == "development" && !rio.boot.noConsole) {
	document.observe("dom:loaded", rio.console.launch);
}
