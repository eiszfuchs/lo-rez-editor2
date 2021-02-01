const { app, BrowserWindow } = require('electron');

// https://github.com/atom/electron/issues/647
// http://electron.atom.io/docs/api/app/#appsetpathname-path
// This basically makes the application portable.
app.setPath('userData', `${__dirname}/.editor/`);

function createWindow() {
    const win = new BrowserWindow({
        center: true,

        width: 800,
        minWidth: 770,
        height: 520,
        minHeight: 520,

        useContentSize: true,
        autoHideMenuBar: true,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,

            webgl: true,
            devTools: true,
        },
    });

    win.loadFile('static/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
