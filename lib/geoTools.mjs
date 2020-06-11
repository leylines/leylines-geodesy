/** All kind of geographic tools
 * @module   geoTools
 * @author   Jörg Roth
 * @requires NPM:geodesy
 */

import LatLon, { Dms } from 'geodesy/latlon-spherical.js';

export function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

export function radians_to_degrees(radians) {
  var pi = Math.PI;
  return radians * (180/pi);
}

export function greatCirclePoints(sp, start, bearing, increment) {
  let coords = [];
  for (let i=start; i<40000000; i=i+increment) {
    let mp = sp.destinationPoint(i, bearing);
    coords.push(mp.lon, mp.lat, 0);
  }
  return coords;
}
  
export async function getInitialValues(points, sourcePoint, destinationPoint, bearing) {

  if (!destinationPoint && !bearing) {
    throw new Error('No sourcepoint is defined!');
  }

  if (!destinationPoint && !bearing) {
    throw new Error('Neither desinationpoint nor bearing is defined!');
  }

  if (destinationPoint && bearing) {
    throw new Error('Both desinationpoint and bearing are defined!');
  }

  var result = [];

  if (points[sourcePoint]) {
    result['sp'] = [];
    result['sp']['value']    = new LatLon(points[sourcePoint]['coords'][0], points[sourcePoint]['coords'][1]);
    result['sp']['name']     = sourcePoint;
    result['sp']['filename'] = sourcePoint;
  } else if (sourcePoint) {
    result['sp'] = [];
    result['sp']['value']    = parse_input(sourcePoint);
    result['sp']['name']     = Dms.toLat(result['sp']['value'].lat, 'dms') + ' / ' + Dms.toLon(result['sp']['value'].lon, 'dms');
    result['sp']['filename'] = result['sp']['value'].lat + '-' + result['sp']['value'].lon;
  } 

  if (points[destinationPoint]) {
    result['dp'] = [];
    result['dp']['value']    = new LatLon(points[destinationPoint]['coords'][0], points[destinationPoint]['coords'][1]);
    result['dp']['name']     = destinationPoint;
    result['dp']['filename'] = destinationPoint;
  } else if (destinationPoint) {
    result['dp'] = [];
    result['dp']['value']    = parse_input(destinationPoint);
    result['dp']['name']     = Dms.toLat(result['dp']['value'].lat, 'dms') + ' / ' + Dms.toLon(result['dp']['value'].lon, 'dms');
    result['dp']['filename'] = result['dp']['value'].lat + '-' + result['dp']['value'].lon;
  }

  if (bearing) {
    result['ib-0'] = [];
    result['ib-0']['value'] = parseFloat(bearing);
    result['ib-0']['name'] = Dms.toBrng(result['ib-0']['value'],'dms');
    result['filename'] = 'greatcircle-' + result['sp']['filename'] + '-' + bearing;
  } else {
    result['ib-0'] = [];
    result['ib-0']['value'] = result['sp']['value'].initialBearingTo(result['dp']['value']);
    result['ib-0']['name'] = Dms.toBrng(result['ib-0']['value'],'dms');
    result['fb-0'] = [];
    result['fb-0']['value'] = result['sp']['value'].finalBearingTo(result['dp']['value']);
    result['fb-0']['name'] = Dms.toBrng(result['fb-0']['value'],'dms');
    result['fb-90'] = [];
    result['fb-90']['value'] = result['fb-0']['value'] + 90;
    result['fb-90']['name'] = Dms.toBrng(result['fb-90']['value'],'dms');
    result['filename'] = 'greatcircle-' + result['sp']['filename'] + '-' + result['dp']['filename'];
  }

  result['ib-90'] = [];
  result['ib-90']['value'] = result['ib-0']['value'] + 90;
  result['ib-90']['name'] = Dms.toBrng(result['ib-90']['value'],'dms');

  return result;
}

function parse_input(input) {
  let coords = input.split(/\s+/);
  let lat = Dms.parse(coords[0]);
  let lon = Dms.parse(coords[1]);
  return new LatLon(lat, lon);
}

