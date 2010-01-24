// Taken from Protolicious (http://github.com/kangax/protolicious/tree/master) and JSMVC

/**
* Event.simulate(@element, eventName[, options]) -> Element
*
* - @element: element to fire event on
* - eventName: name of event to fire (only MouseEvents and HTMLEvents interfaces are supported)
* - options: optional object to fine-tune event properties - pointerX, pointerY, ctrlKey, etc.
*
* $('foo').simulate('click'); // => fires "click" event on an element with id=foo
*
**/
(function(){
  
	var createKeypress = function(element, eventName, initialOptions) {
		var character = initialOptions.character;

		var options = Object.extend(initialOptions, {
			charCode: (character ? character.charCodeAt(0) : 0)
		});
		
		if(character && character.match(/\n/)) {
			options.keyCode = 13;
			character = 0;
		}
		if(character && character.match(/[\b]/)) {
			options.keyCode = 8;
			character = 0;
		}

		var event = null;
		try {
			event = document.createEvent("KeyEvents");
			event.initKeyEvent(eventName, true, true, window, 
			options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
			options.keyCode, options.charCode );
		} catch(e) {
			try {
				event = document.createEvent("Events");
			} catch(e2) {
				event = document.createEvent("UIEvents");
			} finally {
				event.initEvent(eventName, true, true);
				Object.extend(event, options);
			}
		}

		var success = false;
		if(element.dispatchEvent) {
			success = element.dispatchEvent(event);
		} else if(element.fireEvent) {
			success = element.fireEvent('on' + eventName, event);
		} else {
			throw "Your browser doesn't support dispatching events";
		}

		if(success && eventName == 'keypress' && !Prototype.Browser.Gecko && (element.nodeName.toLowerCase() == 'input' || element.nodeName.toLowerCase() == 'textarea')) {
			if(character) { 
				element.value += character;
			} else if(options.keyCode && options.keyCode == 8) {
				element.value = element.value.substring(0, element.value.length - 1);
			}
        }
	}

	var eventMatchers = {
		'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
		'MouseEvents': /^(?:click|mouse(?:down|up|over|move|out))$/,
		'KeyEvents': /^(?:key(?:press|up|down))$/
	};

	Event.simulate = function(element, eventName) {
		var options = {
			pointerX: 0,
			pointerY: 0,
			button: 0,
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			metaKey: false,
			bubbles: true,
			cancelable: true,
			keyCode: 0,
			charCode: 0
		};
		Object.extend(options, arguments[2] || { });
		var oEvent, eventType = null;

		element = $(element);

		for (var name in eventMatchers) {
			if (eventMatchers[name].test(eventName)) { eventType = name; break; }
		}

		if (!eventType) {
			throw new SyntaxError('Only HTMLEvents, MouseEvents, and KeyEvents interfaces are supported');
		}

		if (eventType == 'KeyEvents') {
			createKeypress(element, eventName, options);
		} else {
			if (document.createEvent) {
				oEvent = document.createEvent(eventType);
				if (eventType == 'HTMLEvents') {
					oEvent.initEvent(eventName, options.bubbles, options.cancelable);
				} else {
					oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
						options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
						options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
				}
				element.dispatchEvent(oEvent);
			} else {
				options.clientX = options.pointerX;
				options.clientY = options.pointerY;
				oEvent = Object.extend(document.createEventObject(), options);
				element.fireEvent('on' + eventName, oEvent);
			}
		}
		return element;
	}

	Element.addMethods({ simulate: Event.simulate });
})();


// Adding combination events

(function() {
	Element.enterText = function(element, text) {
		element.simulate("focus");
		element.value = text;
		element.simulate("blur");
		element.simulate("change");
	}
	
	Element.addMethods({ enterText: Element.enterText });
})();
