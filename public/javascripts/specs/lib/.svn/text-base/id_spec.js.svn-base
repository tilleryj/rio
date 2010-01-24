describe(rio.Id, {
	"that is reified": {
		"should immediately call anything passed in to doAfterReification": function() {
			var rioId = new rio.Id(25);
			rioId.doAfterReification(function(){}.shouldBeCalled());
		}
	},
	
	"that is not reified": {
		beforeEach: function() {
			this.rioId = new rio.Id();
		},
		"should not call anything passed into doAfterReification right away": function() {
			this.rioId.doAfterReification(function(){}.shouldNotBeCalled());
		},
		"should call whatever is passed into doAfterReification after reification": function() {
			this.rioId.doAfterReification(function(){}.shouldBeCalled());
			this.rioId.reify(1234);
		}
	}
});