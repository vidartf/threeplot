/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

import * as THREE from 'three';


export
class LineSegmentsGeometry extends THREE.InstancedBufferGeometry {

    constructor() {

        super();

        this.type = 'LineSegmentsGeometry';

        var plane = new THREE.BufferGeometry();

        var positions = [ - 1, 2, 0, 1, 2, 0, - 1, 1, 0, 1, 1, 0, - 1, 0, 0, 1, 0, 0, - 1, - 1, 0, 1, - 1, 0 ];
        var uvs = [ 0, 1, 1, 1, 0, .5, 1, .5, 0, .5, 1, .5, 0, 0, 1, 0 ];
        var index = [ 0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5 ];

        this.setIndex( index );
        this.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        this.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

    }


    isLineSegmentsGeometry = true;

    applyMatrix( matrix: THREE.Matrix4 ) {

        var start = this.getAttribute('instanceStart') as THREE.InterleavedBufferAttribute;
        var end = this.getAttribute('instanceEnd');

        if ( start !== undefined ) {

            (matrix as any).applyToBufferAttribute( start );

            (matrix as any).applyToBufferAttribute( end );

            start.data.needsUpdate = true;

        }

        if ( this.boundingBox !== null ) {

            this.computeBoundingBox();

        }

        if ( this.boundingSphere !== null ) {

            this.computeBoundingSphere();

        }

        return this;

    }

    setPositions( array: Float32Array | number[] ) {

        var lineSegments;

        if ( array instanceof Float32Array ) {

            lineSegments = array;

        } else if ( Array.isArray( array ) ) {

            lineSegments = new Float32Array( array );

        } else {
            throw new Error('setPositions argument must be array or Float32Array');
        }

        var instanceBuffer = new THREE.InstancedInterleavedBuffer( lineSegments, 6, 1 ); // xyz, xyz

        this.addAttribute( 'instanceStart', new THREE.InterleavedBufferAttribute( instanceBuffer, 3, 0, false ) ); // xyz
        this.addAttribute( 'instanceEnd', new THREE.InterleavedBufferAttribute( instanceBuffer, 3, 3, false ) ); // xyz

        //

        this.computeBoundingBox();
        this.computeBoundingSphere();

        return this;

    }

    setColors( array: Float32Array | number[] ) {

        var colors;

        if ( array instanceof Float32Array ) {

            colors = array;

        } else if ( Array.isArray( array ) ) {

            colors = new Float32Array( array );

        } else {
            throw new Error('setColors argument must be array or Float32Array');
        }

        var instanceColorBuffer = new THREE.InstancedInterleavedBuffer( colors, 6, 1 ); // rgb, rgb

        this.addAttribute( 'instanceColorStart', new THREE.InterleavedBufferAttribute( instanceColorBuffer, 3, 0, false ) ); // rgb
        this.addAttribute( 'instanceColorEnd', new THREE.InterleavedBufferAttribute( instanceColorBuffer, 3, 3, false ) ); // rgb

        return this;

    }

    fromWireframeGeometry( geometry: THREE.BufferGeometry ) {

        this.setPositions( geometry.getAttribute('position').array as any);

        return this;

    }

    fromEdgesGeometry( geometry: THREE.BufferGeometry ) {

        this.setPositions( geometry.getAttribute('position').array as any);

        return this;

    }

    fromMesh( mesh: THREE.Mesh ) {

        this.fromWireframeGeometry( new THREE.WireframeGeometry( mesh.geometry ) );

        // set colors, maybe

        return this;

    }

    fromLineSegements( lineSegments: THREE.LineSegments ) {

        var geometry = lineSegments.geometry;

        if ( (geometry as any).isGeometry ) {

            this.setPositions( (geometry as THREE.Geometry).vertices as any );

        } else if ( (geometry as any).isBufferGeometry ) {

            this.setPositions( (geometry as THREE.BufferGeometry).getAttribute('position').array as any ); // assumes non-indexed

        }

        // set colors, maybe

        return this;

    }

    computeBoundingBox() {

        var box = new THREE.Box3();

        if ( this.boundingBox === null ) {

            this.boundingBox = new THREE.Box3();

        }

        var start = this.getAttribute('instanceStart');
        var end = this.getAttribute('instanceEnd');

        if ( start !== undefined && end !== undefined ) {

            (this.boundingBox as any).setFromBufferAttribute( start );

            (box as any).setFromBufferAttribute( end );

            this.boundingBox.union( box );

        }

    }

    computeBoundingSphere() {

        const vector = new THREE.Vector3();

        if ( this.boundingSphere === null ) {

            this.boundingSphere = new THREE.Sphere();

        }

        if ( this.boundingBox === null ) {

            this.computeBoundingBox();

        }

        const start = this.getAttribute('instanceStart');
        const end = this.getAttribute('instanceEnd');

        if ( start !== undefined && end !== undefined ) {

            const center = this.boundingSphere.center;

            this.boundingBox.getCenter( center );

            let maxRadiusSq = 0;

            for ( let i = 0, il = start.count; i < il; i ++ ) {

                vector.fromBufferAttribute( start as any, i );
                maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( vector ) );

                vector.fromBufferAttribute( end as any, i );
                maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( vector ) );

            }

            this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

            if ( isNaN( this.boundingSphere.radius ) ) {

                console.error( 'THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this );

            }

        }

    }

    toJSON() {

        // todo

    }

    clone(): this {

        let r = new LineSegmentsGeometry();
        r.copy(this);
        return r as this;

    }

    copy( source: LineSegmentsGeometry ) {

        // todo

        return this;

    }

}
