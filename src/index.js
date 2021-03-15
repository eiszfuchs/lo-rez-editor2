import App from './components/App.svelte';

console.log(
    `
%cYou are using a work-in-progress version of the lo-rez-editor!
Feel free to close this window, but it might show interesting messages while you test.
`,
    'font-weight: bold; font-size: larger;'
);

const app = new App({
    target: document.body,
});

export default app;
