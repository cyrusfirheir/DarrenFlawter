const {
	app,
	BrowserWindow,
	screen
} = require('electron');
const fs = require('fs');
const path = require('path');

var win;

function createWindow () {
	let { width, height } = screen.getPrimaryDisplay().workAreaSize
  win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		backgroundColor: "#152126",
    width: width,
    height: height,
		frame: false,
		show: false,
		resizable: false
  })
  win.loadFile("./index.html") //relative to package.json
	win.once('ready-to-show', () => {
	  win.show();
	})
}

if (require('./scripts/fixHtml.js').fix()) app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
