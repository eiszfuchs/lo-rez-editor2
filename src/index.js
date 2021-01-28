import App from './App.svelte';

const { readFileSync } = require('fs');
const foo = readFileSync('package.json');

const app = new App({
	target: document.body,
	props: {
		foo,
	}
});

export default app;
