/**
	@class
	
	JsTemplates are used to parse rio templates (*.jst files).  JsTemplates are created by rio pages as a starting point
	for a pages html state.  You should rarely have to instantiate this class directly.
*/
rio.JsTemplate = Class.create({
	initialize: function(options) {
		this._name = options.name || "template";
		this._template = options.text.gsub("&nbsp;", "\u00a0");
		this._path = options.path;
	},
	
	mixinMethods: function() {
		var template = this;
		return { 
			buildHtml: function() {
				return template.render(this);
			}
		};
	},
	
	xml: function() {
		return '<div style="height: 100%;" class="' + this._name + '" xmlns:rio="http://riojs.com">' + this._template + "</div>";
	},
	
	parse: function() {
		return rio.JsTemplate.parse(this._path ? this._template : this.xml());
	},
	
	render: function(context) {
		var xml = this.parse();
		try {
			if (this._path) {
				var nodes = xml.childNodes.item(0).getElementsByTagName(this._path)[0].childNodes;
				var divNode;
				var i = 0;
				while (divNode == undefined) {
					var node = nodes.item(i);
					if (node.nodeType == 1) {
						divNode = node;
					}
					i++;
				}
				return this.renderElement(node, context);
			} else {
				return this.renderElement(xml.childNodes.item(0), context);
			}
		} catch(e) { 
			rio.error(e, "Rendering error.  Your xml might be malformed.\nRemember to escape these characters [<, \", &] with [&lt;, &quot;, &amp;])"); 
			throw(e);
		}
	},
	
	renderElement: function(xmlElement, context) {
		var nodes = xmlElement.childNodes;
		
		var htmlChildren = [];
		var i, item;
		for (i = 0; i < nodes.length; i++) {
			item = nodes.item(i);
			
			switch(item.nodeType) {
			case 1: // Element
				if (item.nodeName.startsWith("rio:")) {
					htmlChildren.push(this.renderComponent(item, context).html());
				} else {
					htmlChildren.push(this.renderElement(item, context));
				}
				break;
			case 3: // Text
				htmlChildren.push(item.nodeValue);
				break;
			}
		}
		
		var htmlAttributes = {};
		var attributes = xmlElement.attributes;
		var rioId;
		for (i = 0; i < attributes.length; i++) {
			item = attributes.item(i);
			if (item.nodeName == "rio:id") {
				rioId = item.nodeValue;
			} else {
				htmlAttributes[item.nodeName] = item.nodeValue;
			}
		}
		
		var htmlElement = rio.Tag.build(xmlElement.nodeName, htmlChildren, htmlAttributes);
		
		if (rioId) {
			context[("get-" + rioId + "Element").camelize()] = function() {
				return htmlElement;
			};
		}
		
		return htmlElement;
	},
	
	renderChildNodes: function(xmlElement, context) {
		var nodes = xmlElement.childNodes;
		
		var renderedChildren = [];
		for (var i = 0; i < nodes.length; i++) {
			var item = nodes.item(i);
			
			switch(item.nodeType) {
			case 1: // Element
				if (item.nodeName.startsWith("rio:")) {
					if (item.nodeName == "rio:Object") {
						renderedChildren.push(this.renderRioObject(item, context));
					} else {
						renderedChildren.push(this.renderComponent(item, context));
					}
				} else {
					renderedChildren.push(this.renderElement(item, context));
				}
				break;
			case 3: // Text
				if (item.nodeValue.strip() != "") {
					renderedChildren.push(item.nodeValue);
				}
				break;
			}
		}
		return renderedChildren.reduce();
	},
	
	renderRioObject: function(xmlElement, context) {
		var obj = {};
		var nodes = xmlElement.childNodes;
		for (var i = 0; i < nodes.length; i++) {
			var item = nodes.item(i);
			if (item.nodeType == 1) {
				obj[item.nodeName] = this.renderChildNodes(item, context);
			}
		}
		
		return obj;
	},
	
	renderComponent: function(xmlElement, context) {
		var componentType = xmlElement.nodeName.match(/rio:(.*)/)[1];

		
		var componentAttributes = {};
		var attributes = xmlElement.attributes;
		var rioId, i, item;

		for (i = 0; i < attributes.length; i++) {
			item = attributes.item(i);
			if (item.nodeName == "rio:id") {
				rioId = item.nodeValue;
			} else {
				var value = item.nodeValue;
				var executable = value.match(/\{(.*)\}/);
				if (executable) {
					rio.pageBinding = context;
					try {
						value = eval("(function() { return " + executable[1] + "; }).bind(rio.pageBinding)();");
					} catch(e) {
						rio.error(e, "Error evaluating " + this._name.classize() + " template attribute: " + executable[1]);
						throw(e);
					}
					delete rio.pageBinding;
				}
				componentAttributes[item.nodeName] = value;
			}
		}

		var nodes = xmlElement.childNodes;
		for (i = 0; i < nodes.length; i++) {
			item = nodes.item(i);
		
			if (item.nodeType == 1) {
				if (item.nodeName == "rio:id") {
					rioId = item.nodeValue;
				} else {
					componentAttributes[item.nodeName] = this.renderChildNodes(item, context);
				}
			}
		}
		try {
			var component = new rio.components[componentType](componentAttributes);
		} catch(e2) {
			if (rio.components[componentType] == undefined) {
				rio.error(e2, componentType + " not found.  Add 'components/" + componentType.underscore() + "' to the " + this._name.classize() + " require list.");
			}
			throw(e2);
		}
		
		if (rioId) {
			context[("get-" + rioId).camelize()] = function() {
				return component;
			};
		}
		
		return component;
	},
	
	name: function() {
		return this._name;
	}
});
Object.extend(rio.JsTemplate, {
	build: function(path) {
		path = rio.boot.appRoot + path;
		if (this._templatePreloaded(path)) {
			return new rio.JsTemplate({
				name: this._templateNameFromPath(path),
				text: this._allTemplatesFile,
				path: path.gsub("/", "--")
			});
		} else {
			rio.log("missed: " + path);
			return new rio.JsTemplate({ 
				name: this._templateNameFromPath(path),
				text: this._templateFile(path)
			});
		}
	},
	
	preload: function(path) {
		this._allTemplatesFile = this._templateFile(path);
		this._allTemplatesList = [];

		var doc = this.parse(this._allTemplatesFile);
		var templateNodes = doc.childNodes.item(0).childNodes;
		for (var i = 0; i < templateNodes.length; i++) {
			var item = templateNodes.item(i);
			if (item.nodeType == 1) {
				this._allTemplatesList.push(item.nodeName.gsub("--", "/"));
			}
		}
	},
	
	parse: function(xml) {
		var xmlDoc;
		if (Prototype.Browser.IE) {
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async="false";
			xmlDoc.loadXML(xml);
		} else {
			try {
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(xml,"text/xml");
			} catch(e) {
				rio.log(e);
			}
		}
		return xmlDoc;
	},
	
	_templatePreloaded: function(path) {
		return (this._allTemplatesList || []).include(path);
	},
	
	_templateNameFromPath: function(path) {
		return path.split("/").last().camelize();
	},

	_templateFile: function(path) {
		return rio.File.open(rio.boot.root + rio.boot.appRoot + path + ".jst", {
			asynchronous: false,
			onFailure: function() {
				rio.Application.fail("Failed loading template - " + path);
			}
		});
	},

	toString: function() { 
		return "JsTemplate"; 
	}
});

