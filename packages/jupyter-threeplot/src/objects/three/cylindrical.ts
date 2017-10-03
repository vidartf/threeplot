import * as THREE from 'three';

import {
  scaleLinear, ScaleLinear, ScaleContinuousNumeric
} from 'd3-scale';

import {
  minorMajorDoublet, getScaleDomainEpsilon, containsApproximate,
  gridFromGeometries, N_MAJOR_TICKS, N_MINOR_TICKS
} from './common';

import {
  IGridStyle
} from '../common';

import {
  Cylindrical
} from '../../cylinder';

const CIRCLE_STEPS_PER_DEGREE = 1;

/**
 * Create geometries for a polar grid (base plane)
 *
 * @param scales
 * @param axes
 * @param offset
 * @param size
 */
export
function createPolarGridGeometries<TDomain>(
    radialScale: ScaleContinuousNumeric<number, TDomain>,
    azimuthalScale: ScaleContinuousNumeric<number, TDomain>,

    offset: Cylindrical,
    size: Cylindrical):
    minorMajorDoublet<THREE.BufferGeometry>[] {
  // Steps:
  // 1. Create radial, straight lines in base plane
  // 2. Create concetric circles in base plane
  const geometries: minorMajorDoublet<THREE.BufferGeometry>[] = [];

  // 1.
  const thetaTicks = {
    minor: azimuthalScale.ticks(N_MINOR_TICKS),
    major: azimuthalScale.ticks(N_MAJOR_TICKS),
  }
  const thetaEps = getScaleDomainEpsilon(azimuthalScale);
  const vertexA = new THREE.Vector3();
  const vertexB = new THREE.Vector3();
  let cylA = offset.clone();
  let cylB = offset.clone();
  cylB.radius += size.radius;
  const thetaDoublet: minorMajorDoublet<THREE.BufferGeometry> = {
    minor: new THREE.BufferGeometry(),
    major: new THREE.BufferGeometry()
  };
  for (const which of ['minor', 'major'] as ('minor' | 'major')[]) {
    const vertices: number[] = [];

    for (const tick of thetaTicks[which]) {
      // Skip minor ticks which are also major ticks
      if (which === 'minor' && containsApproximate(thetaTicks['major'], tick, thetaEps)) {
        continue;
      }

      cylA.theta = cylB.theta = tick;

      (vertexA as any).setFromCylindrical(cylA);
      (vertexB as any).setFromCylindrical(cylB);

      // Push a vertex pair (one line):
      vertices.push(
        vertexA.x, vertexA.y, vertexA.z,
        vertexB.x, vertexB.y, vertexB.z
      );
    }

    thetaDoublet[which].addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  }
  geometries.push(thetaDoublet);

  // 2.
  const radialTicks = {
    minor: radialScale.ticks(N_MINOR_TICKS),
    major: radialScale.ticks(N_MAJOR_TICKS),
  }
  const radialEps = getScaleDomainEpsilon(radialScale);
  const N_STEPS = Math.floor(CIRCLE_STEPS_PER_DEGREE*(180 * size.theta / Math.PI));
  let swapCyl: Cylindrical;
  const radialDoublet: minorMajorDoublet<THREE.BufferGeometry> = {
    minor: new THREE.BufferGeometry(),
    major: new THREE.BufferGeometry()
  };
  for (const which of ['minor', 'major'] as ('minor' | 'major')[]) {
    const vertices: number[] = [];
    const geometry = new THREE.BufferGeometry();

    for (const tick of radialTicks[which]) {
      // Skip minor ticks which are also major ticks
      if (which === 'minor' && containsApproximate(radialTicks['major'], tick, radialEps)) {
        continue;
      }

      cylA.copy(offset);
      cylB.copy(offset);
      cylA.radius = cylB.radius = tick;

      for (let step=1; step<N_STEPS; ++step) {
        cylB.theta = offset.theta + size.theta * step / (N_STEPS - 1);

        (vertexA as any).setFromCylindrical(cylA);
        (vertexB as any).setFromCylindrical(cylB);

        // Push a vertex pair (one segment of circle):
        vertices.push(
          vertexA.x, vertexA.y, vertexA.z,
          vertexB.x, vertexB.y, vertexB.z
        );
        swapCyl = cylA;
        cylA = cylB;
        cylB = swapCyl;
      }
    }

    radialDoublet[which].addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  }
  geometries.push(radialDoublet);

  return geometries;
}


export
function createCylindricalGrids<TDomain>(scales: ScaleContinuousNumeric<number, TDomain>[],
                                         styles: IGridStyle[],
                                         parentMaterial: THREE.LineBasicMaterial):
                                         THREE.Group {
  let result = new THREE.Group();

  let offset = new (THREE as any).Cylindrical(
    Math.min(...scales[0].domain()),
    Math.min(...scales[1].domain()),
    Math.min(...scales[2].domain())
  ) as Cylindrical;
  let size = new (THREE as any).Cylindrical(
    Math.max(...scales[0].domain()) - offset.radius,
    Math.max(...scales[1].domain()) - offset.theta,
    Math.max(...scales[2].domain()) - offset.y
  ) as Cylindrical;

  let geometries = createPolarGridGeometries(scales[0], scales[1], offset, size);
  let baseGrid = gridFromGeometries(geometries, styles[0], parentMaterial);
  result.add(baseGrid);
  return result;
}
