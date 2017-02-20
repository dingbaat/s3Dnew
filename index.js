const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain;

const path = require('path')
const url = require('url')
const request = require('request');

let mainWindow;

let errorMap = {
    "EACCES": "Permission denied",
    "ECONNREFUSED": "Connection refused",
    "ECONNRESET": "Connection reset by peer",
    "ENOENT": "No such file or directory",
    "EPERM": "Operation not permitted",
    "ETIMEDOUT": "Operation timed out"
};

function init() {

    mainWindow = new BrowserWindow({width: 800, height: 600});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.webContents.openDevTools();
    mainWindow.maximize();

    mainWindow.on('closed', function () {
        mainWindow = null
    })


    ipcMain.on('request', function (event, args) {

        var options = {
            url: args['url'],
            headers: {
                'Cookie': 'acid=' + args['acid'] + ';authLevel=' + args['authlevel']
            },
            followRedirect: false
        };

        request(options, function (error, response, body) {

            if (error) {
                if (msg = errorMap[error.code]) {
                    event.sender.send("error", msg, args);
                } else {
                    event.sender.send("error", `There is a network problem (${error.code})`, args);
                }
            } else if (response.statusCode != 200) {
                event.sender.send("error", `${response.statusCode}: ${response.statusMessage}`, args);
            } else {
                event.sender.send("response", response, body);
            }
        })
    });


    ipcMain.on('propRequest', function (event, args) {

        var options = {
            url: args['url'],
            headers: {
                'Cookie': 'acid=' + args['acid'] + ';brlang=0'
            },
        };

        request(options, function (error, response, body) {

            if (error) {
                if (msg = errorMap[error.code]) {
                    event.sender.send("error", msg, args);
                } else {
                    event.sender.send("error", `There is a network problem (${error.code})`, args);
                }
            } else if (response.statusCode != 200) {
                event.sender.send("error", `${response.statusCode}: ${response.statusMessage}`, args);
            } else {
                event.sender.send("response", response, body);
            }
        })
    });


    ipcMain.on('lvRequest', function (event, args) {

        var options = {
            url: args['url'],
            headers: {
                'Cookie': 'acid=' + args['acid'] + ';brlang=0'
            },
            followRedirect: false,
            encoding: null
        };

        request(options, function (error, response, body) {

            if (error) {
                if (msg = errorMap[error.code]) {
                    event.sender.send("lvError", msg, args);
                } else {
                    event.sender.send("lvError", `There is a network problem (${error.code})`, args);
                }
            } else if (response.statusCode != 200) {
                event.sender.send("lvError", `${response.statusCode}: ${response.statusMessage}`, args);
            } else {
                event.sender.send("lvResponse", response, body);
            }
        })
    })


    ipcMain.on('loginRequest', function (event, args) {

        var options = {
            url: args['url'],
            followRedirect: false
        };

        request(options, function (error, response, body) {

            if (error) {
                if (msg = errorMap[error.code]) {
                    event.sender.send("loginError", msg, args);
                } else {
                    event.sender.send("loginError", `There is a network problem (${error.code})`, args);
                }
            } else {
                event.sender.send("loginResponse", response, body);
            }
        })
    })

}


app.on('ready', init)

app.on('window-all-closed', function () {

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {

    if (mainWindow === null) {
        init()
    }
})