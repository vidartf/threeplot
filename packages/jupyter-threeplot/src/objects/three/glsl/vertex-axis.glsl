


attribute float a_vertex_id;  // webgl2 required for int attributes or gl_VertexID
//attribute float a_vertex_id;  // webgl2 required for int attributes

uniform uint u_n_vertices;
uniform float u_linewidth;
uniform vec3 u_tick_vector;
uniform float u_length;

varying float v_u;
varying float v_v;
varying vec2
varying uint v_edge;

#ifndef TICK_VECTOR_3D
#define TICK_VECTOR_3D
#endif

void main()
{
    // For each tick, we have two vertices to set
    // Our job is to offset the second vertex
    // of each pair
    vec2 offset2d;

    v_u = a_vertex_id % 2 ? 1.0 : 0.0;
    v_v = floor(a_vertex_id / 2) ? 1.0 : 0.0;

    // Detect when near an edge!
    v_edge = a_vertex_id < 2 ? 1 : (u_n_vertices - a_vertex_id) < 2 ? 2 : 0;

#ifdef TICK_VECTOR_3D
    // Case 1:
    // Tick vector is fixed in 3D: add/sub vector before projecting
    vec2 vA;
    vec2 vB;
    mat4 MVP = projectionMatrix * modelViewMatrix;
    if (a_vertex_id % 2 != 0) {
        gl_Position = MVP * vec4(position + u_tick_vector * u_length, 1.0);
    } else {
        gl_Position = MVP * vec4(position, 1.0);
    }
    if (v_edge > 0) {
        // Add offset to ensure room for tick width of outer ticks:
        if (a_vertex_id % 2 != 0) {
            vA = (MVP * vec4(position, 1.0)).xy;
            vB = gl_Position.xy;
        } else {
            vB = gl_Position.xy;
            vA = (MVP * vec4(position - u_tick_vector * u_length, 1.0)).xy;
        }
        vec2 tick2d = vB - vA;
        vec2 perpDir = normalize(vec2(tick2d.y, -tick2d.x));
        // TODO: Check sign of perpdir
        if (v_edge == 1) {
            offset2d += perpDir * u_linewidth;
        } else {
            offset2d -= perpDir * u_linewidth;
        }
    }

#else
    // Case 2:
    // Tick vector is fixed in 2D: add/sub vector after projecting
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vec2 perpDir = normalize(vec2(u_tick_vector.y, -u_tick_vector.x));
    if (a_vertex_id % 2 != 0) {
        offset2d = u_tick_vector.xy * u_length;
    }
    if (v_edge > 0) {
        // Add offset to ensure room for tick width of outer ticks:
        // TODO: Check sign of perpdir
        if (v_edge == 1) {
            offset2d += perpDir * u_linewidth;
        } else {
            offset2d -= perpDir * u_linewidth;
        }
    }
#endif
    gl_Position.xy += offset2d;
}
