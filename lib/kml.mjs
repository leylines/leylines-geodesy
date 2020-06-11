/** Write kml
 * @module  kml
 * @author  Jörg Roth
 */

import { RGBToHex } from './tools.mjs';

/**
 * create kml-header
 * @return {string} header
 */
export function createKmlHeader() {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document>';
}

/**
 * create kml-footer
 * @return {string} footer
 */
export function createKmlFooter() {
  return '</Document></kml>';
}

export function createKmlLinestring({ id, name, description, values,
  color = [255, 0, 0, 255],
  clampToGround = true,
  linewidth = 10
}={}) {

  let kmlCoords = [];
  while (values.length > 0) {
    kmlCoords.push(values.splice(0, 3));
  }
  kmlCoords = kmlCoords.join(' ');

  let kmlLineString = '<Placemark id="' + id + '">';

  kmlLineString += '<name>' +  name + '</name>';
  kmlLineString += '<description>' +  description + '</description>';

  kmlLineString += '<Style><LineStyle>';
  kmlLineString += '<color>' + RGBToHex(color[0], color[1], color[2], color[3]) + '</color>';
  kmlLineString += '<width>' + linewidth + '</width>';
  kmlLineString += '</LineStyle></Style>';

  kmlLineString += '<LineString>';
  kmlLineString += '<tessellate>true</tessellate>';

  if (clampToGround) {
    kmlLineString += '<altitudeMode>clampToGround</altitudeMode>';
  } else {
    kmlLineString += '<altitudeMode>absolute</altitudeMode>';
  }

  kmlLineString += '<coordinates>';
  
  kmlLineString += kmlCoords;

  kmlLineString += '</coordinates>';
  kmlLineString += '</LineString>';
  kmlLineString += '</Placemark>';

  return kmlLineString;
}

export function createKmlPoint({ id, name, description, values,
  color = [255, 255, 255, 255],
  icon
}={}) {

  let kmlPoint = '<Placemark id="' + id + '">';

  kmlPoint += '<name>' +  name + '</name>';
  kmlPoint += '<description>' +  description + '</description>';

  kmlPoint += '<Style>';
  kmlPoint += '<Icon>http://maps.google.com/mapfiles/kml/shapes/placemark_circle_highlight.png</Icon>';
  kmlPoint += '</Style>';

  kmlPoint += '<Point>';

  kmlPoint += '<coordinates>';

  kmlPoint += values;

  kmlPoint += '</coordinates>';
  kmlPoint += '</Point>';
  kmlPoint += '</Placemark>';

  return kmlPoint;

}
