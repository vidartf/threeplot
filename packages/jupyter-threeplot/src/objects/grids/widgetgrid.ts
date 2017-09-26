// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  WidgetModel, ManagerBase, unpack_models
} from '@jupyter-widgets/base';

import {
  scaleLinear, ScaleLinear, ScaleContinuousNumeric
} from 'd3-scale';

import * as THREE from 'three';

import {
  ISerializerMap, ScaleModel
} from 'jupyter-scales';

import {
  ThreeModel, computeBoundingBox
} from 'jupyter-threejs';

import {
  JUPYTER_EXTENSION_VERSION
} from '../../version';

import {
  ObjectModel
} from '../object';

import {
  IGridStyle, IGridlineStyle, N_MINOR_TICKS, N_MAJOR_TICKS
} from './common';

import {
  gridTriplet
} from './threegrid';




export
function defaultGridlineStyle(options?: Partial<IGridlineStyle>): IGridlineStyle {
  return {
    label_format: '',
    line_width: null,
    line_color: null,
    ...options,
  }
}

export
function defaultGridStyle(options?: Partial<IGridStyle>): IGridStyle {
  return {
    line_color: null,
    line_width: null,
    minor_style: defaultGridlineStyle({line_color: '#d9d9d9', line_width: 1}),
    major_style: defaultGridlineStyle({line_color: '#a6a6a6', line_width: 2}),
    label: '',
    ...options,
  }
}




/**
 * TODO: Docstring
 */
export
class GridCrossModel<TDomain> extends ObjectModel {
  defaults() {
    return {...super.defaults(),
      _model_name: GridCrossModel.model_name,

      scales: null,
      grid_styles: [defaultGridStyle(), defaultGridStyle(), defaultGridStyle()],

      autosize_target: null,
      autosize_axes: true,
      tight: false,
      line_color: 'black',
      line_width: 1.0,
    };
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();

    this.three_nested_properties.push('scales');
    this.three_properties.push('autosize_target');
  }

  setupListeners(): void {
    let target = this.get('autosize_target');
    if (target) {
        this.listenTo(target, 'change', this.onAutosizeTargetChange);
        this.listenTo(target, 'childchange', this.onAutosizeTargetChange);
    }

    // make sure to (un)hook listeners when child points to new object
    this.on('change:autosize_target', function(model: ThreeModel, value: any, options: any) {
      var prevModel = this.previous('autosize_target');
      var currModel = value;
      if (prevModel) {
        this.stopListening(prevModel);
      }
      if (currModel) {
        this.listenTo(currModel, 'change', this.onAutosizeTargetChange);
        this.listenTo(currModel, 'childchange', this.onAutosizeTargetChange);
      }
      this.onAutosizeTargetChange(model, options);
    }, this);
    super.setupListeners();
  }

  onAutosizeTargetChange(model: ThreeModel, options: any): void {
    let target = this.get('autosize_target');
    if (target) {
      let box = computeBoundingBox(target.obj);
      if (box.isEmpty()) {
        this.sceneSize = null;
      } else {
        this.sceneSize = [
          [box.min.x, box.max.x],
          [box.min.y, box.max.y],
          [box.min.z, box.max.z],
        ];
      }
    } else {
      this.sceneSize = null;
    }
  }

  onChildChanged(model: ThreeModel, options: any): void {
    this.obj.remove.apply(this.obj, this.obj.children);
    this.obj.add(this.createGridTripletFromModel());

    super.onChildChanged(model, options);
  }

  onChange(model: ThreeModel, options: any): void {
    super.onChange(model, options);
    this.obj.remove.apply(this.obj, this.obj.children);
    this.obj.add(this.createGridTripletFromModel());
  }

  constructThreeObject(): Promise<any> {

    let result = new THREE.Group();

    this.onAutosizeTargetChange(this, null);

    let grids = this.createGridTripletFromModel();
    result.add(grids);

    return Promise.resolve(result);
  }

  /**
   * Create grid scales.
   *
   * Grid scales are copies of the model scales, but whos domain/range
   * can autoscale with the scene.
   *
   * @param {(ScaleContinuousNumeric<number, TDomain | number>[])} scales
   * @memberof GridCrossModel
   */
  createGridScales(scales: ScaleContinuousNumeric<number, TDomain | number>[]): void {

    /*
    Note about auto-sizing axes scales:

    Axes scales --ref--> actual scales
                --ref--> scene size
                -------> autosize flag
                -------> autosize min/max clamps (actual scales domain/range?)
    */

    this.gridScales = scales.map(scale => scale.copy());
    let autosize_axes = this.get('autosize_axes') as boolean | boolean[];
    for (let i=0; i < this.gridScales.length; ++i) {
      let scale = this.gridScales[i];
      let autoscale = Array.isArray(autosize_axes) ? autosize_axes[i] : autosize_axes;
      if (autoscale && this.sceneSize) {
        let size = this.sceneSize[i];
        scale.domain(size);
        if (!this.get('tight')) {
          scale.nice(N_MINOR_TICKS);
          size = scale.domain();
        }
        if (scales[i].clamp()) {
          let range = scales[i].range();
          size = [Math.max(size[0], range[0]),
                  Math.min(size[1], range[1])];
        }
        scale.range(size);
      }
    }
  }

  createGridTripletFromModel(): THREE.Object3D {
    let material = new THREE.LineBasicMaterial({
      color: this.get('line_color'),
      linewidth: this.get('line_width'),
    });

    let scales: ScaleContinuousNumeric<number, TDomain | number>[];
    if (this.get('scales')) {
      scales = (this.get('scales') as ScaleModel[]).map(scale => scale.obj);
    } else {
      scales = [scaleLinear(), scaleLinear(), scaleLinear()];
    };

    this.createGridScales(scales);

    let gridStyles = this.get('grid_styles');
    return gridTriplet(this.gridScales, gridStyles, material);
  }

  gridScales: ScaleContinuousNumeric<number, TDomain | number>[];
  sceneSize: number[][] | null;

  static serializers: ISerializerMap = {
      ...GridCrossModel.serializers,
      scales: { deserialize: unpack_models },
      autosize_target: { deserialize: unpack_models },
    }

  static model_name = 'GridCrossModel';
}

