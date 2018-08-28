// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterLabPlugin, JupyterLab
} from '@jupyterlab/application';

import {
  Token
} from '@phosphor/coreutils';

import * as yourCode from 'jupyter-threeplot';

import {
  INBWidgetExtension
 } from "@jupyter-widgets/base";


const EXTENSION_ID = 'jupter.extensions.threeplot'


/**
 * The token identifying the JupyterLab plugin.
 */
export
const IThreePlotExtension = new Token<IThreePlotExtension>(EXTENSION_ID);

/**
 * The type of the provided value of the plugin in JupyterLab.
 */
export
interface IThreePlotExtension {
};


/**
 * The notebook diff provider.
 */
const threePlotProvider: JupyterLabPlugin<IThreePlotExtension> = {
  id: EXTENSION_ID,
  requires: [INBWidgetExtension],
  activate: activateWidgetExtension,
  autoStart: true
};

export default threePlotProvider;


/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: JupyterLab, widgetsManager: INBWidgetExtension): IThreePlotExtension {
  widgetsManager.registerWidget({
      name: 'jupyter-threeplot',
      version: yourCode.JUPYTER_EXTENSION_VERSION,
      exports: yourCode
    });
  return {};
}
