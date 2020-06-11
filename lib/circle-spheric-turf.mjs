import LatLon from 'geodesy/latlon-nvector-spherical.js';
//import * as turf from '@turf/turf';

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const turf = require('@turf/turf');

import { createCzmlHeader, createCzmlPolyline, createCzmlPoint } from './czml.mjs';
import { circlePoints } from './geotools.mjs';

export function getCircle(firstPointName, secondPointName, thirdPointName, firstPointCoordinates, secondPointCoordinates, thirdPointCoordinates, showCalc) {

  var czmlResult = [];
  czmlResult.push(createCzmlHeader());

  var width = 2;
  var outlineWidth = 2;
  var pixelSize = 6;
  var color = [255, 0, 0, 255];
  var outlineColor = [255, 0, 0, 255];
  var material = {"solidColor" : { "color" : { "rgba" : outlineColor } }};

  var fpc = new LatLon(firstPointCoordinates['coords'][0], firstPointCoordinates['coords'][1]);
  var spc = new LatLon(secondPointCoordinates['coords'][0], secondPointCoordinates['coords'][1]);
  var tpc = new LatLon(thirdPointCoordinates['coords'][0], thirdPointCoordinates['coords'][1]);

  var fpct = turf.point([firstPointCoordinates['coords'][1], firstPointCoordinates['coords'][0]]);
  var spct = turf.point([secondPointCoordinates['coords'][1], secondPointCoordinates['coords'][0]]);
  var tpct = turf.point([thirdPointCoordinates['coords'][1], thirdPointCoordinates['coords'][0]]);

  czmlResult.push(createCzmlPoint({id: firstPointName, name: firstPointName, description: firstPointName, values: [fpc.lon, fpc.lat, 0]}));
  czmlResult.push(createCzmlPoint({id: secondPointName, name: secondPointName, description: secondPointName, values: [spc.lon, spc.lat, 0]}));
  czmlResult.push(createCzmlPoint({id: thirdPointName, name: thirdPointName, description: thirdPointName, values: [tpc.lon, tpc.lat, 0]}));

  var coords = [];
  var name = firstPointName + "-" + secondPointName + "-" + thirdPointName;

  coords.push(fpc.lon, fpc.lat, 0);
  coords.push(spc.lon, spc.lat, 0);
  coords.push(tpc.lon, tpc.lat, 0);
  coords.push(fpc.lon, fpc.lat, 0);

  czmlResult.push(createCzmlPolyline({id: name, name: name, description: name, values: coords, linewidth: width, color: color}));

  var ibfpsp = fpc.initialBearingTo(spc);
  var ibfptp = fpc.initialBearingTo(tpc);
  var ibsptp = spc.initialBearingTo(tpc);

  console.log(ibfpsp, ibfptp, ibsptp);

  var ibfpspt = turf.bearing(fpct, spct);
  var ibfptpt = turf.bearing(fpct, tpct);
  var ibsptpt = turf.bearing(spct, tpct);

  console.log(ibfpspt, ibfptpt, ibsptpt);

  var mpfpsp = fpc.intermediatePointTo(spc, 0.5);
  var mpfptp = fpc.intermediatePointTo(tpc, 0.5);
  var mpsptp = spc.intermediatePointTo(tpc, 0.5);

  console.log(mpfpsp, mpfptp, mpsptp);

  var mpfpspt = turf.midpoint(fpct, spct);
  var mpfptpt = turf.midpoint(fpct, tpct);
  var mpsptpt = turf.midpoint(spct, tpct);

  console.log(mpfpspt, mpfptpt, mpsptpt);

  var fbmpfpsp = fpc.finalBearingTo(mpfpsp);
  var fbmpfptp = fpc.finalBearingTo(mpfptp);
  var fbmpsptp = spc.finalBearingTo(mpsptp);

  console.log(fbmpfpsp, fbmpfptp, fbmpsptp)

  var fbmpfpspt = turf.bearing(fpct, spct, {final: true});
  var fbmpfptpt = turf.bearing(fpct, tpct, {final: true});
  var fbmpsptpt = turf.bearing(spct, tpct, {final: true});

  console.log(fbmpfpspt, fbmpfptpt, fbmpsptpt)

  if (showCalc) {
    name = "midpoint-" + firstPointName + "-" + secondPointName;
    czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [mpfpsp.lon, mpfpsp.lat, 0], outlineColor: [255, 255, 0, 255]}));
    name = "midpoint-" + firstPointName + "-" + thirdPointName;
    czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [mpfptp.lon, mpfptp.lat, 0], outlineColor: [255, 255, 0, 255]}));
    name = "midpoint-" + secondPointName + "-" + thirdPointName;
    czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [mpsptp.lon, mpsptp.lat, 0], outlineColor: [255, 255, 0, 255]}));
  }

  fbmpfpsp > 180 ? fbmpfpsp += 90 : fbmpfpsp -= 90
  fbmpfptp > 180 ? fbmpfptp += 90 : fbmpfptp -= 90
  fbmpsptp > 180 ? fbmpsptp += 90 : fbmpsptp -= 90

  var mp1 = LatLon.intersection(mpfpsp, fbmpfpsp, mpfptp, fbmpfptp);
  var mp2 = LatLon.intersection(mpfptp, fbmpfptp, mpsptp, fbmpsptp);
  var mp3 = LatLon.intersection(mpfpsp, fbmpfpsp, mpsptp, fbmpsptp);

  var mp_lon = (mp1.lon + mp2.lon + mp2.lon) / 3
  var mp_lat = (mp1.lat + mp2.lat + mp2.lat) / 3

  var center = new LatLon(mp_lat,mp_lon)
  var dfpc = fpc.distanceTo(center)
  var dspc = spc.distanceTo(center)
  var dtpc = tpc.distanceTo(center)
  
  var radius = (dfpc + dspc + dtpc) / 3;
  
  var coords = circlePoints(center.lat, center.lon, radius);

  var centert = [mp_lon, mp_lat];
  var options = {steps: 360, units: 'kilometers'};
  var circlet = turf.circle(centert, radius / 1000, options);

  var coordst = circlet.geometry.coordinates
  console.log(circlet.geometry);
  var coordsth = [];
  for (var point of coordst[0]) {
     if (point.length < 3) {
       point.push(0);
     }
     coordsth.push(point);
  }

  coordsth = coordsth.flat();
    
  console.log(coordsth);

  name = "center";
  czmlResult.push(createCzmlPoint({id: name, name: name, description: name, values: [center.lon, center.lat, 0], outlineColor: [255, 64, 0, 255]}));

  name = "circle";
  czmlResult.push(createCzmlPolyline({id: name, name: name, description: name, values: coords, linewidth: width, color: color}));

  name = "circlet";
  czmlResult.push(createCzmlPolyline({id: name, name: name, description: name, values: coordsth, linewidth: width, color: color}));

  name = "ellipse";
  czmlResult.push({"id": name, "name": name, description: name, position: { cartographicDegrees: [center.lon, center.lat, center.height], }, ellipse: { semiMinorAxis: radius, semiMajorAxis: radius, height: 0, fill : false, outline : true, outlineColor: { "rgba" : [255, 255, 0, 255] }, outlineWidth: 200, granularity: 0.00001 } });
  return czmlResult;
}
