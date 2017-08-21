// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  // Add any needed widget imports here (or from controls)
} from '@jupyter-widgets/base';

import {
  scaleLinear, InterpolatorFactory
} from 'd3-scale';

import {
  createTestModel
} from '../utils.spec';

import {
  LinearScaleModel
} from '../../../src/'


describe('LinearScaleModel', () => {

    it('should be createable', () => {
        let model = createTestModel(LinearScaleModel);
        expect(model).to.be.an(LinearScaleModel);
        return model.initPromise.then(() => {
          expect(typeof model.obj).to.be('function');
        });
    });

    it('should be createable with a value', () => {
        let state = { value: 'Foo Bar!' }
        let model = createTestModel(LinearScaleModel, state);
        expect(model).to.be.an(LinearScaleModel);
    });

});
