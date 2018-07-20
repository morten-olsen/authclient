const { ipcRenderer } = require('electron');
let registered = false
if (!registered) {
  window.sendToHost = function (channel) {
    ipcRenderer.send(channel)
  }

  window.registerOnHost = function (channel, callback) {
    ipcRenderer.on(channel, callback);
  }
  registered = true;
}