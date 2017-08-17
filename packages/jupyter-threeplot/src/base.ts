// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel
} from '@jupyter-widgets/base';

import {
  JUPYTER_EXTENSION_VERSION
} from './version';




export
class BaseModel extends WidgetModel {
  defaults() {
    return {...super.defaults(),
      _model_name: BaseModel.model_name,
      _model_module: BaseModel.model_module,
      _model_module_version: BaseModel.model_module_version,
      _view_name: BaseModel.view_name,
      _view_module: BaseModel.view_module,
      _view_module_version: BaseModel.view_module_version,
    };
  }

  static serializers = WidgetModel.serializers;

  static model_name: string;    // Base model should not be instantiated directly
  static model_module = 'jupyter-threeplot';
  static model_module_version = JUPYTER_EXTENSION_VERSION;
  static view_name = null;
  static view_module = null;
  static view_module_version = JUPYTER_EXTENSION_VERSION;
}
