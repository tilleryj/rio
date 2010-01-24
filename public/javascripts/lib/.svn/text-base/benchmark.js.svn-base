rio.Benchmark = new (rio.Attr.create({ 
	attrAccessors: [
		["installations", []],
		["started", false]
	],
	methods: {
		install: function(obj, methodName, objString) {
			if (!objString) { objString = obj.toString(); };

			if (!this.installationFor(obj, methodName)) {
				var installation = new rio.BenchmarkInstallation({ objectString: objString, object: obj, methodName: methodName });
				this.getInstallations().push(installation);
			
				installation.install();
			}
		},

		start: function() {
			this.setStarted(true);
			this.getInstallations().invoke("reset");
		},

		stop: function() {
			this.setStarted(false);
		},
		
		begin: function(waypointName) {
			var installation = this.installationFor(waypointName);
			if (!installation) {
				installation = new rio.BenchmarkWaypoint({ objectString: "[WAYPOINT]", methodName: waypointName });
				this.getInstallations().push(installation);
			}
			installation.begin();
		},
		
		end: function(waypointName) {
			var installation = this.installationFor(waypointName);
			if (installation) {
				installation.end();
			}
		},
		
		count: function(countName) {
			var installation = this.installationFor(countName);
			if (!installation) {
				installation = new rio.BenchmarkCount({ objectString: "[COUNT]", methodName: countName });
				this.getInstallations().push(installation);
			}
			installation.increment();
		},

		metrics: function(obj, methodName) {
			var installation = this.installationFor(obj, methodName);
			return { invocations: installation.getInvocations(), time: installation.getTime() };
		},
		
		installationFor: function(obj, methodName) {
			if (Object.isString(obj)) {
				return this.getInstallations().detect(function(i) {
					return (i.constructor == rio.BenchmarkWaypoint || i.constructor == rio.BenchmarkCount) && i.getMethodName() == obj;
				});
			} else {
				return this.getInstallations().detect(function(i) { return i.getObject() == obj && i.getMethodName() == methodName });
			}
		},
		
		clear: function() {
			this.getInstallations().clear();
		},
		
		toString: function() {
			return "Benchmark";
		}
	}
}))();

rio.BenchmarkInstallation = rio.Attr.create({
	attrAccessors: [
		"object", 
		"objectString", 
		"methodName",
		["installed", false],
		["enabled", true],
		["invocations", 0], 
		["time", 0]
	],
	
	methods: {
		incrementInvocations: function() {
			this.setInvocations(this.getInvocations() + 1);
		},
		
		addTime: function(time) {
			this.setTime(this.getTime() + time);
		},
		
		reset: function() {
			this.setInvocations(0);
			this.setTime(0);
		},

		doesApply: function() {
			return rio.Benchmark.getStarted() && this.getEnabled();
		},

		install: function() {
			if (this.getInstalled()) { return; }
			this._oldMethod = this.getObject()[this.getMethodName()];
			this.getObject()[this.getMethodName()] = this.getObject()[this.getMethodName()].wrap(function() {
				var args = $A(arguments);
				var proceed = args.shift();
				
				if (this.doesApply()) {
					if (!this._inLoop) {
						this._inLoop = true;
						var t = new Date().getTime();
					}
				}
				var result = proceed.apply(this, args);

				if (this.doesApply()) {
					if (t) {
						this._inLoop = false;
						this.addTime(new Date().getTime() - t);
					}
					this.incrementInvocations();
				}
				
				return result;
			}.bind(this));
			this.setInstalled(true);
		},
		
		uninstall: function() {
			this.getObject()[this.getMethodName()] = this._oldMethod;
			this.setInstalled(false);
			
			var index = rio.Benchmark.getInstallations().indexOf(this);
			rio.Benchmark.getInstallations().splice(index, 1);
		},
		
		isRemovable: function() {
			return true;
		}
	}
});

rio.BenchmarkWaypoint = rio.Attr.create({
	attrAccessors: [
		"objectString", 
		"methodName",
		["installed", true],
		["enabled", true],
		["invocations", 0], 
		["time", 0]
	],
	
	methods: {
		addTime: function(time) {
			this.setTime(this.getTime() + time);
		},

		reset: function() {
			this.setInvocations(0);
			this.setTime(0);
		},

		doesApply: function() {
			return rio.Benchmark.getStarted() && this.getEnabled();
		},
	
		_nesting: 0,
		begin: function() {
			if (this.doesApply()) {
				if (this._nesting == 0) {
					this._beginTime = new Date().getTime();
				}
				this._nesting++;
				this.setInvocations(this.getInvocations() + 1);
			}
		},
		
		end: function() {
			if (this.doesApply()) {
				this._nesting--;
				if (this._nesting == 0) {
					this.addTime(new Date().getTime() - this._beginTime);
				}
			}
		},

		isRemovable: function() {
			return false;
		}
	}
});


rio.BenchmarkCount = rio.Attr.create({
	attrAccessors: [
		"objectString", 
		"methodName",
		["installed", true],
		["enabled", true],
		["invocations", 0], 
		["time", 0]
	],
	
	methods: {
		increment: function() {
			if (this.doesApply()) {
				this.setInvocations(this.getInvocations() + 1);
			}
		},
		
		doesApply: function() {
			return rio.Benchmark.getStarted() && this.getEnabled();
		},
		
		reset: function() {
			this.setInvocations(0);
		},

		isRemovable: function() {
			return false;
		}
	}
});


