
import {
  Vector3, Vector2, BufferAttribute, Box3, Object3D,
  Geometry, BufferGeometry, Sphere
} from 'three';

import * as THREE from 'three';


export
declare class Cylindrical {
  constructor(radius?: number, theta?: number, y?: number);

  radius: number;
  theta: number;
  y: number;

  set(radius: number, theta: number, y: number): this;
  clone(): this;
  copy(other: this): this;
  makeSafe(): void;
  setFromVector3(vec3: THREE.Vector3): this;
}


var box = new Box3();
var vector3 = new Vector3();

export
class Cylinder {
  constructor(polarCenter?: Vector2) {
    this.polarCenter = polarCenter || new Vector2();
    this.min = new (THREE as any).Cylindrical(+Infinity, +Infinity, +Infinity);
    this.max = new (THREE as any).Cylindrical(-Infinity, -Infinity, -Infinity);
  }

  setFromArray(array: ArrayLike<number>, optionalPolarCenter?: Vector2) {
    let minRSq = + Infinity;
    let minT = + Infinity;
    let minZ = + Infinity;

    let maxRSq = - Infinity;
    let maxT = - Infinity;
    var maxZ = - Infinity;

    const polarCenter = this.polarCenter;
    if (optionalPolarCenter !== undefined) {
      polarCenter.copy(optionalPolarCenter);
    } else {
      box.setFromArray(array).getCenter(vector3);
      polarCenter.set(vector3.x, vector3.y);
    }

    for (let i = 0, l = array.length; i < l; i += 3) {
      const x = array[i] - polarCenter.x;
      const y = array[i + 1] - polarCenter.y;
      const z = array[i + 2];

      const rSq = x*x + y*y;
      const theta = Math.atan2(x, y);

      if ( rSq < minRSq ) minRSq = rSq;
      if ( theta < minT ) minT = theta;
      if ( z < minZ ) minZ = z;

      if ( rSq > maxRSq ) maxRSq = rSq;
      if ( theta > maxT ) maxT = theta;
      if ( z > maxZ ) maxZ = z;
    }

    this.min.set(Math.sqrt(minRSq), minT, minZ);
    this.max.set(Math.sqrt(maxRSq), maxT, maxZ);

    return this;
  }

  isEmpty(): boolean {
    return ( this.max.radius < this.min.radius ) ||
           ( this.max.y < this.min.y ) ||
           ( this.min.theta === +Infinity ) ||
           ( this.max.theta === -Infinity );
  }

  polarCenter: Vector2;
  min: Cylindrical;
  max: Cylindrical;
}


export
const TAU = 2 * Math.PI;

function boundedTheta(a: number): number {
  return a >= 0 ? a % TAU : TAU - (-a % TAU);
}

function forwardThetaDistance(from: number, to: number) {
  return from <= to ? to - from : to - from + TAU;
}

export
function rangesOverlap(a: RRange, b: RRange): boolean {
  // Short circuit for abutting case
  if (a.max === b.min || b.max === a.min) {
    return true;
  }
  let aSpansZero = a.min > a.max;
  let bSpansZero = b.min > b.max;
  let aMaxGreater = a.max > b.max;
  if (aSpansZero && bSpansZero) {
    // Both span zero, so overlapping by definition
    return true;
  } else if (aSpansZero) {
    return aMaxGreater || b.min < a.max || b.max > a.min;
  } else if (bSpansZero) {
    return !aMaxGreater || b.min < a.max || b.max > a.min;
  } else {
    // Trivial case
    return aMaxGreater ? b.max > a.min : a.max > b.min
  }
}

/**
 * Merges b into a. Returns a.
 */
export
function mergeRanges(a: RRange, b: RRange): boolean {
  let aSpansZero = a.min > a.max;
  let bSpansZero = b.min > b.max;
  let aMaxGreater = a.max >= b.max;
  if (aSpansZero && bSpansZero) {
    // Both span zero, so overlapping by definition
    a.max = Math.max(a.max, b.max);
    a.min = Math.min(a.min, b.min);
    // Cannot be a loop here
    // (can only loop if a or b already loops,
    //  and if so we should not be here)
    return true;
  } else if (aSpansZero) {
    if (b.min <= a.max && a.min <= b.max) {
      a.min = 0;
      a.max = TAU;
      return true;
    }
    let overlaps = aMaxGreater;
    if (!aMaxGreater) {
      if (b.min <= a.max) {
        a.max = Math.max(a.max, b.max);
        overlaps = true;
      }
      if (b.max >= a.min) {
        a.min = Math.min(a.min, b.min);
        overlaps = true;
      }
    }
    return overlaps;
  } else if (bSpansZero) {
    // As we are assigning to a, this logic is more complicated
    // than when `a` spans zero.
    // Writing: A,B,C,D = a.min, a.max, b.max, b.min  (note reverse order of b max/min)
    // We know:
    // - 0 < C < D < TAU   (bSpansZero)
    // - 0 < A < B < TAU   (!aSpansZero)
    // - C < B             (aMaxGreater)
    // Possible orderings:
    // 1. ABCD
    // 2. ACBD
    // 3. CABD
    // 4. ACDB
    // 5. CADB
    // 6. CDAB
    if (b.min <= a.max && a.min <= b.max) { // D <= B && A <= C
      // 4., e.g. (2,5), (4,3) => (3,2)
      a.min = 0;
      a.max = TAU;
    } else if (!aMaxGreater) {
      // 1., e.g. (1, 1.5), (4, 2) => (4, 2)
      a.min = b.min;
      a.max = b.max;
    } else {
      if (b.min < a.min) {  // D < A
        // 6., e.g. (5,6), (4,2) => (4,2)
        a.min = b.min;
        a.max = b.max;
      } else if (b.min < a.max) {  // D < B
        // CADB
        // 5., e.g. (3,5), (4,2) => (3,2)
        a.max = b.max;
      } else if (a.min <= b.max){  // A <= C
        // 2., e.g. (1,3), (4,2) => (4,3)
        // or       (2,3), (4,2) => (4,3)
        a.min = b.min;
      } else {
        // 3., e.g. (3,4), (5,2) => (3,4)
        // No overlap, do nothing!
        return false;
      }
    }
    return true;
  } else if (aMaxGreater ? b.max >= a.min : a.max >= b.min) {
    // Trivial case
    // (cannot loop without one zero span)
    a.max = Math.max(a.max, b.max);
    a.min = Math.min(a.min, b.min);
    return true;
  }
  return false;
}

export
type RRange = {min: number, max: number};

function isTau(value: number) {
  return Math.abs(value - TAU) < 1e-8;
}

/**
 * Find the maximum gap between ranges on a looping [0, 2*PI] domain
 *
 * @param {{min: number, max: number}[]} ranges
 * @returns {{min: number, max: number}}
 */
export
function radiansMaximumGap(ranges: RRange[]): RRange | null {
  // Sort ranges according to max value
  const sorted = ranges.sort((a, b) => {
    return a.max < b.max ? -1 : a.max === b.max ? 0 : 1;
  });

  // Merge ranges
  const merged: RRange[] = [];
  let currentMerge = {min: sorted[0].min, max: sorted[0].max};
  merged.push(currentMerge);
  for (let i=1, l=sorted.length; i < l; ++i) {
    if (!mergeRanges(currentMerge, sorted[i])) {
      // No overlap, switch to next
      currentMerge = {min: sorted[i].min, max: sorted[i].max};
      merged.push(currentMerge);
    } else if (currentMerge.min === 0 && isTau(currentMerge.max)) {
      // No gap!
      return null;
    }
  }
  if (currentMerge.min === 0 && isTau(currentMerge.max)) {
    // No gap!
    return null;
  }

  // Find largest gap:
  // Initialize to gap from N back to 0:
  let maxGap = {min: merged[merged.length - 1].max, max: merged[0].min};
  let maxLen = forwardThetaDistance(maxGap.min, maxGap.max);
  let candidate: RRange;
  let candidateLength: number;
  for (let i=0, l=merged.length; i < l - 1; ++i) {
    candidate = {min: merged[i].max, max: merged[i+1].min};
    candidateLength = forwardThetaDistance(candidate.min, candidate.max);
    if (candidateLength > maxLen) {
      maxGap = candidate;
      maxLen = candidateLength;
    }
  }
  return maxGap;
}

const objectBox = new Box3();
const objectSphere = new Sphere();
const vAB = new Vector2();
let s: number;
let r: number;
let theta: number
let deltaTheta: number;

export
function computeBoundingCylinder(root: Object3D, polarCenter?: Vector2, skipTheta=false): Cylinder {
  const cyl = new Cylinder(polarCenter);
  const thetaRanges: RRange[] = [];
  if (skipTheta) {
    cyl.min.theta = 0;
    cyl.max.theta = TAU;
  }
  root.traverseVisible(function (object) {
    const geometry = (object as any).geometry as Geometry | BufferGeometry | undefined;
    if (geometry) {
      // Y:
      geometry.computeBoundingBox();
      objectBox.copy(geometry.boundingBox);
      object.updateMatrixWorld(true);
      objectBox.applyMatrix4(object.matrixWorld);

      if (objectBox.min.y < cyl.min.y) cyl.min.y = objectBox.min.y;
      if (objectBox.max.y > cyl.max.y) cyl.max.y = objectBox.max.y;

      // Polar:
      geometry.computeBoundingSphere();
      objectSphere.copy(geometry.boundingSphere);
      objectSphere.applyMatrix4(object.matrixWorld);

      // Radius:
      r = objectSphere.radius;
      if (objectBox.max.y - objectBox.min.y > Math.max(
          objectBox.max.x - objectBox.min.x,
          objectBox.max.z - objectBox.min.z)) {
        // Box is largest along y, radius is probably too large
        r = Math.max(r,
          Math.sqrt(Math.pow(objectBox.max.x - objectBox.min.x, 2) +
                    Math.pow(objectBox.max.z - objectBox.min.z, 2)));
      }

      vAB.set(objectSphere.center.x, objectSphere.center.z).sub(cyl.polarCenter);
      s = vAB.length();
      if (s - r < cyl.min.radius) cyl.min.radius = Math.max(s - r, 0);
      if (s + r > cyl.max.radius) cyl.max.radius = s + r;

      // Theta:
      if (skipTheta) {
        return;  // continue
      }
      if (r > s) {
        // Bounding sphere encircles polar center, use full range
        cyl.min.theta = 0;
        cyl.max.theta = TAU;
        skipTheta = true;
        return;  // continue
      }
      theta = Math.atan2(vAB.x, vAB.y);
      // Move r along circular arc (overestimation, but OK approx)
      deltaTheta = r / s;
      thetaRanges.push({min: boundedTheta(theta - deltaTheta),
                        max: boundedTheta(theta + deltaTheta)});
    }
  });
  if (!skipTheta && thetaRanges.length) {
    // Figure out largest break between ranges, use the inverse as range
    let maxGap = radiansMaximumGap(thetaRanges);
    if (maxGap === null) {
      cyl.min.theta = 0;
      cyl.max.theta = TAU;
    } else {
      cyl.min.theta = maxGap.max;
      cyl.max.theta = maxGap.min;
      if (cyl.min.theta > cyl.max.theta) {
        cyl.min.theta -= TAU;
      }
    }
  }
  return cyl;
}
