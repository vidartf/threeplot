
import * as THREE from 'three';

import {
  scaleLinear, ScaleLinear, ScaleContinuousNumeric
} from 'd3-scale';

import {
  IGridStyle, IGridlineStyle, IHasLabelStyle
} from '../common';


export
const LABEL_RELATIVE_OFFSET = 0.07;

export
const N_MAJOR_TICKS = 3;

export
const N_MINOR_TICKS = 10;

/**
 * Get a value that is small compared to the domain of a scale.
 *
 * @template TDomain
 * @param {ScaleContinuousNumeric<number, TDomain>} scale
 * @param {number} [relativePrecision=1e-7]
 * @returns {number}
 */
export
function getScaleDomainEpsilon<TDomain>(scale: ScaleContinuousNumeric<number, TDomain>,
                                        relativeSize=1e-7):
                                        number {
  let domain = scale.domain();
  return (Math.max(...domain) - Math.min(...domain)) * relativeSize;
}


/**
 * Wether a sequence of numbers contains a specific value with given precision.
 */
export
function containsApproximate(sequence: number[], value: number, precision: number): boolean {
  for (let candidate of sequence) {
    if (Math.abs(value - candidate) < precision) {
      return true;
    }
  }
  return false;
}

export
interface IBounds { offset: THREE.Vector3, size: THREE.Vector3 };

export
function getGridTripletBounds<TDomain>(scales: ScaleContinuousNumeric<number, TDomain>[]): IBounds {
  let mins = scales.map(scale => {
    return Math.min(...scale.range());
  });
  let maxs = scales.map(scale => {
    return Math.max(...scale.range());
  });
  let offset = new THREE.Vector3(mins[0], mins[1], mins[2]);
  let size = (new THREE.Vector3(maxs[0], maxs[1], maxs[2])).sub(offset);
  return {offset, size};
}

export
interface MinorMajorDoublet<T> {
  minor: T,
  major: T
}

export
function gridLineMaterialFromStyle(style: IGridStyle,
                                   parentMaterial: THREE.LineBasicMaterial):
                                   MinorMajorDoublet<THREE.LineBasicMaterial> {
  let major = parentMaterial;
  let minor = parentMaterial;
  if (style.major_style.line_color === null &&
      style.major_style.line_width === null &&
      style.minor_style.line_color === null &&
      style.minor_style.line_width === null) {
    // Major and minor can share material
    if (style.line_color || style.line_width) {
      major = minor = new THREE.LineBasicMaterial({
        color: style.line_color || parentMaterial.color.getHex(),
        linewidth: style.line_width || parentMaterial.linewidth,
      });
    }
  } else {
    let majorLineColor = style.major_style.line_color || style.line_color;
    let majorLineWidth = style.major_style.line_width || style.line_width;
    let minorLineColor = style.minor_style.line_color || style.line_color;
    let minorLineWidth = style.minor_style.line_width || style.line_width;
    if (majorLineColor || majorLineWidth) {
      major = new THREE.LineBasicMaterial({
        color: majorLineColor || parentMaterial.color.getHex(),
        linewidth: majorLineWidth || parentMaterial.linewidth,
      });
    }
    if (minorLineColor || minorLineWidth) {
      minor = new THREE.LineBasicMaterial({
        color: minorLineColor || parentMaterial.color.getHex(),
        linewidth: minorLineWidth || parentMaterial.linewidth,
      });
    }
  }
  return { minor, major };
}

export
function createLabel(text: string, style: IHasLabelStyle): THREE.Sprite {
  const fontFace = 'Arial';
  const size = 36;
  const color = style.label_color || 'black';

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  // Pad size with two to avoid edge artifacts when interpolating
  canvas.height = size + 2;
  const font = 'Normal ' + size + 'px ' + fontFace;
  context.font = font;

  var metrics = context.measureText(text);
  var textWidth = Math.ceil(metrics.width) + 2;
  canvas.width = textWidth;

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = color;
  // Must set the font again for the fillText call
  context.font = font;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  let texture = new THREE.CanvasTexture(canvas);

  let material = new THREE.SpriteMaterial({ map: texture });
  let sprite = new THREE.Sprite(material);
  sprite.scale.set(0.1 * canvas.width / canvas.height, 0.1, 1.0);
  return sprite;
}


/**
 * Will create a flat, rectangular grid from a pair of scales and styles.
 *
 * Styles will be applied per grid (as opposed to per axis). I.e. style 0
 * will be applied to geometry doublet 0.
 */
export
function gridFromGeometries<TDomain>(geometries: MinorMajorDoublet<THREE.BufferGeometry>[],
                                     style: IGridStyle,
                                     parentMaterial: THREE.LineBasicMaterial): THREE.Object3D {

  // First, create materials:
  let material = gridLineMaterialFromStyle(style, parentMaterial);

  let grids: THREE.Group[] = [];
  for (let i=0; i < geometries.length; ++i) {
    let grid = new THREE.Group();
    grid.add(new THREE.LineSegments(geometries[i].minor, material.minor));
    grid.add(new THREE.LineSegments(geometries[i].major, material.major));
    grids.push(grid);
  }

  let result = new THREE.Group();
  result.add(...grids);
  return result;
}
