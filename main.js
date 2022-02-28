const {app, BrowserWindow} = require("electron");
const url = require("url");
const path = require("path");

const indexUrl = path.join(__dirname, "index.html");
let win;

function createWindow() {
	win = new BrowserWindow({width: 800, height: 600})
	win.loadURL(url.format (indexUrl, {
		protocol: "file:",
		slashes: true
	}));
}
 
app.on("ready", createWindow);

// ./node_modules/.bin/electron ./main.js