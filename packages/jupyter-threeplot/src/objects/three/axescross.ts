// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  ScaleContinuousNumeric
} from 'd3-scale';

import * as THREE from 'three';

import {
  IAxisStyle
} from '../common';

import {
  getScaleDomainEpsilon, createLabel, getGridTripletBounds,
  N_MAJOR_TICKS, N_MINOR_TICKS, LABEL_RELATIVE_OFFSET
} from './common';

import {
  Ticks
} from './ticks';


const axisGeometry: THREE.BufferGeometry = new THREE.BufferGeometry()
axisGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0, 1,0,0]), 3));


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


export
function createAxesCross(
    scales: ScaleContinuousNumeric<number, number>[],
    styles: IAxisStyle[],
    parentMaterial: THREE.LineBasicMaterial): THREE.Group {

  const bounds = getGridTripletBounds(scales);
  const minSize = Math.min(...bounds.size.toArray());
  const result = new THREE.Group();
  const axes = [];
  for (let i=0; i < 3; ++i) {
    const scale = scales[i];
    const style = styles[i];
    const axis = axisFromScale(scale, style, parentMaterial, minSize);
    if (i === 1) {
      axis.rotateZ(0.5 * Math.PI);
      axis.rotateX(0.5 * Math.PI);
    } else if (i === 2) {
      axis.rotateY(-0.5 * Math.PI);
      axis.rotateX(Math.PI);
    }
    result.add(axis);
  }

  return result;
}

export
function axisFromScale(
    scale: ScaleContinuousNumeric<number, number>,
    style: IAxisStyle,
    parentMaterial: THREE.LineBasicMaterial,
    scaleFactor: number,
    ): THREE.Group {
  let material = parentMaterial;
  if (style.line_color || style.line_width) {
    material = new THREE.LineBasicMaterial({
      color: style.line_color || parentMaterial.color.getHex(),
      linewidth: style.line_width || parentMaterial.linewidth,
    });
  }
  let result = new THREE.Group();
  // Add axis:
  result.add(new THREE.Line(axisGeometry, material));

  // Add tick markers:
  const ticks = {
    minor: scale.ticks(N_MINOR_TICKS),
    major: scale.ticks(N_MAJOR_TICKS),
  };
  const tickStyle = {
    minor: style.minor_tick_format,
    major: style.major_tick_format,
  }

  const tickVector = new THREE.Vector3();
  const eps = getScaleDomainEpsilon(scale);
  for (const which of ['minor', 'major'] as ('minor' | 'major')[]) {
    const tickPositions: number[] = [];
    switch (tickStyle[which].direction) {
      case 'in':
        tickVector.set(0, 0, tickStyle[which].tick_length);
        break;
      case 'out':
        tickVector.set(0, 0, -tickStyle[which].tick_length);
        break;
      default:
        throw new Error(`Invalid tick direction: ${tickStyle[which].direction}`);
    }

    for (const tick of ticks[which]) {
      // Skip minor ticks which are also major ticks
      if (which === 'minor' && containsApproximate(ticks['major'], tick, eps)) {
        continue;
      }
      tickPositions.push(tick, 0, 0);
    }
    result.add(new Ticks(tickPositions, tickVector, material));
    result.add(new Ticks(tickPositions, tickVector, material));
  }

  // Add major tick labels:
  const tickFormat = scale.tickFormat(N_MAJOR_TICKS);
  const tick_labels = [];
  let labelTickOffset = 0.03;
  if (tickStyle['major'].direction === 'out') {
    labelTickOffset += Math.max(
      tickStyle['major'].tick_length,
      tickStyle['minor'].tick_length);
  }
  for (let tick of ticks['major']) {
    const sprite = createLabel(tickFormat(tick), style.major_tick_format);
    sprite.position.setX(tick);
    sprite.position.setZ(- (LABEL_RELATIVE_OFFSET * scaleFactor + labelTickOffset));
    sprite.scale.multiplyScalar(scaleFactor);
    tick_labels.push(sprite);
  }
  const labelGroup = new THREE.Group()
  labelGroup.add(...tick_labels);
  result.add(labelGroup);

  return result;
}

