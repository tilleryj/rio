/**
	@class
	
	Component is the root of all rio components.  It provides basic html and rendering support as 
	well as css dependency management.
	
	@extends rio.Attr
*/
rio.Component = {
	create: function() {
		var args = $A(arguments);
		if (args.length > 0 && args.last() != undefined && !args.last().ATTR) {
			args[args.size() - 1] = Object.extend({ noExtend: true }, args.last());
		}
		var component = rio.Attr.create.apply(this, args);
		
		var methods = {
			rerender: function() {
				if (!this._html) { return; }
				var oldHtml = this._html;
				this._html = null;
				component._htmls.each(function(fieldName) {
					this[fieldName].remove();
					this[fieldName] = null;
				}.bind(this));
				oldHtml.replace(this.html());
				rio.app.getCurrentPage().__lm.resize();
			},

			toString: function() {
				return "[rio.components.*]";
			}
		};
		if (!component.prototype.html) {
			methods.html = function() {
				if (!this._html) { this._html = this.buildHtml(); }
				return this._html;
			};
		}
		component.addMethods(methods);

		Object.extend(component, {
			requireCss: function(name) {
				rio.Application.includeCss("components/" + name);
			},
			
			template: function(name) {
				rio.boot.loadedTemplates.push(rio.boot.appRoot + "components/" + name);
				
				this._templateName = name;
			},
			
			applyTemplate: function() {
				if (this._templateName && !this._templateApplied) {
					var template = rio.JsTemplate.build("components/" + this._templateName);
					var mixinMethods = template.mixinMethods();
					if (component.prototype.render == undefined) {
						mixinMethods.render = function() {};
					}
					mixinMethods.buildHtml = mixinMethods.buildHtml.wrap(function(proceed) {
						var ret = proceed();
						this._html = ret;
						this.render();
						return ret;
					});
					component.addMethods(mixinMethods);

					this._templateApplied = true;
				}
			},
			
			style: function(name) {
				component.attrAccessor(name);
			}
		});
		
		if (args.length > 0 && args.last() != undefined && !args.last().ATTR) {
			var initializers = args.last();
			if (Object.isString(initializers.requireCss)) {
				component.requireCss(initializers.requireCss);
			}
			
			if (Object.isString(initializers.template)) {
				component.template(initializers.template);
			}
			
			(initializers.styles || []).each(function(styleName) {
				component.style(styleName);
			});
			
			rio.Component.extend(component, initializers.methods || {});
		}
		
		return component;
	},
	
	extend: function(component, extension) {
		extension.__initialize = extension.initialize || Prototype.emptyFunction;
		extension.initialize = function(options) {
			component.applyTemplate();
		
			(this.__initialize.bind(this))(options);
		};

		rio.Attr.extend(component, extension);
	},
	
	toString: function() {
		return "Component";
	}
};


















