// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  JUPYTER_EXTENSION_VERSION
} from '../version';

import {
  ISerializerMap
} from '../base';

import {
  ObjectModel
} from './object';

import THREE = require('three');



/**
 * TODO: Docstring
 */
export
class AxesCrossModel extends ObjectModel {
  defaults() {
    return {...super.defaults(),
      _model_name: AxesCrossModel.model_name,
    };
  }

  constructThreeObject(): Promise<any> {

      let result = new THREE.Group();
      let geom = new THREE.PlaneBufferGeometry(10, 10, 1, 1);
      let mat = new THREE.MeshBasicMaterial();
      let mesh = new THREE.Mesh(geom , mat);
      result.add(mesh);

      return Promise.resolve(result);

  }

  static serializers: ISerializerMap = {
      ...AxesCrossModel.serializers,
      // Add any extra serializers here
    }

  static model_name = 'AxesCrossModel';
}
