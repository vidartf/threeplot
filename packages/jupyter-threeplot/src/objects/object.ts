// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  JUPYTER_EXTENSION_VERSION
} from '../version';


import {
  BlackboxModel
} from 'jupyter-threejs';

//import pythreejs = require('jupyter-threejs');

/**
 * TODO: Docstring
 */
export
abstract class ObjectModel extends BlackboxModel {
  defaults() {
    return {...super.defaults(),
      _model_name: ObjectModel.model_name,
    };
  }

  static serializers = {
      ...BlackboxModel.serializers,
      // Add any extra serializers here
    }

  static model_name = 'ObjectModel';
}
