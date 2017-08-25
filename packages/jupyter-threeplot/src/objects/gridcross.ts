// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  WidgetModel, ManagerBase, unpack_models
} from '@jupyter-widgets/base';

import {
  scaleLinear, ScaleLinear
} from 'd3-scale';

import * as THREE from 'three';

import {
  ISerializerMap
} from 'jupyter-scales';

import {
  JUPYTER_EXTENSION_VERSION
} from '../version';

import {
  ObjectModel
} from './object';



export
const N_MAJOR_TICKS = 3;

export
const N_MINOR_TICKS = 10;



export
interface IGridlineStyle {
  label_format: string,
  line_color: string | null,
  line_width: number | null,
}

export
interface IGridStyle {
  label: string,
  line_color: string | null,
  line_width: number | null,
  major_style: IGridlineStyle,
  minor_style: IGridlineStyle,
}


function defaultGridlineStyle(options?: Partial<IGridlineStyle>): IGridlineStyle {
  return {
    label_format: '',
    line_width: null,
    line_color: null,
    ...options,
  }
}

function defaultGridStyle(options?: Partial<IGridStyle>): IGridStyle {
  return {
    line_color: null,
    line_width: null,
    minor_style: defaultGridlineStyle({line_color: '#d9d9d9', line_width: 1}),
    major_style: defaultGridlineStyle({line_color: '#a6a6a6', line_width: 2}),
    label: '',
    ...options,
  }
}


function getScaleDomainEpsilon(scale: ScaleLinear<number, number>, relativePrecision=1e-7): number {
  let domain = scale.domain();
  return (Math.max(...domain) - Math.min(...domain)) * relativePrecision;
}


/**
 * Wether a sequence of numbers contains a specific value with given precision.
 */
function containsApproximate(sequence: number[], value: number, precision: number): boolean {
  for (let candidate of sequence) {
    if (Math.abs(value - candidate) < precision) {
      return true;
    }
  }
  return false;
}


interface IBounds { offset: THREE.Vector3, size: THREE.Vector3 };

function getGridTripletBounds(scales: ScaleLinear<number, number>[]): IBounds {
  let mins = scales.map(scale => {
    return Math.min(...scale.range());
  });
  let maxs = scales.map(scale => {
    return Math.max(...scale.range());
  });
  let offset = new THREE.Vector3(mins[0], mins[1], mins[2]);
  let size = (new THREE.Vector3(maxs[0], maxs[1], maxs[2])).sub(offset);
  return {offset, size};
}


/**
 * TODO: Docstring
 */
export
class GridCrossModel extends ObjectModel {
  defaults() {
    return {...super.defaults(),
      _model_name: GridCrossModel.model_name,

      scales: null,
      grid_styles: [defaultGridStyle(), defaultGridStyle(), defaultGridStyle()],


      line_color: 'black',
      line_width: 1.0,
    };
  }

  constructThreeObject(): Promise<any> {

      let result = new THREE.Group();
      let material = new THREE.LineBasicMaterial({
        color: this.get('line_color'),
        linewidth: this.get('line_width'),
      });

      let scales: ScaleLinear<number, number>[] = [];
      if (this.get('scales')) {
        for (let scale of this.get('scales')) {
          scales.push(scale.obj);
        }
      } else {
        scales = [scaleLinear(), scaleLinear(), scaleLinear()]
      };

      let gridStyles = this.get('grid_styles');
      let grids = GridCrossModel.gridTriplet(scales, gridStyles, material);
      result.add(grids);

      return Promise.resolve(result);
  }

  static gridLineMaterialFromStyle(style: IGridStyle,
                                   parentMaterial: THREE.LineBasicMaterial):
                                   { minor: THREE.LineBasicMaterial,
                                     major: THREE.LineBasicMaterial,
                                   } {
    let major = parentMaterial;
    let minor = parentMaterial;
    if (style.major_style.line_color === null &&
        style.major_style.line_width === null &&
        style.minor_style.line_color === null &&
        style.minor_style.line_width === null) {
      // Major and minor can share material
      if (style.line_color || style.line_width) {
        major = minor = new THREE.LineBasicMaterial({
          color: style.line_color || parentMaterial.color.getHex(),
          linewidth: style.line_width || parentMaterial.linewidth,
        });
      }
    } else {
      let majorLineColor = style.line_color || style.major_style.line_color;
      let majorLineWidth = style.line_width || style.major_style.line_width;
      let minorLineColor = style.line_color || style.minor_style.line_color;
      let minorLineWidth = style.line_width || style.minor_style.line_width;
      if (majorLineColor || majorLineWidth) {
        major = new THREE.LineBasicMaterial({
          color: majorLineColor || parentMaterial.color.getHex(),
          linewidth: majorLineWidth || parentMaterial.linewidth,
        });
      }
      if (minorLineColor || minorLineWidth) {
        minor = new THREE.LineBasicMaterial({
          color: minorLineColor || parentMaterial.color.getHex(),
          linewidth: minorLineWidth || parentMaterial.linewidth,
        });
      }
    }
    return { minor, major };
  }

  /**
   * Create grid lines for a single scale.
   *
   * The grid will start at (0, 0, 0), and extend to 1 in the given axes
   * (and have flat 0's in the last axis). This is done so that it can be
   * moved and scaled by its matrix.
   */
  static gridLineGeometryFromScale(scale: ScaleLinear<number, number>, axes: number[]):
                                   { minor: THREE.BufferGeometry,
                                     major: THREE.BufferGeometry, } {

    let mainAxes = axes[0];
    let ticks = {
      minor: scale.ticks(N_MINOR_TICKS),
      major: scale.ticks(N_MAJOR_TICKS),
    };
    let geometries = [];
    let eps = getScaleDomainEpsilon(scale);
    GridCrossModel.internalNormalizer.domain(scale.domain());
    for (let which of ['minor', 'major'] as ('minor' | 'major')[]) {
      let vertices: number[] = [];
      let geometry = new THREE.BufferGeometry();

      for (let tick of ticks[which]) {
        // Skip minor ticks which are also major ticks
        if (which === 'minor' && containsApproximate(ticks['major'], tick, eps)) {
          continue;
        }
        // Normalize the ticks to [0, 1]:
        tick = GridCrossModel.internalNormalizer(tick);
        // Push a vertex pair (one line):
        vertices.push(
          axes[0] === 0 ? tick : axes[1] === 0 ? 0 : 0,
          axes[0] === 1 ? tick : axes[1] === 1 ? 0 : 0,
          axes[0] === 2 ? tick : axes[1] === 2 ? 0 : 0,
          axes[0] === 0 ? tick : axes[1] === 0 ?  1 : 0,
          axes[0] === 1 ? tick : axes[1] === 1 ?  1 : 0,
          axes[0] === 2 ? tick : axes[1] === 2 ?  1 : 0,
        );
      }

      geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometries.push(geometry);
    }
    return { minor: geometries[0], major: geometries[1] };
  }

  /**
   * Will create a grid from a pair of scale and styles.
   */
  static gridFromScale(scales: ScaleLinear<number, number>[],
                       styles: IGridStyle[],
                       axes: number[],
                       parentMaterial: THREE.LineBasicMaterial): THREE.Object3D {

    // First, create materials:
    let material = GridCrossModel.gridLineMaterialFromStyle(styles[axes[0]], parentMaterial);

    // create grid geometries
    let geometries = [
      GridCrossModel.gridLineGeometryFromScale(scales[axes[0]], axes),
      GridCrossModel.gridLineGeometryFromScale(scales[axes[1]], axes.reverse()),
    ];

    let grids = [];
    for (let i=0; i<2; ++i) {
      let grid = new THREE.Group();
      grid.add(new THREE.LineSegments(geometries[i].minor, material.minor));
      grid.add(new THREE.LineSegments(geometries[i].major, material.major));
      grids.push(grid);
    }

    let result = new THREE.Group();
    result.add(...grids);
    return result;
  }

  /**
   * Create three grids (XY/XZ/YZ) from three scale/style pairs.
   */
  static gridTriplet(scales: ScaleLinear<number, number>[], styles: IGridStyle[], parentMaterial: THREE.LineBasicMaterial): THREE.Object3D {
    let tripletIndices = [[0, 1], [2, 0], [1, 2]];  // XY, ZX, YZ
    let grids = [];
    for (let planeIndices of tripletIndices) {
      let grid = GridCrossModel.gridFromScale(scales, styles, planeIndices, parentMaterial);
      grids.push(grid);
    }
    let bounds = getGridTripletBounds(scales);
    // TODO: Introduce grid modes: intersect at low/high end (with switching) or zero
    for (let grid of grids) {
      grid.position.copy(bounds.offset);
    }
    grids[0].scale.set(bounds.size.x, bounds.size.y, 1);  // XY
    grids[1].scale.set(bounds.size.x, 1, bounds.size.z);  // ZX
    grids[2].scale.set(1, bounds.size.y, bounds.size.z);  // YZ

    let result = new THREE.Group();
    result.add(...grids);
    return result;
  }

  static serializers: ISerializerMap = {
      ...GridCrossModel.serializers,
      scales: { deserialize: unpack_models },
    }

  static model_name = 'GridCrossModel';
}


export
namespace GridCrossModel {

  export
  const internalNormalizer = scaleLinear().clamp(true);

}
