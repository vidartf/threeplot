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
  Object3DModel
} from 'jupyter-threejs';

import * as THREE from 'three';

import {
  createTestModel, DummyManager
} from '../utils.spec';

import {
  GridCrossModel, defaultGridStyle, IGridStyle
} from '../../../src/objects/gridcross'


function emptyGridStyle(): IGridStyle {
  let emptyLineStyle = {
  label_format: '',
  line_color: null,
  line_width: null,
}
  return {
    label: '',
    line_color: null,
    line_width: null,
    major_style: emptyLineStyle,
    minor_style: {...emptyLineStyle}
  }
}


describe('GridCrossModel', () => {

    it('should be createable', () => {
      let model = createTestModel(GridCrossModel);
      expect(model).to.be.an(GridCrossModel);
    });

    it('should be createable with a state', () => {
      let scale_states = [
        { domain: [10, 20] },
        { domain: [10, 20] },
        { domain: [10, 20] },
      ];
      let manager = new DummyManager();
      let scales = scale_states.map(scale_state =>
        createTestModel(LinearScaleModel, scale_state, manager)
      );
      return Promise.all(scales.map(scale => scale.initPromise)).then(() => {
        let state = {
          position: [1, 2, 3],
          scales: scales,
          grid_styles: [
            defaultGridStyle(), defaultGridStyle(), defaultGridStyle()
          ],
          line_color: 'red',
          line_width: 2.0,
        }
        let model = createTestModel(GridCrossModel, state, manager);
        expect(model).to.be.an(GridCrossModel);
        expect(model.get('scales')).to.eql(scales);
      });
    });

    describe('gridLineMaterialFromStyle', () => {

      it('should use parent material when no overrides', () => {
        let style = emptyGridStyle();
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.be(parentMaterial);
        expect(material.major).to.be(parentMaterial);
      });

      it('should use shared material with grid-style level color override', () => {
        let style = emptyGridStyle();
        style.line_color = 'blue';
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.be(material.major);
        expect(material.major).to.not.be(parentMaterial);
      });

      it('should use shared material with grid-style level linewidth override', () => {
        let style = emptyGridStyle();
        style.line_width = 2;
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.be(material.major);
        expect(material.major).to.not.be(parentMaterial);
      });

      it('should use shared material with several grid-style level overrides', () => {
        let style = emptyGridStyle();
        style.line_color = 'blue';
        style.line_width = 2;
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.be(material.major);
        expect(material.major).to.not.be(parentMaterial);
      });

      it('should use individual materials with major line color defined', () => {
        let style = emptyGridStyle();
        style.major_style.line_color = 'blue';
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.be(parentMaterial);
        expect(material.major).to.not.be(parentMaterial);
        expect(material.major.color.getHexString()).to.eql('0000ff');
      });

      it('should use individual materials with minor line color defined', () => {
        let style = emptyGridStyle();
        style.minor_style.line_color = 'blue';
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.major).to.be(parentMaterial);
        expect(material.minor).to.not.be(parentMaterial);
        expect(material.minor.color.getHexString()).to.eql('0000ff');
      });

      it('should use individual materials with major + common line color defined', () => {
        let style = emptyGridStyle();
        style.major_style.line_color = 'blue';
        style.line_color = 'red';
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.not.be(parentMaterial);
        expect(material.major).to.not.be(parentMaterial);
        expect(material.minor.color.getHexString()).to.eql('ff0000');
        expect(material.major.color.getHexString()).to.eql('0000ff');
      });

      it('should use individual materials with minor + common line color defined', () => {
        let style = emptyGridStyle();
        style.minor_style.line_color = 'blue';
        style.line_color = 'red';
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.not.be(parentMaterial);
        expect(material.major).to.not.be(parentMaterial);
        expect(material.minor.color.getHexString()).to.eql('0000ff');
        expect(material.major.color.getHexString()).to.eql('ff0000');
      });

      it('should use individual materials with major line width defined', () => {
        let style = emptyGridStyle();
        style.major_style.line_width = 2;
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.be(parentMaterial);
        expect(material.major).to.not.be(parentMaterial);
        expect(material.major.linewidth).to.eql(2);
      });

      it('should use individual materials with minor line width defined', () => {
        let style = emptyGridStyle();
        style.minor_style.line_width = 2;
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.major).to.be(parentMaterial);
        expect(material.minor).to.not.be(parentMaterial);
        expect(material.minor.linewidth).to.eql(2);
      });

      it('should use individual materials with major + common line width defined', () => {
        let style = emptyGridStyle();
        style.major_style.line_width = 2;
        style.line_width = 3;
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.not.be(parentMaterial);
        expect(material.major).to.not.be(parentMaterial);
        expect(material.minor.linewidth).to.eql(3);
        expect(material.major.linewidth).to.eql(2);
      });

      it('should use individual materials with minor + common line width defined', () => {
        let style = emptyGridStyle();
        style.minor_style.line_width = 2;
        style.line_width = 3;
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.not.be(parentMaterial);
        expect(material.major).to.not.be(parentMaterial);
        expect(material.minor.linewidth).to.eql(2);
        expect(material.major.linewidth).to.eql(3);
      });

      it('should use individual materials with minor + major overrides defined', () => {
        let style = emptyGridStyle();
        style.minor_style.line_width = 2;
        style.major_style.line_width = 3;
        style.minor_style.line_color = 'blue';
        style.major_style.line_color = 'red';
        style.line_width = 4;
        style.line_color = 'green';
        let parentMaterial = new THREE.LineBasicMaterial();
        let material = GridCrossModel.gridLineMaterialFromStyle(style, parentMaterial);
        expect(material.minor).to.not.be(parentMaterial);
        expect(material.major).to.not.be(parentMaterial);
        expect(material.minor.linewidth).to.eql(2);
        expect(material.major.linewidth).to.eql(3);
        expect(material.minor.color.getHexString()).to.eql('0000ff');
        expect(material.major.color.getHexString()).to.eql('ff0000');
      });

    });


    describe('createLabel', () => {

      it('should create a sprite with a given color', () => {
        let style = emptyGridStyle();
        style.line_color = 'red';
        let sprite = GridCrossModel.createLabel('Test string', style);
        let canvas = sprite.material.map.image as HTMLCanvasElement;
        let data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        expect(data.every((value, i) => {
          // Every non-red pixel value should be zero (red label)
          return i % 3 === 0 || value === 0;
        }));
      });

      it('should create a sprite with a given major color', () => {
        let style = emptyGridStyle();
        style.major_style.line_color = 'red';
        let sprite = GridCrossModel.createLabel('Test string', style);
        let canvas = sprite.material.map.image as HTMLCanvasElement;
        let data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        expect(data.every((value, i) => {
          // Every non-red pixel value should be zero (red label)
          return i % 3 === 0 || value === 0;
        }));
      });

      it('should ignore minor color', () => {
        let style = emptyGridStyle();
        style.minor_style.line_color = 'white';
        let sprite = GridCrossModel.createLabel('Test string', style);
        let canvas = sprite.material.map.image as HTMLCanvasElement;
        let data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        expect(data.every((value, i) => {
          // Every pixel value should be zero (black label is the default)
          return value === 0;
        }));
      });

    });


    describe('auto-sizing', () => {

      it('should auto-scale to target given in constructor', () => {
        let manager = new DummyManager();
        let target = createTestModel(Object3DModel, {}, manager);
        return target.initPromise.then(() => {
          target.obj = new THREE.Mesh(
            new THREE.BoxGeometry(7, 3, 5),
            new THREE.Material()
          );
          let state = {
            autosize_target: target,
          }
          let model = createTestModel(GridCrossModel, state, manager);
          expect(model).to.be.an(GridCrossModel);
          expect(model.get('autosize_target')).to.be(target);
          // Box geometry has its center at as origin:
          expect(model.sceneSize).to.eql([[-3.5, 3.5], [-1.5, 1.5], [-2.5, 2.5]]);
        });
      });

      it('should auto-scale to target set, when switching from null', () => {
        let manager = new DummyManager();
        let target = createTestModel(Object3DModel, {}, manager);
        let model = createTestModel(GridCrossModel, {}, manager);
        return Promise.all([target.initPromise, model.initPromise]).then(() => {
          target.obj = new THREE.Mesh(
            new THREE.BoxGeometry(7, 3, 5),
            new THREE.Material()
          );
          model.set('autosize_target', target);
          expect(model).to.be.an(GridCrossModel);
          expect(model.get('autosize_target')).to.be(target);
          // Box geometry has its center at as origin:
          expect(model.sceneSize).to.eql([[-3.5, 3.5], [-1.5, 1.5], [-2.5, 2.5]]);
        });
      });

      it('should disable auto-scale, when switching to null', () => {
        let manager = new DummyManager();
        let target = createTestModel(Object3DModel, {}, manager);
        return target.initPromise.then(() => {
          target.obj = new THREE.Mesh(
            new THREE.BoxGeometry(7, 3, 5),
            new THREE.Material()
          );
          let model = createTestModel(GridCrossModel, {autosize_target: target}, manager);
          return model.initPromise.then(() => model);
        }).then(model => {
          model.set('autosize_target', null);
          expect(model.get('autosize_target')).to.be(null);
          expect(model.sceneSize).to.be(null);
        });
      });

      it('should disable auto-scale, when setting to empty target', () => {
        let manager = new DummyManager();
        let target = createTestModel(Object3DModel, {}, manager);
        return target.initPromise.then(() => {
          target.obj = new THREE.Group();
          let model = createTestModel(GridCrossModel, {autosize_target: target}, manager);
          return model.initPromise.then(() => model);
        }).then(model => {
          expect(model.get('autosize_target')).to.be(target);
          expect(model.sceneSize).to.be(null);
        });
      });

      it('should restrict auto-scale on clamped axes', () => {
        let manager = new DummyManager();
        let scale_states = [
          { domain: [10, 20], range: [0, 2], clamp: true },
          { domain: [10, 20], range: [0, 0.5], clamp: true },
          { domain: [10, 20], range: [1, 1.5], clamp: true },
        ];
        let scales = scale_states.map(scale_state =>
          createTestModel(LinearScaleModel, scale_state, manager)
        );
        return Promise.all(scales.map(scale => scale.initPromise)).then(() => {
          expect(scales[0].get('clamp')).to.be(true);
          expect(scales[0].obj.clamp()).to.be(true);
          return createTestModel(Object3DModel, {}, manager);
        }).then(target => {
          target.obj = new THREE.Mesh(
            new THREE.BoxGeometry(7, 3, 5),
            new THREE.Material()
          );
          let model = createTestModel(GridCrossModel, {scales: scales, autosize_target: target}, manager);
          return model.initPromise.then(() => model);
        }).then((model: GridCrossModel<any>) => {
          let size = model.gridScales.map(scale => scale.range());
          expect(size).to.eql([[0, 2], [0, 0.5], [1, 1.5]]);
        });
      });

      it('should only restrict auto-scale to clamped range', () => {
        let manager = new DummyManager();
        let scale_states = [
          { domain: [10, 20], range: [-10, 10], clamp: true },
          { domain: [10, 20], range: [0, 0.5], clamp: false },
          { domain: [10, 20], range: [-50, 0], clamp: true },
        ];
        let scales = scale_states.map(scale_state =>
          createTestModel(LinearScaleModel, scale_state, manager)
        );
        let target = createTestModel(Object3DModel, {}, manager);
        return Promise.all(scales.map(scale => scale.initPromise)).then(() => {
          expect(scales[0].get('clamp')).to.be(true);
          expect(scales[0].obj.clamp()).to.be(true);

          return target.initPromise;
        }).then(() => {
          let model = createTestModel(GridCrossModel, {scales: scales, tight: true}, manager);
          return model.initPromise.then(() => model);
        }).then((model: GridCrossModel<any>) => {

          target.obj = new THREE.Mesh(
            new THREE.BoxGeometry(7, 3, 5),
            new THREE.Material()
          );
          model.set({autosize_target: target});
          let size = model.gridScales.map(scale => scale.range());
          // TODO: This fails because the second axes is niced.
          expect(size).to.eql([[-3.5, 3.5], [-1.5, 1.5], [-2.5, 0]]);
        });
      });

      it('should respect auto-size flags', () => {
        let manager = new DummyManager();
        let target = createTestModel(Object3DModel, {}, manager);
        return target.initPromise.then(() => {
          target.obj = new THREE.Mesh(
            new THREE.BoxGeometry(7, 3, 5),
            new THREE.Material()
          );
          let model = createTestModel(GridCrossModel, {
            autosize_axes: [true, false, true],
          }, manager);
          return model.initPromise.then(() => model);
        }).then((model: GridCrossModel<any>) => {
          model.set({autosize_target: target});
          let size = model.gridScales.map(scale => scale.range());
          expect(size).to.eql([[-3.5, 3.5], [0, 1], [-2.5, 2.5]]);
        });
      });

      it('should resize grid if scale changes', () => {
        let manager = new DummyManager();
        let scale_states = [
          { domain: [10, 20], range: [-10, 10], clamp: true },
          { domain: [10, 20], range: [0, 0.5], clamp: true },
          { domain: [10, 20], range: [-50, 0], clamp: true },
        ];
        let scales = scale_states.map(scale_state =>
          createTestModel(LinearScaleModel, scale_state, manager)
        );
        let target = createTestModel(Object3DModel, {}, manager);
        return Promise.all(scales.map(scale => scale.initPromise)).then(() => {
          return target.initPromise;
        }).then(() => {
          target.obj = new THREE.Mesh(
            new THREE.BoxGeometry(7, 3, 5),
            new THREE.Material()
          );
          let model = createTestModel(GridCrossModel, {
              scales: scales,
              tight: true,
              autosize_target: target,
            }, manager);
          return model.initPromise.then(() => model);
        }).then((model: GridCrossModel<any>) => {
          scales[1].set('range', [-0.2, 0.3]);
          let size = model.gridScales.map(scale => scale.range());
          // TODO: This fails because the second axes is niced.
          expect(size).to.eql([[-3.5, 3.5], [-0.2, 0.3], [-2.5, 0]]);
        });
      });

    });

});
