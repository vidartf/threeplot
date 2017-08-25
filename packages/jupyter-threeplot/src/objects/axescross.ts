// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  WidgetModel, ManagerBase, unpack_models
} from '@jupyter-widgets/base';

import {
  scaleLinear, ScaleLinear
} from 'd3-scale';

import * as THREE from 'three';

import {
  ISerializerMap
} from 'jupyter-scales';

import {
  JUPYTER_EXTENSION_VERSION
} from '../version';

import {
  ObjectModel
} from './object';



export
const N_MAJOR_TICKS = 3;

export
const N_MINOR_TICKS = 10;


export
interface ITickStyle {
  label_format: string,
  line_color: string | null,
  line_width: number | null,
  tick_length: number,
}

export
interface IAxisStyle {
  label: string,
  line_color: string | null,
  line_width: number | null,
  minor_tick_format: ITickStyle,
  major_tick_format: ITickStyle,
}


function defaultTickStyle(options?: Partial<ITickStyle>): ITickStyle {
  return {
    label_format: '',
    line_color: null,
    line_width: null,
    tick_length: 1.0,
    ...options,
  }
}

function defaultAxisStyle(options?: Partial<IAxisStyle>): IAxisStyle {
  return {
    label: '',
    line_color: null,
    line_width: null,
    minor_tick_format: defaultTickStyle(),
    major_tick_format: defaultTickStyle(),
    ...options,
  }
}


function getScaleDomainEpsilon(scale: ScaleLinear<number, number>, relativePrecision=1e-7): number {
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


/**
 * TODO: Docstring
 */
export
class AxesCrossModel extends ObjectModel {
  defaults() {
    return {...super.defaults(),
      _model_name: AxesCrossModel.model_name,

      scales: null,
      axes_styles: [defaultAxisStyle({label: 'x', line_color: 'red'}),
                    defaultAxisStyle({label: 'y', line_color: 'green'}),
                    defaultAxisStyle({label: 'z', line_color: 'blue'})],


      line_color: 'black',
      line_width: 1.0,
    };
  }

  constructThreeObject(): Promise<any> {

      let result = new THREE.Group();
      let material = new THREE.LineBasicMaterial({
        color: this.get('line_color'),
        linewidth: this.get('line_width'),
      });

      let scales: ScaleLinear<number, number>[] = [];
      if (this.get('scales')) {
        for (let scale of this.get('scales')) {
          scales.push(scale.obj);
        }
      } else {
        scales = [scaleLinear(), scaleLinear(), scaleLinear()]
      };

      let axesStyles = this.get('axes_styles');
      let axes = [];
      for (let i=0; i < 3; ++i) {
        let scale = scales[i];
        let style = axesStyles[i];
        let axis = AxesCrossModel.axisFromScale(scale, style, material);
        if (i === 1) {
          axis.rotateZ(0.5 * Math.PI);
        } else if (i === 2) {
          axis.rotateY(-0.5 * Math.PI);
        }
        result.add(axis);
      }

      return Promise.resolve(result);
  }

  static axisFromScale(scale: ScaleLinear<number, number>, style: IAxisStyle, parentMaterial: THREE.LineBasicMaterial): THREE.Object3D {
    let material = parentMaterial;
    if (style.line_color || style.line_width) {
      material = new THREE.LineBasicMaterial({
        color: style.line_color || parentMaterial.color.getHex(),
        linewidth: style.line_width || parentMaterial.linewidth,
      });
    }
    let result = new THREE.Group();
    // TODO: Add tick markers

    result.add(new THREE.Line(AxesCrossModel.axisGeometry, material));
    return result;
  }

  static serializers: ISerializerMap = {
      ...AxesCrossModel.serializers,
      scales: { deserialize: unpack_models },
    }

  static model_name = 'AxesCrossModel';
}


export
namespace AxesCrossModel {

  export
  const axisGeometry: THREE.BufferGeometry = new THREE.BufferGeometry()
  axisGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0, 1,0,0]), 3));

}
