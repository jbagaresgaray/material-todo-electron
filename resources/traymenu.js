'use strict';
const electron = require('electron');
const os = require('os');

const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const MenuItem = electron.MenuItem;
const BrowserWindow = electron.BrowserWindow;
const shell = electron.shell;
const appName = app.getName();

const configStore = require('./config');
var _window = null;

function restoreWindow() {
    // const win = BrowserWindow.getAllWindows()[0];
    const win = BrowserWindow.fromId(1);
    win.show();
    return win;
}

const contextMenuTpl = [{
        label: 'YouProductive',
        click: function() {
            restoreWindow();
        }
    }, { type: 'separator' }, {
        label: 'Tasks',
        submenu: [{
            label: 'Inbox',
            click: function() {
                // const _window = BrowserWindow.getAllWindows()[0];
                const _window = BrowserWindow.fromId(1);
                _window.webContents.send('tasks');
                if (!_window.isFocused()) {
                    _window.show();
                }
            }
        }, {
            label: 'Starred',
            click: function() {
                const _window = BrowserWindow.fromId(1);
                _window.webContents.send('tasks-starred');
                if (!_window.isFocused()) {
                    _window.show();
                }
            }
        }, {
            label: 'Priorities',
            click: function() {
                const _window = BrowserWindow.fromId(1);
                _window.webContents.send('tasks-priorities');
                if (!_window.isFocused()) {
                    _window.show();
                }
            }
        }, {
            label: 'Due Date',
            click: function() {
                const _window = BrowserWindow.fromId(1);
                _window.webContents.send('tasks-due-date');
                if (!_window.isFocused()) {
                    _window.show();
                }
            }
        }, {
            label: 'Recently Added',
            click: function() {
                const _window = BrowserWindow.fromId(1);
                _window.webContents.send('tasks-recently-added');
                if (!_window.isFocused()) {
                    _window.show();
                }
            }
        }, {
            label: 'Completed',
            click: function() {
                const _window = BrowserWindow.fromId(1);
                _window.webContents.send('tasks-completed');
                if (!_window.isFocused()) {
                    _window.show();
                }
            }
        }]
    },
    { type: 'separator' }, {
        label: 'Projects',
        click: function() {
            // const _window = BrowserWindow.getAllWindows()[0];
            const _window = BrowserWindow.fromId(1);
            _window.webContents.send('projects');
            if (!_window.isFocused()) {
                _window.show();
            }
        }
    }, { type: 'separator' }, {
        label: 'Messages',
        click: function() {
            // const _window = BrowserWindow.getAllWindows()[0];
            const _window = BrowserWindow.fromId(1);
            _window.webContents.send('messages');
            if (!_window.isFocused()) {
                _window.show();
            }
        }
    }, {
        label: 'Notifications',
        click: function() {
            // const _window = BrowserWindow.getAllWindows()[0];
            const _window = BrowserWindow.fromId(1);
            _window.webContents.send('notifications');
            if (!_window.isFocused()) {
                _window.show();
            }
        }
    },
    { type: 'separator' },
    { label: 'Away', type: 'radio' },
    { label: 'Do not disturb', type: 'radio' },
    { label: 'Invisible', type: 'radio' },
    { type: 'separator' }, {
        label: 'Logout',
        click: function() {
            // const _window = BrowserWindow.getAllWindows()[0];
            const _window = BrowserWindow.fromId(1);
            _window.webContents.send('logout');
            if (!_window.isFocused()) {
                _window.show();
            }
        }
    },
    { type: 'separator' }, {
        label: `Quit ${appName}`,
        click: function() {
            app.quit();
        }
    }
];



module.exports = {
    trayMenu: Menu.buildFromTemplate(contextMenuTpl),
    defaultTrayMenu: Menu.buildFromTemplate(contextMenuTpl)
};
