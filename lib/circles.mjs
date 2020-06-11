//import LatLon from 'geodesy/latlon-nvector-spherical.js';
import { createCzmlPolyline, createCzmlPoint } from './czml.mjs';
import { circlePoints } from './geotools.mjs';
import LatLon from 'geodesy/latlon-ellipsoidal-vincenty.js';
import LatLonS from 'geodesy/latlon-spherical.js';

export function getCircle(firstPointCoordinates, secondPointCoordinates, thirdPointCoordinates, mode, calc) {

  var height = 0.0;
  var czml = [];


  var name = sp + "-" + dp + "-" + mp;
  var width = 2;
  var outlineWidth = 2;
  var pixelSize = 6;
  var color = [255, 0, 0, 255];
  var outlineColor = [255, 0, 0, 255];
  var material = {"solidColor" : { "color" : { "rgba" : outlineColor } }};

  if (mode == "ellipsoidal") {
    var spc = new LatLon(sp['coords'][0], sp['coords'][1]);
    var dpc = new LatLon(dp['coords'][0], dp['coords'][1]);
    var mpc = new LatLon(mp['coords'][0], mp['coords'][1]);
  } else {
    var spc = new LatLonS(sp['coords'][0], sp['coords'][1]);
    var dpc = new LatLonS(dp['coords'][0], dp['coords'][1]);
    var mpc = new LatLonS(mp['coords'][0], mp['coords'][1]);
  }

  czml.push(createCzmlPoint({id: sp, name: sp, description: sp, values: [spc.lon, spc.lat, spc.height]}));
  czml.push(createCzmlPoint({id: dp, name: dp, description: dp, values: [dpc.lon, dpc.lat, dpc.height]}));
  czml.push(createCzmlPoint({id: mp, name: mp, description: mp, values: [mpc.lon, mpc.lat, mpc.height]}));

  var coords = [];
  coords.push(spc.lon, spc.lat, height)
  coords.push(dpc.lon, dpc.lat, height)
  coords.push(mpc.lon, mpc.lat, height)
  coords.push(spc.lon, spc.lat, height)

  czml.push(createCzmlPolyline({id: name, name: name, description: name, values: coords, linewidth: width, color: color}));

  var ibp1p2 = spc.initialBearingTo(dpc)
  var ibp1p3 = spc.initialBearingTo(mpc)
  var ibp2p3 = dpc.initialBearingTo(mpc)

  var dp1p2 = spc.distanceTo(dpc) / 2;
  var dp1p3 = spc.distanceTo(mpc) / 2;
  var dp2p3 = dpc.distanceTo(mpc) / 2;

  var mp1p2 = spc.destinationPoint(dp1p2, ibp1p2);
  var mp1p3 = spc.destinationPoint(dp1p3, ibp1p3);
  var mp2p3 = dpc.destinationPoint(dp2p3, ibp2p3);

  var fbp1p2 = spc.finalBearingTo(mp1p2);
  var fbp1p3 = spc.finalBearingTo(mp1p3);
  var fbp2p3 = dpc.finalBearingTo(mp2p3);

  if (calc) {
    name = "midpoint-" + sp + "-" + dp;
    czml.push(createCzmlPoint({id: name, name: name, description: name, values: [mp1p2.lon, mp1p2.lat, mp1p2.height], outlineColor: [255, 255, 0, 255]}));
    name = "midpoint-" + sp + "-" + mp;
    czml.push(createCzmlPoint({id: name, name: name, description: name, values: [mp1p3.lon, mp1p3.lat, mp1p3.height], outlineColor: [255, 255, 0, 255]}));
    name = "midpoint-" + dp + "-" + mp;
    czml.push(createCzmlPoint({id: name, name: name, description: name, values: [mp2p3.lon, mp2p3.lat, mp2p3.height], outlineColor: [255, 255, 0, 255]}));
  }

  fbp1p2 < 180 ? fbp1p2 += 90 : fbp1p2 -= 90
  fbp1p3 < 180 ? fbp1p3 += 90 : fbp1p3 -= 90
  fbp2p3 < 180 ? fbp2p3 += 90 : fbp2p3 -= 90

  if (mode == "ellipsoidal") {
    mp1p2 = new LatLonS(mp1p2.lat, mp1p2.lon);
    mp1p3 = new LatLonS(mp1p3.lat, mp1p3.lon);
    mp2p3 = new LatLonS(mp2p3.lat, mp2p3.lon);
  }

  var mp1 = LatLonS.intersection(mp1p2, fbp1p2, mp1p3, fbp1p3);
  var mp2 = LatLonS.intersection(mp1p2, fbp1p2, mp2p3, fbp2p3);
  var mp3 = LatLonS.intersection(mp1p3, fbp1p3, mp2p3, fbp2p3);

  var mp_lon = (mp1.lon + mp2.lon + mp2.lon) / 3
  var mp_lat = (mp1.lat + mp2.lat + mp2.lat) / 3

  if (calc && mode == 'ellipsoidal') {
    name = 'sphere-center1';
    czml.push(createCzmlPoint({id: name, name: name, description: name, values: [mp1.lon, mp1.lat, mp1.height], outlineColor: [255, 128, 0, 255]}));
    name = 'sphere-center2';
    czml.push(createCzmlPoint({id: name, name: name, description: name, values: [mp2.lon, mp2.lat, mp2.height], outlineColor: [255, 128, 0, 255]}));
    name = 'sphere-center3';
    czml.push(createCzmlPoint({id: name, name: name, description: name, values: [mp3.lon, mp3.lat, mp3.height], outlineColor: [255, 128, 0, 255]}));
    name = 'sphere-center';
    czml.push(createPoint({id: name, name: name, description: name, values: [mp_lon, mp_lat, 0], outlineColor: [255, 64, 0, 255]}));
  }

  var spm, dpm, mpm, center;

  if (mode == 'ellipsoidal') {

    var min_lat = Math.min(mp1.lat, mp2.lat, mp3.lat);
    var max_lat = Math.max(mp1.lat, mp2.lat, mp3.lat);
    var min_lon = Math.min(mp1.lon, mp2.lon, mp3.lon);
    var max_lon = Math.max(mp1.lon, mp2.lon, mp3.lon);

    var diff_lat = max_lat - min_lat;
    var diff_lon = max_lon - min_lon;

    center = new LatLon(min_lat + (diff_lat / 2), min_lon + (diff_lon / 2));
    var diff = 10000000;

    if (calc) {
      var poly0 = [min_lon,min_lat,0,min_lon,max_lat,0,max_lon,max_lat,0,max_lon,min_lat,0,min_lon,min_lat,0]
      name = 'polygon_0';
      czml.push(createCzmlPolyline({id: name, name: name, description: name, values: poly0, linewidth: width, color: color}));
    }

    var iterations = [[10,0.0001,1],[1,0.00001,2],[0.1,0.000001,3],[0.001,0.0000001,4]];
  
    for (var iteration of iterations) {
 
      min_lat = center.lat - (diff_lat * iteration[0]);
      max_lat = center.lat + (diff_lat * iteration[0]);
      min_lon = center.lon - (diff_lon * iteration[0]);
      max_lon = center.lon + (diff_lon * iteration[0]);
  
      //  console.log("level1");
      for (var i = min_lat; i < max_lat; i = i + iteration[1]) {
        for (var j = min_lon; j < max_lon; j = j + iteration[1]) {
          var newcenter = new LatLon(i, j); 
          spm = spc.distanceTo(newcenter);
          dpm = dpc.distanceTo(newcenter);
          mpm = mpc.distanceTo(newcenter);
        
          var newdiff = Math.max(spm, dpm, mpm) - Math.min(spm, dpm, mpm);
          if (newdiff < diff) {
            //console.log(newdiff);
            diff = newdiff;
            center = newcenter;
          }
        }
      }
  
      if (calc) {
        var poly1 = [min_lon,min_lat,0,min_lon,max_lat,0,max_lon,max_lat,0,max_lon,min_lat,0,min_lon,min_lat,0];
        name = 'polygon-' + iteration[2];
        czml.push(createCzmlPolyline({id: name, name: name, description: name, values: poly1, linewidth: width, color: color}));
  
        if (iteration[2] != '4') {
          name = 'center-' + iteration[2];
          czml.push(createCzmlPoint({id: name, name: name, description: name, values: [center.lon, center.lat, 0], outlineColor: [255, 64, 0, 255]}));
        } 
      }
    }

  } else {
 
    center = new LatLonS(mp_lat,mp_lon);
    spm = spc.distanceTo(center);
    dpm = dpc.distanceTo(center);
    mpm = mpc.distanceTo(center);
    //center = LatLon.trilaterate(spc, spm, dpc, dpm, mpc, mpm);

  }
  
  var radius = (spm + dpm + mpm) / 3;
  
  coords = circlePoints(center.lat, center.lon, radius);
  console.log(coords);

  name = 'center';
  czml.push(createCzmlPoint({id: name, name: name, description: name, values: [center.lon, center.lat, 0], outlineColor: [255, 64, 0, 255]}));
  czml.push(createCzmlPolyline({id: name, name: name, description: name, values: coords, linewidth: width, color: color}));
  //czml.push({"id": "c1", "name": "c1", position: { cartographicDegrees: [center.lon, center.lat, center.height], }, ellipse: { semiMinorAxis: radius, semiMajorAxis: radius, height: 0, fill : false, outline : true, outlineColor: { "rgba" : [255, 255, 0, 255] }, outlineWidth: 200, granularity: 0.00001 } });
  return czml;
}
