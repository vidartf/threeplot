// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  // Add any needed widget imports here (or from controls)
} from '@jupyter-widgets/base';

import * as THREE from 'three';

import {
  createTestModel
} from '../utils.spec';

import {
  rangesOverlap, mergeRanges, TAU, RRange,
  radiansMaximumGap, computeBoundingCylinder
} from '../../../src/cylinder'


function range(min: number, max: number) {
  return {min, max};
}




describe('cylinder util functions', () => {

  describe('rangesOverlap', () => {

    it('should return true for obvious overlaps', () => {
      expect(rangesOverlap(
        range(0.1, 3),
        range(2, 4),
      )).to.be(true);
      expect(rangesOverlap(
        range(2, 4),
        range(0.1, 3),
      )).to.be(true);
      expect(rangesOverlap(
        range(2, 5),
        range(3, 4),
      )).to.be(true);
      expect(rangesOverlap(
        range(3, 4),
        range(2, 5),
      )).to.be(true);
    });

    it('should return false for obvious non-overlaps', () => {
      expect(rangesOverlap(
        range(0.1, 2),
        range(3, 4),
      )).to.be(false);
      expect(rangesOverlap(
        range(3, 4),
        range(0.1, 2),
      )).to.be(false);
    });

    it('should return true when both overlap zero', () => {
      expect(rangesOverlap(
        range(5, 1),
        range(6, 0.5),
      )).to.be(true);
      expect(rangesOverlap(
        range(6, 0.5),
        range(5, 1),
      )).to.be(true);
      expect(rangesOverlap(
        range(5, 0.5),
        range(6, 1),
      )).to.be(true);
      expect(rangesOverlap(
        range(6, 1),
        range(5, 0.5),
      )).to.be(true);
    });

    it('should return true when overlapping on both sides', () => {
      expect(rangesOverlap(
        range(1, 5),
        range(4, 2),
      )).to.be(true);
      expect(rangesOverlap(
        range(4, 2),
        range(1, 5),
      )).to.be(true);
    });

    it('should return true when one spans zero and one overlaps on max end', () => {
      expect(rangesOverlap(
        range(4, 2),
        range(1, 3),
      )).to.be(true);
      expect(rangesOverlap(
        range(1, 3),
        range(4, 2),
      )).to.be(true);
    });

    it('should return true when one spans zero and one is contained in max end', () => {
      expect(rangesOverlap(
        range(4, 2),
        range(1, 1.5),
      )).to.be(true);
      expect(rangesOverlap(
        range(1, 1.5),
        range(4, 2),
      )).to.be(true);
    });

    it('should return true when one spans zero and one overlaps on min end', () => {
      expect(rangesOverlap(
        range(4, 2),
        range(3, 5),
      )).to.be(true);
      expect(rangesOverlap(
        range(3, 5),
        range(4, 2),
      )).to.be(true);
    });

    it('should return true when one spans zero and one is contained in min end', () => {
      expect(rangesOverlap(
        range(4, 2),
        range(5, 6),
      )).to.be(true);
      expect(rangesOverlap(
        range(5, 6),
        range(4, 2),
      )).to.be(true);
    });

    it('should return false when one spans zero and one is elsewhere', () => {
      expect(rangesOverlap(
        range(5, 2),
        range(3, 4),
      )).to.be(false);
      expect(rangesOverlap(
        range(3, 4),
        range(5, 2),
      )).to.be(false);

      expect(rangesOverlap(
        range(4, 3),
        range(3.1, 3.9),
      )).to.be(false);
      expect(rangesOverlap(
        range(3.1, 3.9),
        range(4, 3),
      )).to.be(false);
    });

    it('should return true when the ranges abut', () => {
      expect(rangesOverlap(
        range(4, 2),
        range(2, 3),
      )).to.be(true);
      expect(rangesOverlap(
        range(2, 3),
        range(4, 2),
      )).to.be(true);

      expect(rangesOverlap(
        range(3, 4),
        range(2, 3),
      )).to.be(true);
      expect(rangesOverlap(
        range(2, 3),
        range(3, 4),
      )).to.be(true);

      expect(rangesOverlap(
        range(2, 4),
        range(4, 2),
      )).to.be(true);
      expect(rangesOverlap(
        range(4, 2),
        range(2, 4),
      )).to.be(true);
    });

  });

  describe('mergeRanges', () => {


    function checkDualMerge(a: RRange, b: RRange, expected: RRange) {
      let c = range(a.min, a.max);
      expect(mergeRanges(c, b)).to.be(true);
      expect(c).to.eql(expected);
      c = range(b.min, b.max);
      expect(mergeRanges(c, a)).to.be(true);
      expect(c).to.eql(expected);
    }

    it('should merge obvious overlaps', () => {
      checkDualMerge(
        range(0.1, 3), range(2, 4),
        range(0.1, 4));
      checkDualMerge(
        range(2, 5), range(3, 4),
        range(2, 5));
    });

    it('should not modify range for obvious non-overlaps', () => {
      let a = range(0.1, 2);
      let b = range(3, 4);
      mergeRanges(a, b);
      expect(a).to.eql(range(0.1, 2));
      mergeRanges(b, a);
      expect(b).to.eql(range(3, 4));
    });

    it('should merge correctly when both overlap zero', () => {
      checkDualMerge(
        range(5, 1), range(6, 0.5),
        range(5, 1));
      checkDualMerge(
        range(5, 0.5), range(6, 1),
        range(5, 1));
    });

    it('should set to [0, Tau] when overlapping on both sides', () => {
      checkDualMerge(
        range(1, 5), range(4, 2),
        range(0, TAU));
    });

    it('should merge when one spans zero and one overlaps on max end', () => {
      checkDualMerge(
        range(4, 2), range(1, 3),
        range(4, 3));
    });

    it('should merge when one spans zero and one is contained in max end', () => {
      checkDualMerge(
        range(4, 2), range(1, 1.5),
        range(4, 2));

      // Ensure it also handles boundary condition:
      checkDualMerge(
        range(4, 2), range(1, 2),
        range(4, 2));
    });

    it('should merge when one spans zero and one overlaps on min end', () => {
      checkDualMerge(
        range(4, 2), range(3, 5),
        range(3, 2));
    });

    it('should return true when one spans zero and one is contained in min end', () => {
      checkDualMerge(
        range(4, 2), range(5, 6),
        range(4, 2));

      // Ensure it also handles boundary condition:
      checkDualMerge(
        range(4, 2), range(4, 6),
        range(4, 2));
    });

    it('should not merge when one spans zero and one is elsewhere', () => {
      let a = range(5, 2);
      let b = range(3, 4);
      mergeRanges(a, b);
      expect(a).to.eql(range(5, 2));
      mergeRanges(b, a);
      expect(b).to.eql(range(3, 4));

      a = range(4, 3);
      b = range(3.1, 3.9);
      mergeRanges(a, b);
      expect(a).to.eql(range(4, 3));
      mergeRanges(b, a);
      expect(b).to.eql(range(3.1, 3.9));
    });

    it('should merge when the ranges abut', () => {
      checkDualMerge(
        range(4, 2), range(2, 3),
        range(4, 3));

      checkDualMerge(
        range(3, 4), range(2, 3),
        range(2, 4));

      checkDualMerge(
        range(2, 4), range(4, 2),
        range(0, TAU));
    });

  });

  describe('radiansMaximumGap', () => {

    it('should handle one trivial range', () => {
      let ranges = [range(1, 3)];
      let gaps = radiansMaximumGap(ranges);
      expect(gaps).to.eql(range(3, 1));
    });

    it('should handle one looping range', () => {
      let ranges = [range(5, 2)];
      let gaps = radiansMaximumGap(ranges);
      expect(gaps).to.eql(range(2, 5));
    });

    it('should handle two trivial, non-overlapping ranges', () => {
      let ranges = [range(1, 3), range(4, 5)];
      let gaps = radiansMaximumGap(ranges);
      expect(gaps).to.eql(range(5, 1));

      ranges = [range(1, 2), range(5, 6)];
      gaps = radiansMaximumGap(ranges);
      expect(gaps).to.eql(range(2, 5));
    });

    it('should handle two non-overlapping ranges', () => {
      let ranges = [range(2, 3), range(6, 1)];
      let gaps = radiansMaximumGap(ranges);
      expect(gaps).to.eql(range(3, 6));
    });

    it('should handle multiple ranges', () => {
      let ranges = [range(2.5, 4), range(3, 4), range(3, 5), range(6, 1)];
      let gaps = radiansMaximumGap(ranges);
      expect(gaps).to.eql(range(1, 2.5));
    });

    it('should pick the last if multiple equal gaps exist', () => {
      let ranges = [range(2, 4), range(3, 4), range(3, 5), range(6, 1)];
      let gaps = radiansMaximumGap(ranges);
      expect(gaps).to.eql(range(5, 6));

      ranges = [range(3, 5), range(6, 1), range(2, 4), range(3, 4)];
      gaps = radiansMaximumGap(ranges);
      expect(gaps).to.eql(range(5, 6));

      ranges = [range(6, 1), range(2, 4), range(3, 5), range(3, 4)];
      gaps = radiansMaximumGap(ranges);
      expect(gaps).to.eql(range(5, 6));
    });

    it('should handle cases without gaps', () => {
      let ranges = [range(1, 6), range(6, 1)];
      let gaps = radiansMaximumGap(ranges);
      expect(gaps).to.be(null);

      ranges = [range(0, TAU)];
      gaps = radiansMaximumGap(ranges);
      expect(gaps).to.be(null);

      ranges = [range(1, 6), range(6, 2), range(2, 3)];
      gaps = radiansMaximumGap(ranges);
      expect(gaps).to.be(null);

      ranges = [range(1, 3), range(3, 4), range(2, 5), range(3.5, 2), range(4, 5)];
      gaps = radiansMaximumGap(ranges);
      expect(gaps).to.be(null);
    });


  });

  describe('computeBoundingCylinder', () => {

    const box1 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({color: 'red'}));
    box1.position.set(2, 0, 0);
    const box2 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({color: 'red'}));
    box2.position.set(-2, 0, 0);
    const sphere1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshLambertMaterial({color: 'red'}));
    sphere1.position.set(0, 0, 2);
    const sphere2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshLambertMaterial({color: 'red'}));
    sphere2.position.set(0, 0, -2);

    const fullSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshLambertMaterial({color: 'red'}));
    fullSphere.position.set(0, 0, -0.1);

    it('should handle a single object', () => {
      const group = new THREE.Group();
      group.add(box1);
      let cyl = computeBoundingCylinder(group);
      expect(cyl.min.theta).to.within(0.5, 1.5);
      expect(cyl.max.theta).to.within(1.5, 2.5);
      expect(cyl.min.radius).to.be.within(1, 2);
      expect(cyl.max.radius).to.be.within(2, 3);
      expect(cyl.min.y).to.be.within(-1, 0);
      expect(cyl.max.y).to.be.within(0, 1);
    });

    it('should skip theta calculation if asked', () => {
      const group = new THREE.Group();
      group.add(box1);
      let cyl = computeBoundingCylinder(group, undefined, true);
      expect(cyl.min.theta).to.be(0);
      expect(cyl.max.theta).to.eql(TAU);
      expect(cyl.min.radius).to.be.within(1, 2);
      expect(cyl.max.radius).to.be.within(2, 3);
      expect(cyl.min.y).to.be.within(-1, 0);
      expect(cyl.max.y).to.be.within(0, 1);
    });

    it('should return full theta range when object overlaps center', () => {
      const group = new THREE.Group();
      group.add(fullSphere, box1);
      let cyl = computeBoundingCylinder(group);
      expect(cyl.min.theta).to.be(0);
      expect(cyl.max.theta).to.eql(TAU);
      expect(cyl.min.radius).to.be(0);
      expect(cyl.max.radius).to.be.within(2, 3);
      expect(cyl.min.y).to.be.within(-1, 0);
      expect(cyl.max.y).to.be.within(0, 1);
    });

    it('should handle multiple objects', () => {
      const group = new THREE.Group();
      group.add(box1, sphere1, sphere2);
      let cyl = computeBoundingCylinder(group);
      expect(cyl.min.theta).to.within(-0.5, 0);
      expect(cyl.max.theta).to.within(3, 3.5);
      expect(cyl.min.radius).to.be.within(1, 2);
      expect(cyl.max.radius).to.be.within(2, 3);
      expect(cyl.min.y).to.be.within(-1, 0);
      expect(cyl.max.y).to.be.within(0, 1);
    });

    it('should return full theta range when they together span the entire range', () => {
      const group = new THREE.Group();
      const positions = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];
      for (let p of positions) {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.95),
          new THREE.MeshLambertMaterial({color: 'red'}));
        sphere.position.set(p[0], p[1], p[2]);
        group.add(sphere);
      }
      let cyl = computeBoundingCylinder(group);
      expect(cyl.min.theta).to.be(0);
      expect(cyl.max.theta).to.eql(TAU);
      expect(cyl.min.radius).to.be.within(0, 0.1);
      expect(cyl.max.radius).to.be.within(1.9, 2);
      expect(cyl.min.y).to.be.within(-1, -0.9);
      expect(cyl.max.y).to.be.within(0.9, 1);
    });

  });

});
