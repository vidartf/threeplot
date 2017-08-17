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
  ObjectModel
} from '../../../src/'


describe('ObjectModel', () => {

    it('should be createable', () => {
        let model = createTestModel(ObjectModel);
        expect(model).to.be.an(ObjectModel);
    });

    it('should be createable with a value', () => {
        let state = { value: 'Foo Bar!' }
        let model = createTestModel(ObjectModel, state);
        expect(model).to.be.an(ObjectModel);
    });

});
