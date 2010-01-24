/*
	Copyright (c) 2008 Alexander MacCaw

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* This variable has to be left here because Juggernaut.swf expects it. */
var juggernaut;

/**
	@class
	
	<p>Juggernaut is a utility that allows the server to initiate connections with the browser.</p>
	<p>This is what facilitates the client-server bindings that allow for automatic-collborative models.</p>
	<p><i>Note: this version of Juggernaut has been altered to work better with the rio framework.</i></p>
*/
rio.Juggernaut = Class.create({
	initialize: function(options) {
		this.is_connected = false;
		this.attempting_to_reconnect = false;
		this.ever_been_connected = false;
		this.options = options;
		if(!this.options.client_id) { 
			this.options.client_id = this.options.session_id;
		}

		this.bindToWindow();
		
		var connectionAttr = new rio.Attr.create({
			attrAccessors: [["live", false]]
		});
		this.live = (new connectionAttr()).live;
	},

	logger: function(msg) {
		if (this.options.debug) {
			msg = "Juggernaut: " + msg + " on " + this.options.host + ':' + this.options.port;
			rio.log(msg);
		}
	},

	initialized: function(){
		this.fire_event('initialized');
		this.connect();
	},

	broadcast: function(body, type, client_ids, channels){
		var msg = { command: 'broadcast', body: body, type: (type||'to_channels') };
		if(channels) { msg.channels = channels; }
		if(client_ids) { msg.client_ids = client_ids; }
		msg.client_id = this.options.client_id;
		msg.session_id = this.options.session_id;
		this.sendData(this.toJSON(msg));
	},

	sendData: function(data){
		this.swf().sendData(escape(data));
	},

	connect: function(){
		if(!this.is_connected){
			this.fire_event('connect');
			this.swf().connect(this.options.host, this.options.port);
		}
	},

	disconnect: function(){
		if(this.is_connected) {
			this.swf().disconnect();
			this.is_connected = false;
			this.live.update(false);
		}
	},
	
	addChannel: function(channelName) {
		this.options.channels.push(channelName);
		this.resetConnection();	
	},
	
	// Added to facilitate subscription to new channels
	resetConnection: function() {
		if (!this._resetTask) { this._resetTask = new rio.DelayedTask(); }
		this._resetTask.delay(100, function() {
			if (!(this.swf() && this.swf().connect)) { 
				this.resetConnection.bind(this).delay(500); 
				return;
			}
			this.disconnect();
			this.connect();
		}.bind(this));
	},

	handshake: function() {
		var handshake = {};
		handshake.command = 'subscribe';
		if(this.options.session_id) { handshake.session_id = this.options.session_id; }
		if(this.options.client_id) { handshake.client_id = this.options.client_id; }
		if(this.options.channels) { handshake.channels = this.options.channels; }
		if(this.currentMsgId) {
			handshake.last_msg_id = this.currentMsgId;
			handshake.signature = this.currentSignature;
		}

		return handshake;
	},

	connected: function(e) {
		var json = this.toJSON(this.handshake());
		this.sendData(json);
		this.ever_been_connected = true;
		this.is_connected = true;
		this.live.update(true);
		setTimeout(function(){
			if(this.is_connected) { this.attempting_to_reconnect = false; }
		}.bind(this), 1 * 1000);
		this.logger('Connected');
		this.fire_event('connected');
	},

	// OVERRIDE FOR CHAT STYLE APPS - POSSIBLE MALICIOUS CONTENT CAN BE EVALED
	receiveData: function(e) {
		var msg = this.parseJSON(unescape(e.toString()));
		this.currentMsgId = msg.id;
		this.currentSignature = msg.signature;
		
		if (msg.body.startsWith("rio.console.touch")) {
			// don't log autospec stuff
		} else {
			this.logger("Received data:\n" + msg.body + "\n");
		}
		eval(msg.body); 
	},

	/*** START PROTOTYPE SPECIFIC - OVERRIDE FOR OTHER FRAMEWORKS ***/
	fire_event: function(fx_name) {
		$(document).fire("juggernaut:" + fx_name);
	},

	bindToWindow: function() {
		window.juggernaut = this;
		this.appendFlashObject();
	},

	toJSON: function(hash) {
		return Object.toJSON(hash);
	},

	parseJSON: function(string) {
		return string.evalJSON();
	},

	swf: function(){
		return $(this.options.swf_name);    
	},

	appendElement: function() {
		this.element = new Element('div', { id: 'juggernaut' });
		$(document.body).insert({ bottom: this.element });
	},

	/*** END PROTOTYPE SPECIFIC ***/

	appendFlashObject: function(){
		if(this.swf()) {
			throw("Juggernaut error. 'swf_name' must be unique per juggernaut instance.");
		}
		this.appendElement();
		rio.swfobject.embedSWF(
			this.options.swf_address, 
			'juggernaut', 
			this.options.width, 
			this.options.height, 
			String(this.options.flash_version),
			this.options.ei_swf_address,
			{'bridgeName': this.options.bridge_name},
			{},
			{'id': this.options.swf_name, 'name': this.options.swf_name}
		);
	},

	refreshFlashObject: function(){
		this.swf().remove();
		this.appendFlashObject();
	},

	errorConnecting: function(e) {
		this.is_connected = false;
		this.live.update(false);
		if(!this.attempting_to_reconnect) {
			this.logger('There has been an error connecting');
			this.fire_event('errorConnecting');
			this.reconnect();
		}
	},

	disconnected: function(e) {
		this.is_connected = false;
		this.live.update(false);
		if(!this.attempting_to_reconnect) {
			this.logger('Connection has been lost');
			this.fire_event('disconnected');
			this.reconnect();
		}
	},

	reconnect: function(){
		if(this.options.reconnect_attempts){
			this.attempting_to_reconnect = true;
			this.live.update(false);
			this.fire_event('reconnect');
			this.logger('Will attempt to reconnect ' + this.options.reconnect_attempts + ' times,' +
			'the first in ' + (this.options.reconnect_intervals || 3) + ' seconds');
			var attemptReconnect = function(){
				if(!this.is_connected){
					this.logger('Attempting reconnect');
					if(!this.ever_been_connected){
						this.refreshFlashObject();
					} else {
						this.connect();
					}
				}
			}.bind(this);
			for(var i=0; i < this.options.reconnect_attempts; i++){
				setTimeout(attemptReconnect, (this.options.reconnect_intervals || 3) * 1000 * (i + 1));
			}
		}
	}
});

rio.Juggernaut.boot = function() {
	var push = new rio.Juggernaut({
		ei_swf_address: "/javascripts/lib/expressinstall.swf", 
		reconnect_intervals: 3, 
		flash_version: 8, 
		channels: [],
		session_id: rio.environment.sessionId,
		client_id: rio.environment.userId || Math.round(Math.random() * -1000000000),
		host: rio.environment.pushUrl, 
		width: "0px", 
		height: "0px", 
		flash_color: "#fff", 
		swf_name: "juggernaut_flash", 
		port: rio.environment.pushPort, 
		bridge_name: "juggernaut", 
		debug: rio.environment.pushDebug, 
		swf_address: "/javascripts/lib/juggernaut.swf", 
		reconnect_attempts: 3
	});

	setInterval(function() {
		if (rio.push) {
			if (!rio.push.is_connected) { 
				rio.push.connect();
			} else {
				new Ajax.Request("/push/test_connection", {
					method: "get",
					asynchronous: true,
					evalJS: false,
					evalJSON: false,
					onSuccess: function(response) {
						if (response.responseText != "CONNECTED") {
							rio.warn("Juggernaut connection silently failed");
							rio.push.resetConnection();
						}
					}
				});
			}
		}
	}, 60000);

	return push;
};






