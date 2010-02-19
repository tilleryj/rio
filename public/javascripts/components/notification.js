rio.components.Notification = rio.Component.create(rio.components.Base, "Notification", {
	requireCss: "notification",
	attrReaders: [
		"body", 
		"iconSrc",
		["duration", 5]
	],
	methods: {
		initialize: function() {
			rio.components.Notification.show(this);
		},

		buildHtml: function() {
			var bodyHtml = rio.Tag.div("", { className: "notificationBody" });

			bodyHtml.update(this.getBody());

			var innerContents = bodyHtml;
			if (this.getIconSrc()) {
				bodyHtml.addClassName('notificationBodyWithIcon');
				innerContents = [
					new rio.components.Image({src: this.getIconSrc(), className: "notificationIcon" }),
					bodyHtml
				];
			}

			var innerHtml = rio.Tag.div(innerContents, { 
				className: "notificationInner" 
			});

			return rio.Tag.div(innerHtml, {
				className: "notification"
			});
		},
		
		hide: function() {
			this.html().fade();
		}
	},
	
	classMethods: {
		notifications: function() {
			if (!this._notifications) { this._notifications = []; }
			return this._notifications;
		},
		show: function(notification) {
			this.notifications().push(notification);

			var html = notification.html();

			Element.body().insert(html);
			
			var totalHeight = html.getHeight() + html.verticalMBP();
			var totalWidth = html.getWidth() + html.horizontalMBP();
			
			html.setStyle({
				top: -1 * totalHeight + "px",
				left: Element.body().getWidth() - totalWidth - 15 + "px"
			});
			
			this.slideDownBy(totalHeight + 15);

			notification.hide.bind(notification).delay(notification.getDuration());
		},
		
		slideDownBy: function(pixels) {
			this.notifications().each(function(notification) {
				var html = notification.html();
				new Effect.Move(html, {
					y: pixels,
					afterFinish: function() {
						this.notifications().splice(this.notifications().indexOf(notification));
					}.bind(this)
				});
			}.bind(this));
		}
	}
});