// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  // Add any needed widget imports here (or from controls)
} from '@jupyter-widgets/base';

import {
  createTestModel
} from '../utils.spec';

import {
  AxesCrossModel
} from '../../../src'


describe('AxesCrossModel', () => {

    it('should be createable', () => {
        let model = createTestModel(AxesCrossModel);
        expect(model).to.be.an(AxesCrossModel);
    });

    it('should be createable with a state', () => {
        let state = { position: [1, 2, 3] }
        let model = createTestModel(AxesCrossModel, state);
        expect(model).to.be.an(AxesCrossModel);
    });

});
