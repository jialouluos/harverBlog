const waveVertexShader =/*glsl */`
#define LAMBERT

varying vec3 vLightFront;
varying vec3 vIndirectFront;

#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
	varying vec3 vIndirectBack;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <bsdfs>
#include <lights_pars_begin>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
uniform float u_Time;
varying float v_Time;
varying vec2 v_Uv;
varying vec3 vPosition;
void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>

	#include <beginnormal_vertex>

	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
    float x = transformed.x;
            float y = transformed.y;
            float sx = 0.0;
            float sy = 0.0;
            float sz = 0.0;

            float ti = 0.0;
            float index = 1.0;
            vec2 dir;//水波方向
            for(int i = 0;i<3;i++){
                ti = ti + 0.0005;
                index +=1.0;
                if(mod(index,2.0)==0.0){
                    dir = vec2(ti,1.0);
                }else{
                    dir = vec2(ti,-1.0);
                }
                float l1 = 5.0 * PI / (0.5 + ti);//波长
                float s1 = 5.0 * 2.0 / l1;//速度
                float x1 = 1.0 * dir.x * sin(dot(normalize(dir),vec2(x,y)) * l1 + u_Time * s1);
                float y1 = 1.0 * dir.y * sin(dot(normalize(dir),vec2(x,y)) * l1 + u_Time * s1);
                float z1 = 1.0 * sin(dot(normalize(dir),vec2(x,y)) * l1 + u_Time * s1);
                sx +=y1;
                sy +=x1;
                sz +=z1;
            }
            sx = x + sx;
            sy = y + sy;
	#include <morphtarget_vertex>
	#include <skinning_vertex>

    transformed = vec3(sx,sy,sin(sz) * 4.0*sin(sz)*sin(sz));

    //  transformed = vec3(position.x, position.y, position.z + sin1  + sin2  + sin3);

    vec4 mvPosition = vec4( transformed, 1.0 );
    #ifdef USE_INSTANCING
	    mvPosition = instanceMatrix * mvPosition;
    #endif
    mvPosition = modelViewMatrix * mvPosition;
	vPosition = position;
    gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <lights_lambert_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
    v_Time = u_Time;
    v_Uv = uv;
}
`
const waveFragementShader =/*glsl */`
precision mediump float;
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
varying float v_Time;
varying vec3 vLightFront;
varying vec3 vIndirectFront;
varying vec2 v_Uv;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
	varying vec3 vIndirectBack;
#endif


#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <fog_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec3 vPosition;

const float duration = 8.0;
const float delay = 4.0;
vec3 convertHsvToRgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
void main() {

	#include <clipping_planes_fragment>
	float now = clamp((v_Time - delay) / duration, 0.0, 1.0);
  	float opacity = (1.0 - length(vPosition.xy / vec2(512.0))) * 0.6 * now;
  	vec3 v = normalize(vPosition);
  	vec3 rgb = convertHsvToRgb(vec3(0.5 + (v.x + v.y + v.x) / 40.0 + v_Time * 0.1, 0.4, 1.0));
    vec3 col = 0.5 + 0.5*cos(v_Time *0.5+v_Uv.xyx+vec3(0,2,4));
	vec4 diffuseColor = vec4( rgb*col, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <emissivemap_fragment>

	// accumulation

	#ifdef DOUBLE_SIDED

		reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;

	#else

		reflectedLight.indirectDiffuse += vIndirectFront;

	#endif

	#include <lightmap_fragment>

	reflectedLight.indirectDiffuse *= BRDF_Lambert( diffuseColor.rgb );

	#ifdef DOUBLE_SIDED

		reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;

	#else

		reflectedLight.directDiffuse = vLightFront;

	#endif

	reflectedLight.directDiffuse *= BRDF_Lambert( diffuseColor.rgb ) * getShadowMask();

	// modulation

	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

	#include <envmap_fragment>

	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}
`
export { waveVertexShader, waveFragementShader }