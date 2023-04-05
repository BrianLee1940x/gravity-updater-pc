const {app, BrowserWindow, ipcMain} = require('electron');
const { autoUpdater } = require('electron-updater');

const path = require('path');
const ClientManager = require('./ClientManager');
const { SampQuery } = require('./utils');

class Application {
  constructor() {
    this.mainWindow = null;
    this.client = null;
    this.SampQuery = new SampQuery();
    this.createWindow = this.createWindow.bind(this);

    this.gamePath = `./release-builds/GravityLauncher-win32-ia32/bin/gravity/`;

    this.servers = [
      {
        ip: `127.0.0.1`,
        port: 7777,
      }
    ];

    this.init();
  }

  init() {
    app.whenReady().then(this.createWindow);

    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) this.createWindow();
    });

    ipcMain.on('app_version', (event) => {
      event.sender.send('app_version', { version: app.getVersion() });
    });    

    ipcMain.on('restart_app', () => {
      autoUpdater.quitAndInstall();
    });
  }

  async getServersOnline() {
    return await Promise.all(
      this.servers.map(async(res) => {
        const data = await this.SampQuery.getServerInfo(res.ip, res.port);

        return {
          ip: `${res.ip}:${res.port}`,
          ...data
        }
      })
    );
  }

  async createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      frame: false,
      resizable: false,
      icon: './assets/logo.ico',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    const answer = await this.getServersOnline();
    this.mainWindow.loadFile('./app/index.html');

    this.mainWindow.once('ready-to-show', () => {
      this.client = new ClientManager(this);

      autoUpdater.checkForUpdatesAndNotify();
      
      this.mainWindow.webContents.send(`Online:Init`, answer);
      this.mainWindow.show();

      ipcMain.on('Press:Close', this.client.onPressClose);
      ipcMain.on('Press:Resize', this.client.onPressResize);
      ipcMain.on('Press:Play', this.client.onPressPlay);

      ipcMain.on('Online:Check', async(event) => {
        const answer = await this.getServersOnline();

        event.reply('Online:Answer', answer);
      });
    });
  }
}
process.on('uncaughtException', function (err) {
  console.log(err);
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

const thisApplication = new Application();