uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

varying vec2 vUv;

void main() {

    #include <clipping_planes_fragment>

    if ( vUv.y < 0.5 || vUv.y > 0.5 ) {

        float a = vUv.x - 0.5;
        float b = vUv.y - 0.5;
        float len2 = a * a + b * b;

        if ( len2 > 0.25 ) discard;

    }

    vec4 diffuseColor = vec4( diffuse, opacity );

    #include <logdepthbuf_fragment>
    #include <color_fragment>

    gl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );

    #include <premultiplied_alpha_fragment>
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>

}
