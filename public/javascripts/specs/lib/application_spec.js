/*

	Untested methods:
	
		applyHistoryEntry
		addHistoryEntry
		navigateTo
		clearPage
		reboot
		getCurrentLocation
		getCurrentPage
		setCurrentPage
		rootUrl

		#include
		#require
		#includeCss
		#getToken
		#setToken
		#fail

*/

describe(rio.Application, {
	
	"with no routes": {
		beforeEach: function() {
			this.lPressed = false;
			var application = rio.Application.create({
				methods: {
					keyMap: function() {
						return [
							{
								map: { key: 'l' },
								handler: function() {
									this.lPressed = true;
								}.bind(this)
							}
						];
					}.bind(this)
				}
			});
			this.applicationInstance = new application();
		},

		"should have no routes": function() {
			this.applicationInstance.noRoutes().shouldBeTrue();
		},
		
		"should avoid animation if IE": function() {
			stub(Prototype.Browser, "IE").withValue(true);
			this.applicationInstance.avoidAnimation().shouldBeTrue();
		},

		"should not avoid animation if not IE": function() {
			stub(Prototype.Browser, "IE").withValue(false);
			this.applicationInstance.avoidAnimation().shouldBeFalse();
		},
		
		"should reload the page on refresh": function() {
			/* You can't stub document.location.reload in firefox or chrome, so just skip the test */
			if (Prototype.Browser.Gecko || navigator.userAgent.indexOf("Chrome") > 0) { return; }

			stub(document.location, "reload").shouldBeCalled();
			this.applicationInstance.refresh();
		},
		
		"should execute keymaps on keypress": function() {
			this.applicationInstance.launch();
			
			var keyEvent = { keyCode: 76 };
			this.applicationInstance.keyDown(keyEvent);
			this.lPressed.shouldBeTrue();
		}
	},
	
	"with routes": {
		beforeEach: function() {
			stub(dhtmlHistory, "getCurrentLocation").andReturn("");


			var page = rio.Page.create({
				methods: {
					buildHtml: function() {
						return "";
					},
					
					render: function() {
						
					}
				}
			});
			this.lPressed = false;
			this.myPage = new page();
			this.application = rio.Application.create({
				routes: {
					"other": "otherPage",
					":something/hello": "helloPage",
					"business/:businessId": "helloPage",
					"hello/*world": "worldPage",
					"": "myPage"
				},
				methods: {
					myPage: function() {
						return this.myPage;
					}.bind(this),
					
					keyMap: function() {
						return [
							{
								map: { key: 'l' },
								handler: function() {
									this.lPressed = true;
								}.bind(this)
							}
						];
					}.bind(this)
				}
			});
			this.applicationInstance = new this.application();
		},
		
		"should not have no routes": function() {
			this.applicationInstance.noRoutes().shouldBeFalse();
		},

		"should fire its current page's resize event if the window is resized": function() {
			this.applicationInstance.launch();
			stub(this.myPage, "resize").shouldBeCalled();
			this.applicationInstance.resize();
		},
		
		"should fire its current page's keyPress event on keyPress": function() {
			this.applicationInstance.launch();
			
			var expectedEvent = { a: 1 };
			stub(this.myPage, "keyPress").withValue(function(actualEvent) {
				(expectedEvent === actualEvent).shouldBeTrue();
			}.shouldBeCalled());
			this.applicationInstance.keyPress(expectedEvent);
		},
		
		"should execute keymaps on keypress": function() {
			this.applicationInstance.launch();
			
			var keyEvent = { keyCode: 76 };
			this.applicationInstance.keyDown(keyEvent);
			this.lPressed.shouldBeTrue();
		},

		"should fire its current page's _keyDown event on keyDown": function() {
			this.applicationInstance.launch();
			
			var expectedEvent = { a: 1 };
			stub(this.myPage, "_keyDown").withValue(function(actualEvent) {
				(expectedEvent === actualEvent).shouldBeTrue();
			}.shouldBeCalled());
			this.applicationInstance.keyDown(expectedEvent);
		},
		
		"should not be launched before launch": function() {
			this.applicationInstance.launched().shouldBeFalse();
		},
		
		"should be launched after launch": function() {
			this.applicationInstance.launch();
			this.applicationInstance.launched().shouldBeTrue();
		},
			
		"should initialize the dhtmlHistory on launch": function() {
			stub(window.dhtmlHistory, "initialize").shouldBeCalled();
			this.applicationInstance.launch();
		},

		"should add applyHistoryEntry as a listener to the dhtmlHistory on launch": function() {
			stub(this.applicationInstance, "applyHistoryEntry").shouldBeCalled();
			stub(window.dhtmlHistory, "addListener").withValue(function(listener) {
				listener();
			}.shouldBeCalled());
			this.applicationInstance.launch();
		},

		"should immediately execute Application#afterLaunch calls if rio.app exists and has been launched": function() {
			stub(rio, "_afterLaunchFunctions").withValue([]);
			stub(rio, "app").withValue(this.applicationInstance);
			this.applicationInstance.launch();
			rio.Application.afterLaunch(function() {}.shouldBeCalled());
			rio.Application.afterLaunch(function() {}.shouldBeCalled());
		},

		"should not immediately execute Application#afterLaunch calls if rio.app does not exist": function() {
			stub(rio, "_afterLaunchFunctions").withValue([]);
			stub(rio, "app").withValue();
			rio.Application.afterLaunch(function() {}.shouldNotBeCalled());
		},

		"should not immediately execute Application#afterLaunch calls if rio.app exists but is not launched": function() {
			stub(rio, "_afterLaunchFunctions").withValue([]);
			stub(rio, "app").withValue(this.applicationInstance);
			rio.Application.afterLaunch(function() {}.shouldNotBeCalled());
		},

		"should process the Application class afterLaunch functions on launch": function() {
			stub(rio, "app").withValue(this.applicationInstance);
			rio.Application.afterLaunch(function() {}.shouldBeCalled());
			rio.Application.afterLaunch(function() {}.shouldBeCalled());
			this.applicationInstance.launch();
		},

		"should match exact matches": function() {
			this.applicationInstance.matchRoutePath("other").shouldEqual("other");
			this.applicationInstance.matchRoutePath("").shouldEqual("");
		},
		
		"should treat :part as wild cards separated by slashes": function() {
			this.applicationInstance.matchRoutePath("123/hello").shouldEqual(":something/hello");
		},

		"should treat :part as wild cards separated by slashes at end of url": function() {
			this.applicationInstance.matchRoutePath("business/123").shouldEqual("business/:businessId");
		},

		"should treat *part as optional": function() {
			this.applicationInstance.matchRoutePath("hello/123").shouldEqual("hello/*world");
			this.applicationInstance.matchRoutePath("hello").shouldEqual("hello/*world");
		},
		
		"should fail to create routes if the * is not on the last parameter": function() {
			var f = function() {}.shouldBeCalled();
			try {
				rio.Application.create({
					routes: {
						"*hello/world": "worldPage"
					}
				});
			} catch(e) {
				f();
			}
		},
		
		"should match anything to '' route": function() {
			this.applicationInstance.matchRoutePath("asdf").shouldEqual("");
		},
		
		"should return the match route target name": function() {
			this.applicationInstance.matchRouteTarget("asdf").shouldEqual("myPage");
			this.applicationInstance.matchRouteTarget("123/hello").shouldEqual("helloPage");
		},
		
		"should return anything after a slash trailing a match as remainingPath": function() {
			this.applicationInstance.remainingPath("asdf").shouldEqual("asdf");
			this.applicationInstance.remainingPath("123/hello/3/something").shouldEqual("3/something");
			this.applicationInstance.remainingPath("other/page").shouldEqual("page");
			this.applicationInstance.remainingPath("hello/anything").shouldEqual("anything");
		},
		
		"should return an empty hash for path parts that match path's with no wild-cards": function() {
			var parts = this.applicationInstance.pathParts("asdf");
			(parts.constructor == Object).shouldBeTrue();
			Object.keys(parts).shouldBeEmpty();
		},
		
		"should return a hash from the wildcard name to its value in the path for path parts": function() {
			this.applicationInstance.pathParts("123/hello").something.shouldEqual("123");
		},

		"should return a hash from the wildcard name to its value in the path for path parts when wild card is at the end": function() {
			this.applicationInstance.pathParts("business/123").businessId.shouldEqual("123");
		},

		"should return a hash from the optional name to its value in the path for path parts": function() {
			this.applicationInstance.pathParts("hello/456").world.shouldEqual("456");
		},

		"should fail the application if a route can't be found": function() {
			stub(rio.Application, "fail").shouldBeCalled();
			var app = new (rio.Application.create({
				routes: {
					"world": "asdf"
				}
			}))({});
			try {
				app.navigateTo("hello");
			} catch(e) {
				/* It's going to error here */
			}
		}
	}

});