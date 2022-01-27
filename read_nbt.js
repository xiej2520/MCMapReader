window.onload = function() {

document.getElementById('fileSelect').addEventListener('change', loadFile);
canvas = document.getElementById("mapCanvas");
ctx = canvas.getContext("2d");
var width = 128 * 8;
var height = 128 * 8;
canvas.width = width;
canvas.height = height;

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

function loadFile(event){
	var file = event.target.files[0];
	if (file) {
		let r = new FileReader();
		r.onload = function(e) {
			try {
				var parser = new nbtParser.NBTParser();
				var result = parser.parse(e.target.result);
				mapData = result.data.colors;

				var imgData = ctx.createImageData(128, 128);
				var pixels = imgData.data;

				for (var i=0; i<16384; i++) {
					let val = mapData[i];
					if (val < 0) {
						val = 0;
					}
					pixels[i*4] = colorLUT[val][0];
					pixels[i*4+1] = colorLUT[val][1];
					pixels[i*4+2] = colorLUT[val][2];
					pixels[i*4+3] = colorLUT[val][3];
				}

				ctx.putImageData(scaleImageData(imgData, 8), 0, 0);
			} catch(e) {
					console.error(e)
			}
		}
		r.readAsArrayBuffer(file); 
	} else {
			console.error("Failed to load file");
	}
}
}