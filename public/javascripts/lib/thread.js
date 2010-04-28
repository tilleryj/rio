if (rio.Thread) { rio.Thread.disable(); }

rio.Thread = {
	jobs: [],
	groups: {},
	frequency: 100,
	lastPulse: new Date(),
	pulse: function() {
		if (this.jobs.length == 0) {
			this.lastPulse = new Date();
			return;
		}
		
		var start = new Date();
		if (start - this.lastPulse < 50) {
			// rio.log("Thread.skipping_beat - " + (start - this.lastPulse));
			return;
		}

		try {
			var count = this.frequency;

			var job = this.jobs.shift();
			while (job) {
				job();
				if (count--) { job = this.jobs.shift(); } else { job = false; }
			}
		} catch(e) {
			rio.warn("thread failed");
		} finally {
			this.lastPulse = new Date();
			var delay = this.lastPulse - start;

			if (this.jobs.length > 0) {
				if (delay > 100) {
					this.frequency /= 2;
					// rio.log("Thread.frequency changed to: " + this.frequency);
				} else if (delay < 30) {
					this.frequency = (this.frequency * 1.5).ceil();
					// rio.log("Thread.frequency changed to: " + this.frequency);
				}
				// rio.log("Thread.delay - " + delay);
			}
		}
	},
	
	fork: function(fcn, options) {
		var groupName = (options || {}).group;
		if (groupName) {
			var group = this.groups[groupName];
			if (!group) { 
				group = { 
					suspended: options.suspended,
					jobs: []
				};
				this.groups[groupName] = group;
			} else {
				if (options.suspended != undefined) {
					if (group.suspended && !options.suspended) {
						this.resume(groupName);
					} else if (!group.suspended && options.suspended) {
						group.suspended = true;
					}
				}
			}
			
			
			if (!group.suspended) {
				// rio.log("Thread.fork job for group: " + groupName);
				this.jobs.push(fcn);
			} else {
				group.jobs.push(fcn);
			}

		} else {
			this.jobs.push(fcn);
		}
	},
	
	resume: function(groupName, options) {
		try {
			(function() {
				var group = this.groups[groupName];
				for (var i=0, length=group.jobs.length; i<length; i++) {
					this.jobs.push(group.jobs[i]);
				}
				group.jobs.clear();
				group.suspended = false;
			}.bind(this)).delay((options || {}).delay || 0);
		} catch(e) { 
			rio.warn("Thread.resume failed to resume group: " + groupName);
			throw(e);
		}
	},
	
	suspend: function(groupName) {
		var group = this.groups[groupName];
		if (!group) {
			group = {
				jobs: []
			};
			this.groups[groupName] = group;
		}
		group.suspended = true;
	},
	
	enable: function() {
		if (this.pulseIntervalId) { return; }
		this.pulseIntervalId = setInterval(rio.Thread.pulse.bind(rio.Thread), 100);
	},
	
	disable: function() {
		if (this.pulseIntervalId) {
			clearInterval(this.pulseIntervalId);
		}
	}
};

rio.Thread.enable();

