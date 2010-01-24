rio.Instrumenter = {
	instrument: function(filePath) {
		rio.File.open(rio.boot.appRoot + filePath + ".js", {
			asynchronous: false,
			onSuccess: function(text) {
				this.parseBlocks(text);
			}.bind(this)
		});
	},

	parseBlocks: function(text) {
		var tokens = this.tokenize(text);
		rio.log(tokens.map(function(t) { return t.token; }).join("\n"));
		var CONTEXTS = {
			NONE: 0,
			FUNCTION: 1,
			OBJECT: 2,
			ARRAY: 3,
			COMMENT: 4
		};
		
		var context = CONTEXTS.NONE;
		var out = "";
		for (var i = 0; i < text.length; i++) {
			
		}
	},

	tokenize: function(text) {
		var CONTEXTS = {
			NONE: 0,
			STRING: 1,
			COMMENT: 2,
			BLOCK_COMMENT: 3,
			NUMBER: 4
		};
		var context = CONTEXTS.NONE;

		var lineNumber = 1;
		var tokens = [];
		var soFar = "";
		var addToken = function() {
			tokens.push({
				lineNumber: lineNumber,
				token: soFar
			});
			soFar = "";
		};
		for (var i = 0; i < text.length; i++) {
			var c = text[i];
			switch(context) {
			case CONTEXTS.NONE:
				switch(c) {
				case ' ':
				case '\t':
				case '\n':
					if (soFar != "") { addToken(); }
					break;
				case '"':
					
					break;
				default:
					if (soFar == "/" && c == "*") {
						context = CONTEXTS.BLOCK_COMMENT;
						soFar = "";
					} else if (soFar == "/" && c == "/") {
						context = CONTEXTS.COMMENT;
						soFar = "";
					} else {
						soFar += c;
					}
				}
				break;
			case CONTEXTS.STRING:
				break;
			case CONTEXTS.COMMENT:
				switch(c) {
				case "\n":
					context = CONTEXTS.NONE;
				}
				break;
			case CONTEXTS.BLOCK_COMMENT:
				switch(c) {
				case "*":
					soFar = "*";
					break;
				case "/":
					if (soFar == "*") { context = CONTEXTS.NONE };
				default: 
					soFar = "";
				}
				break;
			}

			if (c == "\n") { lineNumber += 1;  }
		}
		return tokens;
	},

	wrap: function(fcn) {
		rio.log("WRAP");
		return fcn();
	},

	toString: function() { return "Instrumenter"; }
};
