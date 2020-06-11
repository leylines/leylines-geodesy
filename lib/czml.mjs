/** Write czml
 * @module  czml
 * @author  Jörg Roth
 */

export function createCzmlHeader() {
  return {'id': 'document', 'name': 'simple', 'version': '1.0'};
}

export function createCzmlPolyline({ id, name, description, values,
  arcType = 'GEODESIC',
  clampToGround = true,
  color = [255, 0, 0, 255],
  distanceDisplayCondition,
  linewidth = 10,
  materialType = 'solidColor',
  type = 'cartographic'
}={}) {

  var czmlPolyline = {};
  czmlPolyline.id = id;
  czmlPolyline.name = name;
  czmlPolyline.description = description;

  var polyline = {};
  polyline.width = linewidth;
  polyline.arcType = arcType;

  if (distanceDisplayCondition) {
    polyline.distanceDisplayCondition = distanceDisplayCondition;
  }
  if (clampToGround) {
    polyline.clampToGround = clampToGround;
  }

  var rgba = {};
  rgba.rgba = color;

  var material = {};
  if (materialType == 'solidColor') {
    var solidColor = {};
    solidColor.color = rgba;
    material.solidColor = solidColor;
  } else if (materialType == 'polylineGlow') {
    var glowColor = {};
    glowColor.color = rgba;
    glowColor.glowPower = 0.2;
    material.polylineGlow = glowColor;
  }
  polyline.material = material;

  if (type == 'cartographic') {
    var carto = {};
    carto.cartographicDegrees = values;
    polyline.positions = carto;
  } else if (type == 'references') {
    var references = {};
    references.references = values;
    polyline.positions = references;
  }

  czmlPolyline.polyline = polyline;
  return czmlPolyline;
}

export function createCzmlPoint({ id, name, description, values,
  outlineColor = [255, 0, 0, 255],
  color = [255, 255, 255, 255],
  pixelSize = 6,
  icon
}={}) {

  var czmlPoint = {};
  czmlPoint.id = id;
  czmlPoint.name = name;
  czmlPoint.description = description;

  if (icon) {
    var billboard = {};
    var cart1value = [0,0,0];
    var cartesian1 = {};
    cartesian1.cartesian = cart1value;
    billboard.eyeOffset = cartesian1;
    billboard.horizontalOrigin = 'CENTER';
    billboard.image = icon;
    point.billboard = billboard;
    var cart2value = [0,0];
    var cartesian2 = {};
    cartesian2.cartesian2 = cart2value;
    billboard.pixelOffset = cartesian2;
    //billboard.scale = scale;
    billboard.show = true;
    billboard.verticalOrigin = 'CENTER';
  }

  var rgbaPoint = {};
  rgbaPoint.rgba = color;

  var point = {};
  point.color = rgbaPoint;

  var rgbaOutline = {};
  rgbaOutline.rgba = outlineColor;

  point.outlineColor = rgbaOutline;

  point.outlineWidth = pixelSize / 5;
  point.pixelSize = pixelSize;

  czmlPoint.point = point;

  var position = {};
  var cart3value = values;
  position.cartographicDegrees = cart3value;
  czmlPoint.position = position;
  return czmlPoint;
}
