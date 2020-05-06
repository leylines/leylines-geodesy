//import LatLon, { Cartesian } from 'geodesy/latlon-ellipsoidal.js';
import LatLon, { Nvector, Dms } from 'geodesy/latlon-nvector-spherical.js';
//import LatLon, { Nvector, Cartesian, Ned, Dms } from 'geodesy/latlon-nvector-ellipsoidal.js';
import { degrees_to_radians, radians_to_degrees }  from './radians.mjs';

export function calculateGridPoints(allpoints, sp, dp, shapename) {

  var results = [];

  var thetaX;
  var thetaY;
  var thetaZ;

  var shape = getShapePoints(shapename);

  // default the vertex of a shape toward true north
  thetaY = degrees_to_radians(20.9051574479);
  thetaX = degrees_to_radians(180.0);

  if (shapename == "dodecahedron") {
    shape = rotateX(rotateY(shape, thetaY), thetaX);
  }

  if (shapename == "beckerhagens") {
    shape = rotateX(rotateY(shape, thetaY), thetaX);
  }

  thetaY = degrees_to_radians(35.26439);
  thetaZ = degrees_to_radians(-45.0);
  thetaX = degrees_to_radians(180.0);

  if (shapename == "tetrahedron") {
    shape = rotateY(rotateZ(shape, thetaZ), thetaY);
  }

  if (shapename == "cube") {
    shape = rotateX(rotateY(rotateZ(shape, thetaZ), thetaY), thetaX);
  }

  thetaY = degrees_to_radians(31.717474);

  if (shapename == "icosahedron") {
    shape = rotateX(rotateY(shape, thetaY), thetaX);
  }

  // set rotational angles
  var spc = new LatLon(allpoints[sp]['coords'][0], allpoints[sp]['coords'][1]);
  var dpc = new LatLon(allpoints[dp]['coords'][0], allpoints[dp]['coords'][1]);
  var b = spc.initialBearingTo(dpc);
  thetaX = -1 * degrees_to_radians(b);
  thetaZ = degrees_to_radians(spc.lon);
  thetaY = -1 * degrees_to_radians(spc.lat);
  
  var results = coordinates(rotateZ(rotateY(rotateX(shape, thetaX), thetaY), thetaZ), results);
  return results;
}

function calculateGridLines(param, level) {

  var results = [];

  var x = 0;
  var z = 1;
  var smallest = 91;

  while (x < param.length) {
    while (z < param.length) {
      var xcoord = param[x].split("|");
      var zcoord = param[z].split("|");
      x = xcoord[0];
      z = zcoord[0];
      var a = xcoord[1];
      var b = xcoord[2];
      var c = zcoord[1];
      var d = zcoord[2];
      var separation = Math.acos(Math.sin(b*0.01744)*Math.sin(d*0.01744)+Math.cos(b*0.01744)*Math.cos(d*0.01744)*Math.cos(a*0.01744-c*0.01744))/0.01744;
      if (separation < 50 && level == 1) {
        results.push(x + "|" + z + "|" + a + "|" + b + "|" + c + "|" + d + "|" + separation);
      } else if (separation >= 50 && separation < 61 && level == 2) {
        results.push(x + "|" + z + "|" + a + "|" + b + "|" + c + "|" + d + "|" + separation);
      } else if (separation >= 61 && separation < 64 && level == 3) {
        results.push(x + "|" + z + "|" + a + "|" + b + "|" + c + "|" + d + "|" + separation);
      } else if (separation < smallest && level == 4) {
        results.push(x + "|" + z + "|" + a + "|" + b + "|" + c + "|" + d + "|" + separation);
      }
      z++;
    }
    z = Number(x) + 2;
    x++;
  }
  return results;
}

function getShapePoints(shapename) {

  var shapepoints = {};

  var p = (1+Math.sqrt(5))/2;

  shapepoints.dodecahedron = [[0,1/p,p],[0,-1/p,-p],[0,-1/p,p],[0,1/p,-p],[1/p,p,0],[-1/p,-p,0],[-1/p,p,0],[1/p,-p,0],[p,0,1/p],[-p,0,-1/p],[-p,0,1/p],[p,0,-1/p],[1,1,1],[-1,-1,-1],[-1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1],[1,-1,1],[1,1,-1]];
  shapepoints.icosahedron = [[0,1,p],[0,-1,-p],[0,-1,p],[0,1,-p],[1,p,0],[-1,-p,0],[-1,p,0],[1,-p,0],[p,0,1],[-p,0,-1],[-p,0,1],[p,0,-1]];
  shapepoints.cube = [[1,1,1],[-1,-1,-1],[-1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1],[1,-1,1],[1,1,-1]];
  shapepoints.tetrahedron = [[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]];
  shapepoints.octahedron = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  shapepoints.beckerhagens = [[0,1/p,p],[0,-1/p,-p],[0,-1/p,p],[0,1/p,-p],[1/p,p,0],[-1/p,-p,0],[-1/p,p,0],[1/p,-p,0],[p,0,1/p],[-p,0,-1/p],[-p,0,1/p],[p,0,-1/p],[1,1,1],[-1,-1,-1],[-1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1],[1,-1,1],[1,1,-1],[0,-p,1],[0,p,-1],[0,-p,-1],[0,p,1],[1,0,p],[-1,0,-p],[-1,0,p],[1,0,-p],[p,-1,0],[-p,1,0],[-p,-1,0],[p,1,0],[2,0,0],[-2,0,0],[0,2,0],[0,-2,0],[0,0,2],[0,0,-2],[p,1/p,1],[-p,-1/p,-1],[-p,-1/p,1],[-p,1/p,-1],[p,-1/p,-1],[p,-1/p,1],[p,1/p,-1],[-p,1/p,1],[1,p,1/p],[-1,-p,-1/p],[-1,-p,1/p],[-1,p,-1/p],[1,-p,-1/p],[1,-p,1/p],[1,p,-1/p],[-1,p,1/p],[1/p,1,p],[-1/p,-1,-p],[-1/p,-1,p],[-1/p,1,-p],[1/p,-1,-p],[1/p,-1,p],[1/p,1,-p],[-1/p,1,p]];

  var shape = shapepoints[shapename];
  return shape;
}

function coordinates(param, results) {

  var height = 0;
  var width = 2;
  var outlineWidth = 2;
  var pixelSize = 6;
  var color = [255, 255, 255, 255];
  var outlineColor = [255, 0, 0, 255];
  var material = {"solidColor" : { "color" : { "rgba" : outlineColor } }};

  for (var i=0; i < param.length; i++) {
    var x = param[i][0];
    var y = param[i][1];
    var z = param[i][2];

    var theta = 0;
    var phi = 0;
    var pi = Math.PI;

    if (z < 0) {
      theta = pi+Math.atan(Math.sqrt(x*x+y*y)/z);
    } else if (z===0) {
      theta = Math.Pi/2;
    } else {
      theta = Math.atan(Math.sqrt(x*x+y*y)/z);
    }

    if (x < 0 && y !== 0) {
      phi=pi+Math.atan(y/x);
    } else if (x === 0 && y > 0) {
      phi=pi/2;
    } else if (x === 0 && y < 0) {
      phi=pi*3/2;
    } else if (y === 0 && x > 0) {
      phi=0;
    } else if (y === 0 && x < 0) {
      phi=pi;
    } else if (x > 0 && y <= 0) {
      phi = 2*pi+Math.atan(y/x);
    } else if (x === 0 && y === 0)  {
      phi = 888;
    } else {
      phi=Math.atan(y/x);
    }

    param[i][0] = theta;
    param[i][1] = phi;
    delete param[i][2];

    theta = radians_to_degrees(theta);
    phi = radians_to_degrees(phi);

    var longitude;
    var latitude = 90-theta;

    if (phi <= 180) {
      longitude = phi;
    } else {
      longitude = phi-360;
    }

    if (longitude > 600) {
      longitude = 0.0;
    }

    results.push({"id" : i, "name": i, position: { cartographicDegrees: [longitude, latitude, height] }, point: { color: { rgba: color }, outlineColor: { rgba: outlineColor }, outlineWidth: 2, "pixelSize": pixelSize } });

  }
  return results;
}

function rotateX(param, thetaX) {
  var i, tot;
  for (i=0, tot=param.length; i<tot; i++) {
    var x = param[i][0];
    var y = param[i][1];
    var z = param[i][2];

    param[i][0] = x;
    param[i][1] = y*Math.cos(thetaX)-z*Math.sin(thetaX);
    param[i][2] = y*Math.sin(thetaX)+z*Math.cos(thetaX);
  }
  return param;
}

function rotateY(param, thetaY) {
  var i, tot;
  for (i=0, tot=param.length; i<tot; i++) {
    var x = param[i][0];
    var y = param[i][1];
    var z = param[i][2];

    param[i][0] = x*Math.cos(thetaY)+z*Math.sin(thetaY);
    param[i][1] = y;
    param[i][2] = -x*Math.sin(thetaY)+z*Math.cos(thetaY);
  }
  return param;
}

function rotateZ(param, thetaZ) {
  var i, tot;
  for (i=0, tot=param.length; i<tot; i++) {
    var x = param[i][0];
    var y = param[i][1];
    var z = param[i][2];

    param[i][0] = x*Math.cos(thetaZ)-y*Math.sin(thetaZ);
    param[i][1] = x*Math.sin(thetaZ)+y*Math.cos(thetaZ);
    param[i][2] = z;
  }
  return param;
}

function bearing(lat1,lon1,lat2,lon2) {

  lat1 = degrees_to_radians(lat1);
  lon1 = degrees_to_radians(lon1);
  lat2 = degrees_to_radians(lat2);
  lon2 = degrees_to_radians(lon2);

  var thetaY = degrees_to_radians(31.717474);

  var y = Math.sin(lon2-lon1)*Math.cos(lat2);
  var x = Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);

  if (y>0) {
    if (x>0) {
      thetaY = Math.atan(y/x);
    } else if (x<0) {
      thetaY = -Math.PI-Math.atan(-y/x);
    } else {
      thetaY = Math.PI/2;
    }
  } else if (y<0) {
    if (x>0) {
      thetaY = -Math.atan(-y/x);
    } else if (x<0) {
      thetaY = Math.atan(y/x)+Math.PI;
    } else {
      thetaY = Math.PI*3/2;
    }
  } else {
    if (x>0) {
      thetaY = 0;
    } else if (x<0) {
      thetaY = -Math.PI;
    } else {
      thetaY = 0;
    }
  }

  var bearing = Math.atan2( Math.sin(lon2-lon1) * Math.cos(lat2), Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1));
  return -bearing;
}
