import LatLon from 'geodesy/latlon-spherical.js';
import { degrees_to_radians, radians_to_degrees }  from './radians.mjs';
import { createPolyline, createPoint } from './czml.mjs';

export function calculatePlatonic(allpoints, sp, dp, shapename) {
  var results = [];
  var points = calculateGridPoints(allpoints, sp, dp, shapename)
  for (var point of points) {
    results.push(createPoint({id: point[0], name: point[0], description: point[0], values: [point[1], point[2], 0]}));
  }
  var lines;
  switch (shapename) {
  case 'beckerhagens':
    lines = calculateGridLines(points, 91)
    break;
  case 'cube':
    lines = calculateGridLines(points, 71)
    break;
  case 'dodecahedron':
    lines = calculateGridLines(points, 71)
    break;
  case 'icosahedron':
    lines = calculateGridLines(points, 64)
    break;
  case 'octahedron':
    lines = calculateGridLines(points, 91)
    break;
  case 'tetrahedron':
    lines = calculateGridLines(points, 110)
    break;
  }
  var width, color;
  for (var line of lines) {
    var name = line[0][0] + "-" + line[0][1] + "-" + line[0][2];
    if (line[0][2] <= 50) {
      width = 4;
      color = [255, 215, 0, 255];
    } else if (line[0][2] <= 61) {
      width = 3;
      color = [0, 255, 0, 255];
    } else if (line[0][2] <= 70) {
      width = 2;
      color = [0, 0, 255, 255];
    } else {
      width = 1;
      color = [128, 0, 128, 255];
    }
    //results.push(createPolyline({id: name, name: name, description: name, values: line[1], linewidth: width, color: color}));
    results.push(createPolyline({id: name, name: name, description: name, values: [line[0][0] + "#position", line[0][1] + "#position"], linewidth: width, color: color, type: "references"}));
  }
  return results;
}

export function calculateGridPoints(allpoints, sp, dp, shapename) {

  var points = [];

  var thetaX;
  var thetaY;
  var thetaZ;

  var shape = getShapePoints(shapename);

  // default the vertex of a shape toward true north
  thetaY = degrees_to_radians(20.9051574479);
  thetaX = degrees_to_radians(180.00);

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
  
  var points = coordinates(rotateZ(rotateY(rotateX(shape, thetaX), thetaY), thetaZ));
  return points;
}

function calculateGridLines(param, smallest) {

  var results = [];
  var x = 0;
  var z = 1;

  //x = 8;
  while (x < param.length) {
    var p1 = new LatLon(param[x][1], param[x][2]);
    while (z < param.length) {
      if (x == z) {
        z++;
        continue;
      }
      var a = param[x][1], b = param[x][2];
      var c = param[z][1], d = param[z][2];
      var p2 = new LatLon(param[z][1], param[z][2]);
      var bearing = p1.initialBearingTo(p2);
      var distance = p1.distanceTo(p2);
      var separation = Math.acos(Math.sin(b*0.01744)*Math.sin(d*0.01744)+Math.cos(b*0.01744)*Math.cos(d*0.01744)*Math.cos(a*0.01744-c*0.01744))/0.01744;
      if (separation < smallest) {
        results.push([[x, z, separation], [a,  b, 0, c,  d, 0]]);
      }
      z++;
    }
    z = x+2;
    x++;
  }
  return results;
}

function getShapePoints(shapename) {

  var shapepoints = {};

  var p = (1.0+Math.sqrt(5.0))/2.0;

  shapepoints.dodecahedron = [[0,1/p,p],[0,-1/p,-p],[0,-1/p,p],[0,1/p,-p],[1/p,p,0],[-1/p,-p,0],[-1/p,p,0],[1/p,-p,0],[p,0,1/p],[-p,0,-1/p],[-p,0,1/p],[p,0,-1/p],[1,1,1],[-1,-1,-1],[-1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1],[1,-1,1],[1,1,-1]];
  shapepoints.icosahedron = [[0,1,p],[0,-1,-p],[0,-1,p],[0,1,-p],[1,p,0],[-1,-p,0],[-1,p,0],[1,-p,0],[p,0,1],[-p,0,-1],[-p,0,1],[p,0,-1]];
  shapepoints.cube = [[1,1,1],[-1,-1,-1],[-1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1],[1,-1,1],[1,1,-1]];
  shapepoints.tetrahedron = [[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]];
  shapepoints.octahedron = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  shapepoints.beckerhagens = [[0,1/p,p],[0,-1/p,-p],[0,-1/p,p],[0,1/p,-p],[1/p,p,0],[-1/p,-p,0],[-1/p,p,0],[1/p,-p,0],[p,0,1/p],[-p,0,-1/p],[-p,0,1/p],[p,0,-1/p],[1,1,1],[-1,-1,-1],[-1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1],[1,-1,1],[1,1,-1],[0,-p,1],[0,p,-1],[0,-p,-1],[0,p,1],[1,0,p],[-1,0,-p],[-1,0,p],[1,0,-p],[p,-1,0],[-p,1,0],[-p,-1,0],[p,1,0],[2,0,0],[-2,0,0],[0,2,0],[0,-2,0],[0,0,2],[0,0,-2],[p,1/p,1],[-p,-1/p,-1],[-p,-1/p,1],[-p,1/p,-1],[p,-1/p,-1],[p,-1/p,1],[p,1/p,-1],[-p,1/p,1],[1,p,1/p],[-1,-p,-1/p],[-1,-p,1/p],[-1,p,-1/p],[1,-p,-1/p],[1,-p,1/p],[1,p,-1/p],[-1,p,1/p],[1/p,1,p],[-1/p,-1,-p],[-1/p,-1,p],[-1/p,1,-p],[1/p,-1,-p],[1/p,-1,p],[1/p,1,-p],[-1/p,1,p]];

  var shape = shapepoints[shapename];
  return shape;
}

function coordinates(param) {

  var results = [];
  var height = 0;

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
      theta = pi/2;
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

    results.push([i, longitude, latitude]);

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
