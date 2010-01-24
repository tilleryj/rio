/**
	@class

	DelayedTask will execute a function after a delay.  Every time delay is called, any pending execution
	will be canceled.
*/
rio.DelayedTask = Class.create(/** @scope rio.DelayedTask.prototype */{
	/** @constructor */
	initialize: function() {
	    this.id = null;
		this.start = null;
		this.delayLength = null;
		this.task = null;
		this.args = [];
		this.scope = this;
	},

	/** @private */
    timeout: function() {
        if (new Date().getTime() - this.start >= this.delayLength) {
            clearInterval(this.id);
            this.id = null;
            this.task.apply(this.scope, this.args || []);
        }
    },

    /**
		Executes the passed in task after a delay.  This will also cancel any pending tasks.

		@param {Number} delayLength The delay in milliseconds
		@param {Function} task Task to execute after the delay
		@param {Object} scope (optional) The scope in which to execute the task
		@param {Array} args (optional) Arguments to pass into the task function 
     */
    delay: function(delayLength, task, scope, args) {
        if (this.id && delayLength != this.delayLength) {
            this.cancel();
        }
        
        this.delayLength = delayLength;
        this.task = task;
        this.scope = scope;
        this.args = args;
        
        this.start = new Date().getTime();
        
        if (!this.id) {
            this.id = setInterval(this.timeout.bind(this), this.delayLength);
        }
    },

    /**
     * Cancels the queued task
     */
    cancel: function() {
        if (this.id) {
            clearInterval(this.id);
            this.id = null;
        }
    }
});