describe(rio.Attr, {

	"should support declaritive attrReader": function() {
		var attr = rio.Attr.create();
		attr.attrReader("something");
		rio.Attr.extend(attr, {});
		
		var attrInstance = new attr({ something: "some value" });
		
		attrInstance.getSomething().shouldEqual("some value");
	},
	
	"should support declaritive attrReader with default value": function() {
		var attr = rio.Attr.create();
		attr.attrReader("something", "some default");
		rio.Attr.extend(attr, {});
		
		var attrInstance = new attr();
		
		attrInstance.getSomething().shouldEqual("some default");
	},

	"should support declaritive attrAccessor": function() {
		var attr = rio.Attr.create();
		attr.attrAccessor("something");
		rio.Attr.extend(attr, {});
		
		var attrInstance = new attr({ something: "some value" });
		
		attrInstance.getSomething().shouldEqual("some value");
		attrInstance.setSomething("another value");
		attrInstance.getSomething().shouldEqual("another value");
	},
	
	"should support attr inheritance": function() {
		var attr = rio.Attr.create();
		attr.attrReader("something");
		rio.Attr.extend(attr, {});
		
		var subAttr = rio.Attr.create(attr);
		
		var attrInstance = new subAttr({ something: "some value" });
		
		attrInstance.getSomething().shouldEqual("some value");
	},
	
	"should support concise attrReader syntax": function() {
		var attr = rio.Attr.create({
			attrReaders: ["something", "anotherThing"]
		});
	
		var attrInstance = new attr({ something: "some value", anotherThing: "another thing" });
		attrInstance.getSomething().shouldEqual("some value");
		attrInstance.getAnotherThing().shouldEqual("another thing");
	},
	
	"should support concise attrReader syntax also generating an is- accessor": function() {
		var attr = rio.Attr.create({
			attrReaders: ["something"]
		});
	
		var attrInstance = new attr({ something: "some value" });
		attrInstance.isSomething().shouldEqual("some value");
	},
	
	"should support concise attrReader syntax with default values": function() {
		var attr = rio.Attr.create({
			attrReaders: [["something", "some default"]]
		});
	
		var attrInstance = new attr();
		
		attrInstance.getSomething().shouldEqual("some default");
	},

	"should support concise attrReader syntax with default array values that are cloned when creating new objects": function() {
		var attr = rio.Attr.create({
			attrReaders: [["something", [1]]]
		});
	
		var a = new attr();
		a.getSomething().push(2);
		a.getSomething().length.shouldEqual(2);
		shouldBeUndefined(new attr().getSomething().length.shouldEqual(1));
	},

	"should support concise attrReader syntax with default object values that are cloned when creating new objects": function() {
		var attr = rio.Attr.create({
			attrReaders: [["something", {a: 1}]]
		});
	
		var a = new attr();
		a.getSomething().b = 2;
		shouldBeUndefined(new attr().getSomething().b);
	},
	
	"should support concise attrAccessor syntax": function() {
		var attr = rio.Attr.create({
			attrAccessors: ["something", "anotherThing"]
		});
	
		var attrInstance = new attr({ something: "some value", anotherThing: "another thing" });
	
		attrInstance.getSomething().shouldEqual("some value");
		attrInstance.getAnotherThing().shouldEqual("another thing");
		
		attrInstance.setSomething("some value 2");
		attrInstance.getSomething().shouldEqual("some value 2");
	},
	
	"should support concise attrAccessor syntax with default values": function() {
		var attr = rio.Attr.create({
			attrAccessors: [["something", "some default"]]
		});
	
		var attrInstance = new attr();
	
		attrInstance.getSomething().shouldEqual("some default");
		
		attrInstance.setSomething("some value");
		attrInstance.getSomething().shouldEqual("some value");
	},
	
	"should support concise instance method extension": function() {
		var attr = rio.Attr.create({
			methods: {
				hello: function() {
					return "hello world";
				}
			}
		});
		
		var attrInstance = new attr();
		
		attrInstance.hello().shouldEqual("hello world");
	},
	
	"should support concise class method extension": function() {
		var attr = rio.Attr.create({
			classMethods: {
				hello: function() {
					return "hello world";
				}
			}
		});
		
		attr.hello().shouldEqual("hello world");
	},

	/* BEGIN BINDING RELATED SPECS */
	"with a bindable attribute named a": {
		beforeEach: function() {
			this.attr = rio.Attr.create({ attrAccessors: ["a"] });
			this.attrB = rio.Attr.create({ attrAccessors: ["b"] });
		},

		"should immediately execute a binding on a": function() {
			var attrInstance = new this.attr({ a: "asdf" });
			attrInstance.bind("a", function(newVal) {
				newVal.shouldEqual("asdf");
			}.shouldBeCalled());
		},
		
		"should pass the current value as the old value on bind": function() {
			var attrInstance = new this.attr({ a: "asdf" });
			attrInstance.bind("a", function(newVal, oldVal) {
				oldVal.shouldEqual("asdf");
			}.shouldBeCalled());
		},

		"should not immediately execute a binding when passing true for skipInitialExecution": function() {
			var attrInstance = new this.attr({ a: "asdf" });
			attrInstance.bind("a", function() {}.shouldNotBeCalled(), true);
		},

		"should allow binding a function to a using attr.bind('a', fcn) syntax": function() {
			var attrInstance = new this.attr();
			attrInstance.bind("a", function(newVal) {
				newVal.shouldEqual("asdf");
			}.shouldBeCalled(), true);
		
			attrInstance.setA("asdf");
		},
		
		"should also pass the old value to the function on set": function() {
			var attrInstance = new this.attr({ a: "something old" });
			attrInstance.bind("a", function(newVal, oldVal) {
				newVal.shouldEqual("asdf");
				oldVal.shouldEqual("something old");
			}.shouldBeCalled(), true);
		
			attrInstance.setA("asdf");
		},

		"should not execute bindings during a #transaction until the transaction has completed": function() {
			var attrInstance = new this.attr({ a: "asdf" });
			var lastCalledWith;
			attrInstance.bind("a", function(val) {
				lastCalledWith = val;
			});
			
			lastCalledWith.shouldEqual("asdf");
			rio.Attr.transaction(function() {
				attrInstance.setA("qwer");
				lastCalledWith.shouldNotEqual("qwer");
			}.shouldBeCalled());
			lastCalledWith.shouldEqual("qwer");
		},

		"should not reexecute bindings during a second #transaction": function() {
			var attrInstance = new this.attr({ a: "asdf" });
			var lastCalledWith;
			attrInstance.bind("a", function(val) {
				lastCalledWith = val;
			});
			
			lastCalledWith.shouldEqual("asdf");
			rio.Attr.transaction(function() {
				attrInstance.setA("qwer");
				lastCalledWith.shouldNotEqual("qwer");
			}.shouldBeCalled());
			lastCalledWith.shouldEqual("qwer");
			
			lastCalledWith = undefined;
			rio.Attr.transaction(function() {
				
			});
			shouldBeUndefined(lastCalledWith);
		},

		"should not execute bindings during nested #transactions until all transactions have completed": function() {
			var attrInstance = new this.attr({ a: "asdf" });
			var lastCalledWith;
			attrInstance.bind("a", function(val) {
				lastCalledWith = val;
			});
			
			lastCalledWith.shouldEqual("asdf");
			rio.Attr.transaction(function() {
				rio.Attr.transaction(function() {
					attrInstance.setA("qwer");
					lastCalledWith.shouldNotEqual("qwer");
				}.shouldBeCalled());
				lastCalledWith.shouldNotEqual("qwer");
			}.shouldBeCalled());

			lastCalledWith.shouldEqual("qwer");
		},

		"should not execute bindings during a #transaction if the transaction fails": function() {
			var attrInstance = new this.attr({ a: "asdf" });
			var lastCalledWith;
			attrInstance.bind("a", function(val) {
				lastCalledWith = val;
			});
			
			lastCalledWith.shouldEqual("asdf");
			try {
				rio.Attr.transaction(function() {
					attrInstance.setA("qwer");
					throw("EEEK");
				}.shouldBeCalled());
			} catch(e) {
				/* swallow this exception as part of the test */
			}

			lastCalledWith.shouldEqual("asdf");
		},

		"should not execute bindings during a #transaction if the transaction fails but should allow a binding to fire immediately after": function() {
			var attrInstance = new this.attr({ a: "asdf" });
			var lastCalledWith;
			attrInstance.bind("a", function(val) {
				lastCalledWith = val;
			});
			
			lastCalledWith.shouldEqual("asdf");
			try {
				rio.Attr.transaction(function() {
					attrInstance.setA("qwer");
					throw("EEEK");
				}.shouldBeCalled());
			} catch(e) {
				/* swallow this exception as part of the test */
			}
			lastCalledWith.shouldEqual("asdf");
			
			attrInstance.setA("zxcv");
			lastCalledWith.shouldEqual("zxcv");
		},

		"should return an unbind function when binding a function to an a": function() {
			var attrInstance = new this.attr();
			var unbindFunction = attrInstance.bind("a", function() {}.shouldNotBeCalled(), true);
			unbindFunction();
			attrInstance.setA("asdf");
		},

		"should allow binding on a path 'a.b' and fire bindings when a's b value changes": function() {
			var attrBInstance = new this.attrB();
			var attrInstance = new this.attr({ a: attrBInstance });
			attrInstance.bind("a.b", function(newVal) {
				newVal.shouldEqual("asdf");
			}.shouldBeCalled(), true);

			attrBInstance.setB("asdf");
		},
		
		"should allow binding on a path 'a.b' and fire bindings immediately with the old value and new value the same": function() {
			var attrInstance = new this.attr({ a: new this.attrB({ b: "asdf" }) });
			attrInstance.bind("a.b", function(newVal, oldVal) {
				oldVal.shouldEqual("asdf");
				newVal.shouldEqual("asdf");
			}.shouldBeCalled());
		},

		"should allow binding on a path 'a.b' and fire bindings when a's b value changes with the old value as well": function() {
			var attrBInstance = new this.attrB({ b: "old" });
			var attrInstance = new this.attr({ a: attrBInstance });
			attrInstance.bind("a.b", function(newVal, oldVal) {
				oldVal.shouldEqual("old");
			}.shouldBeCalled(), true);

			attrBInstance.setB("asdf");
		},

		"should allow binding on a path 'a.b' and fire bindings when a changes": function() {
			var attrInstance = new this.attr();
			attrInstance.bind("a.b", function(newVal) {
				newVal.shouldEqual("asdf");
			}.shouldBeCalled(), true);

			attrInstance.setA(new this.attrB({ b: "asdf" }));
		},

		"should allow binding on a path 'a.b' and fire bindings when a changes with the old value also": function() {
			var attrInstance = new this.attr({ a: new this.attrB({ b: "old" }) });
			attrInstance.bind("a.b", function(newVal, oldVal) {
				oldVal.shouldEqual("old");
			}.shouldBeCalled(), true);

			attrInstance.setA(new this.attrB({ b: "asdf" }));
		},

		"should properly unbind a path": function() {
			var attrInstanceB = new this.attrB({ b: 0 });
			var attrInstance = new this.attr({ a: attrInstanceB });
			attrInstance.bind("a.b", function() {}.shouldBeCalled().times(2), true);

			attrInstanceB.setB(1);
			attrInstance.setA(new this.attrB({ b: 2 }));
			attrInstanceB.setB(3);
		},

		"should properly unbind a long path": function() {
			var attrInstanceA2 = new this.attr({ a: "asdf" });
			var attrInstanceB = new this.attrB({ b: attrInstanceA2 });
			var attrInstance = new this.attr({ a: attrInstanceB });
			attrInstance.bind("a.b.a", function() {}.shouldBeCalled().times(2), true);

			attrInstanceA2.setA(1);
			attrInstance.setA(new this.attrB({ b: new this.attr({ a: 2 }) }));
			attrInstanceA2.setA(3);
		},
		
		"should bind collection bindings at the end of a path": function() {
			var arr = [1];
			var attrInstanceB = new this.attrB({ b: arr });
			var attrInstance = new this.attr({ a: attrInstanceB });
			attrInstance.bind("a.b", {
				insert: function(val) {
					val.shouldEqual(2);
				}.shouldBeCalled().once()
			});
			
			arr.push(2);
		},

		"should rebind collection bindings at the end of a path": function() {
			var arr = [1];
			var attrInstanceB = new this.attrB({ b: arr });
			var attrInstance = new this.attr({ a: attrInstanceB });
			attrInstance.bind("a.b", {
				insert: function(val) {}.shouldNotBeCalled()
			});
			
			attrInstanceB.setB([]);
			arr.push(2);
		},

		"should unbind collection bindings at the end of a long path": function() {
			var arr = [1];
			var attrInstanceA2 = new this.attr({ a: arr });
			var attrInstanceB = new this.attrB({ b: attrInstanceA2 });
			var attrInstance = new this.attr({ a: attrInstanceB });
			attrInstance.bind("a.b.a", {
				insert: function(val) { }.shouldNotBeCalled()
			});
			
			attrInstanceB.setB(new this.attr({ a: [] }));
			arr.push(2);
		},
		
		
		/* This is a confusing test. */
		"should allow you to pass the same list bindings to a binding path and a standard binding": function() {
			var subInstance = new this.attrB({ b: "asdf" });
			var attrInstance = new this.attr({
				a: subInstance
			});
			
			var otherInstance = new this.attr({
				a: [2,3]
			});

			var setValue = "asdf";
			var insertValue = "";
			var listBindings = {
				set: function(newVal) {
					newVal.shouldEqual(setValue);
				}.shouldBeCalled().times(3),
				
				insert: function(val) {
					val.shouldEqual(insertValue);
				}.shouldBeCalled().times(3)
			};

			attrInstance.bind("a.b", listBindings);
			
			setValue = [2, 3];
			otherInstance.a.bind(listBindings);
			
			insertValue = 6;
			otherInstance.getA().push(6);

			setValue = [1,2,3];
			subInstance.setB(setValue);
			
			insertValue = 7;
			otherInstance.getA().push(7);
			
			insertValue = 4;
			setValue.push(insertValue);
		},

		"should allow binding a collection attrAccessor to an object with set": function() {
			var attrInstance = new this.attr();
			
			attrInstance.bind("a", {
				set: function(newVal) {
					newVal.shouldEqual([1,2,3]);
				}.shouldBeCalled()
			}, true);

			attrInstance.setA([1,2,3]);
		},

		"should allow binding a collection attrAccessor to an object with insert responding to push": function() {
			var arr = [1,2,3];
			var attrInstance = new this.attr({ a: arr });
			
			attrInstance.bind("a", {
				insert: function(newVal, index) {
					newVal.shouldEqual(4);
					index.shouldEqual(3);
				}.shouldBeCalled()
			});
			arr.push(4);
		},

		"should allow binding a collection attrAccessor to an object with insert responding to splice": function() {
			var arr = [1,2,3];
			var attrInstance = new this.attr({ a: arr });
			
			attrInstance.bind("a", {
				insert: function(newVal, index) {
					newVal.shouldEqual(1.5);
					index.shouldEqual(1);
				}.shouldBeCalled()
			});
			arr.splice(1, 0, 1.5);
		},

		"should allow binding a collection attrAccessor to an object with remove responding to splice": function() {
			var arr = [1,2,3];
			var attrInstance = new this.attr({ a: arr });
			
			attrInstance.bind("a", {
				remove: function(removeVal) {
					removeVal.shouldEqual(2);
				}.shouldBeCalled()
			});
			arr.splice(1, 1);
		},
		
		"should allow binding a collection attrAccessor to an object with remove responding to pop": function() {
			var arr = [1,2,3];
			var attrInstance = new this.attr({ a: arr });
			
			attrInstance.bind("a", {
				remove: function(removeVal) {
					removeVal.shouldEqual(3);
				}.shouldBeCalled()
			});
			arr.pop().shouldEqual(3);
		},

		"should allow binding a collection attrAccessor to an object with remove not responding to pop if already empty": function() {
			var arr = [];
			var attrInstance = new this.attr({ a: arr });
			
			attrInstance.bind("a", {
				remove: function(removeVal) {}.shouldNotBeCalled()
			});
			shouldBeUndefined(arr.pop());
		},

		"should allow binding a collection attrAccessor to an object with empty responding to pop": function() {
			var arr = [1];
			var attrInstance = new this.attr({ a: arr });
			
			var lastEmptyValue;
			attrInstance.bind("a", {
				empty: function(val) {
					lastEmptyValue = val;
				}.shouldBeCalled()
			});
			lastEmptyValue.shouldBeFalse();
			arr.pop();
			lastEmptyValue.shouldBeTrue();
		},

		"should allow binding a collection attrAccessor to an object with empty not responding to pop if emptyness doesn't change": function() {
			var arr = [1, 2];
			var attrInstance = new this.attr({ a: arr });
			
			var lastEmptyValue;
			attrInstance.bind("a", {
				empty: function(val) {
					lastEmptyValue = val;
				}.shouldBeCalled()
			});
			lastEmptyValue.shouldBeFalse();
			lastEmptyValue = undefined;
			arr.pop();
			shouldBeUndefined(lastEmptyValue);
		},
		
		"should allow binding a collection attrAccessor to an object with empty": function() {
			var attrInstance = new this.attr({ a: [] });
			attrInstance.bind("a", {
				empty: function(empty) {
					empty.shouldBeTrue();
				}.shouldBeCalled().once()
			});
		},

		"should allow binding a collection attrAccessor to an object with empty responding true to set": function() {
			var attrInstance = new this.attr();
			attrInstance.bind("a", {
				empty: function(empty) {
					empty.shouldBeTrue();
				}.shouldBeCalled().once()
			});
			attrInstance.setA([]);
		},

		"should allow binding a collection attrAccessor to an object with empty responding false to set": function() {
			var attrInstance = new this.attr();
			attrInstance.bind("a", {
				empty: function(empty) {
					empty.shouldBeFalse();
				}.shouldBeCalled().once()
			});
			attrInstance.setA([1,2,3]);
		},

		"should allow binding a collection attrAccessor to an object with empty responding to insert": function() {
			var arr = [];
			var attrInstance = new this.attr({ a: arr });

			/* When bind is called the empty binding will fire.  Use this expectation variable to set an expectation on the subsequent firing. */
			var expectation = Prototype.emptyFunction;
			attrInstance.bind("a", {
				empty: function(empty) {
					expectation(empty);
				}
			});
			expectation = function(empty) { empty.shouldBeFalse(); }.shouldBeCalled();
			arr.push(4);
		},

		"should allow binding a collection attrAccessor to an object with empty responding to splice adding": function() {
			var arr = [];
			var attrInstance = new this.attr({ a: arr });

			/* When bind is called the empty binding will fire.  Use this expectation variable to set an expectation on the subsequent firing. */
			var expectation = Prototype.emptyFunction;
			attrInstance.bind("a", {
				empty: function(empty) {
					expectation(empty);
				}
			});
			expectation = function(empty) { empty.shouldBeFalse(); }.shouldBeCalled();
			
			arr.splice(0, 0, "a");
		},

		"should allow binding a collection attrAccessor to an object with empty responding to splice removing": function() {
			var arr = [1];
			var attrInstance = new this.attr({ a: arr });

			/* When bind is called the empty binding will fire.  Use this expectation variable to set an expectation on the subsequent firing. */
			var expectation = Prototype.emptyFunction;
			attrInstance.bind("a", {
				empty: function(empty) {
					expectation(empty);
				}
			});
			expectation = function(empty) { empty.shouldBeTrue(); }.shouldBeCalled();
			
			arr.splice(0, 1);
		},

		"should allow binding a collection attrAccessor to an object with empty not responding to splice adding or removing that don't change emptyness": function() {
			var arr = [1];
			var attrInstance = new this.attr({ a: arr });

			/* When bind is called the empty binding will fire.  Use this expectation variable to set an expectation on the subsequent firing. */
			var expectation = Prototype.emptyFunction;
			attrInstance.bind("a", {
				empty: function(empty) {
					expectation(empty);
				}
			});
			expectation = function() { }.shouldNotBeCalled();
			
			arr.splice(0, 0, "a");
			arr.splice(0, 1);
		},

		"should allow binding a collection attrAccessor to an object with set responding to clear": function() {
			var arr = [1,2,3];
			var attrInstance = new this.attr({ a: arr });

			var expectation = Prototype.emptyFunction;
			attrInstance.bind("a", {
				set: function(val) {
					expectation(val);
				}
			});
			expectation = function(val) {
				val.shouldBeEmpty();
			}.shouldBeCalled();
			
			arr.clear();
		},

		"should allow binding a collection attrAccessor to an object with set not responding to clear if already empty": function() {
			var arr = [];
			var attrInstance = new this.attr({ a: arr });

			var expectation = Prototype.emptyFunction;
			attrInstance.bind("a", {
				set: function(val) {
					expectation(val);
				}
			});
			expectation = function(val) {}.shouldNotBeCalled();
			
			arr.clear();
		},

		"should allow binding a collection attrAccessor to an object with empty responding to clear": function() {
			var arr = [1, 2, 3];
			var attrInstance = new this.attr({ a: arr });

			var expectation = Prototype.emptyFunction;
			var lastEmptyValue;
			attrInstance.bind("a", {
				empty: function(val) {
					lastEmptyValue = val;
				}
			});
			
			arr.clear();
			lastEmptyValue.shouldBeTrue();
		},

		"should allow binding a collection attrAccessor to an object with empty not responding to clear if already empty": function() {
			var arr = [];
			var attrInstance = new this.attr({ a: arr });

			var expectation = Prototype.emptyFunction;
			var lastEmptyValue;
			attrInstance.bind("a", {
				empty: function(val) {
					lastEmptyValue = val;
				}
			});
			
			lastEmptyValue = undefined;
			arr.clear();
			shouldBeUndefined(lastEmptyValue);
		},

		"should unbind collection clear binding when the value of an attrAccessor changes": function() {
			var arr = [1,2,3];
			var attrInstance = new this.attr({ a: arr });
			
			var expectation = Prototype.emptyFunction;
			attrInstance.bind("a", {
				set: function(val) {
					expectation(val);
				}
			});
			expectation = function(val) {}.shouldBeCalled().once();
			
			attrInstance.setA([]);
			arr.clear();
			arr.clear();
		},
		
		"should unbind collection bindings when the value of an attrAccessor changes": function() {
			var arr = [1,2,3];
			var attrInstance = new this.attr({ a: arr });
			
			attrInstance.bind("a", {
				insert: function(insertVal) {}.shouldBeCalled().once()
			});
			
			attrInstance.setA([5,6,7,8]);
			attrInstance.setA(arr);

			arr.push(4);
		},

		"should unbind collection bindings when the value of an attrAccessor changes and the collection was bound in multiple attr's": function() {
			var arr = [1,2,3];
			var attrInstance1 = new this.attr({ a: arr });
			var attrInstance2 = new this.attr({ a: arr });
			
			attrInstance1.bind("a", {
				insert: function(insertVal) {}.shouldBeCalled().once()
			});
			attrInstance2.bind("a", {
				insert: function(insertVal) {}.shouldBeCalled().once()
			});
			
			attrInstance1.setA([5,6,7,8]);
			attrInstance1.setA(arr);

			attrInstance2.setA([5,6,7,8]);
			attrInstance2.setA(arr);

			arr.push(4);
		},
		
		"should unbind collection bindings when calling the unbind function": function() {
			var arr = [1,2,3];
			var attrInstance = new this.attr({ a: arr });
			
			var unbind = attrInstance.bind("a", {
				insert: function(insertVal) {}.shouldBeCalled().once()
			});
			
			arr.push(4);
			unbind();
			arr.push(5);
		},
		
		"should not execute collection bindings for push during a #transaction until the transaction completes": function() {
			var arr = [];
			var attrInstance = new this.attr({ a: arr });

			var insertLastCalledWith;
			var emptyLastCalledWith;
			attrInstance.bind("a", {
				insert: function(val) {
					insertLastCalledWith = val;
				},
				
				empty: function(val) {
					emptyLastCalledWith = val;
				}
			});

			shouldBeUndefined(insertLastCalledWith);
			emptyLastCalledWith.shouldBeTrue();

			rio.Attr.transaction(function() {
				arr.push(4);

				shouldBeUndefined(insertLastCalledWith);
				emptyLastCalledWith.shouldBeTrue();
			}.shouldBeCalled());

			insertLastCalledWith.shouldEqual(4);
			emptyLastCalledWith.shouldBeFalse();
		},

		"should not execute collection bindings for pop during a #transaction until the transaction completes": function() {
			var arr = [1];
			var attrInstance = new this.attr({ a: arr });

			var removeLastCalledWith;
			var emptyLastCalledWith;
			attrInstance.bind("a", {
				remove: function(val) {
					removeLastCalledWith = val;
				},
				
				empty: function(val) {
					emptyLastCalledWith = val;
				}
			});

			shouldBeUndefined(removeLastCalledWith);
			emptyLastCalledWith.shouldBeFalse();

			rio.Attr.transaction(function() {
				arr.pop().shouldEqual(1);

				shouldBeUndefined(removeLastCalledWith);
				emptyLastCalledWith.shouldBeFalse();
			}.shouldBeCalled());

			removeLastCalledWith.shouldEqual(1);
			emptyLastCalledWith.shouldBeTrue();
		},

		"should not execute collection bindings for splice during a #transaction until the transaction completes": function() {
			var arr = [];
			var attrInstance = new this.attr({ a: arr });

			var insertLastCalledWith;
			var removeLastCalledWith;
			var emptyLastCalledWith;
			attrInstance.bind("a", {
				insert: function(val) {
					insertLastCalledWith = val;
				},
				
				remove: function(val) {
					removeLastCalledWith = val;
				},
				
				empty: function(val) {
					emptyLastCalledWith = val;
				}
			});

			shouldBeUndefined(insertLastCalledWith);
			shouldBeUndefined(removeLastCalledWith);
			emptyLastCalledWith.shouldBeTrue();

			rio.Attr.transaction(function() {
				arr.splice(0, 0, 2);
				arr.splice(1, 0, 5);
				
				arr.splice(0, 1);

				shouldBeUndefined(insertLastCalledWith);
				shouldBeUndefined(removeLastCalledWith);
				emptyLastCalledWith.shouldBeTrue();
			}.shouldBeCalled());

			insertLastCalledWith.shouldEqual(5);
			removeLastCalledWith.shouldEqual(2);
			emptyLastCalledWith.shouldBeFalse();
		},
		
		"should not execute collection bindings for clear during a #transaction until the transaction completes": function() {
			var arr = [1, 2, 3];
			var attrInstance = new this.attr({ a: arr });

			var setLastCalledWith;
			var emptyLastCalledWith;
			attrInstance.bind("a", {
				set: function(val) {
					setLastCalledWith = val;
				},
				
				empty: function(val) {
					emptyLastCalledWith = val;
				}
			});

			setLastCalledWith = undefined;
			emptyLastCalledWith.shouldBeFalse();

			rio.Attr.transaction(function() {
				arr.clear();

				shouldBeUndefined(setLastCalledWith);
				emptyLastCalledWith.shouldBeFalse();
			}.shouldBeCalled());

			setLastCalledWith.shouldEqual([]);
			emptyLastCalledWith.shouldBeTrue();
		},

		"has a binding object at attrInstance.a that": {
			beforeEach: function() {
				this.attrInstance = new this.attr({ a: "asdf" });
			},
			
			"should expose the value of a": function() {
				this.attrInstance.a.value().shouldEqual("asdf");
			},
			
			"should allow binding a function to it": function() {
				this.attrInstance.a.bind(function(newVal) {
					newVal.shouldEqual("qwer");
				}.shouldBeCalled(), true);

				this.attrInstance.setA("qwer");
			},

			"should provide an update method that changes the underlying attribute value": function() {
				this.attrInstance.a.update("qwer");
				this.attrInstance.getA().shouldEqual("qwer");
			},

			"provides a bindTo method that": {
				beforeEach: function() {
					this.otherInstance = new this.attrB({ b: "qwer" });
				},

				"should bind itself to another binding initializing the binding value with 'asdf'": function() {
					this.attrInstance.a.bindTo(this.otherInstance.b);
					this.attrInstance.getA().shouldEqual("asdf");
					this.otherInstance.getB().shouldEqual("asdf");
				},

				"should bind itself to another binding and update the other binding when it updates": function() {
					this.attrInstance.a.bindTo(this.otherInstance.b);
					this.attrInstance.setA("1234");
					this.otherInstance.getB().shouldEqual("1234");
				},

				"should bind itself to another binding and update itself when the other binding is updated": function() {
					this.attrInstance.a.bindTo(this.otherInstance.b);
					this.otherInstance.setB("4321");
					this.attrInstance.getA().shouldEqual("4321");
				},
				
				"should provid an unbind object that cleans up the bindings in both directions": function() {
					var unbind = this.attrInstance.a.bindTo(this.otherInstance.b);
					this.attrInstance.setA('initial');
					unbind();

					this.attrInstance.setA('newA');
					this.otherInstance.getB().shouldEqual('initial');

					this.otherInstance.setB('newB');
					this.attrInstance.getA().shouldEqual('newA');
				}
			}
		},

		"will bind a to another attrAccessor if its binding is passed in on initialization and": {
			beforeEach: function() {
				this.subInstance = new this.attrB({ b: "1234" });
				this.otherInstance = new this.attrB({ b: this.subInstance });
				this.attrInstance = new this.attr({ a: this.otherInstance.binding("b.b") });
			},

			"should initialize a with the value of the other binding": function() {
				this.attrInstance.getA().shouldEqual("1234");
			},

			"should update a when the sub binding value is updated": function() {
				this.subInstance.setB("4321");
				this.attrInstance.getA().shouldEqual("4321");
			},

			"should update the sub binding value when a is updated": function() {
				this.attrInstance.setA("4321");
				this.subInstance.getB().shouldEqual("4321");
			},

			"should update a when the binding value is changed": function() {
				this.otherInstance.setB(new this.attrB({ b: "9876" }));
				this.attrInstance.getA().shouldEqual("9876");
			}
		},
		
		"has a freeze method that": {
			"sets frozen to true": function() {
				var attrInstance = new this.attr({ a: 1 });
				attrInstance.freeze();
				attrInstance.frozen().shouldBeTrue();
			},

			"makes all attrAccessor set methods no-ops": function() {
				var attrInstance = new this.attr({ a: 1 });
				attrInstance.freeze();
				attrInstance.setA(2);
				attrInstance.getA().shouldEqual(1);
			}
		},

		"has an unfreeze method that": {
			"sets frozen to false": function() {
				var attrInstance = new this.attr({ a: 1 });
				attrInstance.freeze();
				attrInstance.unfreeze();
				attrInstance.frozen().shouldBeFalse();
			},

			"makes all attrAccessor set methods no-ops": function() {
				var attrInstance = new this.attr({ a: 1 });
				attrInstance.freeze();
				attrInstance.unfreeze();
				attrInstance.setA(2);
				attrInstance.getA().shouldEqual(2);
			}
		},
		
		"supports an invert method on bindings that": {
			"should have value true for underlying false": function() {
				new this.attr({ a: false }).a.invert().value().shouldEqual(true);
			},
			
			"should have value false for underlying true": function() {
				new this.attr({ a: true }).a.invert().value().shouldEqual(false);
			},

			"should have value true for underlying falsy values": function() {
				new this.attr({ a: 0 }).a.invert().value().shouldEqual(true);
				new this.attr({ a: "" }).a.invert().value().shouldEqual(true);
				new this.attr({ a: null }).a.invert().value().shouldEqual(true);
			},

			"should have value false for underlying truthy values": function() {
				new this.attr({ a: 1 }).a.invert().value().shouldEqual(false);
				new this.attr({ a: "asdf" }).a.invert().value().shouldEqual(false);
				new this.attr({ a: [1] }).a.invert().value().shouldEqual(false);
			},

			"should have value true for underlying undefined": function() {
				new this.attr().a.invert().value().shouldEqual(true);
			},
			
			"should update the underlying value to false for true": function() {
				var attrInstance = new this.attr();
				attrInstance.a.invert().update(true);
				attrInstance.getA().shouldEqual(false);
			},

			"should update the underlying value to true for false": function() {
				var attrInstance = new this.attr();
				attrInstance.a.invert().update(false);
				attrInstance.getA().shouldEqual(true);
			},

			"should update the underlying value to false for truthy values": function() {
				var attrInstance = new this.attr();
				attrInstance.a.invert().update(1);
				attrInstance.getA().shouldEqual(false);
				attrInstance.a.invert().update("asdf");
				attrInstance.getA().shouldEqual(false);
				attrInstance.a.invert().update([1]);
				attrInstance.getA().shouldEqual(false);
			},

			"should update the underlying value to true for falsy values": function() {
				var attrInstance = new this.attr();
				attrInstance.a.invert().update(0);
				attrInstance.getA().shouldEqual(true);
				attrInstance.a.invert().update("");
				attrInstance.getA().shouldEqual(true);
				attrInstance.a.invert().update(null);
				attrInstance.getA().shouldEqual(true);
			},

			"should update the underlying value to true for undefined": function() {
				var attrInstance = new this.attr();
				attrInstance.a.invert().update();
				attrInstance.getA().shouldEqual(true);
			},

			"should honor true for skipInitialExecution flag on bind": function() {
				new this.attr().a.invert().bind(function() {}.shouldNotBeCalled(), true);
			},

			"should honor false for skipInitialExecution flag on bind": function() {
				new this.attr().a.invert().bind(function() {}.shouldBeCalled(), false);
			},

			"should honor a default of false for skipInitialExecution flag on bind": function() {
				new this.attr().a.invert().bind(function() {}.shouldBeCalled());
			},

			"should invert true to false for observers on bind": function() {
				new this.attr({ a: true }).a.invert().bind(function(a) { a.shouldEqual(false); }.shouldBeCalled());
			},

			"should invert false to true for observers on bind": function() {
				new this.attr({ a: false }).a.invert().bind(function(a) { a.shouldEqual(true); }.shouldBeCalled());
			},

			"should invert truthy values to false for observers on bind": function() {
				new this.attr({ a: 1 }).a.invert().bind(function(a) { a.shouldEqual(false); }.shouldBeCalled());
				new this.attr({ a: "asdf" }).a.invert().bind(function(a) { a.shouldEqual(false); }.shouldBeCalled());
				new this.attr({ a: [1] }).a.invert().bind(function(a) { a.shouldEqual(false); }.shouldBeCalled());
			},

			"should invert falsy values to true for observers on bind": function() {
				new this.attr({ a: 0 }).a.invert().bind(function(a) { a.shouldEqual(true); }.shouldBeCalled());
				new this.attr({ a: "" }).a.invert().bind(function(a) { a.shouldEqual(true); }.shouldBeCalled());
				new this.attr({ a: null }).a.invert().bind(function(a) { a.shouldEqual(true); }.shouldBeCalled());
			},

			"should invert undefined to true for observers on bind": function() {
				new this.attr().a.invert().bind(function(a) { a.shouldEqual(true); }.shouldBeCalled());
			},
			
			"should return an unbinding function from bind": function() {
				var attrInstance = new this.attr();
				var unbinding = attrInstance.a.invert().bind(function() {}.shouldNotBeCalled(), true);
				unbinding();
				attrInstance.setA(1);
			},

			"should update a second attribute with true for undelying false on bindTo": function() {
				var attrInstance = new this.attr({ a: false });
				var otherAttrInstance = new this.attr();
				
				attrInstance.a.invert().bindTo(otherAttrInstance.a);
				
				otherAttrInstance.getA().shouldEqual(true);
			},

			"should update a second attribute with false for undelying true on bindTo": function() {
				var attrInstance = new this.attr({ a: true });
				var otherAttrInstance = new this.attr();

				attrInstance.a.invert().bindTo(otherAttrInstance.a);

				otherAttrInstance.getA().shouldEqual(false);
			},

			"should update a second attribute with true for undelying falsy on bindTo": function() {
				var attrInstance = new this.attr({ a: 0 });
				var otherAttrInstance = new this.attr();

				attrInstance.a.invert().bindTo(otherAttrInstance.a);

				otherAttrInstance.getA().shouldEqual(true);
			},
			
			"should update a second attribute with false for undelying truthy on bindTo":  function() {
				var attrInstance = new this.attr({ a: 1 });
				var otherAttrInstance = new this.attr();

				attrInstance.a.invert().bindTo(otherAttrInstance.a);

				otherAttrInstance.getA().shouldEqual(false);
			},
			
			"should update a second attribute with true for undelying undefined on bindTo": function() {
				var attrInstance = new this.attr();
				var otherAttrInstance = new this.attr();

				attrInstance.a.invert().bindTo(otherAttrInstance.a);

				otherAttrInstance.getA().shouldEqual(true);
			},
			
			"should update itself with true from a second attribute with false on bindTo": function() {
				var attrInstance = new this.attr();
				var otherAttrInstance = new this.attr();

				attrInstance.a.invert().bindTo(otherAttrInstance.a);

				otherAttrInstance.setA(false);
				attrInstance.getA().shouldEqual(true);
			},
			
			"should update itself with false from a second attribute with true on bindTo": function() {
				var attrInstance = new this.attr();
				var otherAttrInstance = new this.attr();

				attrInstance.a.invert().bindTo(otherAttrInstance.a);

				otherAttrInstance.setA(true);
				attrInstance.getA().shouldEqual(false);
			},
			
			"should update itself with true from a second attribute with falsy on bindTo": function() {
				var attrInstance = new this.attr();
				var otherAttrInstance = new this.attr();

				attrInstance.a.invert().bindTo(otherAttrInstance.a);

				otherAttrInstance.setA(0);
				attrInstance.getA().shouldEqual(true);
			},
			
			"should update itself with false from a second attribute with truthy on bindTo": function() {
				var attrInstance = new this.attr();
				var otherAttrInstance = new this.attr();

				attrInstance.a.invert().bindTo(otherAttrInstance.a);

				otherAttrInstance.setA(1);
				attrInstance.getA().shouldEqual(false);
			},
			
			"should update itself with true from a second attribute with undefined on bindTo": function() {
				var attrInstance = new this.attr();
				var otherAttrInstance = new this.attr();

				attrInstance.a.invert().bindTo(otherAttrInstance.a);

				otherAttrInstance.setA();
				attrInstance.getA().shouldEqual(true);
			},

			"should return an unbinding function from bindTo": function() {
				var attrInstance = new this.attr();
				var otherAttrInstance = new this.attr();

				var unbinding = attrInstance.a.invert().bindTo(otherAttrInstance.a);

				unbinding();

				attrInstance.setA(3);
				otherAttrInstance.setA(false);
				attrInstance.getA().shouldEqual(3);

				otherAttrInstance.setA(3);
				attrInstance.setA(true);
				otherAttrInstance.getA().shouldEqual(3);
			},
			
			"should has attribute BINDING true": function() {
				new this.attr().a.invert().BINDING.shouldBeTrue();
			}
		}

	},
	
	"with two bindable attributes": {
		beforeEach: function() {
			this.attr = rio.Attr.create({ attrAccessors: ["a", "helloWorld"] });
		},
		
		"should allow multiple attributes to be updated with updateAttributes": function() {
			var attrInstance = new this.attr({ a: 1, helloWorld: 2 });
			attrInstance.updateAttributes({ a: 3, helloWorld: 4 });
			attrInstance.getA().shouldEqual(3);
			attrInstance.getHelloWorld().shouldEqual(4);
		},
		
		"should update all attributes before firing bindings on updateAttributes": function() {
			var attrInstance = new this.attr({ a: 1, helloWorld: 2 });
			var f = function() {
				attrInstance.getA().shouldEqual(3);
				attrInstance.getHelloWorld().shouldEqual(4);
			}.shouldBeCalled().times(2);
			attrInstance.a.bind(f, true);
			attrInstance.helloWorld.bind(f, true);
			attrInstance.updateAttributes({ a: 3, helloWorld: 4 });
		},
		
		"should update all attributes of multiple Attr instances on Attr#updateAttributes": function() {
			var attrInstance1 = new this.attr({ a: 1, helloWorld: 2 });
			var attrInstance2 = new this.attr({ a: 3, helloWorld: 4 });
			rio.Attr.updateAttributes([
				{ object: attrInstance1, attributes: { a: 5, helloWorld: 6 } },
				{ object: attrInstance2, attributes: { a: 7, helloWorld: 8 } }
			]);
			attrInstance1.getA().shouldEqual(5);
			attrInstance1.getHelloWorld().shouldEqual(6);
			attrInstance2.getA().shouldEqual(7);
			attrInstance2.getHelloWorld().shouldEqual(8);
		},

		"should update all attributes of multiple Attr instances before firing bindings on Attr#updateAttributes": function() {
			var attrInstance1 = new this.attr({ a: 1, helloWorld: 2 });
			var attrInstance2 = new this.attr({ a: 3, helloWorld: 4 });
			var f = function() {
				attrInstance1.getA().shouldEqual(5);
				attrInstance1.getHelloWorld().shouldEqual(6);
				attrInstance2.getA().shouldEqual(7);
				attrInstance2.getHelloWorld().shouldEqual(8);
			}.shouldBeCalled().times(4);
			attrInstance1.a.bind(f, true);
			attrInstance1.helloWorld.bind(f, true);
			attrInstance2.a.bind(f, true);
			attrInstance2.helloWorld.bind(f, true);
			rio.Attr.updateAttributes([
				{ object: attrInstance1, attributes: { a: 5, helloWorld: 6 } },
				{ object: attrInstance2, attributes: { a: 7, helloWorld: 8 } }
			]);
		}
	},
	
	/* END BINDING RELATED SPECS */
	
	"with a declared event called poof": {
		beforeEach: function() {
			this.attr = rio.Attr.create({ attrEvents: ["poof"] });
			this.attrInstance = new this.attr();
		},

		"should observe and fire the event": function() {
			this.attrInstance.observe("poof", function() {}.shouldBeCalled());
			this.attrInstance.fire("poof");
		},
		
		"should support stop observing functionality": function() {
			var f = function() {}.shouldNotBeCalled();
			this.attrInstance.observe("poof", f);
			this.attrInstance.stopObserving("poof", f);
			this.attrInstance.fire("poof");
		},

		"should return a stop observing function on observing an event": function() {
			var f = function() {}.shouldBeCalled().once();
			var stopObserving = this.attrInstance.observe("poof", f);
			this.attrInstance.fire("poof");
			stopObserving();
			this.attrInstance.fire("poof");
		},

		"should pass on any parameters to the observers": function() {
			this.attrInstance.observe("poof", function(a,b,c) {
				a.shouldEqual(1);
				b.shouldEqual(2);
				c.shouldEqual(3);
			}.shouldBeCalled());
			this.attrInstance.fire("poof", 1, 2, 3);
		},

		"should create an observer when initialized with an onPoof argument": function() {
			var attrInstance = new this.attr({
				onPoof: function(a) {
					a.shouldEqual(1);
				}.shouldBeCalled()
			});
			attrInstance.fire("poof", 1);
		}
	},
	
	"should set the attr NAME property": function() {
		var attr = rio.Attr.create("SomeAttr");
		
		attr.NAME.shouldEqual("SomeAttr");
	},
	
	"should return NAME from toString": function() {
		var attr = rio.Attr.create("SomeAttr");
		
		attr.toString().shouldEqual("SomeAttr");
	},
	
	"inheritance": {
		"on initialize": {
			"should call the initialize method of the super class if the subclass has no initialize method": function() {
				var SuperAttr = rio.Attr.create("Super", {
					methods: {
						initialize: function() {}.shouldBeCalled()
					}
				});
			
				var SubAttr = rio.Attr.create(SuperAttr, "Sub");
				new SubAttr();
			},
		
			"should pass in $super and options if both super and sub classes provide initializers": function() {
				var SuperAttr = rio.Attr.create("Super", {
					methods: {
						initialize: function(options) {
							options.hello.shouldEqual("world");
							options.foo.shouldEqual("bar");
						}.shouldBeCalled()
					}
				});
			
				var SubAttr = rio.Attr.create(SuperAttr, "Sub", {
					methods: {
						initialize: function($super, options) {
							$super(Object.extend({
								foo: "bar"
							}, options));
							options.hello.shouldEqual("world");
						}
					}
				});
				new SubAttr({hello: "world"});
			},

			"should handle 3 level heirarchy": function() {
				var SuperAttr = rio.Attr.create("Super", {
					methods: {
						initialize: function(options) {
							options.hello.shouldEqual("world");
							options.foo.shouldEqual("bar");
							options.bar.shouldEqual("baz");
						}.shouldBeCalled()
					}
				});
			
				var SubAttr = rio.Attr.create(SuperAttr, "Sub", {
					methods: {
						initialize: function($super, options) {
							$super(Object.extend({
								foo: "bar"
							}, options));
							options.hello.shouldEqual("world");
							options.bar.shouldEqual("baz");
						}
					}
				});
			
				var SubSubAttr = rio.Attr.create(SubAttr, "SubSub", {
					methods: {
						initialize: function($super, options) {
							$super(Object.extend({
								bar: "baz"
							}, options));
							options.hello.shouldEqual("world");
						}
					}
				});
				new SubSubAttr({hello: "world"});
			},

			"should handle 3 level heirarchy, where the middle level omits initialize": function() {
				var SuperAttr = rio.Attr.create("Super", {
					methods: {
						initialize: function(options) {
							options.hello.shouldEqual("world");
							options.bar.shouldEqual("baz");
						}.shouldBeCalled()
					}
				});
			
				var SubAttr = rio.Attr.create(SuperAttr, "Sub");
			
				var SubSubAttr = rio.Attr.create(SubAttr, "SubSub", {
					methods: {
						initialize: function($super, options) {
							$super(Object.extend({
								bar: "baz"
							}, options));
							options.hello.shouldEqual("world");
						}
					}
				});
				new SubSubAttr({hello: "world"});
			}
		},

		beforeEach: function() {
			var SuperAttr = rio.Attr.create("Super", {
				attrAccessors: ["a", ["hello", "super"]],
				attrHtmls: ["super"],
				methods: { buildSuperHtml: function() { return "foo"; } }
			});
			
			var SubAttr = rio.Attr.create(SuperAttr, "Sub", {
				attrAccessors: ["b"],
				attrHtmls: ["sub"],
				methods: { buildSubHtml: function() { return "bar"; } }
			});

			var SubSubAttr = rio.Attr.create(SubAttr, "SubSub", {
				attrAccessors: ["c", ["hello", "subsub"]],
				attrHtmls: ["subSub"],
				methods: { buildSubSubHtml: function() { return "baz"; } }
			});
			
			this.attr = new SubSubAttr({ a: 1, b: 2, c: 3 });
			this.superAttr = new SuperAttr();
		},
		
		
		"should inherit the attributes of its parent": function() {
			this.attr.getB().shouldEqual(2);
			this.attr.getC().shouldEqual(3);
		},
		
		"should inherit the attributes of its grandparent": function() {
			this.attr.getA().shouldEqual(1);
			this.attr.getB().shouldEqual(2);
			this.attr.getC().shouldEqual(3);
		},
		
		"should inherit the attrHtmls of it's parent": function() {
			this.attr.superHtml().shouldEqual("foo");
			this.attr.subHtml().shouldEqual("bar");
		},

		"should inherit the attrHtmls of it's grandparent": function() {
			this.attr.superHtml().shouldEqual("foo");
			this.attr.subHtml().shouldEqual("bar");
			this.attr.subSubHtml().shouldEqual("baz");
		},
		
		"should use it's own default value for an attribute if defined": function() {
			this.attr.getHello().shouldEqual("subsub");
		},
		
		"should not override default value for instances of superclasses": function() {
			this.superAttr.getHello().shouldEqual("super");
		}
		
	}
});
