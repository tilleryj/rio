rio.Clipboard = {
	/*
		Only call copy on the platform specific keydown event scenario.
		
			Mac: CMD + c
			Win: CTRL + c
	*/
	copy: function(val, afterCopy) {
		if (Prototype.Browser.WebKit) {
			this.copyToClipboardForWebKit(val);
			afterCopy.defer();
			return;
		}
		
		var clipboard = this.html();
		
		clipboard.value = val;
		clipboard.setSelectionRange(0, clipboard.value.length);
		clipboard.focus();
		
		var keyObserver = function(e) {
			clipboard.stopObserving("keyup");
			clipboard.stopObserving("keydown");
			clipboard.stopObserving("keypress");
			
			afterCopy.defer();
		}.bindAsEventListener(this);
		
		clipboard.observe("keyup", keyObserver);
		clipboard.observe("keydown", keyObserver);
		clipboard.observe("keypress", keyObserver);
	},
	
	copyToClipboardForWebKit: function(textToCopy) {
        var clipDoc = this.clipboardDoc();
    
    	// Get the clipboard container (input box) and set its contents
    	var container = clipDoc.getElementById("clipContainer");
    	container.value = textToCopy;
    
    	// Focus/Select the container containing the text to copy
    	container.focus();
    	container.select();
    
    	clipDoc.execCommand("copy", false, "");
    },

	clipboardDoc: function() {
		if (!this._clipFrame) {
	 		this._clipFrame = rio.Tag.iframe("", {
				style: "position: absolute; top: -1000px"
			});
	 		Element.body().insert(this._clipFrame);
         
	         // Insert an input box and switch it to design mode
	 		var clipDoc = this._clipFrame.contentDocument;
	 		clipDoc.body.innerHTML = "<textarea id='clipContainer'/>";
	 		clipDoc.designMode = "On";
	 		clipDoc.body.contentEditable = true;
 		}
		return this._clipFrame.contentDocument;
	},
	
	paste: function(callback) {
		var clipboard = this.html();

		clipboard.value = "";
		clipboard.focus();
		
		var keyObserver = function() {
			clipboard.stopObserving("keyup");
			clipboard.stopObserving("keydown");
			clipboard.stopObserving("keypress");
			
			(function() {
				callback(clipboard.value);
			}).defer();
		};
		
		clipboard.observe("keyup", keyObserver);
		clipboard.observe("keydown", keyObserver);
		clipboard.observe("keypress", keyObserver);
	},
	
	html: function() {
		if (!this._html) {
			this._html = rio.Tag.textarea("");

			Element.body().insert(rio.Tag.div(this._html, {
				style: "position: absolute; top: -10px; overflow: hidden; height:1px;"
			}));
		}
		
		return this._html;
	}
};