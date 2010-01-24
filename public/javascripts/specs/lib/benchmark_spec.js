describe(rio.Benchmark, {
	beforeEach: function() {
		rio.Benchmark.stop();
		rio.Benchmark.clear();
	},
	
	afterEach: function() {
		rio.Benchmark.stop();
	},

	"install wraps a method with a function that": {
		beforeEach: function() {
			this.obj = { hello: function() { return "world"; } };
			rio.Benchmark.install(this.obj, "hello", "weeee");
		},
		
		"should be installed": function() {
			rio.Benchmark.installationFor(this.obj, "hello").getInstalled().shouldBeTrue();
		},
		
		"should not be installed twice": function() {
			rio.Benchmark.install(this.obj, "hello", "weeee");
			rio.Benchmark.getInstallations().size().shouldEqual(1);
		},
		
		"should be removable": function() {
			rio.Benchmark.installationFor(this.obj, "hello").isRemovable().shouldBeTrue();
		},

		"should keep track of the object string": function() {
			rio.Benchmark.installationFor(this.obj, "hello").getObjectString().shouldEqual("weeee");
		},

		"should not keep track of the number of invocations before benchmarking is started": function() {
			this.obj.hello();
			rio.Benchmark.metrics(this.obj, "hello").invocations.shouldEqual(0);
		},

		"should keep track of the number of invocations after benchmarking is started": function() {
			rio.Benchmark.start();
			this.obj.hello();
			this.obj.hello();
			rio.Benchmark.metrics(this.obj, "hello").invocations.shouldEqual(2);
		},

		"should not keep track of the number of invocations after benchmarking is started if it is not enabled": function() {
			rio.Benchmark.start();
			rio.Benchmark.installationFor(this.obj, "hello").setEnabled(false);
			this.obj.hello();
			this.obj.hello();
			rio.Benchmark.metrics(this.obj, "hello").invocations.shouldEqual(0);
		},

		"should stop keeping track of the number of invocations after benchmarking is stopped": function() {
			rio.Benchmark.start();
			this.obj.hello();
			rio.Benchmark.stop();
			this.obj.hello();
			rio.Benchmark.metrics(this.obj, "hello").invocations.shouldEqual(1);
		},
		
		"should still return the proper value": function() {
			this.obj.hello().shouldEqual("world");
		},

		"should reset the number of invocations after benchmarking is restarted": function() {
			rio.Benchmark.start();
			this.obj.hello();
			rio.Benchmark.stop();
			rio.Benchmark.start();
			rio.Benchmark.metrics(this.obj, "hello").invocations.shouldEqual(0);
		},
		
		"should not keep track of the total invocation time before benchmarking is started": function() {
			var oldDate = Date;
			var times = [1,6];
			Date = function() {	return { getTime: function() { return times.shift(); } }; };
			try {
				this.obj.hello();
				rio.Benchmark.metrics(this.obj, "hello").time.shouldEqual(0);
			} finally {
				Date = oldDate;
			}
		},

		"should keep track of the total invocation time": function() {
			var oldDate = Date;
			var times = [1,6,2,7];
			Date = function() {	return { getTime: function() { return times.shift(); } }; };
			try {
				rio.Benchmark.start();
				this.obj.hello();
				this.obj.hello();
				rio.Benchmark.stop();
				rio.Benchmark.metrics(this.obj, "hello").time.shouldEqual(10);
			} finally {
				Date = oldDate;
			}
		},
		
		"should stop keeping track of the number of the total invocation time after benchmarking is stopped": function() {
			var oldDate = Date;
			var times = [1,6,2,7];
			Date = function() {	return { getTime: function() { return times.shift(); } }; };
			try {
				rio.Benchmark.start();
				this.obj.hello();
				rio.Benchmark.stop();
				this.obj.hello();
				rio.Benchmark.metrics(this.obj, "hello").time.shouldEqual(5);
			} finally {
				Date = oldDate;
			}
		},
		
		"should reset the total invocation time after benchmarking is restarted": function() {
			var oldDate = Date;
			var times = [1,6];
			Date = function() {	return { getTime: function() { return times.shift(); } }; };
			try {
				rio.Benchmark.start();
				this.obj.hello();
				rio.Benchmark.stop();
				rio.Benchmark.start();
				rio.Benchmark.metrics(this.obj, "hello").time.shouldEqual(0);
			} finally {
				Date = oldDate;
			}
		},
		
		"should be removed on Benchmark.clear": function() {
			rio.Benchmark.clear();
			rio.Benchmark.getInstallations().shouldBeEmpty();
		},
		
		"should can be uninstalled": function() {
			var installation = rio.Benchmark.installationFor(this.obj, "hello");
			installation.uninstall();
			installation.getInstalled().shouldBeFalse();
			rio.Benchmark.getInstallations().shouldNotInclude(installation);
		}
		
	},

	"should determine the object string from the object if its not provided": function() {
		var obj = {hello: function() {}, toString: function() {return "goat";}};
		
		rio.Benchmark.install(obj, "hello");
		
		rio.Benchmark.installationFor(obj, "hello").getObjectString().shouldEqual("goat");
	},
	
	"should support prototype benchmarking for classes": function() {
		var cls = Class.create({
			hello: function() {}
		});
		
		rio.Benchmark.install(cls.prototype, "hello");
		
		var clsInstance = new cls();
		
		rio.Benchmark.start();
		
		clsInstance.hello();
		
		rio.Benchmark.metrics(cls.prototype, "hello").invocations.shouldEqual(1);
	},
	
	"should not double count time as a result of recursion": function() {
		var obj = {
			hello: function(val) {
				if (val < 1) {
					return;
				} else {
					return obj.hello(val - 1);
				}
			}
		};
		
		rio.Benchmark.install(obj, "hello");
		
		var oldDate = Date;
		var times = [1,11];
		Date = function() {	return { getTime: function() { return times.shift(); } }; };
		try {
			rio.Benchmark.start();
			obj.hello(2);
			rio.Benchmark.stop();
			rio.Benchmark.metrics(obj, "hello").invocations.shouldEqual(3);
			rio.Benchmark.metrics(obj, "hello").time.shouldEqual(10);
		} finally {
			Date = oldDate;
		}
	},
	
	"begin creates a finer grained benchmark that": {
		"should add an installation with an object string of [WAYPOINT]": function() {
			rio.Benchmark.begin("hello");
			
			rio.Benchmark.installationFor("hello").getObjectString().shouldEqual("[WAYPOINT]");
		},
		
		"should add an installation with a method name equal to the waypoint name": function() {
			rio.Benchmark.begin("hello");
			
			rio.Benchmark.installationFor("hello").getMethodName().shouldEqual("hello");
		},

		"should not keep track of how many times begin is called for a particular waypoint before benchmarking is started": function() {
			rio.Benchmark.begin("hello");
			rio.Benchmark.metrics("hello").invocations.shouldEqual(0);
		},

		"should keep track of how many times begin is called for a particular waypoint": function() {
			rio.Benchmark.start();
			rio.Benchmark.begin("world");
			rio.Benchmark.begin("hello");
			rio.Benchmark.begin("hello");
			rio.Benchmark.begin("world");
			rio.Benchmark.begin("world");
			
			rio.Benchmark.metrics("hello").invocations.shouldEqual(2);
			rio.Benchmark.metrics("world").invocations.shouldEqual(3);
		},
		
		"should not add time to a waypoint when it is ended before benchmarking is started": function() {
			var oldDate = Date;
			var times = [1,11];
			Date = function() {	return { getTime: function() { return times.shift(); } }; };
			try {
				rio.Benchmark.begin("hello");
				rio.Benchmark.end("hello");
				rio.Benchmark.metrics("hello").time.shouldEqual(0);
			} finally {
				Date = oldDate;
			}
		},

		"should add time to a waypoint when it is ended": function() {
			var oldDate = Date;
			var times = [1,11];
			Date = function() {	return { getTime: function() { return times.shift(); } }; };
			try {
				rio.Benchmark.start();
				rio.Benchmark.begin("hello");
				rio.Benchmark.end("hello");
				rio.Benchmark.metrics("hello").invocations.shouldEqual(1);
				rio.Benchmark.metrics("hello").time.shouldEqual(10);
			} finally {
				Date = oldDate;
			}
		},
		
		"should not double count waypoint time as a result of nesting": function() {
			var oldDate = Date;
			var times = [1,11,19,28];
			Date = function() {	return { getTime: function() { return times.shift(); } }; };
			try {
				rio.Benchmark.start();
				rio.Benchmark.begin("hello");
				rio.Benchmark.begin("hello");
				rio.Benchmark.end("hello");
				rio.Benchmark.end("hello");
				rio.Benchmark.metrics("hello").time.shouldEqual(10);
			} finally {
				Date = oldDate;
			}
		},

		"should not record any time for a waypoint that hasn't closed its outer most end": function() {
			var oldDate = Date;
			var times = [1,11,19,28];
			Date = function() {	return { getTime: function() { return times.shift(); } }; };
			try {
				rio.Benchmark.start();
				rio.Benchmark.begin("hello");
				rio.Benchmark.begin("hello");
				rio.Benchmark.end("hello");
				rio.Benchmark.metrics("hello").time.shouldEqual(0);
			} finally {
				Date = oldDate;
			}
		},
		
		"should not record any time or invocations for a waypoint that is not enabled": function() {
			var oldDate = Date;
			var times = [1,11];
			Date = function() {	return { getTime: function() { return times.shift(); } }; };
			try {
				rio.Benchmark.begin("hello");
				rio.Benchmark.installationFor("hello").setEnabled(false);

				rio.Benchmark.start();
				rio.Benchmark.begin("hello");
				rio.Benchmark.end("hello");
				rio.Benchmark.metrics("hello").invocations.shouldEqual(0);
				rio.Benchmark.metrics("hello").time.shouldEqual(0);
			} finally {
				Date = oldDate;
			}
		},
		
		"should not be removable": function() {
			rio.Benchmark.begin("hello");
			rio.Benchmark.installationFor("hello").isRemovable().shouldBeFalse();
		}
	},
	
	"count creates a very small benchmark that": {
		"should add an installation with an object string of [COUNT]": function() {
			rio.Benchmark.count("hello");
			
			rio.Benchmark.installationFor("hello").getObjectString().shouldEqual("[COUNT]");
		},
		
		"should add an installation with a method name equal to the count name": function() {
			rio.Benchmark.count("hello");
			
			rio.Benchmark.installationFor("hello").getMethodName().shouldEqual("hello");
		},
		
		"should not keep track of how many times count is called for a particular waypoint before benchmarking is started": function() {
			rio.Benchmark.count("hello");
			rio.Benchmark.metrics("hello").invocations.shouldEqual(0);
		},
		
		"should keep track of how many times count is called for a particular waypoint": function() {
			rio.Benchmark.start();
			rio.Benchmark.count("world");
			rio.Benchmark.count("hello");
			rio.Benchmark.count("hello");
			rio.Benchmark.count("world");
			rio.Benchmark.count("world");
			
			rio.Benchmark.metrics("hello").invocations.shouldEqual(2);
			rio.Benchmark.metrics("world").invocations.shouldEqual(3);
		},
		
		"should not add time": function() {
			var oldDate = Date;
			var times = [1,11];
			Date = function() {	return { getTime: function() { return times.shift(); } }; };
			try {
				rio.Benchmark.count("hello");
				rio.Benchmark.count("hello");
				rio.Benchmark.metrics("hello").time.shouldEqual(0);
			} finally {
				Date = oldDate;
			}
		},

		"should not be removable": function() {
			rio.Benchmark.count("hello");
			rio.Benchmark.installationFor("hello").isRemovable().shouldBeFalse();
		}
	}

});



