Object.extend(rio.environment, {
	push: false,
	pushPort: 5001,
	pushUrl: "127.0.0.1",
	pushOptions: {},

	logEventErrors: false,
	failOnBootError: false,
	autoConcatCss: false,
	giveWarnings: true,
	boot: {
		// bootCompressed: true
	}
});
	
rio.environments = {
	development: {
		console: true,
		autospec: true,
		autocss: true,
		pushDebug: true,
		logEventErrors: true,
		failOnBootError: true
	},
	
	production: {
		giveWarnings: false,
		pushDebug: false
	}
};