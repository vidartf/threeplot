

import * as THREE from 'three';

import {
  scaleLinear, ScaleLinear, ScaleContinuousNumeric
} from 'd3-scale';

import {
  IGridStyle, IGridlineStyle, N_MAJOR_TICKS, N_MINOR_TICKS
} from './common';


/**
 * Get a value that is small compared to the domain of a scale.
 *
 * @template TDomain
 * @param {ScaleContinuousNumeric<number, TDomain>} scale
 * @param {number} [relativePrecision=1e-7]
 * @returns {number}
 */
function getScaleDomainEpsilon<TDomain>(scale: ScaleContinuousNumeric<number, TDomain>,
                                        relativeSize=1e-7):
                                        number {
  let domain = scale.domain();
  return (Math.max(...domain) - Math.min(...domain)) * relativeSize;
}


/**
 * Wether a sequence of numbers contains a specific value with given precision.
 */
function containsApproximate(sequence: number[], value: number, precision: number): boolean {
  for (let candidate of sequence) {
    if (Math.abs(value - candidate) < precision) {
      return true;
    }
  }
  return false;
}


interface IBounds { offset: THREE.Vector3, size: THREE.Vector3 };

export
interface minorMajorDoublet<T> {
  minor: T,
  major: T
}

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
function gridLineMaterialFromStyle(style: IGridStyle,
                                   parentMaterial: THREE.LineBasicMaterial):
                                   minorMajorDoublet<THREE.LineBasicMaterial> {
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

/**
 * Create grid lines for a single scale.
 *
 * The grid will start at given offset, with each line extending along the
 * lineVector. The lines will be spaced acording to the scale's tick positions
 * along the scaleUnitVector.
 *
 * @param {ScaleContinuousNumeric<number, TDomain>} scale: d3-scale to use for ticks
 * @param {THREE.Vector3} offset: the starting point of the grid
 * @param {THREE.Vector3} scaleUnitVector: unit vector pointing along the scale direction
 * @param {THREE.Vector3} lineVector: the vector describing the grid line (direction and length)
 * @returns {minorMajorDoublet<THREE.BufferGeometry>}
 */
export
function gridStraightLineGeometry<TDomain>(scale: ScaleContinuousNumeric<number, TDomain>,
                                       offset: THREE.Vector3,
                                       scaleVector: THREE.Vector3,
                                       lineVector: THREE.Vector3):
                                       minorMajorDoublet<THREE.BufferGeometry> {

  const ticks = {
    minor: scale.ticks(N_MINOR_TICKS),
    major: scale.ticks(N_MAJOR_TICKS),
  };
  Private.internalNormalizer.domain(scale.range());
  const geometries = [];
  const eps = getScaleDomainEpsilon(scale);
  const vertexA = new THREE.Vector3();
  const vertexB = new THREE.Vector3();
  for (const which of ['minor', 'major'] as ('minor' | 'major')[]) {
    const vertices: number[] = [];
    const geometry = new THREE.BufferGeometry();

    for (const tick of ticks[which]) {
      // Skip minor ticks which are also major ticks
      if (which === 'minor' && containsApproximate(ticks['major'], tick, eps)) {
        continue;
      }
      const normTick = Private.internalNormalizer(tick);

      vertexA.copy(offset).addScaledVector(scaleVector, normTick);
      vertexB.addVectors(vertexA, lineVector);

      // Push a vertex pair (one line):
      vertices.push(
        vertexA.x, vertexA.y, vertexA.z,
        vertexB.x, vertexB.y, vertexB.z
      );
    }

    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometries.push(geometry);
  }
  return { minor: geometries[0], major: geometries[1] };
}

const ZERO = new THREE.Vector3();

export
function gridRectLineGeometry<TDomain>(scales: ScaleContinuousNumeric<number, TDomain>[],
                                       axes: number[],
                                       offset: THREE.Vector3,
                                       size: THREE.Vector3):
                                       minorMajorDoublet<THREE.BufferGeometry>[] {
  const geometries: minorMajorDoublet<THREE.BufferGeometry>[] = [];
  const lineVector = new THREE.Vector3();
  const scaleVector = new THREE.Vector3();
  for (let i=0; i<2; ++i) {
    scaleVector.set(
      axes[i] == 0 ? size.x : 0,
      axes[i] == 1 ? size.y : 0,
      axes[i] == 2 ? size.z : 0);
    lineVector.set(
      axes[1-i] == 0 ? size.x : 0,
      axes[1-i] == 1 ? size.y : 0,
      axes[1-i] == 2 ? size.z : 0);
    geometries.push(
      gridStraightLineGeometry(
        scales[axes[i]],
        offset,
        scaleVector,
        lineVector)
      );
  }
  return geometries;
}

function labelRectAxesOffsets(bounds: IBounds, axes: number[]): THREE.Vector3 {
  let minSize = Math.min(...bounds.size.toArray());
  const i = axes.indexOf(0) === -1 ? 0 : axes.indexOf(1) === -1 ? 1 : 2;
  const ret = new THREE.Vector3(
    i !== 0 ? bounds.offset.x : 0,
    i !== 1 ? bounds.offset.y : 0,
    i !== 2 ? bounds.offset.z : 0);
  const j = axes[1];
  ret.setComponent(j, ret.getComponent(j) + bounds.size.getComponent(j) + 0.07 * minSize);
  return ret;
}

export
function createLabel(text: string, style: IGridStyle): THREE.Sprite {
  const fontFace = 'Arial';
  const size = 36;
  const color = style.major_style.line_color || style.line_color || 'black';

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
function gridFromGeometries<TDomain>(geometries: minorMajorDoublet<THREE.BufferGeometry>[],
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

/**
 * Create three grids (XY/XZ/YZ) from three scale/style pairs.
 */
export
function gridTriplet<TDomain>(scales: ScaleContinuousNumeric<number, TDomain>[],
                              styles: IGridStyle[],
                              parentMaterial: THREE.LineBasicMaterial):
                              THREE.Object3D {
  // TODO: Take optional material cache?
  const tripletIndices = [[0, 1], [2, 0], [1, 2]];  // XY, ZX, YZ
  const unitVectors = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
  const bounds = getGridTripletBounds(scales);
  const grids = [];
  let geometries: minorMajorDoublet<THREE.BufferGeometry>[];
  // TODO: Introduce grid modes: intersect at low/high end (with switching) or zero
  for (let axes of tripletIndices) {
    geometries = gridRectLineGeometry(scales, axes, bounds.offset, bounds.size);
    let grid = gridFromGeometries(geometries, styles[tripletIndices.indexOf(axes)], parentMaterial);
    //grid.position.copy();
    grids.push(grid);
  }

  const tick_labels = [];
  let minSize = Math.min(...bounds.size.toArray());
  for (let axes of tripletIndices) {
    // Add major tick labels:
    let scale = scales[axes[0]];
    let tickFormat = scale.tickFormat(N_MAJOR_TICKS);
    const vector = new THREE.Vector3();
    for (let tick of scale.ticks(N_MAJOR_TICKS)) {
      let sprite = createLabel(tickFormat(tick), styles[axes[0]]);
      let offset = labelRectAxesOffsets(bounds, axes);
      sprite.position.copy(offset).addScaledVector(unitVectors[axes[0]], tick);
      sprite.scale.multiplyScalar(minSize);
      tick_labels.push(sprite);
    }
  }

  let result = new THREE.Group();
  result.add(...grids, ...tick_labels);
  return result;
}


namespace Private {

  export
  const internalNormalizer = scaleLinear().clamp(true);

}
