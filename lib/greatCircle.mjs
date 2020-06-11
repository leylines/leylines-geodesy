import { createHeader, createFooter, createPoint, createPolyline } from './geometry.mjs';
import { greatCirclePoints } from './geotools.mjs';

export async function getGreatCircle(initialValues, outFormat) {

  var coords = [];
  var color, width, name, description, materialType;
  var spv, spn, dpv, dpn, ib0v, ib0n, ib90v, ib90n, fb0v, fb0n, fb90v, fb90n, d, dkm;

  spv   = initialValues['sp']['value'];
  spn   = initialValues['sp']['name'];
  ib0v  = initialValues['ib-0']['value'];
  ib0n  = initialValues['ib-0']['name'];
  ib90v = initialValues['ib-90']['value'];
  ib90n = initialValues['ib-90']['name'];

  if (initialValues['dp']) {
    dpv   = initialValues['dp']['value'];
    dpn   = initialValues['dp']['name'];
    //fb0v  = initialValues['fb-0']['value'];
    //fb0n  = initialValues['fb-0']['name'];
    fb90v = initialValues['fb-90']['value'];
    fb90n = initialValues['fb-90']['name'];
    d     = spv.distanceTo(dpv);
    dkm   = d/1000;
    dkm   = Math.round(dkm * 100)/100;
  }

  var result = await createHeader({outFormat: outFormat});

  result = await createPoint({outFormat: outFormat, result: result, id: 'sourcePoint', name: spn, description: spn, values: [spv.lon, spv.lat, 0]});
  if (initialValues['dp']) {
    result = await createPoint({outFormat: outFormat, result: result, id: 'destinationPoint', name: dpn, description: dpn, values: [dpv.lon, dpv.lat, 0]});
  }

  width = 16;
  color = [255, 0, 0, 200];
  materialType = 'polylineGlow';

  coords = [];
  if (initialValues['dp']) {
    name = spn + ' - ' + dpn;
    description = 'Distance: ' + dkm + ' km<br>Bearing: ' + ib0n;
    coords.push(spv.lon, spv.lat, 0);
    coords.push(dpv.lon, dpv.lat, 0);
  } else {
    name = spn +  ' - circle';
    description = 'Bearing: ' + ib0n;
    coords = greatCirclePoints(spv, 0, ib0v, 100000);
    coords.push(spv.lon, spv.lat, 0);
  }

  result = await createPolyline({outFormat: outFormat, result: result, id: 'sp-circle', name: name, description: description, values: coords, linewidth: width, color: color, materialType: materialType});

  if (initialValues['dp']) {
    name = spn + ' - ' + dpn + ' - circle';
    description = spn + ' - ' + dpn + ' - closing circle';
    width = 12;
    color = [255, 255, 0, 200];
    materialType = 'polylineGlow';

    coords = [];
    coords = greatCirclePoints(spv, d, ib0v, 100000);
    coords.push(spv.lon, spv.lat, 0);

    result = await createPolyline({outFormat: outFormat, result: result, id: 'sp-dp-circle', name: name, description: description, values: coords, linewidth: width, color: color, materialType: materialType});
  }

  name = spn + ' + 90 degrees';
  description = 'Bearing: ' + ib90n;
  width = 6;
  color = [255, 0, 255, 200];

  coords = [];
  coords = greatCirclePoints(spv, 0, ib90v, 100000);
  coords.push(spv.lon, spv.lat, 0);

  result = await createPolyline({outFormat: outFormat, result: result, id: 'sp-90-circle', name: name, description: description, values: coords, linewidth: width, color: color});

  if (initialValues['dp']) {
    name = dpn + ' + 90 degrees' ;
    description = 'Bearing: ' + fb90n;
    width = 4;
    color = [0, 255, 255, 200];

    coords = [];
    coords = greatCirclePoints(dpv, 0, fb90v, 100000);
    coords.push(dpv.lon, dpv.lat, 0);

    result = await createPolyline({outFormat: outFormat, result: result, id: 'dp-90-circle', name: name, description: description, values: coords, linewidth: width, color: color});
  }

  result = await createFooter({outFormat: outFormat, result: result});

  return result;

}
