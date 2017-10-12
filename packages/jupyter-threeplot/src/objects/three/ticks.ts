
import * as THREE from 'three';


import {
  LineMaterial, lineUniforms
} from '../../vendored/linematerial';


const vertexShader = require("./glsl/vertex-ticks.glsl");
const fragmentShader = require("./glsl/fragment-ticks.glsl");

export
interface ITickUniforms {
  tickVector: { value: THREE.Vector3 };
}

export
const tickUniforms: ITickUniforms = {
  tickVector: { value: new THREE.Vector3( 1, 1, 0 ) }
};


export
class TickMaterial extends LineMaterial {
  /**
   *
   */
  constructor(params?: THREE.ShaderMaterialParameters) {
    super({
      uniforms: THREE.UniformsUtils.merge([
        lineUniforms, tickUniforms]),
      vertexShader,
      fragmentShader,
      ...params
    });
  }


  get tickVector() {
    return this.uniforms['tickVector'].value;
  }

  set tickVector(value: THREE.Vector3) {
    this.uniforms['tickVector'].value = value;
  }

  isTickMaterial = true;
}


export
class TicksGeometry extends THREE.InstancedBufferGeometry {

  constructor() {

    super();

    this.type = 'TickGeometry';

    var plane = new THREE.BufferGeometry();

    var positions = [ - 1, 2, 0, 1, 2, 0, - 1, 1, 0, 1, 1, 0, - 1, 0, 0, 1, 0, 0, - 1, - 1, 0, 1, - 1, 0 ];
    var uvs = [ 0, 1, 1, 1, 0, .5, 1, .5, 0, .5, 1, .5, 0, 0, 1, 0 ];
    var index = [ 0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5 ];

    this.setIndex(index);
    this.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  }

  isTicksGeometry = true;

  applyMatrix(matrix: THREE.Matrix4) {
    const start = this.getAttribute('instanceStart') as THREE.InterleavedBufferAttribute;

    if (start !== undefined) {
      (matrix as any).applyToBufferAttribute(start);
      start.data.needsUpdate = true;
    }

    if (this.boundingBox !== null) {
      this.computeBoundingBox();
    }

    if (this.boundingSphere !== null) {
      this.computeBoundingSphere();
    }

    return this;
  }

  setPositions(array: Float32Array | number[]) {

      let lineSegments;
      if (array instanceof Float32Array) {
          lineSegments = array;
      } else if (Array.isArray(array)) {
          lineSegments = new Float32Array(array);
      } else {
          throw new Error('setPositions argument must be array or Float32Array');
      }

      this.addAttribute('instanceStart', new THREE.InstancedBufferAttribute(lineSegments, 3, 1));


      this.computeBoundingBox();
      this.computeBoundingSphere();

      return this;
  }

  setColors(array: Float32Array | number[]) {

      let colors;
      if (array instanceof Float32Array) {
          colors = array;
      } else if (Array.isArray(array)) {
          colors = new Float32Array(array);
      } else {
          throw new Error('setColors argument must be array or Float32Array');
      }
      this.addAttribute(
        'instanceColor', new THREE.InstancedBufferAttribute(colors, 3, 1)); // rgb

      return this;
  }

  fromWireframeGeometry(geometry: THREE.BufferGeometry) {

      this.setPositions(geometry.getAttribute('position').array as any);
      return this;
  }

  fromEdgesGeometry(geometry: THREE.BufferGeometry) {

      this.setPositions(geometry.getAttribute('position').array as any);
      return this;
  }

  fromMesh(mesh: THREE.Mesh) {

      this.fromWireframeGeometry(new THREE.WireframeGeometry(mesh.geometry));

      // set colors, maybe

      return this;
  }

  fromLineSegements(lineSegments: THREE.LineSegments) {

      var geometry = lineSegments.geometry;
      if ((geometry as any).isGeometry) {
          this.setPositions((geometry as THREE.Geometry).vertices as any);
      } else if ((geometry as any).isBufferGeometry) {
          this.setPositions((geometry as THREE.BufferGeometry).getAttribute('position').array as any); // assumes non-indexed
      }

      // set colors, maybe

      return this;
  }

  computeBoundingBox() {

      if (this.boundingBox === null) {
          this.boundingBox = new THREE.Box3();
      }

      var start = this.getAttribute('instanceStart');

      if (start !== undefined) {
          (this.boundingBox as any).setFromBufferAttribute(start);
      }
  }

  computeBoundingSphere() {

    const vector = new THREE.Vector3();

    if (this.boundingSphere === null) {
      this.boundingSphere = new THREE.Sphere();
    }

    if (this.boundingBox === null) {
      this.computeBoundingBox();
    }

    const start = this.getAttribute('instanceStart');
    if (start !== undefined) {
      const center = this.boundingSphere.center;
      this.boundingBox.getCenter(center);
      let maxRadiusSq = 0;
      for (let i = 0, il = start.count; i < il; i ++) {
        vector.fromBufferAttribute(start as any, i);
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
      }

      this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

      if (isNaN(this.boundingSphere.radius)) {
        console.error('THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this);
      }
    }
  }

  toJSON() {
    // todo
  }

  clone(): this {
    let r = new TicksGeometry();
    r.copy(this);
    return r as this;
  }

  copy(source: TicksGeometry) {
    // todo
    return this;
  }

}


export
class Ticks extends THREE.LineSegments {
  /**
   *
   */
  constructor(
      positions: Float32Array | number[],
      tick: THREE.Vector3,
      materialParams?: THREE.ShaderMaterialParameters) {
    const geom = new TicksGeometry();
    geom.setPositions(positions);
    const material = new TickMaterial(materialParams);
    material.tickVector = tick.clone();
    super(geom, material);
 }

 /**
  * Update the tick geometry in-place for a new tick vector.
  *
  * @param {THREE.Vector3} tick The new tick vector
  * @memberof Ticks
  */
 updateTickVector(tick: THREE.Vector3) {
    if (!(this.material as any).isTickMaterial) {
      throw new Error('Cannot update tick vector for non-tick material');
    }
    (this.material as TickMaterial).tickVector = tick.clone();
    this.material.needsUpdate = true;
 }

  /**
   * Update the tick geometry in-place for a new tick vector.
   *
   * @param {THREE.Vector3} tick The new tick vector
   * @memberof Ticks
   */
  updateTicks(positions: Float32Array | number[], tick?: THREE.Vector3) {
    if (!(this.material as any).isTickMaterial) {
      throw new Error('Cannot update ticks for non-tick material');
    }
    if (!(this.geometry as any).isTicksGeometry) {
      throw new Error('Cannot update ticks for non-tick geometry');
    }
    if (tick !== undefined) {
      (this.material as TickMaterial).tickVector = tick.clone();
      this.material.needsUpdate = true;
    }

    (this.geometry as TicksGeometry).setPositions(positions);
  }

}
