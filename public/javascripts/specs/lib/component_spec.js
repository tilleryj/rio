describe(rio.Component, {
	"inheritance": {
		beforeEach: function() {
			var SuperComponent = rio.Component.create("SuperComponent", {
				attrAccessors: ["a"],
				attrHtmls: ["super"],
				methods: { 
					buildSuperHtml: function() { return "foo"; },
					superHello: function() { return "super world"; }
				}
			});
			var SubComponent = rio.Component.create(SuperComponent, "SubComponent", {
				attrAccessors: ["b"],
				attrHtmls: ["sub"],
				methods: { 
					buildSubHtml: function() { return "bar"; },
					subHello: function() { return "sub world"; }
				}
			});
			var SubSubComponent = rio.Component.create(SubComponent, "SubSubComponent", {
				attrAccessors: ["c"],
				attrHtmls: ["subSub"],
				methods: { 
					buildSubSubHtml: function() { return "baz"; },
					subSubHello: function() { return "sub sub world"; }
				}
			});
			
			this.component = new SubSubComponent({ a: 1, b: 2, c: 3 });
		},
		
		"should support attrHtmls": function() {
			this.component.subSubHtml().shouldEqual("baz");
		},

		"should inherit parent's attrHtmls": function() {
			this.component.subHtml().shouldEqual("bar");
		},

		"should inherit grandparent's attrHtmls": function() {
			this.component.superHtml().shouldEqual("foo");
		},
		
		"should support attrAccessors": function() {
			this.component.getC().shouldEqual(3);
		},
		
		"should inherit parent's attrAccessors": function() {
			this.component.getB().shouldEqual(2);
		},
		
		"should inherit grandparent's attrAccessors": function() {
			this.component.getA().shouldEqual(1);
		},
		
		"should support methods": function() {
			this.component.subSubHello().shouldEqual("sub sub world");
		},
		
		"should inherit parent's methods": function() {
			this.component.subHello().shouldEqual("sub world");
		},
		
		"should inherit grandparent's methods": function() {
			this.component.superHello().shouldEqual("super world");
		}
	}
});


















