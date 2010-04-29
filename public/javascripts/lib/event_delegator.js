if (rio.EventDelegator) { rio.EventDelegator.disable(); }

rio.EventDelegator = {
	observers: [],

	processEvent: function(eventName, e) {
		var body = Element.body();
		var rioComponent;
		var target = e.target;
		while (target && target != body) {
			rioComponent = target.rioComponent;
			if (rioComponent) {
				if (Object.isFunction(rioComponent[eventName])) {
					rioComponent[eventName](Event.extend(e));
				}
			}
			target = target.parentNode;
		}
	},

	enable: function() {
		this.observers = [
			{
				eventName: "click",
				element: Element.body(),
				observer: this.processEvent.bind(this, "click")
			},
			{
				eventName: "dblclick",
				element: Element.body(),
				observer: this.processEvent.bind(this, "dblClick")
			},
			{
				eventName: "keyup",
				element: document,
				observer: this.processEvent.bind(this, "keyUp")
			}
		];

		this.observers.each(function(o) {
			Event.observe(o.element, o.eventName, o.observer);
		});
	},
	
	disable: function() {
		this.observers.each(function(o) {
			try {
				Event.stopObserving(o.element, o.eventName, o.observer);
			} catch(e) {
				// Don't let one failure ruin the party
			}
		});
		
		this.observers.clear();
	}
	
	
};
