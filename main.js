const { app, BrowserWindow } = require('electron');

// https://github.com/atom/electron/issues/647
// http://electron.atom.io/docs/api/app/#appsetpathname-path
// This basically makes the application portable.
app.setPath('userData', `${__dirname}/.editor/`);

function createWindow() {
    const win = new BrowserWindow({
        center: true,

        width: 960,
        minWidth: 900,
        height: 600,
        minHeight: 540,

        useContentSize: true,
        autoHideMenuBar: true,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,

            webgl: true,
            devTools: true,
        },
    });

    win.removeMenu();
    win.loadFile('static/index.html');
    win.webContents.openDevTools();
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
