'use strict';

const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const app = electron.app;

module.exports = function() {


    ipcMain.on('set-tray-session', function(event, arg) {
        const _window = BrowserWindow.fromId(2);
        _window.webContents.send('save-trey-sesson', arg);
    });


    // ================ TRAY EVENTS ================ //

    ipcMain.on('tray-refresh-task', function(event, arg) {
        const _window = BrowserWindow.fromId(1);
        _window.webContents.send('tray-refresh-task');
    });

    ipcMain.on('tray-open-app', function(event, arg) {
        const _window = BrowserWindow.fromId(1);
        _window.webContents.send('tray-open-app', arg);
        if (!_window.isFocused()) {
            _window.show();
        }
    });

    ipcMain.on('tray-quit-app', function(event, arg) {
        app.quit();
    });
};
