'use strict';

const electron = require('electron');
const app = electron.app;
const remote = electron.remote;
const BrowserWindow = electron.BrowserWindow;

function setBadge(text) {
    if (process.platform === "darwin") {
        app.dock.setBadge("" + text);
        app.dock.bounce('informational');
    } else if (process.platform === "win32") {
        var win = remote.getCurrentWindow();

        if (text === "") {
            win.setOverlayIcon(null, "");
            return;
        }

        // Create badge
        var canvas = document.createElement("canvas");
        canvas.height = 140;
        canvas.width = 140;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.ellipse(70, 70, 70, 70, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.textAlign = "center";
        ctx.fillStyle = "white";

        if (text.length > 2) {
            ctx.font = "75px sans-serif";
            ctx.fillText("" + text, 70, 98);
        } else if (text.length > 1) {
            ctx.font = "100px sans-serif";
            ctx.fillText("" + text, 70, 105);
        } else {
            ctx.font = "125px sans-serif";
            ctx.fillText("" + text, 70, 112);
        }

        var badgeDataURL = canvas.toDataURL();
        var img = NativeImage.createFromDataUrl(badgeDataURL);

        win.setOverlayIcon(img, text);
    }
};

module.exports = {
    setBadges: function(text) {
        setBadge(text);
    }
};
