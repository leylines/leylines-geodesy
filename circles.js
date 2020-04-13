var LatLon = require('geodesy').LatLonSpherical;
var fs = require('fs');

var path = process.cwd();

var elements = ["giza", "kailash", "shasta", "angkor", "stonehenge", "uluru", "easter"]
var toDo = [...elements];
toDo.shift();

var giza = [];
giza.coords = new LatLon(29.9792458, 31.134658);
giza.color = [255, 255, 0, 200]
var kailash = [];
kailash.coords = new LatLon(31.066667, 81.3125);
kailash.color = [255, 255, 255, 200]
var shasta = [];
shasta.coords = new LatLon(41.409167, -122.195);
shasta.color = [255, 0, 0, 200]
var angkor = [];
angkor.coords = new LatLon(13.41246, 103.86677);
angkor.color = [0, 255, 255, 200]
var stonehenge = [];
stonehenge.coords = new LatLon(51.178889, -1.826389);
stonehenge.color = [0, 255, 0, 200]
var uluru = [];
uluru.coords = new LatLon(-25.345278, 131.034722);
uluru.color = [0, 0, 255, 200]
var easter = [];
easter.coords = new LatLon(-27.119444, -109.354722);
easter.color = [255, 0, 255, 200]

var height = 0.0;

for (start of elements) {
	for (destination of toDo) {
		var sp = eval(start).coords;
		var dp = eval(destination).coords;
		var d = sp.distanceTo(dp);
		var bearing = sp.bearingTo(dp);
		var bearing90 = bearing + 90;
		var finalbearing = sp.finalBearingTo(dp);
		var finalbearing90 = finalbearing + 90;

		var cdp = sp.destinationPoint(d, bearing);

		/*
		console.log(start + "-" + destination);
		console.log("Distance: " + d.toFixed(7));
		console.log("Bearing: " + bearing.toFixed(7));
		console.log("Bearing + 90: " + bearing90.toFixed(7));
		console.log("FinalBearing: " + finalbearing.toFixed(7));
		console.log("Calculated DestinationPoint: " + cdp);
		*/

		var color = eval(start).color;
		var materialglow = {"polylineGlow" : { "color" : { "rgba" : color }, "glowPower" : 0.2 }};
		var material = {"polyline" : { "color" : { "rgba" : color } }};

		var result = [];
		result.push({"id": "document", "name": "simple", "version": "1.0"});

		/* Circle */
		var name = start + "-" + destination;
		var width = 20;
		var coords = [];
		coords.push(sp.lon, sp.lat, height)
		coords.push(dp.lon, dp.lat, height)
		result.push({"id" : name, "name": name, "polyline" : { "positions" : { "cartographicDegrees" : coords }, "width" : width, "material" : materialglow } });

		name = start + "-" + destination + "-circle";
		width = 6;
		coords = [];
		for (var i = d; i < 40000000; i = i + 1000000) {
			var point = sp.destinationPoint(i, bearing);
			coords.push(point.lon, point.lat, height)
		}
		coords.push(sp.lon, sp.lat, height)
		result.push({"id" : name, "name": name, "polyline" : { "positions" : { "cartographicDegrees" : coords }, "width" : width, "material" : materialglow } });

		/* Circle + 90 */
		name = start + "-" + destination + "-sp-90";
		width = 4;
		coords = [];
		coords.push(sp.lon, sp.lat, height)
		for (var i = 1000000; i < 40000000; i = i + 1000000) {
			var point = sp.destinationPoint(i, bearing90);
			coords.push(point.lon, point.lat, height)
		}
		coords.push(sp.lon, sp.lat, height)
		result.push({"id" : name, "name": name, "polyline" : { "positions" : { "cartographicDegrees" : coords }, "width" : width, "material" : materialglow } });

		/* Circle + 90 */
		name = start + "-" + destination + "-dp-90";
		width = 4;
		coords = [];
		coords.push(dp.lon, dp.lat, height)
		for (var i = 1000000; i < 40000000; i = i + 1000000) {
			var point = dp.destinationPoint(i, finalbearing90);
			coords.push(point.lon, point.lat, height)
		}
		coords.push(dp.lon, dp.lat, height)
		result.push({"id" : name, "name": name, "polyline" : { "positions" : { "cartographicDegrees" : coords }, "width" : width, "material" : materialglow } });

		fs.writeFile(path + "/" + start + "-" + destination + ".czml", JSON.stringify(result), function(err){
	if (err) throw err;
}); 


	}
	toDo.shift();
}

return;



