window.onload = function() {

canvas = document.getElementById("mapCanvas");
ctx = canvas.getContext("2d");
var scale = 8;
resizeCanvas(scale);

var fileSelect = document.getElementById("fileSelect");
fileSelect.addEventListener("change", addFiles);

var mapPrevButton = document.getElementById("mapPrev");
var mapNextButton = document.getElementById("mapNext");
mapPrevButton.addEventListener("click", function() {loadAdjacent("prev")});
mapNextButton.addEventListener("click", function() {loadAdjacent("next")});

var zoomInButton = document.getElementById("zoomIn");
var zoomOutButton = document.getElementById("zoomOut");
zoomInButton.addEventListener("click", function() {zoomMap("in")});
zoomOutButton.addEventListener("click", function() {zoomMap("out")});


var mapIndexText = document.getElementById("mapIndex");
var totalMapText = document.getElementById("totalMaps");

var currentMapText = document.getElementById("currentMap");
var dimensionText = document.getElementById("dimensionText");
var mapItemScaleText = document.getElementById("mapItemScaleText");
var xCenterText = document.getElementById("xCenterText");
var zCenterText = document.getElementById("zCenterText");


var fileList = [];
var currentIndex = 0;


// Fixes issue with negative color IDs in map when read
// Verified by comparing to ingame map (n=1)
var negOffsetCorrection = 256;


function resizeCanvas(scale) {
	// prevent flicker by saving canvas contents
	var tempCanvas = document.createElement('canvas');
	tempCanvas.width = ctx.canvas.width;
	tempCanvas.height = ctx.canvas.height;
	var tempContext = tempCanvas.getContext("2d");
	
	tempContext.drawImage(ctx.canvas, 0, 0);
	width = 128 * scale;
	height = 128 * scale;
	canvas.width = width;
	canvas.height = height;
	ctx.drawImage(tempContext.canvas, 0, 0);
}


function zoomMap(dir) {
	if (dir == "in" && scale > 1) {
		scale--;
		resizeCanvas(scale);
		if (fileList.length > 0){
			paintMap(fileList[currentIndex]);
		}
	}
	else if (dir == "out" && scale < 16) {
		scale++;
		resizeCanvas(scale);
		if (fileList.length > 0){
			paintMap(fileList[currentIndex]);
		}
	}
}


// scrolls forward or backwards through loaded files
function loadAdjacent(dir) {
	if (dir == "prev" && currentIndex > 0) {
		paintMap(fileList[--currentIndex]);
	}
	else if (dir == "next" && currentIndex < fileList.length-1) {
		paintMap(fileList[++currentIndex]);
	}
}


// adds uploaded files to upload, paints last map selected
function addFiles(event) {
	for (var i=0; i<event.target.files.length; i++) {
		fileList.push(event.target.files[i]);
	}
	currentIndex = fileList.length-1;
	currentMapText.innerHTML = fileList[currentIndex].name
	mapIndexText.innerHTML = fileList.length;
	paintMap(fileList[currentIndex]);
	totalMapText.innerHTML = fileList.length;
}


// draws a map on the canvas given a file
function paintMap(file) {
	let r = new FileReader();
	r.onload = function(event) {
		try {
			// parses map from file data
			var parser = new nbtParser.NBTParser();
			var result = parser.parse(event.target.result);
			mapData = result.data.colors;

			// image data to be put on canvas
			var imgData = ctx.createImageData(128, 128);
			var pixels = imgData.data;

			// reads color value from map and places it on pixels
			for (var i=0; i<16384; i++) {
				let val = mapData[i];
				// negative value correction (?)
				if (val < 0) {
					val = negOffsetCorrection + val; // 256 + val
				}
				// rgba
				pixels[i*4] = colorLUT[val][0];
				pixels[i*4+1] = colorLUT[val][1];
				pixels[i*4+2] = colorLUT[val][2];
				pixels[i*4+3] = colorLUT[val][3];
			}
			// put map on canvas
			ctx.putImageData(scaleImageData(imgData, scale), 0, 0);

			// update map properties
			mapIndexText.innerHTML = currentIndex+1;
			currentMapText.innerHTML = file.name;
			dimensionText.innerHTML = result.data.dimension;
			mapItemScaleText.innerHTML = result.data.scale;
			xCenterText.innerHTML = result.data.xCenter;
			zCenterText.innerHTML = result.data.zCenter;
		}
		// not a map file
		catch (error) {
			mapIndexText.innerHTML = currentIndex+1;
			currentMapText.innerHTML = "Error: Could not read file " + file.name;
		}

	}
	r.readAsArrayBuffer(file); 
}


// https://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas user3079576
function scaleImageData(imageData, scale) {
	var scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale);
	var subLine = ctx.createImageData(scale, 1).data
	for (var row = 0; row < imageData.height; row++) {
			for (var col = 0; col < imageData.width; col++) {
					var sourcePixel = imageData.data.subarray(
							(row * imageData.width + col) * 4,
							(row * imageData.width + col) * 4 + 4
					);
					for (var x = 0; x < scale; x++) subLine.set(sourcePixel, x*4)
					for (var y = 0; y < scale; y++) {
							var destRow = row * scale + y;
							var destCol = col * scale;
							scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
					}
			}
	}

	return scaled;
}

}