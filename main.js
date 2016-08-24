'use strict';

const electron = require('electron');
const os = require('os');
// Module to control application life.
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const MenuItem = electron.MenuItem;
const shell = electron.shell;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;


const path = require('path');
const dialog = require('dialog');
const fs = require('fs');
const express = require('express');
const expressApp = express();

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');

const badges = require('./resources/badges');
const appMenu = require('./resources/menu');
const configStore = require('./resources/config');
const tray = require('./resources/traymenu');
const routes = require('./routes/index');

const port = normalizePort(process.env.PORT || '6309');

var i = 0;
var server;
let mainWindow;
let menuBarWindow;
var appIcon = null;
var eNotify = null;
// const TRAY_ARROW_HEIGHT = 40; //px
const TRAY_ARROW_HEIGHT = 0; //px

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}



function InitExpress() {
    // view engine setup
    // expressApp.set('views', express.static(path.join(__dirname,'')));
    // expressApp.set('view engine', 'ejs');
    // view engine setup
    expressApp.use(logger('dev'));
    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({
        extended: false
    }));
    expressApp.use(cookieParser());
    expressApp.use(express.static(__dirname));
    expressApp.use('/', routes);
    expressApp.set('port', port);

    expressApp.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // development error handler
    if (expressApp.get('env') === 'development') {
        expressApp.use(function(err, req, res, next) {
            res.status(err.status || 500);
            console.log('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    expressApp.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log('error', {
            message: err.message,
            error: {}
        });
    });

    server = http.createServer(expressApp);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', function() {
        var addr = server.address();
        var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        console.log('Listening on ', bind);

        // and load the index.html of the app.
        mainWindow.loadURL('file://' + __dirname + '/index.html');
        mainWindow.loadURL('http://127.0.0.1:6309');
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        title: app.getName(),
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'assets/icons/32x32.png'),
    });

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Maximize Screen
    mainWindow.maximize();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        mainWindow = null;
        server.close();
    });

    mainWindow.on('close', function(e) {
        if (process.platform === 'darwin' && !mainWindow.forceClose) {
            e.preventDefault();
            mainWindow.hide();
        } else if (process.platform === 'win32') {
            mainWindow.hide();
            e.preventDefault();
        }
    });

    mainWindow.on('minimize', function() {
        if (process.platform === 'win32') {
            mainWindow.hide();
        }
    });

}

function showWindow(trayPos) {
    var x = Math.floor(trayPos.x - ((340 / 2) || 200) + (trayPos.width / 2));
    var y = process.platform === 'win32' ? trayPos.y - 600 : (trayPos.y + TRAY_ARROW_HEIGHT);

    const _window = BrowserWindow.fromId(1);
    _window.webContents.send('get-app-session');

    if (menuBarWindow === undefined) {
        createMenuWindow(true, x, y)
    }

    if (menuBarWindow) {
        menuBarWindow.show();
        menuBarWindow.setPosition(x, y);
    }
}

function hideWindow() {
    if (!menuBarWindow) return;
    menuBarWindow.hide();
}

function createMenuWindow(show, x, y) {

    menuBarWindow = new BrowserWindow({
        show: show,
        width: 320,
        height: 480,
        resizable: false,
        frame: false,
        transparent: true,
        'always-on-top': false,
        'web-preferences': {
            'web-security': true,
            'plugins': true,
            'overlay-fullscreen-video': true
        },
        show: false,
        icon: path.join(__dirname, 'assets/icons/32x32.png')
    });

    if (show) {
        menuBarWindow.setPosition(x, y);
    }

    // Open the devtools.
    // TODO: depending on which environment
    // menuBarWindow.openDevTools();

    menuBarWindow.loadURL('file://' + __dirname + '/menu.html');
    menuBarWindow.on('closed', function() {
        menuBarWindow = null;
    });

    menuBarWindow.on('blur', function() {
        menuBarWindow.hide();
    });
};






app.on('ready', function() {

    var electronScreen = require('screen');
    var cachedBounds;

    eNotify = require('electron-notify');
    eNotify.setConfig({
        appIcon: path.join(__dirname, 'assets/icons/64x64.png'),
        displayTime: 3000,
        borderRadius: 5
    });

    createWindow();

    InitExpress();


    function clicked(e, bounds) {
        if (menuBarWindow && menuBarWindow.isVisible()) {
            return hideWindow()
        };
        var size = electronScreen.getDisplayNearestPoint(electronScreen.getCursorScreenPoint()).workArea;
        if (bounds) cachedBounds = bounds;

        bounds = bounds || {
            x: 0,
            y: 0
        };

        if (bounds.x === 0 && bounds.y === 0) {
            bounds.x = size.width + size.x - (340 / 2); // default to right
            cachedBounds = bounds;
        }

        showWindow(bounds);
    }

    function double_click() {
        const _window = BrowserWindow.fromId(1);
        if (!_window.isFocused()) {
            _window.show();
        }
    }


    ipcMain.on('login', function(event, arg) {
        electron.Menu.setApplicationMenu(appMenu.mainMenu);
    });

    ipcMain.on('logout', function(event, arg) {
        electron.Menu.setApplicationMenu(appMenu.defaultMenu);
        console.log('appIcon logout: ', appIcon);
        if (appIcon !== null) {
            appIcon.destroy();
            appIcon = null;
        }
    });

    ipcMain.on('tray-logout', function(event, arg) {
        const _window = BrowserWindow.fromId(1);
        _window.webContents.send('tray-app-logout');
        console.log('menuBarWindow: ', menuBarWindow);
        if (menuBarWindow !== undefined) {
            menuBarWindow.hide();
        }
    });

    ipcMain.on('tray-show', function(event, arg) {
        console.log('appIcon tray-show: ', appIcon);
        if (appIcon === null) {
            appIcon = new Tray(__dirname + '/assets/icons/16x16.png');
            appIcon.setToolTip(app.getName());
        }

        appIcon.on('click', clicked);
        appIcon.on('double-click', double_click);
        // createMenuWindow(false);
    });

    ipcMain.on('notif-read', function(event, arg) {
        i = 0;
        badges.setBadges('');
    });


    require('./resources/notification')(eNotify);
    require('./resources/ipc')();
});

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', function() {
    mainWindow.forceClose = true;
});

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }

    badges.setBadges('');
});
