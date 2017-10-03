// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  scaleLinear, ScaleContinuousNumeric
} from 'd3-scale';

import * as THREE from 'three';

import {
  IAxisStyle
} from '../common';



const axisGeometry: THREE.BufferGeometry = new THREE.BufferGeometry()
axisGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0, 1,0,0]), 3));

function getScaleDomainEpsilon(scale: ScaleContinuousNumeric<number, number>, relativePrecision=1e-7): number {
  let domain = scale.domain();
  return (Math.max(...domain) - Math.min(...domain)) * relativePrecision;
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


export
function createAxesCross<TDomain>(
    scales: ScaleContinuousNumeric<number, TDomain>[],
    styles: IAxisStyle[],
    parentMaterial: THREE.LineBasicMaterial): THREE.Group {

  let result = new THREE.Group();
  let axes = [];
  for (let i=0; i < 3; ++i) {
    let scale = scales[i];
    let style = styles[i];
    let axis = axisFromScale(scale, style, parentMaterial);
    if (i === 1) {
      axis.rotateZ(0.5 * Math.PI);
    } else if (i === 2) {
      axis.rotateY(-0.5 * Math.PI);
    }
    result.add(axis);
  }

  return result;
}

export
function axisFromScale<TDomain>(
    scale: ScaleContinuousNumeric<number, TDomain>,
    style: IAxisStyle,
    parentMaterial: THREE.LineBasicMaterial): THREE.Group {
  let material = parentMaterial;
  if (style.line_color || style.line_width) {
    material = new THREE.LineBasicMaterial({
      color: style.line_color || parentMaterial.color.getHex(),
      linewidth: style.line_width || parentMaterial.linewidth,
    });
  }
  let result = new THREE.Group();
  // TODO: Add tick markers

  result.add(new THREE.Line(axisGeometry, material));
  return result;
}

