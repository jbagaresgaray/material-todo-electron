'use strict';
const electron = require('electron');

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

const defaultDarwinTpl = [{
    label: appName,
    submenu: [{
        label: `About ${appName}`,
        role: 'about'
    }, {
        type: 'separator'
    }, {
        label: 'Services',
        role: 'services',
        submenu: []
    }, {
        type: 'separator'
    }, {
        label: `Hide ${appName}`,
        accelerator: 'Cmd+H',
        role: 'hide'
    }, {
        label: 'Hide Others',
        accelerator: 'Cmd+Shift+H',
        role: 'hideothers'
    }, {
        label: 'Show All',
        role: 'unhide'
    }, {
        type: 'separator'
    }, {
        label: `Quit ${appName}`,
        accelerator: 'Cmd+Q',
        click: function() {
            app.quit();
        }
    }]
}, {
    label: 'Window',
    role: 'window',
    submenu: [{
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
    }, {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
    }, {
        type: 'separator'
    }, {
        label: 'Bring All to Front',
        role: 'front'
    }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Cmd+F',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.setFullScreen(!win.isFullScreen());
        }
    }]
}, {
    label: 'Help',
    role: 'help'
}];



const darwinTpl = [{
    label: appName,
    submenu: [{
        label: `About ${appName}`,
        role: 'about'
    }, {
        type: 'separator'
    }, {
        label: 'Services',
        role: 'services',
        submenu: []
    }, {
        type: 'separator'
    }, {
        label: `Hide ${appName}`,
        accelerator: 'Cmd+H',
        role: 'hide'
    }, {
        label: 'Hide Others',
        accelerator: 'Cmd+Shift+H',
        role: 'hideothers'
    }, {
        label: 'Show All',
        role: 'unhide'
    }, {
        type: 'separator'
    }, {
        label: `Quit ${appName}`,
        accelerator: 'Cmd+Q',
        click: function() {
            app.quit();
        }
    }]
}, {
    label: 'View',
    submenu: [{
        label: 'Tasks',
        submenu: [{
            label: 'Inbox',
            type: 'radio',
            checked: true,
            click: function() {
                _window = BrowserWindow.getFocusedWindow();
                _window.webContents.send('tasks');
            }
        }, {
            label: 'Starred',
            type: 'radio',
            click: function() {
                _window = BrowserWindow.getFocusedWindow();
                _window.webContents.send('tasks-starred');
            }
        }, {
            label: 'Priorities',
            type: 'radio',
            click: function() {
                _window = BrowserWindow.getFocusedWindow();
                _window.webContents.send('tasks-priorities');
            }
        }, {
            label: 'Due Date',
            type: 'radio',
            click: function() {
                _window = BrowserWindow.getFocusedWindow();
                _window.webContents.send('tasks-due-date');
            }
        }, {
            label: 'Recently Added',
            type: 'radio',
            click: function() {
                _window = BrowserWindow.getFocusedWindow();
                _window.webContents.send('tasks-recently-added');
            }
        }, {
            label: 'Completed',
            type: 'radio',
            click: function() {
                _window = BrowserWindow.getFocusedWindow();
                _window.webContents.send('tasks-completed');
            }
        }]
    }, {
        label: 'Projects',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('projects');
        }
    }, {
        label: 'Account',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('accounts');
        }
    }, {
        type: 'separator'
    }, {
        label: 'Messages',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('messages');
        }
    }, {
        label: 'Notifications',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('notifications');
        }
    }]
}, {
    label: 'Window',
    role: 'window',
    submenu: [{
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
    }, {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
    }, {
        type: 'separator'
    }, {
        label: 'Bring All to Front',
        role: 'front'
    }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Cmd+F',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.setFullScreen(!win.isFullScreen());
        }
    }]
}, {
    label: 'Help',
    role: 'help'
}];



const defaultLinuxTpl = [{
    label: 'Help',
    role: 'help'
}];

const linuxTpl = [{
    label: 'View',
    submenu: [{
        label: 'Tasks',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('tasks');
        }
    }, {
        label: 'Projects',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            console.log('_window: ', _window);
            _window.webContents.send('projects');
        }
    }, {
        label: 'Account',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('accounts');
        }
    }, {
        type: 'separator'
    }, {
        label: 'Messages',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('messages');
        }
    }, {
        label: 'Notifications',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('notifications');
        }
    }]
}, {
    label: 'Help',
    role: 'help'
}];


const defaultWinTpl = [{
    label: 'Settings',
    submenu: [{
        label: 'Minimize to tray',
        type: 'checkbox',
        checked: configStore.get('minimizeToTray'),
        click(item) {
            configStore.set('minimizeToTray', item.checked);
        }
    }, {
        label: 'Close to tray',
        type: 'checkbox',
        checked: configStore.get('closeToTray'),
        click(item) {
            configStore.set('closeToTray', item.checked);
        }
    }]
}, {
    label: 'Help',
    role: 'help'
}];


const winTpl = [{
    label: 'View',
    submenu: [{
        label: 'Tasks',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('tasks');
        }
    }, {
        label: 'Projects',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            console.log('_window: ', _window);
            _window.webContents.send('projects');
        }
    }, {
        label: 'Account',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('accounts');
        }
    }, {
        type: 'separator'
    }, {
        label: 'Messages',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('messages');
        }
    }, {
        label: 'Notifications',
        click: function() {
            _window = BrowserWindow.getFocusedWindow();
            _window.webContents.send('notifications');
        }
    }]
}, {
    label: 'Settings',
    submenu: [{
        label: 'Minimize to tray',
        type: 'checkbox',
        checked: configStore.get('minimizeToTray'),
        click(item) {
            configStore.set('minimizeToTray', item.checked);
        }
    }, {
        label: 'Close to tray',
        type: 'checkbox',
        checked: configStore.get('closeToTray'),
        click(item) {
            configStore.set('closeToTray', item.checked);
        }
    }]
}, {
    label: 'Help',
    role: 'help'
}];


const helpSubmenu = [{
    label: `${appName} Website...`,
    click: function() {
        shell.openExternal('http://tasks.wmwebdev.com/');
    }
}];

let tpl;
let defaultTpl;
if (process.platform === 'darwin') {
    tpl = darwinTpl;
    defaultTpl = defaultDarwinTpl;
} else if (process.platform === 'win32') {
    tpl = winTpl;
    defaultTpl = defaultWinTpl;
} else {
    tpl = linuxTpl;
    defaultTpl = defaultLinuxTpl;
}

tpl[tpl.length - 1].submenu = helpSubmenu;
defaultTpl[defaultTpl.length - 1].submenu = helpSubmenu;

module.exports = {
    mainMenu: Menu.buildFromTemplate(tpl),
    defaultMenu: Menu.buildFromTemplate(defaultTpl)
};
