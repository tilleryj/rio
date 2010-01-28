Object.extend(rio.environment, {
	push: true,
	pushServer: "Juggernaut",
	pushPort: 5001,
	pushUrl: "127.0.0.1",
	pushOptions: {},
	pushDebug: false,

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
		logEventErrors: true,
		failOnBootError: true
	},
	
	production: {
		giveWarnings: false
	}
};