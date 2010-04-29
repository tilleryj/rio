/**
	@class

	Attr is the basis for most of rio.  It is the class from which all apps, pages, models, and components
	are derived, though you will rarely have to use Attr directly.  Attr provides all of the functionality 
	related to attributes, bindings, dependency management, and events.
	
	@author Jason Tillery
	@copyright 2008-2009 Thinklink LLC
*/
rio.Attr = {
	/**
		Creates an instance of rio.Attr.
		
		@param {String} name (optional) The name of this Attr.  Used primarily for testing reports.
		@param {Object} extends (optional) An Attr class to use as a superclass.
		@param {Object} args (optional) The definition of the class.
		@returns a new instance of type Attr
		@type rio.Attr
		@example
		var attr = rio.Attr.create("AttrName", {
			attrAccessors: [], // list of accessors
			attrReaders: [], // list of readers
			methods: {
				initialize: function() {
					
				}
			},
			classMethods: {
				
			}
		});
	*/ 
	create: function() {
		var args = $A(arguments);
		var attr = (args.length > 0 && args[0] != undefined && args[0].ATTR) ? Class.create(args[0]) : Class.create();

		if (args.length > 0 && args.first() != undefined && Object.isString(args.first())) {
			attr.NAME = args.first();
		} else if (attr.superclass && args.length > 1 && args[1] != undefined && Object.isString(args[1])) {
			attr.NAME = args[1];
		} else {
			attr.NAME = "[attr rio.Attr]";
		}

		attr.addMethods(
			/**
				@scope rio.Attr.prototype
			*/
		{
			/** @private */
			ATTR: true,

			/** @private */
			__bindings: function() {
				if (!this.___bindings) { this.___bindings = {}; }
				return this.___bindings;
			},
			
			/** @private */
			__bindingsFor: function(fieldName) {
				return this.__bindings()[fieldName] || [];
			},

			/** @private */
			__subBindings: function() {
				if (!this.___subBindings) { this.___subBindings = {}; }
				return this.___subBindings;
			},

			/** @private */
			__subBindingsFor: function(fieldName) {
				return this.__subBindings()[fieldName] || [];
			},
			
			/** @private */
			__executeSubBinding: function(attribute, subAttribute, binding, skipInitialExecution, oldValue) {
				var subObj = this[("get-" + attribute).camelize()]();
				if (subObj instanceof Object && subObj.ATTR) {
					if (oldValue instanceof Object && oldValue.ATTR) {
						oldValue.unbind(subAttribute, binding);
					}
					var subOldValue = oldValue && oldValue[("get-" + subAttribute).camelize()] && oldValue[("get-" + subAttribute).camelize()]();
					subObj.bind(subAttribute, binding, skipInitialExecution, subOldValue);
				}
			},
			
			/** @private */
			__executeAllBindings: function(fieldName, newValue, oldValue) {
				var i;
				var bindingsFor = this.__bindingsFor(fieldName);
				var bindingsForLength = bindingsFor.length;
				for (i=0; i<bindingsForLength; i++) {
					this.fireBinding(bindingsFor[i], newValue, oldValue);
				}

				var subBindingsFor = this.__subBindingsFor(fieldName);
				var subBindingsForLength = subBindingsFor.length;
				for (i=0; i<subBindingsForLength; i++) {
					var subBinding = subBindingsFor[i];
					this.__executeSubBinding(fieldName, subBinding[0], subBinding[1], false, oldValue);
				}
			},
			
			/** @private */
			fireBinding: function(binding, value, oldValue) {
				rio.Attr.fireWhenReady(this.doFireBinding.bind(this, binding, value, oldValue));
			},

			/** @private */
			doFireBinding: function(binding, value, oldValue) {
				if (Object.isFunction(binding)) {
					// try {
						binding(value, oldValue);
					// } catch(e) {
						// TODO: This check is in here because refreshing the console can leave null binding references in the app
						// This needs to be resolved immediately.  We should be "un-binding" instead of ignoring this error.
					//	rio.log(e);
					//}
				} else {
					if (Object.isArray(value)) {
						var i;
						
						if (!binding.__unbindings) { 
							binding.__unbindings = []; 
						} else {
							var unbindings = binding.__unbindings;
							for (i=unbindings.length; i--;) {
								var unbinding = unbindings[i];
								if (unbinding.forAttr == this) {
									unbinding();
								}
							}
						}

						
						if (rio.environment.giveWarnings) {
							var unsupportedListBindingOperations = ["reverse", "shift", "sort", "unshift"];
							var oldUnsupportedFunctions = {};
							
							var buildWrapper = function(operation) {
								return function() {
									rio.log("warning: " + operation + " does not fire rio bindings", "warningLogItem", "- ");
									var args = $A(arguments);
									var proceed = args.shift();
									return proceed.apply(this, args);
								};
							};
							for (i=unsupportedListBindingOperations.length; i--;) {
								var operation = unsupportedListBindingOperations[i];
								oldUnsupportedFunctions[operation] = value[operation];
								value[operation] = value[operation].wrap(buildWrapper(operation));
							}
						}
						
						var oldPush = value.push;
						value.push = value.push.wrap(function(proceed, val) {
							var ret = proceed(val);
							if (binding.insert) { 
								rio.Attr.fireWhenReady(binding.insert.curry(val, value.length - 1));
							}
							if (binding.empty && value.length == 1) { 
								rio.Attr.fireWhenReady(binding.empty.curry(false));
							}
							return ret;
						});
						
						var oldPop = value.pop;
						value.pop = value.pop.wrap(function(proceed, val) {
							if (value.length == 0) { return; }
							var startsEmpty = value.length == 0;
							var ret = proceed(val);
							if (binding.remove) {
								rio.Attr.fireWhenReady(binding.remove.curry(ret));
							}
							if (binding.empty) {
								var endsEmpty = value.length == 0;
								if (startsEmpty != endsEmpty) {
									rio.Attr.fireWhenReady(binding.empty.curry(endsEmpty));
								}
							}
							return ret;
						});
						
						var oldSplice = value.splice;
						value.splice = value.splice.wrap(function(proceed, index, count, toInsert) {
							var startsEmpty = value.length == 0;

							var removing = count > 0 && binding.remove;
							var inserting = (toInsert !== undefined) && binding.insert;
							if (removing) {	var toRemove = value[index]; }
							
							var ret = (toInsert !== undefined) ? proceed(index, count, toInsert) : proceed(index, count);

							if (removing) { 
								rio.Attr.fireWhenReady(binding.remove.curry(toRemove));
							}
							if (inserting) { 
								rio.Attr.fireWhenReady(binding.insert.curry(toInsert, index));
							}

							var endsEmpty = value.length == 0;
							if (binding.empty && (startsEmpty != endsEmpty)) { 
								rio.Attr.fireWhenReady(binding.empty.curry(endsEmpty));
							}
							return ret;
						});
						
						var oldClear = value.clear;
						value.clear = value.clear.wrap(function(proceed) {
							if (value.length == 0) { return; }
							proceed();
							if (binding.set) {
								rio.Attr.fireWhenReady(binding.set.curry(value));
							}
							if (binding.empty) {
								rio.Attr.fireWhenReady(binding.empty.curry(true));
							}
						});
						
						var unbindingFunction = function() {
							value.push = oldPush;
							value.pop = oldPop;
							value.splice = oldSplice;
							value.clear = oldClear;
							if (rio.environment.giveWarnings) {
								unsupportedListBindingOperations.each(function(operation) {
									value[operation] = oldUnsupportedFunctions[operation];
								});
							}
						};
						unbindingFunction.forAttr = this;
						binding.__unbindings.push(unbindingFunction);

						if (binding.empty) { binding.empty(value.length == 0); }
					}
					if (binding.set) { 
						binding.set(value, oldValue);
					}
				}
			},

			/**
				Binds a function to an attribute.
				<br /><br />
				<i>NOTE: The function will be called immediately with the current value of the attribute.</i>
				
				@param {String} attribute The name of the attribute to bind
				@param {Function} binding The function to execute when the value of the attribute changes
				@param {Boolean} skipInitialExecution (optional) Do <b>not</b> immediately call the function with the attributes current value
				
				@example
				attr.bind("attribute", function(newValue) {
					alert(newValue);
				});
			*/
			bind: function(attribute, binding, skipInitialExecution, overrideInitialOldValue) {
				var unbind;
				if (attribute.include(".")) {
					var thisAttribute = attribute.match(/^([^\.]*)\.(.*)/)[1];
					var subAttributes = attribute.match(/^([^\.]*)\.(.*)/)[2];
					if (!this.__subBindings()[thisAttribute]) { this.__subBindings()[thisAttribute] = []; }
					this.__subBindings()[thisAttribute].push([subAttributes, binding]);
					this.__executeSubBinding(thisAttribute, subAttributes, binding, skipInitialExecution);
				} else {
					if (!this.__bindings()[attribute]) { this.__bindings()[attribute] = []; }
					this.__bindings()[attribute].push(binding);
					unbind = this.unbind.curry(attribute, binding).bind(this);
					if (!skipInitialExecution) {
						var value = this[("get-" + attribute).camelize()]();
						this.fireBinding(binding, value, overrideInitialOldValue || value);
					}
				}
				return unbind;
			},
			
			/**
				Returns a binding to the specified attribute or attribute path
				<br /><br />
				<i>NOTE: The most common reason for using binding is to specify the initial value of another attrAccessor with an attribute path.</i>
				
				@param {String} attribute The name of the attribute to bind
				
				@example
				attr.binding("attribute");
			*/
			binding: function(attribute) {
				return new rio.Binding(this, attribute);
			},
			
			/** @private */
			unbind: function(fieldName, binding) {
				if (fieldName.include(".")) {
					var thisField = fieldName.match(/^([^\.]*)\.(.*)/)[1];
					var subFields = fieldName.match(/^([^\.]*)\.(.*)/)[2];

					var subBindings = this.__subBindings()[thisField] || [];
					var subIndex = subBindings.indexOf(binding);
					if (subIndex >= 0) {
						subBindings.splice(subIndex, 1);
					}
					var subObj = this[("get-" + thisField).camelize()]();
					if (subObj) {
						subObj.unbind(subFields, binding);
					}
				} else {
					var bindings = this.__bindingsFor(fieldName);
					if (bindings) {
						var index = bindings.indexOf(binding);
						if (index >= 0) {
							bindings.splice(index, 1);
							(binding.__unbindings || []).each(function(unbinding) {
								if (unbinding.forAttr == this) {
									unbinding();
								}
							}.bind(this));
						}
					}
				}
			},
			
			freeze: function() {
				this._frozen = true;
			},

			unfreeze: function() {
				this._frozen = false;
			},
			
			frozen: function() {
				return this._frozen;
			},
			
			updateAttributes: function(attributes, options) {
				Object.keys(attributes).map(function(attribute) {
					return this.setAndReturnAfterSet(attribute, attributes[attribute], options);
				}.bind(this)).each(function(f) {
					f();
				});
			},
			
			/** @private */
			__eventHandlers: function() {
				if (!this.___eventHandlers) { this.___eventHandlers = {}; }
				return this.___eventHandlers;
			},
			
			/** @private */
			__eventHandlersFor: function(eventName) {
				return this.__eventHandlers()[eventName] || [];
			},
			
			/**
				Fires an event.
				
				@param {String} eventName The name of the event to fire
			*/
			fire: function() {
				var args = $A(arguments);
				var eventName = args.shift();
				var handlers = this.__eventHandlersFor(eventName);
				for (var i=0, len=handlers.length; i<len; i++) {
					handlers[i].apply(this, args);
				}
			},
			
			/**
				Observes an event.
				
				@param {String} eventName The name of the event to observe
				@param {Function} handler A function to call when the even is fired
			*/
			observe: function(eventName, handler) {
				if (!this.__eventHandlers()[eventName]) { this.__eventHandlers()[eventName] = []; }
				this.__eventHandlers()[eventName].push(handler);
				return this.stopObserving.bind(this, eventName, handler);
			},
			
			stopObserving: function(eventName, handler) {
				var handlers = this.__eventHandlers()[eventName];
				if (handlers && handlers.include(handler)) {
					handlers.splice(handlers.indexOf(handler), 1);
				}
			},
			
			/* @private */
			setAndReturnAfterSet: function(fieldName, newValue, options) {
				var oldValue = this["_" + fieldName];
				this["_" + fieldName] = newValue;
				return function() {
					if (oldValue != newValue) {
						this.__executeAllBindings(fieldName, newValue, oldValue);

						// TODO: move this crap into model.js
						if (this.afterUpdateField && !(options && options.skipSave)) {
							this.afterUpdateField(fieldName, oldValue, newValue);
						}
						if (this.save && !(options && options.skipSave) && !(attr._clientOnlyAttrs && attr._clientOnlyAttrs.include(fieldName))) {
							this.save.bind(this)();
						}
					}
				}.bind(this);
			}
		});

		var defaultFields = {};
		var defaultHtmls = [];
		var defaultEvents = [];

		if (attr.superclass) {
			defaultFields = Object.clone(attr.superclass._fields);
			defaultHtmls = attr.superclass._htmls.clone();
			defaultEvents = attr.superclass._events.clone();
		}

		Object.extend(attr, {
			ATTR: true,
			_fields: defaultFields,
			_htmls: defaultHtmls,
			_events: defaultEvents,

			attrAccessor: function(fieldName, defaultValue) {
				this.attrReader(fieldName, defaultValue);
				var methods = {};
				methods[("set-" + fieldName).camelize()] = function(newValue, options) {
					if (this.frozen()) { return; }
					this.setAndReturnAfterSet(fieldName, newValue, options)();
				};
				this.addMethods(methods);
			},
			
			attrReader: function(fieldName, defaultValue) {
				if (Object.keys(this._fields).include(fieldName)) {
					this._fields[fieldName] = defaultValue;
					return;
				}
				var methods = {};
				var getFunction = function() {
					return this["_" + fieldName];
				};
				methods[("get-" + fieldName).camelize()] = getFunction;
				methods[("is-" + fieldName).camelize()] = getFunction;

				this.addMethods(methods);
				this._fields[fieldName] = defaultValue;
			},
			
			attrHtml: function() {
				var methods = {};
				$A(arguments).each(function(name) {
					var fieldName = "_" + name + "Html";
					var methodName = name + "Html";
					var buildMethodName = ("build-" + name + "Html").camelize();

					methods[methodName] = function() {
						if (!this[fieldName]) { this[fieldName] = this[buildMethodName](); }
						return this[fieldName];
					};
					this._htmls.push(fieldName);
				}.bind(this));
				this.addMethods(methods);
			},
			
			attrEvent: function(eventName) {
				this._events.push(eventName);
			},

			require: function() {
				$A(arguments).each(function(fileName) {
					rio.Application.include(fileName);
				});
			},
			
			_examples: {},

			setExamples: function(exampleJson) {
				Object.keys(exampleJson).each(function(name) {
					this._examples[name] = exampleJson[name];
				}.bind(this));
			},
			
			examples: function() {
				var exampleGroup = {};
				
				Object.keys(this._examples).each(function(name) { 
					exampleGroup[name] = this.example(name);
				}.bind(this));
				
				return exampleGroup;
			},
			
			exampleParams: function(name) {
				var exampleJson = this._examples[name];

				var evalExamples = function(json) {
					if (json == undefined) {
						return;
					} else if (json._EXAMPLE) {
						return json.attr.example(json.name);
					} else if (Object.isArray(json) || json.size) {
						return json.map(function(value) {
							return evalExamples(value);
						});
					} else if (typeof json == "object") {
						var newObj = {};
						Object.keys(json).each(function(key) {
							newObj[key] = evalExamples(json[key]);
						});
						return newObj;
					} else {
						return json;
					}
				};
			
				var params = evalExamples(exampleJson) || {};
				params.__example = true;
				return params;
			},
			
			example: function(name) {
				rio.loadingFixtures = true;
				try {
					var params = this.exampleParams(name);
					var exampleAttr = new attr(params);
					exampleAttr.__example = true;
					return exampleAttr;
				} finally {
					rio.loadingFixtures = false;
				}
			}
		});
		attr.toString = function() {
			return this.NAME;
		};
		
		
		if (args.length > 0 && args.last() != undefined && !args.last().ATTR) {
			var initializers = args.last();
			
			(initializers.attrReaders || []).each(function(attribute) {
				if (Object.isString(attribute)) {
					attr.attrReader(attribute);
				} else {
					attr.attrReader(attribute[0], attribute[1]);
				}
			});

			(initializers.attrAccessors || []).each(function(attribute) {
				if (Object.isString(attribute)) {
					attr.attrAccessor(attribute);
				} else {
					attr.attrAccessor(attribute[0], attribute[1]);
				}
			});

			(initializers.attrHtmls || []).each(function(attribute) {
				attr.attrHtml(attribute);
			});
			
			(initializers.attrEvents || []).each(function(eventName) {
				attr.attrEvent(eventName);
			});
			
			if (initializers.require) {
				attr.require.apply(attr, initializers.require);
			}
			
			if (!initializers.noExtend) {
				rio.Attr.extend(attr, initializers.methods || {});
			}
			Object.extend(attr, initializers.classMethods || {});
		}
		
		return attr;
	},
	
	_transactionCount: 0,
	_toFire: [],
	transaction: function(t) {
		this._transactionCount++;
		try {
			t();
		} finally {
			this._transactionCount--;
		}
		if (this._transactionCount == 0) {
			this._toFire.each(function(tf) { tf(); });
			this._toFire.clear();
		}
	},
	
	fireWhenReady: function(f) {
		if (this._transactionCount != 0) {
			this._toFire.push(f);
		} else {
			f();
		}
	},
	
	updateAttributes: function(updates) {
		updates.map(function(update) {
			var attributes = update.attributes;
			var object = update.object;
			return Object.keys(attributes).map(function(attribute) {
				return object.setAndReturnAfterSet(attribute, attributes[attribute]);
				// return instance.setAndReturnAfterSet(attribute, attributes[attribute], options);
			});
		}).flatten().each(function(f) {
			f();
		});
	},
	
	extend: function(attr, extension) {
		/*
			This code is called a lot.
			
			Consider (and benchmark) the performance implication of any changes here.
		*/
		if (!attr.prototype._initialize) {
			extension._initialize = extension.initialize || Prototype.emptyFunction;
			extension.initialize = function(options) {
				var attr = this.constructor;
				options = options || {};
				
				for (var fieldName in attr._fields) {
					this[fieldName] = new rio.Binding(this, fieldName);
					
					var val = attr._fields[fieldName];
					
					if (val != undefined) {
						if (Object.isArray(val)) { val = val.clone(); }
						if (typeof val == "object" && val != null && !Object.isArray(val) && !Object.isFunction(val)) {
							val = Object.clone(val);
						}
					}
					
					var optVal = options[fieldName] != undefined ? options[fieldName] : options[fieldName.underscore()];
					if (optVal && optVal.BINDING) {
						optVal.bindTo(this[fieldName]);
						val = optVal.value();
					} else if (optVal != undefined) {
						val = optVal;
					}
					this["_" + fieldName] = val;
				}

				var events = attr._events;
				var len = attr._events.length;
				for (var i=0; i<len; i++) {
					var eventName = events[i];
					var handler = options[("on_" + eventName).camelize()];
					if (handler && Object.isFunction(handler)) {
						this.observe(eventName, handler);
					}
				}
				
				this._initialize(options);
			};
		} else if(extension.initialize) {
			extension._initialize = extension.initialize;
			delete extension.initialize;
		}
		attr.addMethods(extension);
	},
	
	toString: function() {
		return "Attr";
	}
};

/**
	@class
	
	Represents a bindable attribute.  Bindings can be bound to each other to create a bi-directional binding.<br /><br />
	
	<i>You should rarely need to instantiate this class directly</i>
*/
rio.Binding = Class.create({
	BINDING: true,
	
	// This attribute might be unused
	__bindings: [],
	
	initialize: function(obj, fieldName) {
		this._obj = obj;
		this._fieldName = fieldName;
	},
	
	bind: function(observer, skipInitialExecution) {
		return this._obj.bind(this._fieldName, observer, skipInitialExecution);
	},

	bindTo: function(binding) {
		var unbinding1 = this.bind(binding.update.bind(binding));
		var unbinding2 = binding.bind(this.update.bind(this));
		return function() { 
			unbinding1();
			unbinding2();
		};
	},
	
	value: function() {
		if (this._fieldName.include(".")) {
			var parts = this._fieldName.split(".");
			return parts.inject(this._obj, function(acc, field) {
				return acc ? acc[("get-" + field).camelize()]() : null;
			}.bind(this));
		} else {
			return this._obj[("get-" + this._fieldName).camelize()]();
		}
	},
	
	update: function(newVal) {
		var fieldToSet = this._fieldName;
		var setOn = this._obj;
		if (this._fieldName.include(".")) {
			var parts = this._fieldName.split(".");
			fieldToSet = parts.last();
			setOn = parts.slice(0, parts.size() - 1).inject(this._obj, function(acc, field) {
				return acc ? acc["_" + field] : null;
			}.bind(this));
		}
		if (setOn) {
			setOn[("set-" + fieldToSet).camelize()](newVal);
		}
	},
	
	invert: function() {
		var invert = {
			BINDING: true,

			bind: function(observer, skipInitialExecution) {
				return this.bind(observer.wrap(function() {
					var args = $A(arguments);
					var proceed = args.shift();
					args[0] = !args[0];
					return proceed.apply(this, args);
				}), skipInitialExecution);
			}.bind(this),
			
			bindTo: function(binding) {
				var unbinding1 = invert.bind(binding.update.bind(binding));
				var unbinding2 = binding.bind(invert.update.bind(invert));
				return function() { 
					unbinding1();
					unbinding2();
				};
			}.bind(this),
			
			value: function() {
				return !this.value();
			}.bind(this),
			
			update: function(val) {
				this.update(!val);
			}.bind(this)
		};
		return invert;
	}
});
