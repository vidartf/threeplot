import * as THREE from 'three';

import {
  scaleLinear, ScaleLinear, ScaleContinuousNumeric
} from 'd3-scale';

import {
  IGridStyle
} from '../common';


export
function createTriRectGrids(
  scales: ScaleContinuousNumeric<number, number>[],
  styles: IGridStyle[],
  parentMaterial: THREE.LineBasicMaterial
): THREE.Group {
  let result = new THREE.Group();
  return result;
}
