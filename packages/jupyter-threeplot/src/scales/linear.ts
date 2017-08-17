// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  JUPYTER_EXTENSION_VERSION
} from './version';

import {
  ScaleModel
} from './scale';



/**
 * TODO: Docstring
 */
export
class LinearScaleModel extends ScaleModel {
  defaults() {
    return {...super.defaults(),
      _model_name: ScaleModel.model_name,
    };
  }

  static serializers = {
      ...ScaleModel.serializers,
      // Add any extra serializers here
    }

  static model_name = 'LinearScaleModel';
}
