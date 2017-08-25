// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  // Add any needed widget imports here (or from controls)
} from '@jupyter-widgets/base';

import {
  LinearScaleModel
 } from "jupyter-scales";

import {
  createTestModel
} from '../utils.spec';

import {
  GridCrossModel
} from '../../../src/'


describe('GridCrossModel', () => {

    it('should be createable', () => {
      let model = createTestModel(GridCrossModel);
      expect(model).to.be.an(GridCrossModel);
    });

    it('should be createable with a state', () => {
      let scale_states = [
        { domain: [10, 20]}
      ];
      let scales = scale_states.map(scale_state =>
        createTestModel(LinearScaleModel, scale_state)
      );
      let state = {
        position: [1, 2, 3],
        scales: scales.map(scale => scale.model_id),
        grid_styles: [

        ],
        line_color: 'red',
        line_width: 2.0,
      }
      let model = createTestModel(GridCrossModel, state);
      expect(model).to.be.an(GridCrossModel);
    });

    it('should be createable with a state', () => {
      let state = { position: [1, 2, 3] }
      let model = createTestModel(GridCrossModel, state);
      expect(model).to.be.an(GridCrossModel);
    });

});
