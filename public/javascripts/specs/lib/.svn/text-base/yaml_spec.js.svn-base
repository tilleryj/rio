describe(rio.Yaml, {
	"should parse an array": function() {
		rio.Yaml.parse("- hello\n- world").shouldEqual(["hello", "world"]);
	},

	"should lex an object": function() {
		var yaml = 
			"jason:\n" +
			"  age: 27\n" +
			"  city: Chicago";
		var tokens = rio.Yaml._tokenize(yaml);
		tokens[0].shouldEqual("jason:");
		tokens[1].shouldEqual("\n");
		tokens[2].shouldEqual("  age:");
		tokens[3].shouldEqual("27");
		tokens[4].shouldEqual("\n");
		tokens[5].shouldEqual("  city:");
		tokens[6].shouldEqual("Chicago");
	},
	
	"should parse an object": function() {
		var yaml = 
			"jason:\n" +
			"  age: 27\n" +
			"  city: Chicago, IL";
		var obj = rio.Yaml.parse(yaml);
		obj.jason.age.shouldEqual(27);
		obj.jason.city.shouldEqual("Chicago, IL");
	},

	"should parse an object with tabs for whitespace": function() {
		var yaml = 
			"jason:\n" +
			"\tage: 27\n" +
			"\tcity: Chicago";
		var obj = rio.Yaml.parse(yaml);
		obj.jason.age.shouldEqual(27);
		obj.jason.city.shouldEqual("Chicago");
	},
	
	"should parse an object with special characters in keys": function() {
		var yaml = 
			"images/green-circle.png:\n" +
			"  width: 27\n" +
			"  height: 10";
		var obj = rio.Yaml.parse(yaml);
		obj["images/green-circle.png"].width.shouldEqual(27);
		obj["images/green-circle.png"].height.shouldEqual(10);
	},
	
	"should lex an object with an array": function() {
		var yaml = 
			"users:\n" +
			"  - Jason\n" +
			"  - Vishu";
		var tokens = rio.Yaml._tokenize(yaml);
		tokens[0].shouldEqual("users:");
		tokens[1].shouldEqual("\n");
		tokens[2].shouldEqual("  - Jason");
	},

	"should parse an object with an array": function() {
		var yaml = 
			"users:\n" +
			"  - Jason\n" +
			"  - Vishu";
		rio.Yaml.parse(yaml).users.shouldEqual(["Jason", "Vishu"]);
	},

	"should parse an object with multiple arrays": function() {
		var yaml = 
			"users:\n" +
			"  - Jason\n" +
			"  - Vishu\n" + 
			"colors:\n" +
			"  - Green\n" +
			"  - Red";
		var obj = rio.Yaml.parse(yaml);
		obj.users.shouldEqual(["Jason", "Vishu"]);
		obj.colors.shouldEqual(["Green", "Red"]);
	},
	
	"should dump an array": function() {
		rio.Yaml.dump(["hello", "world"]).shouldEqual("- hello\n- world");
	},

	"should dump an object": function() {
		var yaml = 
			"jason:\n" +
			"  age: 27\n" +
			"  city: Chicago";
		var obj = {
			jason: {
				age: 27,
				city: "Chicago"
			}
		};
		rio.Yaml.dump(obj).shouldEqual(yaml);
	},

	"should dump an object with an array": function() {
		var yaml = 
			"users:\n" +
			"  - Jason\n" +
			"  - Vishu";
		var obj = {
			users: ["Jason", "Vishu"]
		};
		rio.Yaml.dump(obj).shouldEqual(yaml);
	},

	"should dump an object with multiple arrays": function() {
		var yaml = 
			"users:\n" +
			"  - Jason\n" +
			"  - Vishu\n" + 
			"colors:\n" +
			"  - Green\n" +
			"  - Red";
		var obj = {
			users: ["Jason", "Vishu"],
			colors: ["Green", "Red"]
		};
		rio.Yaml.dump(obj).shouldEqual(yaml);
	}
});

