/** All kind of non-geographic tools
 * @module  tools
 * @author  Jörg Roth
 */

/**
 * converts RGBA-values to kml-colorcode.
 * @param {int} r - Value for red
 * @param {int} g - Value for green
 * @param {int} b - Value for blue 
 * @param {int} a - Value for alpha
 * @return {string} kml-colorcode
 */
export function RGBToHex(r,g,b,a) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);
  a = a.toString(16);

  if (r.length == 1)
    r = '0' + r;
  if (g.length == 1)
    g = '0' + g;
  if (b.length == 1)
    b = '0' + b;
  if (a.length == 1)
    a = '0' + a;

  return a + b + g + r;
}
