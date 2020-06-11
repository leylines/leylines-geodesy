import { createCzmlHeader, createCzmlPolyline, createCzmlPoint } from './czml.mjs';
import { createKmlHeader, createKmlFooter, createKmlLinestring, createKmlPoint } from './kml.mjs';

export function createHeader({ outFormat }={}) {

  var result;

  switch (outFormat) {
  case 'kml':
    result = '';
    break;
  case 'czml':
    result = [];
    break;
  }

  switch (outFormat) {
  case 'kml':
    result += createKmlHeader();
    break;
  case 'czml':
    result.push(createCzmlHeader());
    break;
  }

  return result;
}

export function createFooter({ outFormat, result }={}) {

  switch (outFormat) {
  case 'kml':
    result += createKmlFooter();
    break;
  case 'czml':
    result = JSON.stringify(result);
    break;
  }

  return result;
}

export function createPoint({ outFormat, result,
  id,
  name,
  description,
  values,
  outlineColor,
  color,
  icon
}={}) {

  switch (outFormat) {
  case 'kml':
    result += createKmlPoint({id: id, name: name, description: description, values: values});
    break;
  case 'czml':
    result.push(createCzmlPoint({id: id, name: name, description: description, values: values, outlineColor, color, icon}));
    break;
  }

  return result;
}

export function createPolyline({outFormat, result,
  id,
  name,
  description,
  values,
  linewidth,
  color,
  type,
  arcType,
  clampToGround,
  materialType,
  distanceDisplayCondition
}={}) {

  switch (outFormat) {
  case 'kml':
    result += createKmlLinestring({id: id, name: name, description: description, values: values, linewidth: linewidth/2, color: color, materialType: materialType, type: type});
    break;
  case 'czml':
    result.push(createCzmlPolyline({id: id, name: name, description: description, values: values, linewidth: linewidth, color: color, materialType: materialType, type: type, arcType: arcType, clampToGround: clampToGround, distanceDisplayCondition: distanceDisplayCondition}));
    break;
  }

  return result;
}
