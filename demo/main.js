// Basic init
const electron = require('electron')
const { app, BrowserWindow, protocol, ipcMain } = electron
const path = require('path');
const url = require('url');

// Let electron reloads by itself when webpack watches changes in ./app/
if (process.env.ELECTRON_START_URL) {
  require('electron-reload')(__dirname)
}

// To avoid being garbage collected
let mainWindow;
let client;

const schema = '...';

ipcMain.on('startup', (event, arg) => {
// console.log(arg) // prints "ping"
// event.sender.send('asynchronous-reply', 'pong')
    client = event.sender;
});

app.on('ready', () => {
    protocol.registerFileProtocol(schema, (request, callback) => {
      const url = request.url;
      mainWindow.webContents.send(
          'callback',
          url,
      );
      // callback({path: path.normalize(`${__dirname}/${url}`)})
    }, (error) => {
      if (error) console.error('Failed to register protocol')
    });

    let mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          preload: path.join(__dirname,'./preload.js'),
      },
    });

    const startUrl = 'http://localhost:1234'

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});