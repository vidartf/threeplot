import * as THREE from 'three';

import {
  scaleLinear, ScaleLinear, ScaleContinuousNumeric
} from 'd3-scale';

import {
  MinorMajorDoublet, getScaleDomainEpsilon, containsApproximate,
  gridFromGeometries, N_MAJOR_TICKS, N_MINOR_TICKS
} from './common';

import {
  IGridStyle
} from '../common';

import {
  Cylindrical
} from '../../cylinder';

const CIRCLE_STEPS_PER_DEGREE = 1;

const rad2deg = 180 / Math.PI;


/**
 * Create geometries for a polar grid (base plane)
 *
 * @param scales
 * @param axes
 * @param offset
 * @param size
 */
export function createPolarGridGeometries(
  radialScale: ScaleContinuousNumeric<number, number>,
  azimuthalScale: ScaleContinuousNumeric<number, number>,

  offset: Cylindrical,
  size: Cylindrical
): MinorMajorDoublet<THREE.BufferGeometry>[] {
  // Steps:
  // 1. Create radial, straight lines in base plane
  // 2. Create concetric circles in base plane
  const geometries: MinorMajorDoublet<THREE.BufferGeometry>[] = [];

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
  const thetaDoublet: MinorMajorDoublet<THREE.BufferGeometry> = {
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

      cylA.theta = cylB.theta = azimuthalScale(tick);

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
  const N_STEPS = Math.floor(CIRCLE_STEPS_PER_DEGREE * size.theta * rad2deg);
  let swapCyl: Cylindrical;
  const radialDoublet: MinorMajorDoublet<THREE.BufferGeometry> = {
    minor: new THREE.BufferGeometry(),
    major: new THREE.BufferGeometry()
  };
  for (const which of ['minor', 'major'] as ('minor' | 'major')[]) {
    const vertices: number[] = [];

    for (const tick of radialTicks[which]) {
      // Skip minor ticks which are also major ticks
      if (which === 'minor' && containsApproximate(radialTicks['major'], tick, radialEps)) {
        continue;
      }

      cylA.copy(offset);
      cylB.copy(offset);
      cylA.radius = cylB.radius = radialScale(tick);

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


export function createCylindricalGrids(
  scales: ScaleContinuousNumeric<number, number>[],
  styles: IGridStyle[],
  parentMaterial: THREE.LineBasicMaterial
): THREE.Group {
  let result = new THREE.Group();

  let offset = new (THREE as any).Cylindrical(
    Math.min(...scales[0].range()),
    Math.min(...scales[1].range()),
    Math.min(...scales[2].range())
  ) as Cylindrical;
  let size = new (THREE as any).Cylindrical(
    Math.max(...scales[0].range()) - offset.radius,
    Math.max(...scales[1].range()) - offset.theta,
    Math.max(...scales[2].range()) - offset.y
  ) as Cylindrical;

  let geometries = createPolarGridGeometries(scales[0], scales[1], offset, size);
  let baseGrid = gridFromGeometries(geometries, styles[0], parentMaterial);
  result.add(baseGrid);
  return result;
}
