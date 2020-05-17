
import LatLon from 'geodesy/latlon-nvector-spherical.js';
import { createPolyline } from './czml.mjs';

export function geogrid(allpoints, sp, dp, ob, g, dc) {

  var spc, dpc, b;
  var bearings = [];
  spc = new LatLon(allpoints[sp]['coords'][0], allpoints[sp]['coords'][1]);
  dpc = new LatLon(allpoints[dp]['coords'][0], allpoints[dp]['coords'][1]);
  b = spc.initialBearingTo(dpc);
  bearings.push(b);
  if (ob) {
    var hp1c = new LatLon(dpc.lat, -90);
    var hp2c = new LatLon(dpc.lat, 90);
    var hb = hp1c.initialBearingTo(hp2c);
    console.log(hb);
    dpc = LatLon.intersection(spc, b+ob, hp1c, hb);
    //var d = spc.distanceTo(dpc);
    //dpc = spc.destinationPoint(d,b+ob);
  }
  var width, color, distanceDisplayCondition, materialType;
  var czml = [];
  var slon = spc.lon % g;
  for (var bearing of bearings) {
    while (slon < 360) {
      var coords = [];
      var offset = spc.lon - slon
      coords.push(slon, spc.lat, 0)
      coords.push(dpc.lon - offset, dpc.lat, 0)
      var name = "line-" + b + "-" + offset;
      if (offset % 90 == 0) {
        width = 16;
        color = [255, 0, 0, 200];
        distanceDisplayCondition = [0, 25000000];
        materialType = "polylineGlow";
      } else if (offset % 60 == 0) {
        width = 14;
        color = [255, 128, 0, 200];
        distanceDisplayCondition = [0, 20000000]
        materialType = "polylineGlow";
      } else if (offset % 45 == 0) {
        width = 12;
        color = [0, 255, 128, 200];
        distanceDisplayCondition = [0, 15000000]
        materialType = "polylineGlow";
      } else if (offset % 30 == 0) {
        width = 10;
        color = [255, 255, 0, 200];
        distanceDisplayCondition = [0, 12500000]
        materialType = "polylineGlow";
      } else if (offset % 10 == 0) {
        width = 8;
        color = [128, 255, 0, 200];
        distanceDisplayCondition = [0, 10000000]
        materialType = "polylineGlow";
      } else if (offset % 5 == 0) {
        width = 6;
        color = [0, 255, 0, 200];
        distanceDisplayCondition = [0, 5000000]
        materialType = "polylineGlow";
      } else {
        width = 2;
        color = [0, 255, 255, 200];
        distanceDisplayCondition = [0, 2500000]
        materialType = "solidColor";
      }
      if (dc) {
        czml.push(createPolyline({id: name, name: name, description: name, values: coords, linewidth: width, color: color, arcType: 'GEODETIC', distanceDisplayCondition: distanceDisplayCondition, materialType: materialType}));
      } else {
        czml.push(createPolyline({id: name, name: name, description: name, values: coords, linewidth: width, color: color, arcType: 'GEODETIC', materialType: materialType}));
      }
      slon = slon + g;
    }
  }
  return czml;
}

export function fibonacci(allpoints, sp, dp, rb, dc) {

  var width, color, materialType, distanceDisplayCondition;
  var czml = [];

  var spc = new LatLon(allpoints[sp]['coords'][0], allpoints[sp]['coords'][1]);
  if (!rb) {
    var dpc = new LatLon(allpoints[dp]['coords'][0], allpoints[dp]['coords'][1]);
    rb = spc.rhumbBearingTo(dpc);
  }
  var rg = 2.8125
  var fibonacci = [0,2.8125,5.625,11.25,19.6875,33.75,56.25,70.3125,78.75,84.375,87.1875,90,92.8125,95.625,101.25,109.6875,123.75,146.25,160.3125,168.75,174.375,177.1875,180,182.8125,185.625,191.25,199.6875,213.75,236.25,250.3125,258.75,264.375,267.1875,270,272.8125,275.625,281.25,289.6875,303.75,326.25,340.3125,348.75,354.375,357.1875];

  for (var bearing of [rb, rb+90]) {
    var slon = spc.lon % rg;
    while (slon < 360) {
      var forcoords = [];
      var revcoords = [];
      var coords = [];
      var name = "rhumbline-" + bearing + "-" + slon;
      var offset = spc.lon - slon
      if (offset == 0) {
        width = 16
        color = [255, 0, 0, 200];
        distanceDisplayCondition = [0, 25000000]
        materialType = "polylineGlow";
      } else if (fibonacci.includes(offset) || fibonacci.includes(offset+360)) {
        width = 12 
        color = [0, 255, 128, 200];
        distanceDisplayCondition = [0, 15000000]
        materialType = "polylineGlow";
      } else {
        width = 2 
        color = [0, 255, 255, 200];
        distanceDisplayCondition = [0, 2500000]
      }
      var rcp = new LatLon(spc.lat, slon);;
      var rmp = new LatLon(spc.lat, slon);;
      for (var i = 10000; rmp.lat > -89; i = i + 10000) {
        rmp = rcp.rhumbDestinationPoint(i, bearing);
        forcoords.push(rmp.lon, rmp.lat, rmp.height)
      }
      var rmp = new LatLon(spc.lat, slon);;
      for (var i = 10000; rmp.lat < 89; i = i + 10000) {
        rmp = rcp.rhumbDestinationPoint(i, bearing + 180);
        revcoords.unshift(rmp.lon, rmp.lat, rmp.height)
      }
      coords = revcoords.concat(forcoords);
      if (dc) {
        czml.push(createPolyline({id: name, name: name, description: name, values: coords, linewidth: width, color: color, arcType: 'GEODETIC', distanceDisplayCondition: distanceDisplayCondition, materialType: materialType}));
      } else {
        czml.push(createPolyline({id: name, name: name, description: name, values: coords, linewidth: width, color: color, arcType: 'GEODETIC', materialType: materialType}));
      }
      slon = slon + rg;
    }
  }
  return czml;
}
