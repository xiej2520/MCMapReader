window.onload = function() {

document.getElementById('fileSelect').addEventListener('change', loadFile);

function loadFile(event){
	var file = event.target.files[0];
	if (file) {
		let r = new FileReader();
		r.onload = function(e) {
			try {
				var parser = new nbtParser.NBTParser();
				var result = parser.parse(e.target.result);
				mapColorArray = result.data.colors;
	
				output = document.getElementById('map');
				output.innerHTML = "";

				s = "<table>"
				for (var i=0; i<128; i++) {
					s += "<tr>"
					for (var j=0; j<128; j++) {
						let val = mapColorArray[i*128 + j];
						s += ("<td style=\"background-color:" + rgbColorTable[val] + "\">" + " "+ "</td>");
					}
					s += "</tr>";
				}
				s += "</table>"
				output.innerHTML += s;

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