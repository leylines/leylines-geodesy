import LatLon from 'geodesy/latlon-spherical.js';
import { createHeader, createFooter, createPoint, createPolyline } from './geometry.mjs';

export async function getGeodesicGrid(initialValues, degrees, outFormat) {

  const radius = 6371e3;
  const circumference = (radius * 2) * Math.PI;
  var divisor = 360.0 / degrees;

  var spc = initialValues['sp']['value'];
  var bearing = initialValues['ib-0']['value'];

  var result = await createHeader({outFormat: outFormat});

  var width = 2;
  var color = [255, 0, 0, 255];

  var name = '0-Line';
  var description = '0-Line';
  var coords = getCircle(spc, bearing);
  result = await createPolyline({outFormat: outFormat, result: result, id: name, name: name, description: description, values: coords, linewidth: width, color: color});
  
  name = '90-Line';
  description = '90-Line';
  color = [255, 255, 0, 255];
  coords = getCircle(spc, bearing+90);
  result = await createPolyline({outFormat: outFormat, result: result, id: name, name: name, description: description, values: coords, linewidth: width, color: color});

  var sp = spc.destinationPoint(circumference / 4, bearing);
  var sb = spc.finalBearingTo(sp);

  name = 'Pol-1';
  description = 'Pol-1';
  color = [255, 128, 0, 255];
  var pol1 = LatLon.intersection(spc, bearing+90, sp, sb+90);
  result = await createPoint({outFormat: outFormat, result: result, id: name, name: name, description: description, values: [pol1.lon, pol1.lat, 0]});

  name = 'Pol-2';
  description = 'Pol-2';
  color = [255, 128, 0, 255];
  var pol2 = LatLon.intersection(spc, bearing-90, sp, sb-90);
  result = await createPoint({outFormat: outFormat, result: result, id: name, name: name, description: description, values: [pol2.lon, pol2.lat, 0]});

  
  for (let i = (circumference / divisor); i < circumference / 2; i = i + (circumference / divisor)) {
    var np = spc.destinationPoint(i, bearing);
    var nb = spc.finalBearingTo(np);
    coords = getCircle(np, nb+90);
    name = i + '-lon';
    description = i + '-lon';
    result = await createPolyline({outFormat: outFormat, result: result, id: name, name: name, description: description, values: coords, linewidth: width, color: color});
  }

  for (var pol of [pol1, pol2]) {
    for (let i = (circumference / divisor); i < circumference / 4; i = i + (circumference / divisor)) {
      coords = [];
      for (let j=0; j<=360; j=j+1) {
        var point = pol.destinationPoint(i,j);
        coords.push(point.lon, point.lat, 0);
      }
      name = pol.lat + i + '-lat';
      description = pol.lat + i + '-lat';
      result = await createPolyline({outFormat: outFormat, result: result, id: name, name: name, description: description, values: coords, linewidth: width, color: color});
    }
  }

  result = await createFooter({outFormat: outFormat, result: result});

  return result;
}

function getCircle(pc, bearing) {

  let coords = [];
  coords.push(pc.lon, pc.lat, 0);
  for (var i = 100000; i < 40000000; i = i + 100000) {
    var mp = pc.destinationPoint(i, bearing);
    coords.push(mp.lon, mp.lat, 0);
  }
  coords.push(pc.lon, pc.lat, 0);
  return coords;

}
