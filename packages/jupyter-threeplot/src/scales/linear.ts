// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  scaleLinear, InterpolatorFactory
} from 'd3-scale';

import * as d3Interpolate from 'd3-interpolate';

import {
  JUPYTER_EXTENSION_VERSION
} from '../version';

import {
  IInitializeOptions
} from '../base';

import {
  ScaleModel
} from './scale';


function functionName(fun: Function) {
  let ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}

/**
 * TODO: Docstring
 */
export
class LinearScaleModel extends ScaleModel {
  defaults() {
    return {...super.defaults(),
      _model_name: LinearScaleModel.model_name,

      domain: [0, 1],
      range: [0, 1],

      interpolator: 'interpolate',
      clamp: false,
    };
  }

  constructObject(): any {
    return scaleLinear();
  }

  syncToObject() {
    let interpolatorName = this.get('interpolator');
    let interpolator = (d3Interpolate as any)[interpolatorName] as InterpolatorFactory<number, number>;
    this.obj.domain(this.get('domain'))
      .range(this.get('range'))
      .interpolate(interpolator)
      .clamp(this.get('clamp'));
  }

  syncToModel(toSet: Backbone.ObjectHash) {
    toSet['domain'] = this.obj.domain();
    toSet['range'] = this.obj.range();
    toSet['clamp'] = this.obj.clamp();
    let interpolator = this.obj.interpolate() as InterpolatorFactory<number, number>;
    toSet['interpolator'] = functionName(interpolator);
    super.syncToModel(toSet);
  }

  static serializers = {
      ...ScaleModel.serializers,
      // Add any extra serializers here
    }

  static model_name = 'LinearScaleModel';
}
