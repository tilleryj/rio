rio.require("lib/jslint");
rio.require("lib/file");

rio.RioLint = {
	checkFileSyntax: function(file, options) {
		options = Object.extend({
			onComplete: Prototype.emptyFunction
		}, options);
		var path = "/javascripts/" + file + ".js";
		rio.File.open(path, {
			onSuccess: function(content) {
				var errors = this.checkSyntax(content, file);
				options.onComplete(errors);
			}.bind(this),
			onFailure: function() {
				rio.error("This file might not exist.", "RioLint failed to load: " + file);
			}
		});
	},
	
	checkSyntax: function(content, fileName) {
		try {
			var errors = rio.JSLINT.process(content, {
				browser: true,
				eqeqeq: false,
				evil: true,
				newcap: false,
				passfail: false
			}).compact().reject(function(error) {
				return this.ignoreError(error);
			}.bind(this));
			
			return this.formatErrors(errors, fileName);
		} catch(e) {
			rio.log(e + "(" + e.fileName + ": " + e.lineNumber + ")", "errorLogItem", "> ");
			rio.log("Syntax check failed for: " + file, "errorLogItem");
		}	
	},
	
	formatErrors: function(errors, fileName) {
		return errors.map(function(error) {
			// lines are 0 indexed in lint
			return {
				toString: function() {
					return fileName + ".js (line " + (error.line + 1) + ", char " + (error.character + 1) + ")" + "  " + error.reason;
				},
				toHtml: function(){
					return '<span class="errorLine">' + fileName + '.js</span> (line <span class="errorLine">' + (error.line + 1) + "</span>, char " + (error.character + 1) + ")" + "  " + error.reason;
				}
				
			};
		});
	},
	
	ignoreError: function(error) {
		return [
			/Use '[!=]==' to compare with .*/,
			"'new' should not be used as a statement.",
			"document.write can be a form of eval.",
			"The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype.",
			"Expected an identifier and instead saw 'eval' (a reserved word)."
		].any(function(allowable) {
			return (error.reason == allowable) || error.reason.match(allowable);
		});
	}	
};