import Main from "./Main";
const MoveVertexShader = /*glsl */`
attribute vec4 a_Color;
attribute vec3 a_NextPosition;
attribute vec4 a_NextColor;
attribute vec2 a_Process;
varying vec4 vColor;
uniform float u_Time;
uniform bool u_AutoRun;
${Main.GLSLChunk.Func.snoise_v3_f}
void main() {
   

    if(u_AutoRun){
        vec3 transformed = a_NextPosition;
        transformed.z += mod(max(0.0,u_Time*0.05 - a_Process.x),a_Process.y)*1000.0 ;
        vColor = a_NextColor;
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        gl_PointSize =  a_Process.x *2.0 +  (600.0 / length(mvPosition.xyz));
        gl_Position = projectionMatrix * mvPosition;
    }else{
        vec3 transformed = position;
        float value = u_Time>0.9?u_Time : u_Time-a_Process.x*0.01;
        transformed = mix(transformed,a_NextPosition,max(0.0,value));
        vColor = mix(a_Color,a_NextColor,value);
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        gl_PointSize =  mix(a_Process.x *2.0,a_Process.x *2.0 +  (600.0 / length(mvPosition.xyz)),value) ;
        gl_Position = projectionMatrix * mvPosition;
    }
}
`;
const MoveFragementShader =/*glsl */`

uniform sampler2D u_Texture;

varying vec4 vColor;

void main() {
    float dis = distance(gl_PointCoord.xy,vec2(0.5));
    if(dis>0.5){
        discard;
    }
  gl_FragColor = vec4(vColor);

  gl_FragColor = gl_FragColor * texture2D(u_Texture, gl_PointCoord);
}
`;

export { MoveVertexShader, MoveFragementShader };