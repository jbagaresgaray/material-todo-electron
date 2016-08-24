'use strict';

const electron = require('electron');
const os = require('os');
const path = require('path');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;


// Module to create native browser window.
const NotificationCenter = require('node-notifier').NotificationCenter;
const WindowsToaster = require('node-notifier').WindowsToaster;
const WindowsBalloon = require('node-notifier').WindowsBalloon;
const NotifySend = require('node-notifier').NotifySend;
const Growl = require('node-notifier').Growl;

var eNotify = null;

module.exports = function(eNotify) {


    function defaultNotification(title, text) {
        eNotify.notify({
            title: title,
            text: text,
            sound: path.join(__dirname, '/assets/sounds/notification.mp3')
        });
    }

    function OSXNotification(title, text) {
        var notifier = new NotificationCenter();
        notifier.notify({
            title: title,
            message: text,
            icon: path.join(__dirname, 'assets', 'icons', '64x64.png'), // Absolute path (doesn't work on balloons)
            sound: true
        });
    }


    function WindowsNotification(title, text) {
        var notifier = new WindowsToaster();
        notifier.notify({
            title: title,
            message: text,
            icon: path.join(__dirname, 'assets', 'icons', '64x64.png'), // Absolute path (doesn't work on balloons)
            sound: true
        });
    }

    function WindowsBalloonNotification(title, text) {
        var notifier = new WindowsBalloon();
        notifier.notify({
            title: title,
            message: text,
            icon: path.join(__dirname, 'assets', 'icons', '64x64.png'), // Absolute path (doesn't work on balloons)
            sound: true
        });

    }

    function LinuxNotification(title, text) {
        var notifier = new NotifySend();
        notifier.notify({
            title: title,
            message: text,
            icon: path.join(__dirname, 'assets', 'icons', '64x64.png'), // Absolute path (doesn't work on balloons)
            sound: true
        });
    }


    ipcMain.on('notify-message', function(event, arg) {
        if (process.platform === 'darwin') {
            if (parseInt(os.release()) <= 10.8) {
                defaultNotification(app.getName(), arg);
            } else {
                OSXNotification(app.getName(), arg);
            }
        } else if (process.platform === 'win32') {
            if (os.release() !== 'NT 10.0' || os.release() !== 'NT 6.3' || os.release() !== 'NT 6.2') {
                WindowsBalloonNotification(app.getName(), arg);
            } else {
                WindowsNotification(app.getName(), arg);
            }
        } else {
            LinuxNotification(app.getName(), arg);
        }
    });

    ipcMain.on('error-message', function(event, arg) {
        if (process.platform === 'darwin') {
            if (parseInt(os.release()) <= 10.8) {
                defaultNotification(app.getName(), arg);
            } else {
                OSXNotification(app.getName(), arg);
            }
        } else if (process.platform === 'win32') {
            if (os.release() !== 'NT 10.0' || os.release() !== 'NT 6.3' || os.release() !== 'NT 6.2') {
                WindowsBalloonNotification(app.getName(), arg);
            } else {
                WindowsNotification(app.getName(), arg);
            }
        } else {
            LinuxNotification(app.getName(), arg);
        }
    });

    ipcMain.on('comment-message', function(event, arg) {
        if (process.platform === 'darwin') {
            if (parseInt(os.release()) <= 10.8) {
                defaultNotification(app.getName(), arg);
            } else {
                OSXNotification(app.getName(), arg);
            }
        } else if (process.platform === 'win32') {
            if (os.release() !== 'NT 10.0' || os.release() !== 'NT 6.3' || os.release() !== 'NT 6.2') {
                WindowsBalloonNotification(app.getName(), arg);
            } else {
                WindowsNotification(app.getName(), arg);
            }
        } else {
            LinuxNotification(app.getName(), arg);
        }

        i++;
        badges.setBadges(i);
    });


};
