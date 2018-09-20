import * as THREE from 'three';

import {
  scaleLinear, ScaleContinuousNumeric
} from 'd3-scale';

import {
  IGridStyle
} from '../common';

import {
  MinorMajorDoublet, getScaleDomainEpsilon, containsApproximate,
  createLabel, gridFromGeometries, getGridTripletBounds,
  LABEL_RELATIVE_OFFSET, N_MAJOR_TICKS, N_MINOR_TICKS
} from './common';


const UNIT_VECTORS = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];


export
type Mode = 'min' | 'max' | 'minmax' | 'zero';

function getMinMax(planeIndex: number, camera: THREE.Camera): 'min' | 'max' {
  let cameraDirection = new THREE.Vector3();
  let planeNormal = UNIT_VECTORS[2-planeIndex];
  camera.getWorldDirection(cameraDirection);
  const dot = planeNormal.dot(cameraDirection);
  if (dot > 0) {
    return 'max';
  } else {
    return 'min';
  }
}

export
function applyModes(
  triplet: THREE.Group,
  modes: Mode[],
  camera: THREE.Camera | null,
  scales: ScaleContinuousNumeric<number, number>[]
): void {
  const bounds = getGridTripletBounds(scales);
  for (let i=0; i<3; ++i) {
    let mode = modes[i];
    if (mode === 'minmax') {
      if (camera === null) {
        throw new Error('Camera need to be given for minmax mode!');
      }
      mode = getMinMax(i, camera);
    }
    const iNormal = 2 - i;
    let value: number;
    if (mode === 'zero') {
      value = 0;
    } else if (mode === 'min') {
      value = bounds.offset.getComponent(iNormal);
    } else if (mode === 'max') {
      value = bounds.offset.getComponent(iNormal) + bounds.size.getComponent(iNormal);
    } else {
      throw new Error(`Invalid mode: ${mode}`);
    }
    // Set grid position:
    triplet.children[i].position.setComponent(iNormal, value);
    // Set label group position:
    triplet.children[i+3].position.setComponent(iNormal, value);
  }
}



/**
 * Create grid lines for a single scale.
 *
 * The grid will start at given offset, with each line extending along the
 * lineVector. The lines will be spaced acording to the scale's tick positions
 * along the scaleUnitVector.
 *
 * @param {ScaleContinuousNumeric<number, number>} scale: d3-scale to use for ticks
 * @param {THREE.Vector3} offset: the starting point of the grid
 * @param {THREE.Vector3} scaleUnitVector: unit vector pointing along the scale direction
 * @param {THREE.Vector3} lineVector: the vector describing the grid line (direction and length)
 * @returns {minorMajorDoublet<THREE.BufferGeometry>}
 */
export
function createParallelLinesGeometry(
  scale: ScaleContinuousNumeric<number, number>,
  offset: THREE.Vector3,
  scaleVector: THREE.Vector3,
  lineVector: THREE.Vector3
): MinorMajorDoublet<THREE.BufferGeometry> {

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

export
function createRectLineGeometries(
  scales: ScaleContinuousNumeric<number, number>[],
  axes: number[],
  offset: THREE.Vector3,
  size: THREE.Vector3
): MinorMajorDoublet<THREE.BufferGeometry>[] {
  const geometries: MinorMajorDoublet<THREE.BufferGeometry>[] = [];
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
      createParallelLinesGeometry(
        scales[axes[i]],
        offset,
        scaleVector,
        lineVector)
      );
  }
  return geometries;
}

function labelRectAxesOffsets(
  offset: THREE.Vector3,
  size: THREE.Vector3,
  axes: number[]
): THREE.Vector3 {
  let minSize = Math.min(...size.toArray());
  //const i = axes.indexOf(0) === -1 ? 0 : axes.indexOf(1) === -1 ? 1 : 2;
  const i = axes[0];
  const ret = new THREE.Vector3(
    i !== 0 ? offset.x : 0,
    i !== 1 ? offset.y : 0,
    i !== 2 ? offset.z : 0);
  const j = axes[1];
  ret.setComponent(j, ret.getComponent(j) + size.getComponent(j) + LABEL_RELATIVE_OFFSET * minSize);
  return ret;
}

/**
 * Create three grids (XY/XZ/YZ) from three scale/style pairs.
 */
export
function createGridTriplet(
  scales: ScaleContinuousNumeric<number, number>[],
  styles: IGridStyle[],
  parentMaterial: THREE.LineBasicMaterial
): THREE.Group {
  // TODO: Take optional material cache?
  const tripletIndices = [[0, 1], [2, 0], [1, 2]];  // XY, ZX, YZ
  const gridOffset = new THREE.Vector3();
  const bounds = getGridTripletBounds(scales);
  const grids = [];
  let geometries: MinorMajorDoublet<THREE.BufferGeometry>[];
  for (let axes of tripletIndices) {
    const iNormal = axes.indexOf(0) === -1 ? 0 : axes.indexOf(1) === -1 ? 1 : 2;
    gridOffset.copy(bounds.offset).setComponent(iNormal, 0);

    geometries = createRectLineGeometries(scales, axes, gridOffset, bounds.size);
    let grid = gridFromGeometries(geometries, styles[tripletIndices.indexOf(axes)], parentMaterial);
    grids.push(grid);
  }

  // Add major tick labels:
  const tick_label_groups = [];
  let minSize = Math.min(...bounds.size.toArray());
  for (let axes of tripletIndices) {
    const iNormal = axes.indexOf(0) === -1 ? 0 : axes.indexOf(1) === -1 ? 1 : 2;
    gridOffset.copy(bounds.offset).setComponent(iNormal, 0);
    let scale = scales[axes[0]];
    let tickFormat = scale.tickFormat(N_MAJOR_TICKS);
    const tick_labels = [];
    for (let tick of scale.ticks(N_MAJOR_TICKS)) {
      let sprite = createLabel(tickFormat(tick), styles[axes[0]].major_style);
      sprite.position.addScaledVector(UNIT_VECTORS[axes[0]], tick);
      sprite.scale.multiplyScalar(minSize);
      tick_labels.push(sprite);
    }
    let offset = labelRectAxesOffsets(gridOffset, bounds.size, axes);
    const labelGroup = new THREE.Group()
    labelGroup.position.copy(offset);
    labelGroup.add(...tick_labels);
    tick_label_groups.push(labelGroup);
  }

  let result = new THREE.Group();
  result.add(...grids, ...tick_label_groups);
  return result;
}


namespace Private {

  export
  const internalNormalizer = scaleLinear().clamp(true);

}
