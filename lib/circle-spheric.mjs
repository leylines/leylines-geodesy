import LatLon from 'geodesy/latlon-nvector-spherical.js';

import { createCzmlHeader, createCzmlPolyline, createCzmlPoint } from './czml.mjs';

export function getCircle(firstPointName, secondPointName, thirdPointName, firstPointCoordinates, secondPointCoordinates, thirdPointCoordinates, showCalc) {

  var czmlResult = [];
  czmlResult.push(createCzmlHeader());

  var outlineWidth = 2;
  var pixelSize = 6;
  var color = [255, 0, 0, 255];
  var outlineColor = [255, 0, 0, 255];


  // 3 points
  var fpc = new LatLon(firstPointCoordinates['coords'][0], firstPointCoordinates['coords'][1]);
  var spc = new LatLon(secondPointCoordinates['coords'][0], secondPointCoordinates['coords'][1]);
  var tpc = new LatLon(thirdPointCoordinates['coords'][0], thirdPointCoordinates['coords'][1]);

  czmlResult.push(createCzmlPoint({id: firstPointName, name: firstPointName, description: firstPointName, values: [fpc.lon, fpc.lat, 0]}));
  czmlResult.push(createCzmlPoint({id: secondPointName, name: secondPointName, description: secondPointName, values: [spc.lon, spc.lat, 0]}));
  czmlResult.push(createCzmlPoint({id: thirdPointName, name: thirdPointName, description: thirdPointName, values: [tpc.lon, tpc.lat, 0]}));

  // polygon
  var coords = [];
  var name = firstPointName + "-" + secondPointName + "-" + thirdPointName;

  coords.push(fpc.lon, fpc.lat, 0)
  coords.push(spc.lon, spc.lat, 0)
  coords.push(tpc.lon, tpc.lat, 0)
  coords.push(fpc.lon, fpc.lat, 0)

  czmlResult.push(createCzmlPolyline({id: name, name: name, description: name, values: coords, linewidth: 2, color: color}));

  // midpoints
  var mpfpsp = fpc.intermediatePointTo(spc, 0.5);
  var mpfptp = fpc.intermediatePointTo(tpc, 0.5);
  var mpsptp = spc.intermediatePointTo(tpc, 0.5);

  if (showCalc) {
    color = [0, 0, 255, 255]
    name = "midpoint-" + firstPointName + "-" + secondPointName;
    czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [mpfpsp.lon, mpfpsp.lat, 0], outlineColor: color, pixelSize: 4}));
    name = "midpoint-" + firstPointName + "-" + thirdPointName;
    czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [mpfptp.lon, mpfptp.lat, 0], outlineColor: color, pixelSize: 4}));
    name = "midpoint-" + secondPointName + "-" + thirdPointName;
    czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [mpsptp.lon, mpsptp.lat, 0], outlineColor: color, pixelSize: 4}));
  }

  // initial bearings
  var ibfpsp = fpc.initialBearingTo(spc)
  var ibfptp = fpc.initialBearingTo(tpc)
  var ibsptp = spc.initialBearingTo(tpc)

  // midpoints finalbearings
  var fbmpfpsp = fpc.finalBearingTo(mpfpsp);
  var fbmpfptp = fpc.finalBearingTo(mpfptp);
  var fbmpsptp = spc.finalBearingTo(mpsptp);

  /*
  if (fbmpfpsp < fbmpfptp) {
    fbmpfpsp -= 90
  } else {
    fbmpfpsp += 90
  }
  if (fbmpfptp < fbmpsptp) {
    fbmpfptp -= 90
  } else {
    fbmpfptp += 90
  }
  if (fbmpfpsp < fbmpfptp) {
    fbmpsptp -= 90
  } else {
    fbmpsptp += 90
  }
  */

  console.log(fbmpfpsp)
  console.log(fbmpfptp)
  console.log(fbmpsptp)

  fbmpfpsp < 180 ? fbmpfpsp += 90 : fbmpfpsp -= 90
  fbmpfptp < 180 ? fbmpfptp += 90 : fbmpfptp -= 90
  fbmpsptp < 180 ? fbmpsptp += 90 : fbmpsptp -= 90

  console.log(fbmpfpsp)
  console.log(fbmpfptp)
  console.log(fbmpsptp)

  // center of circle
  var center1 = LatLon.intersection(mpfpsp, fbmpfpsp, mpfptp, fbmpfptp);
  var center2 = LatLon.intersection(mpfptp, fbmpfptp, mpsptp, fbmpsptp);
  var center3 = LatLon.intersection(mpfpsp, fbmpfpsp, mpsptp, fbmpsptp);

  var center_lon = (center1.lon + center2.lon + center3.lon) / 3
  var center_lat = (center1.lat + center2.lat + center3.lat) / 3

  var center = new LatLon(center_lat,center_lon)

  name = "center";
  color = [255, 165, 0, 255]
  czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [center.lon, center.lat, 0], outlineColor: color}));

  // radius
  var dfpc = fpc.distanceTo(center)
  var dspc = spc.distanceTo(center)
  var dtpc = tpc.distanceTo(center)
  
  var radius = (dfpc + dspc + dtpc) / 3;
  
  var ibcfp = center.initialBearingTo(fpc)

  coords = [];
  var pentagon = [];
  var hexagon = [];
  for (var i=ibcfp; i<=ibcfp+360; i=i+1) {
    var point = center.destinationPoint(radius,i)
    coords.push(point.lon, point.lat, 0);
    if (((i - ibcfp).toFixed(3) % 72) == 0) {
      pentagon.push([point.lon, point.lat, 0])
    }
    if (((i - ibcfp).toFixed(3) % 60) == 0) {
      hexagon.push([point.lon, point.lat, 0])
    }
  }

  name = "circle";
  czmlResult.push(createCzmlPolyline({id: name, name: name, description: name, values: coords, linewidth: 5, color: color}));
    
  coords = [pentagon[0], pentagon[2], pentagon[4], pentagon[1], pentagon[3], pentagon[0]].flat();
  name = "pentagon";
  czmlResult.push(createCzmlPolyline({id: name, name: name, description: name, values: coords, linewidth: 5, color: color}));

  coords = [hexagon[0], hexagon[2], hexagon[4], hexagon[0]].flat();
  name = "hexagon1";
  czmlResult.push(createCzmlPolyline({id: name, name: name, description: name, values: coords, linewidth: 5, color: color}));

  coords = [hexagon[1], hexagon[3], hexagon[5], hexagon[1]].flat();
  name = "hexagon2";
  czmlResult.push(createCzmlPolyline({id: name, name: name, description: name, values: coords, linewidth: 5, color: color}));

/*  
  var ibcfp = center.initialBearingTo(fpc)
  name = "p1"
  var p1 = center.destinationPoint(radius,ibcfp+72)
  czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [p1.lon, p1.lat, 0], outlineColor: [255, 64, 0, 255]}));
  name = "p2"
  var p2 = center.destinationPoint(radius,ibcfp+144)
  czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [p2.lon, p2.lat, 0], outlineColor: [255, 64, 0, 255]}));
  name = "p3"
  var p3 = center.destinationPoint(radius,ibcfp+216)
  czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [p3.lon, p3.lat, 0], outlineColor: [255, 64, 0, 255]}));
  name = "p4"
  var p4 = center.destinationPoint(radius,ibcfp+288)
  czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [p4.lon, p4.lat, 0], outlineColor: [255, 64, 0, 255]}));

*/

  return czmlResult;
}
