// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  JUPYTER_EXTENSION_VERSION
} from './version';

import {
  BaseModel
} from '../base';



/**
 * TODO: Docstring
 */
export
class ScaleModel extends BaseModel {
  defaults() {
    return {...super.defaults(),
      _model_name: ScaleModel.model_name,
    };
  }

  static serializers = {
      ...BaseModel.serializers,
      // Add any extra serializers here
    }

  static model_name = 'ScaleModel';
}
