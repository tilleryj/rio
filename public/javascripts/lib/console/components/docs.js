rio.Application.require("components/box");

rio.components.Docs = rio.Component.create(rio.components.Box, "Docs", {
	require: ["components/list_view"],
	attrHtmls: ["docFrame", "list"],
	methods: {
		buildHtml: function() {
			return rio.Tag.table(
				rio.Tag.tbody(
					rio.Tag.tr([
						rio.Tag.td(this.listHtml(), { className: "docListCell" }),
						rio.Tag.td("", { className: "docSepCell" }),
						rio.Tag.td(this.docFrameHtml(), { className: "docContentCell" })
					])
				),
				{
					style: "width: 100%; height: 100%;",
					cellSpacing: "0px",
					cellPadding: "0px"
				}
			);
		},
		
		buildDocFrameHtml: function() {
			return rio.Tag.iframe("", {
				src: "",
				style: "width: 100%; height: 100%; border-left: 1px solid #888;"
			});
		},
		
		buildListHtml: function() {
			var listview = new rio.components.ListView({
				items: [
					"rio",
					"rio.AIM",
					"rio.Application",
					"rio.Attr",
					"rio.Binding",
					"rio.Component",
					"rio.Cookie",
					"rio.DelayedTask",
					"rio.Juggernaut",
					"rio.Model",
					"rio.Page",
					"rio.Template",
					"rio.Utils"
				],
				itemRenderer: function(item) {
					var fileHtml = rio.Tag.img("", { src: "file-small.png", style: "margin-right: 6px; position: relative; top: 2px" });
					return rio.Tag.div([fileHtml, rio.Tag.span(item)], {style: "-moz-user-select: none;"});
				},
				autoSelectFirstItem: true
			});
			listview.bind("selectedItem", function(item) {
				if (item) {
					this.docFrameHtml().src = "docs/symbols/" + item + ".html";
				}
			}.bind(this));
			listview.html().setStyle({
				borderRight: "1px solid #888",
				height: "100%",
				backgroundColor: "#eee"
			});
			return listview.html();
		}
	}
});