if (rio.EventDelegator) { rio.EventDelegator.disable(); }

rio.EventDelegator = {
	observers: [],

	enable: function() {
		this.observers.push({
			eventName: "dblclick",
			element: Element.body(),
			observer: function(e) {
				var body = Element.body();
				var rioComponent;
				var target = e.target;
				while (target && target != body) {
					rioComponent = target.rioComponent;
					if (rioComponent) {
						if (Object.isFunction(rioComponent.dblClick)) {
							rioComponent.dblClick(e);
						}
					}
					target = target.parentNode;
				}
			}
		});

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
