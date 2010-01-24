describe(rio.JsTemplate, {
	"with no custom tags": {
		beforeEach: function() {
			this.template = new rio.JsTemplate({
				text: '<div><span rio:id="hello">world</span></div>'
			});
		},
	
		"should have a default name of 'tempate'": function() {
			this.template.name().shouldEqual("template");
		},
	
		"should remove the rio:id tag and mix an accessor into the context": function() {
			var context = {};
			var html = this.template.render(context);
			html.childElements()[0].tagName.shouldEqual("DIV");
			html.childElements()[0].childElements()[0].tagName.shouldEqual("SPAN");
			html.childElements()[0].childElements()[0].innerHTML.shouldEqual("world");
			html.childElements()[0].childElements()[0].id.shouldEqual("");
			context.getHelloElement().tagName.shouldEqual("SPAN");
		},
		
		"should provide a build HTML method in the context mixin methods": function() {
			var html = this.template.mixinMethods().buildHtml();
			html.childElements()[0].tagName.shouldEqual("DIV");
			html.childElements()[0].childElements()[0].tagName.shouldEqual("SPAN");
			html.childElements()[0].childElements()[0].innerHTML.shouldEqual("world");
			html.childElements()[0].childElements()[0].id.shouldEqual("");
		}
	},

	"with custom tags": {
		beforeEach: function() {
			if (!rio.components.Box) { rio.File.execute(rio.boot.root + "components/box.js", { asynchronous: false }); }
			this.template = new rio.JsTemplate({
				text: '<rio:Box rio:id="hello" height="10" />',
				name: "editor"
			});
			this.context = {};
			this.template.render(this.context);
		},
		
		"should have the correct name": function() {
			this.template.name().shouldEqual("editor");
		},
		
		"should mixin component accessors": function() {
			this.context.getHello().html().tagName.shouldEqual("DIV");
		},

		"should build components with attributes": function() {
			this.context.getHello().getHeight().shouldEqual("10");
		}
	},

	"with complex custom tags": {
		beforeEach: function() {
			if (!rio.components.Box) { rio.File.execute(rio.boot.root + "components/box.js", { asynchronous: false }); }
			this.template = new rio.JsTemplate({
				text: '<rio:Box rio:id="hello" height="{ 1 + 2 }"><className>world</className><width>13px</width><region><rio:Object><attribute>b</attribute></rio:Object></region></rio:Box>',
				name: "editor"
			});
			this.context = {};
			this.template.render(this.context);
		},
		
		"should build components with evaluative {} attributes": function() {
			this.context.getHello().getHeight().shouldEqual(3);
		},

		"should build components with elemental attributes": function() {
			this.context.getHello().getClassName().shouldEqual("world");
		},
		
		"should build components with more than one elemental attribute": function() {
			this.context.getHello().getWidth().shouldEqual("13px");
		},
		
		"should allow you to pass in an object as an elemental attribute using <rio:Object>": function() {
			this.context.getHello().getRegion().attribute.shouldEqual("b");
		}
	},
	
	"with the <select> tag": {
		beforeEach: function() {
			this.template = new rio.JsTemplate({
				text: '<select rio:id="cardType" class="popupForm" style="width: 300px"><option>asdf</option></select>',
				name: "editor"
			});
			this.context = {};
			this.template.render(this.context);
		},
		
		"should build a select tag correctly": function() {
			this.context.getCardTypeElement().tagName.shouldEqual("SELECT");
		}
	},
	
	/* Safari <4 serializes the \u00a0 representation back into a \u00a0 */
	"with nbsp; tags": {
		"should properly render a space": function() {
			var template = new rio.JsTemplate({
				text: '<div rio:id="divWithSpace">&nbsp;</div>',
				name: "editor"
			});
			var context = {};
			template.render(context);
			
			context.getDivWithSpaceElement().tagName.shouldEqual("DIV");
			var value = context.getDivWithSpaceElement().innerHTML;
			(value == "\u00a0" || value == "&nbsp;").shouldBeTrue();
		},

		"should properly render two spaces": function() {
			var template = new rio.JsTemplate({
				text: '<div rio:id="divWithSpace">&nbsp;&nbsp;</div>',
				name: "editor"
			});
			var context = {};
			template.render(context);
			
			context.getDivWithSpaceElement().tagName.shouldEqual("DIV");
			var value = context.getDivWithSpaceElement().innerHTML;
			(value == "\u00a0\u00a0" || value == "&nbsp;&nbsp;").shouldBeTrue();
		}
	}
});




