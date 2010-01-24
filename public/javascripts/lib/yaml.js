// Based on the work of Tj Holowaychuk
// http://refactormycode.com/codes/1045-js-yaml-parser
//
// This implementation is not complete

rio.Yaml = {
	dump: function(obj, indent) {
		indent = indent || 0;
		var indentText = "  ".times(indent);

		if (Object.isArray(obj)) {
			return obj.map(function(item) {
				return indentText + "- " + item;
			}.bind(this)).join("\n");
		} else {
			return Object.keys(obj).map(function(k) {
				var val = obj[k];
				if (this._isPrimitive(val)) {
					return indentText + k + ": " + val;
				} else {
					return indentText + k + ":\n" + this.dump(obj[k], indent + 1);
				}
			}.bind(this)).join("\n");
		}
	},

	parse: function(str) {
		return this._parse(this._tokenize(str));
	},
	
	_isPrimitive: function(val) {
		return Object.isNumber(val) || Object.isString(val);
	},

	_valueOf: function(token) {
		try {
			return eval('(' + token + ')');
		} catch(e) {
			return token;
		}
	},

	_tokenize: function(str) {
		return str.match(/(---|true|false|null|#(.*)|\[(.*?)\]|\{(.*?)\}|[^\w\n]*[\/\.\w\-]+:|[^\w\n]*-(.+)|\d+\.\d+|\d+|\n+|\w.+)/g);
	},

	_indentLevel: function(token) {
		return token ? Math.max(token.match(/^(\t*).*/)[1].length, token.match(/^([\s]*).*/)[1].length / 2) : 0;
	},

	_parse: function(tokens) {
		while(tokens[0] == "\n") { tokens.shift(); }

		var token, list = /-(.*)/, key = /([\/\.\w\-]+):/, stack = {};
		
		var indentLevel = this._indentLevel(tokens[0]);
		
		while (tokens[0] && (this._indentLevel(tokens[0]) >= indentLevel || tokens[0] == "\n")) {
			token = tokens.shift();
			if (token[0] == '#' || token == '---' || token == "\n") {
				continue;
			} else if (key.exec(token)) {
				var keyName = RegExp.$1.strip();
				if (tokens[0] == "\n") {
					tokens.shift();
					stack[keyName] = this._parse(tokens);
				} else {
					stack[keyName] = this._valueOf(tokens.shift());
				}
			} else if (list.exec(token)) {
				(Object.isArray(stack) ? stack : (stack = [])).push(RegExp.$1.strip());
			}
		}
		return stack;
	},

	toString: function() {
		return "Yaml";
	}
};
