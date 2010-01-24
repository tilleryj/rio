/**
	@namespace
	
	AJAX IFRAME METHOD (AIM)
	<br />
	http://www.webtoolkit.info/
	<br /><br />
	A collection of methods used to simulate an AJAX upload of a file using iframes.
*/
rio.AIM = {

    frame : function(c) {
        var n = 'f' + Math.floor(Math.random() * 99999);
        var d = document.createElement('DIV');
        d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="rio.AIM.loaded(\''+n+'\')"></iframe>';
        document.body.appendChild(d);

        var i = document.getElementById(n);
        if (c && typeof(c.onComplete) == 'function') {
            i.onComplete = c.onComplete;
        }

        return n;
    },

    form : function(f, name) {
        f.setAttribute('target', name);
    },

    submit : function(f, c) {
        rio.AIM.form(f, rio.AIM.frame(c));
        if (c && typeof(c.onStart) == 'function') {
            return c.onStart();
        } else {
            return true;
        }
    },

    loaded : function(id) {
		var d;
        var i = document.getElementById(id);
        if (i.contentDocument) {
            d = i.contentDocument;
        } else if (i.contentWindow) {
            d = i.contentWindow.document;
        } else {
            d = window.frames[id].document;
        }
        if (d.location.href == "about:blank") {
            return;
        }

        if (typeof(i.onComplete) == 'function') {
            i.onComplete(d.body.innerHTML);
        }
    }
};

// Ajax.FileUploadRequest = Class.create({
// 	initialize: function(url, options) {
// 		this.options = {
// 			parameters: ''
// 		};
// 		Object.extend(this.options, options || { });
// 	}
// });



