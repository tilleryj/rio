/**
	@class
	@extends rio.Attr
	
	Model is used to create model classes in a rio application.  It provides ActiveResource style synchronization with
	a rest-based resource and automated client-server bindings with a push server.
	
	@author Jason Tillery
	@copyright 2008-2009 Thinklink LLC
*/
rio.Model = {
	create: function() {
		var args = $A(arguments);
		if (args.length > 0 && args.last() != undefined && !args.last().ATTR) {
			args[args.size() - 1] = Object.extend({ noExtend: true }, args.last());
		}
		var model = rio.Attr.create.apply(this, args);
		if (model._fields.id == undefined || model.prototype.setId == undefined) {
			model.attrAccessor("id");
		}
		model.attrEvent("destroy");
		Object.extend(model, {
			resource: function(url) {
				model.addMethods({
					isNew: function() {
						return this.getId() == undefined || (this.getId().temporary != undefined && this.getId().temporary());
					},
					
					url: function() {
						return model.url() + "/" + this.getId();
					},

					save: function(options) {
						if (this.__destroying) { return; }
						
						if (this.valid && !this.valid()) { return; }
						// var idField = Object.keys(model._fields).detect(function(field) {
						// 	var val = this["_" + field];
						// 	return field != "id" && val && val.temporary && val.temporary();
						// }.bind(this));
						// if (idField) {
						// 	this["_" + idField].doAfterReification(this.save.curry(options).bind(this));
						// 	return;
						// }
						
						// if (this._creating) {
						// 	if (!this._pendingUpdates) { this._pendingUpdates = []; }
						// 	this._pendingUpdates.push(this.save.curry(options).bind(this));
						// 	return;
						// }
						var firstTimeCreating = !this._creating;
						this._creating = true;
						if(this.isNew() && this.beforeCreate && firstTimeCreating){ this.beforeCreate(); }
						
						model.addToTransaction(this, options);
					},

					destroy: function(options) {
						if(this.__destroying) {return;}
						
						if (this.beforeDestroy) { this.beforeDestroy(); }
						
						this.__destroying = true;
						
						model.addToTransaction(this, Object.extend({destroy: true}, options));
						this.removeFromCaches();

						this.fire("destroy");
					},
					
					parameters: function() {
						var modelKey = model.url().match(/^\/?(.*)$/)[1].singularize();
						var parameters = {};
						
						var persistentFieldNames = model.persistentFieldNames();
						for (var i=persistentFieldNames.length; i--;) {
							var name = persistentFieldNames[i];
							var currentState = this["_" + name];
							var lastState = this._lastSavedState ? this._lastSavedState[name] : undefined;

							if (currentState != lastState) {
								parameters[modelKey + "[" + name.underscore() + "]"] = currentState;
							}
						}
						return parameters;
					},
					
					afterUpdateField: function() {
						model.updateInCollectionEntites(this);
					},
					
					attributeState: function() {
						var state = {};

						var persistentFieldNames = model.persistentFieldNames();
						for (var i=persistentFieldNames.length; i--;) {
							var f = persistentFieldNames[i];
							state[f] = this[("get-" + f).camelize()]();
						}
						return state;
					},

					attributeStateChange: function() {
						var state = {};

						var persistentFieldNames = model.persistentFieldNames();
						for (var i=persistentFieldNames.length; i--;) {
							var f = persistentFieldNames[i];
							var currentState = this["_" + f];
							var lastState = this._lastSavedState ? this._lastSavedState[f] : undefined;
							if (currentState != lastState) {
								state[f] = currentState;
							}
						}

						return state;
					},
					
					removeFromCaches: function() {
						model.removeFromCollectionEntities(this);
						model.removeFromCache(this.getId());
					},
					
					toString: function() {
						return "[rio.models.*]";
					}
				});
				
				Object.extend(model, {
					undoEnabled: false,

					url: function() {
						return url;
					},
					
					_idCache: {},
					id: function(val, createIfNotFound) {
						if (val) {
							if (this._idCache[val]) { return this._idCache[val]; }
							if (createIfNotFound) {
								var id = new rio.Id(val);
								this._idCache[val] = id;
								return id;
							}
						} else {
							return new rio.Id();
						}
					},

					reifyId: function(id, val) {
						id.reify(val);
						if (this._idCache[val]) {
							rio.warn("id collision while reifying - " + model + "#" + id);
						}
						this._idCache[val] = id;
					},
					
					persistentFieldNames: function() {
						return Object.keys(model._fields).reject(function(f) {
							return model._clientOnlyAttrs.include(f) || model.prototype[("set-" + f).camelize()] == undefined || f == "id";
						});
					},
					
					_transaction: [],
					addToTransaction: function(entity, options) {
						options = options || {};
						var existingTransaction = this._transaction.detect(function(t) { return t.entity == entity; });
						if (existingTransaction) {
							if (options.destroy) {
								if (existingTransaction.entity.isNew()) {
									this._transaction.splice(this._transaction.indexOf(existingTransaction), 1);
									// don't need to do this, now that we immediately remove on destroy
									// model.removeFromCollectionEntities(existingTransaction.entity);
								} else {
									existingTransaction.options = options;
								}
							} else {
								existingTransaction.attributeState = entity.attributeStateChange();
								existingTransaction.parameters = entity.parameters();
							}
							// TODO: chain onSuccess/onFailure functions
						} else {
							this._transaction.push({
								entity: entity, 
								options: options, 
								attributeState: entity.attributeStateChange(),
								parameters: entity.parameters()
							});
						}
						if (!this._transactionQueued) {
							this._transactionQueued = true;
							this.prepareTransaction();
						}
					},

					/* Simply defers execution.  Can override this for testing. */
					prepareTransaction: function() {
						this.executeTransaction.bind(this, rio.Undo.isProcessingUndo(), rio.Undo.isProcessingRedo()).defer();
					},
					
					__transactionInProgress: false,
					__queuedTransactions: [],
					executeTransaction: function(undoTransaction, redoTransaction) {
						this._transactionQueued = false;
						
						var transaction = this._transaction.clone();
						this._transaction.clear();
						
						// Transactions can be queued here, so lets make sure that all entities _lastSavedState's are
						// correct before letting subsequent transaction queue up.
						for (var i=0, len=transaction.length; i<len; i++) {
							var t = transaction[i];
							t.oldLastSavedState = t.entity._lastSavedState;
							t.entity._lastSavedState = t.options.destroy ? undefined : t.entity.attributeState();
						}
						
						transaction.undoTransaction = undoTransaction;
						transaction.redoTransaction = redoTransaction;
						if (this.__transactionInProgress) {
							this.__queuedTransactions.push(transaction);
							return;
						} else {
							this._doExecuteTransaction(transaction);
						}
					},

					_doExecuteTransaction: function(transaction) {
						if (transaction.empty()) { return; }
						
						if (model.undoEnabled) {
							var undos = transaction.map(function(t) {
								var undo = { id: t.entity.getId(), state: t.oldLastSavedState, destroy: t.options.destroy };
								// t.entity._lastSavedState = t.options.destroy ? undefined : t.entity.attributeState();
								return undo;
							});

							var processUndos = function() {
								undos.reverse().each(function(u) {
									if (u.state) {
										if (u.destroy) {
											var instance = new model(Object.extend({ id: u.id }, u.state));
											instance._lastSavedState = undefined;
											instance.save();
										} else {
											model.getFromCache(u.id).updateAttributes(u.state);
										}
									} else {
										model.getFromCache(u.id).destroy();
									}
								});
							};

							if (transaction.undoTransaction) {
								rio.Undo.registerRedo(processUndos);
							} else {
								rio.Undo.registerUndo(processUndos, transaction.redoTransaction);
							}
						}
						
						// // Always update the last saved states
						// for (var i=0, len=transaction.length; i<len; i++) {
						// 	var t = transaction[i];
						// 	
						// 	// LOOKS LIKE A BUG
						// 	// TODO: SHOULD PROBABLY BE USING THE t.attributeState instead of t.entity.attributeState()
						// 	t.entity._lastSavedState = t.options.destroy ? undefined : t.entity.attributeState();
						// }
						
						var createSuccess = function(entity, onSuccess, json) {
							entity._creating = false;
							var results = model._filterAndProcessJsonWhileAccumulatingCollectionEntities(json);
							var idString = results[0].id;
							if (entity.getId() && entity.getId().temporary && entity.getId().temporary()) {
								var id = parseInt(idString, 10);
								model.reifyId(entity.getId(), id);
							} else {
								// NOTE: An entity will not be updated with any attributes but the ID on create success
								entity._id = model.id(parseInt(idString, 10), true);
								model.putInCache(entity._id, entity);
							}
							onSuccess(entity);
							if (entity.afterCreate) { entity.afterCreate(); }
							// if (entity._pendingUpdates) {
							// 	entity._pendingUpdates.each(function(u) { u(); });
							// }
							return results[1];
						};
						
						var updateSuccess = function(entity, onSuccess) {
							onSuccess(entity);
						};
						
						var destroySuccess = function(entity, onSuccess) {
							// don't need to do this, now that we immediately remove on destroy
							// model.removeFromCollectionEntities(entity);
							(onSuccess || Prototype.emptyFunction)();
						};
						
						var url;
						var method;
						var parameters;
						var onSuccess;
						var onFailure;
						var onConnectionFailure;

						if (transaction.length > 1) {
							url = model.url();
							method = "post";
							
							parameters = {};
							transaction.each(function(t) {
								var id = t.entity.getId();
								if (t.options.destroy) {
									parameters["transaction[" + id + "]"] = "delete";
								} else {
									for (var f in t.attributeState) {
										var val = t.attributeState[f];
										if (val && val.toString) { val = val.toString(); }
										parameters["transaction[" + id + "][" + f.underscore() + "]"] = val;
									}
								}
							});
							
							onSuccess = function(response) {
								var afterFunctions = transaction.map(function(t) {
									var entity = t.entity;
									var options = t.options;

									options = options || {};
									options.onSuccess = options.onSuccess || Prototype.emptyFunction;
									
									var json = response.responseJSON.transaction[t.entity.getId()];
									return (
										options.destroy ? destroySuccess : (entity.isNew() ? createSuccess : updateSuccess)
									)(entity, options.onSuccess, json);
								});
								
								afterFunctions.compact().each(function(af) {
									af();
								});
							}.bind(this);
							
							onFailure = function() {
								var handled = true;
								transaction.each(function(t) {
									if (t.options.onFailure) {
										t.options.onFailure();
									} else {
										handled = false;
									}
								});
								if (!handled) {
									rio.Application.fail("Failed creating, updating, or destroying.", model + "\n" + Object.toJSON(parameters));
								}
							}.bind(this);
							
							onConnectionFailure = function() {
								transaction.each(function(t) {
									if (t.options.onConnectionFailure) {
										t.options.onConnectionFailure();
									}
								});
							};
						} else {
							var entity = transaction.first().entity;
							var options = transaction.first().options;
							
							options = options || {};
							options.onSuccess = options.onSuccess || Prototype.emptyFunction;

							parameters = options.parameters || transaction.first().parameters;
							url = entity.isNew() ? model.url() : entity.url();
							method = options.destroy ? "delete" : (entity.isNew() ? "post" : "put");
							onSuccess = function(response) {
								var after = (
									options.destroy ? destroySuccess : (entity.isNew() ? createSuccess : updateSuccess)
								)(entity, options.onSuccess, response.responseJSON);
								if (after) { after(); }
							};
							onFailure = options.onFailure;
							onConnectionFailure = options.onConnectionFailure;
						}
						
						this.__transactionInProgress = true;
						new Ajax.Request(url, { 
				            asynchronous: true,
							method: method,
							evalJSON: true,
							parameters: $H(parameters).merge({
								'transaction_key': rio.environment.transactionKey,
								'authenticity_token': rio.Application.getToken()
							}).toObject(),
				            onSuccess: function(response) {
								if (response.status == 0) {
									if (onConnectionFailure) {
										onConnectionFailure();
									} else {
										rio.Application.fail("Connection Failure", model + ":\n" + Object.toJSON(parameters));
									}
								} else {
									onSuccess(response);
								}
							},
							onFailure: function(response) { 
								// if (!entity.__destroying) {
									if (onFailure) {
										onFailure(response);
									} else {
										rio.Application.fail("Failed creating, updating, or destroying.", model + ":\n" + Object.toJSON(parameters));
									}
								// }
							}.bind(this),
							onComplete: function(response) {
								this.__transactionInProgress = false;
								if (!this.__queuedTransactions.empty()) {
									this._doExecuteTransaction(this.__queuedTransactions.shift());
								}
							}.bind(this)
				        });

						transaction.each(function(t) {
							if (t.entity.isNew()) {
								t.entity._creating = true;
							}
							if (t.options.destroy) {
								t.entity.__destroying = true;
							}
						});						
					},

					create: function(options) {
						var obj = new model(options);
						obj.save(options);
						return obj;
					},

					find: function(id, options) {
						if (id == undefined) { return; }
						var rioId = id.constructor == rio.Id ? id : model.id(id);

						options = options || {};
						var asynchronous = options.asynchronous == undefined || options.asynchronous;

						if (options.onSuccess == undefined) {
							asynchronous = false;
							options.onSuccess = Prototype.emptyFunction;
						}
						
						var existing = this.getFromCache(rioId);
						if (existing) {
							options.onSuccess(existing);
							return existing;
						}
						
						var entity;
						
						new Ajax.Request(this.url() + "/" + id, {
							asynchronous: asynchronous,
							method: 'get',
							evalJSON: true,
							onSuccess: function(response) {
								entity = new model(model._filterAndProcessJson(response.responseJSON));
								options.onSuccess(entity);
							},
							onFailure: options.onFailure || Prototype.emptyFunction
						});
						if (!asynchronous) {
							return entity;
						}
					},

					findAll: function(options) {
						options = options || {};
						var asynchronous = options.asynchronous == undefined || options.asynchronous;
						
						if (options.onSuccess == undefined) {
							asynchronous = false;
							options.onSuccess = Prototype.emptyFunction;
						}
						 
						var idField = Object.keys(options.parameters).detect(function(parameter) {
							var val = options.parameters[parameter];
							return val && val.temporary && val.temporary();
						});

						var urlToUse = options.url || this.url();
						var parameters = new rio.Parameters(options.parameters || {}, options.nonAjaxParameters);
						// Assume that there are no entities yet (since a param is unreified)
						// New entities will be added to the collectionEntity as they are created or broadcast
						// If this poses a problem, we can always schedule a find for after reification and then reconcile the CE's
						if (idField) {
							var collectionEntity = rio.CollectionEntity.create({
								model: model,
								values: [],
								condition: parameters.conditionFunction()
							});
							this.putCollectionEntity(urlToUse + "#" + Object.toJSON(parameters.ajaxParameters()), collectionEntity);
							
							Object.values(model._identityCache).each(function(entity) {
								collectionEntity.add(entity);
							});
							
							options.onSuccess(collectionEntity);
							return collectionEntity;
						}
						
						
						if (this._collectionEntities[urlToUse + "#" + Object.toJSON(parameters.ajaxParameters())]) {
							var found = this._collectionEntities[urlToUse + "#" + Object.toJSON(parameters.ajaxParameters())];
							found.prepare();
							options.onSuccess(found);
							if (!asynchronous) {
								return found;
							} else {
								return;
							}
						}

						var results;
						rio.Model._findAllRequests.push(
							new Ajax.Request(urlToUse, { 
								asynchronous: asynchronous,
								method: 'get',
								evalJSON: true,
								parameters: {conditions: Object.toJSON(parameters.ajaxParameters())},
								onSuccess: function(response) {
									results = this._collectionEntityFromJson(response.responseJSON, parameters, urlToUse);
									results.prepare();
									options.onSuccess(results);
								}.bind(this)
							})
						);
						if (!asynchronous) {
							return results;
						}
					},
					
					_hasManyAssociations: {},
					hasMany: function(hasManyName) {
						var options = {};
						if (!Object.isString(hasManyName)) {
							options = hasManyName[1] || {};
							hasManyName = hasManyName[0];
						}
						options.className = hasManyName.singularize().classize();
						options.foreignKey = this.NAME.toLowerCase() + "Id";
						options.parameters = options.parameters || {};

						this._hasManyAssociations[hasManyName] = options;
						
						this.attrAccessor(hasManyName);
						this.clientOnlyAttr(hasManyName);
						
						var getName = ("get-" + hasManyName).camelize();

						this.prototype[getName] = this.prototype[getName].wrap(function(proceed) {
							if (this["_" + hasManyName] == undefined) {
								var parameters = Object.clone(options.parameters);
								parameters[options.foreignKey] = this.getId();
								rio.models[options.className].findAll({
									asynchronous: false,
									parameters: parameters,
									onSuccess: function(entities) {
										this["_" + hasManyName] = entities;
									}.bind(this)
								});
							}
							return proceed.apply(this, $A(arguments).slice(1));
						});
					},
					
					belongsTo: function(args) {
						var options = {};
						var associationName;
						if (!Object.isString(args)) {
							associationName = args[0];
							options = args[1] || {};
						} else {
							associationName = args;
						}
						this.attrAccessor(associationName);
						this.clientOnlyAttr(associationName);
						
						var className = options.className || associationName.classize();
						var foreignKey = options.foreignKey || associationName + "Id";
						var getName = ("get-" + associationName).camelize();
						
						this.prototype[getName] = this.prototype[getName].wrap(function(proceed) {
							if (this["_" + associationName] == undefined) {
								var setAssociation = function() {
									var associationId = this["_" + foreignKey];
									var foundValue = rio.models[className].find(associationId, {
										asynchronous: false
									});
									this[("set-" + associationName).camelize()](foundValue);
								}.bind(this);
								setAssociation();
								this[foreignKey].bind(setAssociation, true);
							}
							return proceed.apply(this, $A(arguments).slice(1));
						});
					},
					
					_parametersFromJsonParameters: function(params) {
						return new rio.Parameters(
							Object.keys(params).inject({}, function(acc, p) {
								acc[p.camelize()] = params[p];
								return acc;
							})
						);
					},
					
					_processIncludedCollectionEntities: function(json) {
						for (var i=json.length; i--;) {
							var include = json[i];
							params = this._parametersFromJsonParameters(include.parameters);
							var url = rio.models[include.className].url();
							if (this._collectionEntities[url + "#" + Object.toJSON(params.ajaxParameters())] == undefined) {
								rio.models[include.className]._collectionEntityFromJson(include.json, params, url);
							}
						}
					},
					
					_filterAndProcessJsonWhileAccumulatingCollectionEntities: function(inJson) {
						if (inJson._set) {
							var ceFunction = function() {
								model._processIncludedCollectionEntities(inJson._set.include);
							};
							return [rio.Model.filterJson(inJson._set.self), ceFunction];
						} else {
							return [rio.Model.filterJson(inJson), Prototype.emptyFunction];
						}
					},
					
					_filterAndProcessJson: function(inJson) {
						var results = model._filterAndProcessJsonWhileAccumulatingCollectionEntities(inJson);
						results[1]();
						return results[0];
					},

					_collectionEntityFromJson: function(json, parameters, url) {
						// In case multiple identical queries were made simultaneously
						if (this._collectionEntities[url + "#" + Object.toJSON(parameters.ajaxParameters())]) {
							return this._collectionEntities[url + "#" + Object.toJSON(parameters.ajaxParameters())];
						}

						var results = json.map(function(result) {
							// This may cause bugs.  It should map the results of _filterAndProcessJsonWhileAccumulatingCollectionEntities
							// and execute them after them map to prevent reification collisions
							var modelJson = model._filterAndProcessJson(result);
							var fromCache = this.getFromCache(model.id(modelJson.id));
							if (fromCache) {
								return fromCache;
							} else {
								var lazyNew = function() {
									var fromCache = this.getFromCache(model.id(modelJson.id));
									if (fromCache) { return fromCache; }
									return new model(modelJson);
								}.bind(this);
								lazyNew.__lazyNew = true;
								return lazyNew;
							}
						}.bind(this));
						
						var collectionEntity = rio.CollectionEntity.create({
							model: model,
							values: results,
							condition: parameters.conditionFunction()
						});
						collectionEntity.prepare = function() {
							collectionEntity.prepare = Prototype.emptyFunction;
							// prevent the initialization from double adding the entities
							var oldAdd = this.add;
							try {
								var i;
								this.add = Prototype.emptyFunction;
								var timesToLoop = this.length;
								var toRemove = [];
								for (i=0; i<timesToLoop; i++) {
									if (this[i].__lazyNew) {
										var modelInstance = this[i]();
										if (!this.include(modelInstance)) {
											this[i] = modelInstance;
										} else {
											toRemove.push(i);
										}
									}
								}
								for (i=toRemove.length; i--;) {
									this.splice(toRemove[i], 1);
								}
							} finally {
								this.add = oldAdd;
							}
						};
						(function() {
							// Ultimately we shouldn't need to do this
							// This is required if when parsing eager loaded json collections
							// contain individual entities that need to be added to other collection entities
							// and the entity representing the eager collection is never loaded, hence prepared.
							collectionEntity.prepare();
						}.defer());
						this.putCollectionEntity(url + "#" + Object.toJSON(parameters.ajaxParameters()), collectionEntity);

						return collectionEntity;
					},
					
					_clientOnlyAttrs: [],
					
					clientOnlyAttr: function(attrName) {
						this._clientOnlyAttrs.push(attrName);
					},
					
					_identityCache: {},
					
					getFromCache: function(id) {
						if (id == undefined) { return; }
						return this._identityCache[id.cacheKey ? id.cacheKey() : id] || this._identityCache[model.id(id) && model.id(id).cacheKey()];
					},
					
					putInCache: function(id, value) {
						var cacheKey = id.cacheKey ? id.cacheKey() : id;
						if (this._identityCache[cacheKey] == value) {
							return; 
						}
						this._identityCache[cacheKey] = value;
						this.addToCollectionEntities(value);
					},
					
					removeFromCache: function(id) {
						var cacheKey = id.cacheKey ? id.cacheKey() : id;
						delete this._identityCache[cacheKey];
					},
					
					_collectionEntities: {},
					putCollectionEntity: function(key, value) {
						this._collectionEntities[key] = value;
					},
					
					addToCollectionEntities: function(value) {
						var ces = this._collectionEntities;
						for (var key in ces) {
							ces[key].add(value);
						}
					},
					
					updateInCollectionEntites: function(value) {
						var ces = this._collectionEntities;
						for (var key in ces) {
							ces[key].update(value);
						}
					},
					
					removeFromCollectionEntities: function(value) {
						Object.values(this._collectionEntities).each(function(collectionEntity) {
							collectionEntity.remove(value);
						});
					}

				});
			},
			
			hasChannel: function() {
				return false;
			},

			channel: function() {
				model.addMethods({
					broadcast: function() {
						var args = $A(arguments);
						var methodName = args.shift();
						var body = {
							id: this.getId().toString(),
							method: methodName,
							args: args
						};

						new Ajax.Request("/push/broadcast", {
							asynchronous: true,
							method: "get",
							evalJSON: false,
							evalJS: false,
							parameters: {
								channel: this.channelName(),
								message: Object.toJSON(body)
							}
						});
					},
					
					channelName: function() {
						return model + "." + this.getId();
					}
				});
				
				Object.extend(model, {
					hasChannel: function() { return true; },
					
					receiveBroadcast: function(options) {
						var instance = model.getFromCache(model.id(options.id));
						if (instance) {
							instance[options.method].apply(instance, options.args);
						}
					}
				});
			}
		});
		
		if (args.length > 0 && args.last() != undefined && !args.last().ATTR) {
			var initializers = args.last();
			if (Object.isString(initializers.resource)) {
				model.resource(initializers.resource);
			}
			if (initializers.channel) {
				model.channel();
			}
			
			if (initializers.hasMany) {
				initializers.hasMany.each(function(h) {
					model.hasMany(h);
				});
			}

			if (initializers.belongsTo) {
				initializers.belongsTo.each(function(h) {
					model.belongsTo(h);
				});
			}
			
			(initializers.clientOnlyAttrs || []).each(function(clientOnlyAttr) {
				model.clientOnlyAttr(clientOnlyAttr);
			});
			
			if (initializers.undoEnabled) {
				model.undoEnabled = true;
			}
			
			rio.Model.extend(model, initializers.methods || {});
		}
		
		return model;
	},

	_findAllRequests: [],
	afterActiveQueries: function(fcn) {
		var count = 0;
		this._findAllRequests.each(function(far) {
			if (far._complete) { return; }
			count++;
			far.options.onComplete = (far.options.onComplete || Prototype.emptyFunction).wrap(function(proceed) {
				var ret = proceed(arguments);
				count--;
				if (count == 0) { fcn(); }
				return ret;
			});
		});
		if (count == 0) { fcn(); }
	},
	
	filterJson: function(json) {
		if (json.attributes) { return json.attributes; }
		return (rio.environment.includeRootInJson) ? Object.values(json)[0] : json;
	},
	
	remoteCreate: function(options) {
		if (options.transactionKey == rio.environment.transactionKey) { return; }
		try {
			var results = rio.Model.doRemoteCreate(options);
			if (results.undoFunction) {
				rio.Undo.registerUndo(results.undoFunction);
			}
		} catch(e) { 
			rio.error(e, "Remote create error!");
		}
	},
	
	remoteUpdate: function(options) {
		if (options.transactionKey == rio.environment.transactionKey) { return; }
		try {
			var results = rio.Model.doRemoteUpdate(options);
			if (results.undoFunction) {
				rio.Undo.registerUndo(results.undoFunction);
			}
		} catch(e) { 
			rio.error(e, "Remote update error!");
		}
	},

	remoteDestroy: function(options) {
		if (options.transactionKey == rio.environment.transactionKey) { return; }
		try {
			var results = rio.Model.doRemoteDestroy(options);
			if (results.undoFunction) {
				rio.Undo.registerUndo(results.undoFunction);
			}
		} catch(e) { 
			rio.error(e, "Remote destroy error!");
		}
	},

	doRemoteCreate: function(options) {
		var model = rio.models[options.name];
		var fromCache = model.getFromCache(model.id(options.id));
		if (!fromCache) {
			fromCache = new model(model._filterAndProcessJson(options.json));
		} else {
			return {};
		}

		return {
			undoFunction: model.undoEnabled ? function() {
				model.getFromCache(fromCache.getId()).destroy();
			} : null
		};
	},
	
	doRemoteUpdate: function(options) {
		var model = rio.models[options.name];
		var instance = model.getFromCache(model.id(options.id));
		if (!instance) {
			return {};
		}

		var json = model._filterAndProcessJson(options.json);
	
		var results = {};
	
		if (model.undoEnabled) {
			var oldState = instance.attributeState();
			var processUndo = function() {
				model.getFromCache(instance.getId()).updateAttributes(oldState);
			};
			results.undoFunction = processUndo;
		}

		var attributes = Object.keys(json).without("id").inject({}, function(acc, k) {
			acc[k.camelize()] = json[k];
			return acc;
		});
		instance.updateAttributes(attributes, { skipSave: true });
		rio.models[options.name].updateInCollectionEntites(instance);

		instance._lastSavedState = instance.attributeState();
		
		return results;
	},
	
	doRemoteDestroy: function(options) {
		var model = rio.models[options.name];
		var fromCache = model.getFromCache(model.id(options.id));
		var results = {};

		if (fromCache) {
			if (model.undoEnabled) {
				var oldState = fromCache.attributeState();
				var processUndo = function() {
					var instance = new model(Object.extend({id: fromCache.getId()}, oldState));
					instance._lastSavedState = undefined;
					instance.save();
				};
				results.undoFunction = processUndo;
			}
			
			fromCache.removeFromCaches();
			
			fromCache.fire("destroy");
		}
		
		return results;
	},
	
	remoteTransaction: function(transactionData) {
		if (transactionData.transactionKey == rio.environment.transactionKey) { return; }
		try {
			// TODO: Two potential bugs here
			//
			// 1) Need to execute this in a rio.Attr.transaction
			// 2) Need to get back the collection entity process functions from _filterAndProcessJsonWhileAccumulatingCollectionEntities
			//    and run them at the end.  Otherwise we might have reification collisions.
			var resultSets = transactionData.transaction.map(function(t) {
				switch(t.action) {
				case "create":
					return rio.Model.doRemoteCreate(t);
				case "update":
					return rio.Model.doRemoteUpdate(t);
				case "destroy":
					return rio.Model.doRemoteDestroy(t);
				}
			});
			
			var undos = resultSets.map(function(r) { return r.undoFunction; }).compact();
			
			if (!undos.empty()) {
				rio.Undo.registerUndo(function() {
					undos.each(function(undo) {
						undo();
					});
				});
			}
		} catch(e) { 
			rio.error(e, "Remote transaction error!");
		}
	},
	
	extend: function(model, extension) {
		
		extension.__initialize = extension.initialize || Prototype.emptyFunction;
		extension.initialize = function(options) {
			this.__model = model;

			if (options.id == undefined && model.url) {
				options.id = model.id();
				this._id = options.id;
			}
			
			if (options.id && options.id.constructor != rio.Id && model.id) {
				options.id = model.id(options.id, true);
				this.setId(options.id);
			}

			(this.__initialize.bind(this))(options);
			
			// Add the hasManyAssocitation#create methods
			Object.keys(model._hasManyAssociations).each(function(hasManyName) {
				var options = model._hasManyAssociations[hasManyName];
				this[hasManyName].create = function(createOptions) {
					// In the case that the entity is still new, we should preload the association
					// to make sure no entries are missed
					// TODO: before we can wrap in isNew, we need to make the spec fixture proxy include created entities
					// if (this.isNew()) {
						this[("get-" + hasManyName).camelize()]();
					// }
					var parameters = Object.clone(options.parameters);
					parameters[options.foreignKey] = this.getId();
					return rio.models[options.className].create(Object.extend(createOptions || {}, parameters));
				}.bind(this);
			}.bind(this));
			
			if (model.hasChannel()) {
				if (rio.push) {
					var addChannel = function() {
						rio.push.addChannel(this.channelName());
					}.bind(this);
					if (options.id && options.id.temporary()) {
						options.id.doAfterReification(addChannel);
					} else {
						addChannel();
					}
				} else {
					rio.warn("Attempted to add a channel without an available push server");
				}
			}

			options = options || {};
			if (options.id && model.url) {
				model.putInCache(options.id, this);
			}
			if (options.id && options.id.temporary && !options.id.temporary()) {
				this._lastSavedState = this.attributeState();
			}
		};
		
		rio.Attr.extend(model, extension);
	},
	
	toString: function() {
		return "Model";
	}
};