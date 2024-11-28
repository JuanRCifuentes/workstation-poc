const { app, ipcMain, BrowserWindow } = require("electron");
const { setupIpcHandlers } = require("./electron-src/ipc/ipcHandlers");

let appWin;

createWindow = () => {
    appWin = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Angular and Electron",
        resizable: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });
    
    appWin.loadURL(`file://${__dirname}/dist/browser/index.html`);

    appWin.webContents.openDevTools();

    appWin.on("closed", () => {
        appWin = null;
    });
}

app.on("ready", () => {
    createWindow();
    setupIpcHandlers();
  });

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
