// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  JUPYTER_EXTENSION_VERSION
} from './version';

import {
  ObjectModel
} from './object';



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

  static serializers = {
      ...AxesCrossModel.serializers,
      // Add any extra serializers here
    }

  static model_name = 'AxesCrossModel';
}
