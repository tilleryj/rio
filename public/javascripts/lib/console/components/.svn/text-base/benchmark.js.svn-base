rio.Application.require("components/box");

rio.components.Benchmark = rio.Component.create(rio.components.Box, "Benchmark", {
	require: ["components/button", "components/grid_view", "components/input", "components/label", "components/container", "components/checkbox"],
	attrReaders: [],
	attrAccessors: [],
	attrEvents: [],
	methods: {

		buildHtml: function() {
			this.loadBenchmarks();

			var grid = new rio.components.GridView({
				headerBackgroundColor: "#666",
				headerFontWeight: 700,
				headerColor: "#fff",
				headerPadding: "3px 6px",
				items: opener.rio.Benchmark.installations,
				overflow: "hidden",
				padding: 0,
				columns: [
					{
						padding: 3,
						width: 24,
						align: "center",
						renderer: function(item) {
							return new rio.components.Checkbox({ checked: item.enabled });
						}
					},
					{
						header: "Object",
						padding: 3,
						renderer: function(item) {
							var html = new rio.components.Label({ content: item.objectString });
							item.enabled.bind(function(val) {
								html[val ? "removeClassName" : "addClassName"]("benchmarkDisabled");
							});
							return html;
						}
					},
					{
						header: "Method",
						padding: 3,
						renderer: function(item) {
							var html = new rio.components.Label({ content: item.methodName });
							item.enabled.bind(function(val) {
								html[val ? "removeClassName" : "addClassName"]("benchmarkDisabled");
							});
							return html;
						}
					},
					{
						header: "Invocations",
						padding: 3,
						renderer: function(item) {
							var label = new rio.components.Label({ content: item.invocations });
							var image = rio.Tag.img("", { src: "loading.gif", style: "margin-top: -2px; margin-bottom: -2px" });
							opener.rio.Benchmark.started.bind(function(started) {
								label[started ? "hide" : "show"]();
								image[started ? "show" : "hide"]();
							});
							var enabled = rio.Tag.span([label, image]);
							var disabled = rio.Tag.span("-", { className: "benchmarkDisabled" });
							var html = rio.Tag.span([enabled, disabled]);
							item.enabled.bind(function(val) {
								enabled[val ? "show" : "hide"]();
								disabled[val ? "hide" : "show"]();
							});
							return html;
						}
					},
					{
						header: "Time",
						padding: 3,
						renderer: function(item) {
							var label = new rio.components.Label({ content: item.time });
							var image = rio.Tag.img("", { src: "loading.gif", style: "margin-top: -2px; margin-bottom: -2px" });
							opener.rio.Benchmark.started.bind(function(started) {
								label[started ? "hide" : "show"]();
								image[started ? "show" : "hide"]();
							});
							var enabled = rio.Tag.span([label, image]);
							var disabled = rio.Tag.span("-", { className: "benchmarkDisabled" });
							var html = rio.Tag.span([enabled, disabled]);
							item.enabled.bind(function(val) {
								enabled[val ? "show" : "hide"]();
								disabled[val ? "hide" : "show"]();
							});
							return html;
						}
					},
					{
						width: 24,
						align: "center",
						renderer: function(item) {
							var trash = new rio.components.Button({ 
								imageSrc: "/images/trash.gif",
								// onClick: item.uninstall.bind(item)
								onClick: function() {
									item.uninstall();
									this.saveBenchmarks();
								}.bind(this),
								className: "benchmarkTrashCan"
							});
							return item.isRemovable() ? trash : rio.Tag.span("");
						}.bind(this)
					}
				]
			});
			
			var startButton = new rio.components.Button({ text: "Start benchmarking", onClick: opener.rio.Benchmark.start.bind(opener.rio.Benchmark) });
			var stopButton = new rio.components.Button({ text: "Stop benchmarking", onClick: opener.rio.Benchmark.stop.bind(opener.rio.Benchmark) });
			
			opener.rio.Benchmark.started.bind(function(started) {
				startButton.setEnabled(!started);
				stopButton.setEnabled(started);
			});

			var buttonBar = rio.Tag.div([startButton, stopButton], { className: "benchmarkButtons" });
			var addInput = new rio.components.Input({ 
				placeHolderText: "Type benchmark target here and press enter (e.g. window.alert)", 
				width: "100%", 
				padding: "5px 8px", 
				fontSize: 16,
				blurOnEnter: false,
				onEnter: function() {
					var val = addInput.html().value;
					if (this.installBenchmark(val)) {
						addInput.html().value = "";
						addInput.setValue("");
						addInput.setBackgroundColor("#fff");
						this.saveBenchmarks();
					} else {
						addInput.setBackgroundColor("#faf0f0");
					}
				}.bind(this)
			});
			var installationBar = rio.Tag.div(addInput, { style: "overflow: hidden" });

			var center = new rio.components.Container({ region: "center", items: [installationBar, grid], overflow: "auto" });
			var south = new rio.components.Container({ region: "south", items: [buttonBar] });
			
			return new rio.components.Container({ layout: true, items: [center, south], height: "100%", width: "100%" }).html();
		},
		
		installBenchmark: function(val) {
			var match = val.match(/^(.*)\.(.*)$/);
			if (match) {
				var objectString = match[1];
				try {
					var object = opener.window.eval(objectString);
					if (object) {
						var methodName = match[2];
						if (object[methodName] && Object.isFunction(object[methodName])) {
							opener.rio.Benchmark.install(object, methodName, objectString);
							return true;
						}
					}
				} catch(e) {
				}
			}
			return false;
		},
		
		loadBenchmarks: function() {
			var savedBenchmarks = (rio.Cookie.get("_RIO_savedBenchmarks") || "").split("\n").reject(function(b) { return b.blank() });
			savedBenchmarks.each(function(b) {
				try {
					this.installBenchmark(b);
				} catch(e) {
					// if it fails, who cares.  Add a log here if you need to debug.
				}
			}.bind(this));
		},
		
		saveBenchmarks: function() {
			var benchmarks = [];
			opener.rio.Benchmark.getInstallations().each(function(i) {
				if (i.isRemovable()) {
					var benchmark = i.getObjectString() + "." + i.getMethodName();
					if (this.installBenchmark(benchmark)) {
						benchmarks.push(benchmark);
					}
				}
			}.bind(this));
			rio.Cookie.set("_RIO_savedBenchmarks", benchmarks.join("\n"));
		}
	}
});







