const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain;

const path = require('path')
const url = require('url')
const request = require('request');

let mainWindow;

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
        request(args, function (error, response, body) {

            if (error) {

                switch (error.code) {
                    case "ECONNRESET":
                    case "ETIMEDOUT":
                    case "ENOENT":
                        event.sender.send("error", "Es liegt ein Netzwerkproblem vor");
                        break;
                    case "ECONNREFUSED":
                        event.sender.send("error", "Keine Verbindung möglich");
                        break;
                    default:
                        event.sender.send("error", JSON.stringify(error));
                }

            } else if (response.statusCode != 200) {
                event.sender.send("error", args + " " + response.statusCode);
            } else {
                event.sender.send("response", args + " " + response.statusCode);
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
