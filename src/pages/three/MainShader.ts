import Main from "./Main";
const spaceCount = 1000;
const vertexShader =/*glsl*/`
#define PATH_LENGTH ${spaceCount + 1}
#define PATH_MAX ${(spaceCount).toFixed(1)}
attribute vec3 a_NextPosition;//球
uniform float u_Time;
uniform vec4 u_Path[PATH_LENGTH];
attribute vec2 a_Process;
attribute float a_PivotScale;
attribute vec4 a_Color;
attribute vec4 a_NextColor;
varying vec4 v_Color;
attribute vec4 a_Angle;
uniform bool u_AutoRun;
${Main.GLSLChunk.Func.snoise_v3_f}
${Main.GLSLChunk.Funcs.catmullRomSpline}
${Main.GLSLChunk.Func.quatFromAxisAngle}
${Main.GLSLChunk.Func.rotateVector}
vec3 handler_frequency_zero_to_two(in vec3 transform){
    float value = (u_Time  + a_Process.x )>=a_Process.y?u_Time + a_Process.x:0.0;
    float progress = mod(value,a_Process.y)/a_Process.y;//计算出当前所处的状态(0~1)
    vec4 quaternion = quatFromAxisAngle(a_Angle.xyz,a_Angle.w *progress );
    float index = progress * PATH_MAX;//将该状态转换到路径状态，得到该状态对应的顶点数据索引
    ivec4 path_pos = getCatmullRomSplineIndices(PATH_MAX,index);
    //Catmull-Rom Spline计算
    vec4 p0 = u_Path[path_pos[0]];
    vec4 p1 = u_Path[path_pos[1]];
    vec4 p2 = u_Path[path_pos[2]];
    vec4 p3 = u_Path[path_pos[3]];
    //通过fract可以去表现顶点在一段曲线的位置
    float path_progress = fract(index);
    //加上枢轴距离
    transform += catmullRomSpline(p0.w,p1.w,p2.w,p3.w,path_progress) * a_PivotScale;
    if(value!=0.0) transform *= snoise(transform)*6.0;
    //加上旋转
    transform = rotateVector(quaternion,transform);
    //加上Catmull-Rom Spline
    transform += catmullRomSpline(p0.xyz,p1.xyz,p2.xyz,p3.xyz,path_progress);
    return transform;
}
vec3 handler_frequency_two_to_three(in vec3 transform){
    float value = (u_Time  + a_Process.x )>=a_Process.y?u_Time + a_Process.x:0.0;
    float progress = mod(value,a_Process.y)/a_Process.y;//计算出当前所处的状态(0~1)
    vec4 quaternion = quatFromAxisAngle(a_Angle.xyz,a_Angle.w *progress);
    float index =  PATH_MAX;//将该状态转换到路径状态，得到该状态对应的顶点数据索引
    float index2 = progress * PATH_MAX;//将该状态转换到路径状态，得到该状态对应的顶点数据索引
    ivec4 path_pos = getCatmullRomSplineIndices(PATH_MAX,index);
    //Catmull-Rom Spline计算
    vec4 p0 = u_Path[path_pos[0]];
    vec4 p1 = u_Path[path_pos[1]];
    vec4 p2 = u_Path[path_pos[2]];
    vec4 p3 = u_Path[path_pos[3]];
    //通过fract可以去表现顶点在一段曲线的位置
    float path_progress = fract(index);
    //加上枢轴距离
    //加上Catmull-Rom Spline
    transform += catmullRomSpline(p0.xyz,p1.xyz,p2.xyz,p3.xyz,path_progress);
    transform = mix(transform,a_NextPosition,progress);
    return transform;
}
void main(){
    if(u_AutoRun){
        vec3 transform = position;
        float value = u_Time>0.9?u_Time : u_Time-a_Process.x*0.01;
        transform = mix(transform,a_NextPosition,max(0.0,value));
        vec4 modelPosition = modelMatrix * vec4(transform ,1.0);
        gl_Position = projectionMatrix  *viewMatrix * modelPosition;
        vec4 col = (mix(a_Color,a_NextColor,u_Time));
        v_Color = col;
    }else{
        vec3 transform = position;
        float frequency = floor((u_Time  + a_Process.x ) / a_Process.y);
        //frequency为0 则在原处
        //frequency为1时 则开始根据路径生成圆环
        //frequency为2时 则开始构成球
        //frequency为3时 完成构球
        if(frequency<2.0){
            transform = handler_frequency_zero_to_two(transform);
        }else if(frequency>=2.0 &&frequency < 3.0 ){
            transform = handler_frequency_two_to_three(transform);
        }else if (frequency >= 3.0){
            transform = a_NextPosition;
        }
        vec4 modelPosition = modelMatrix * vec4(transform ,1.0);
        gl_Position = projectionMatrix  * viewMatrix * modelPosition;
        v_Color = a_Color;
    }
    gl_PointSize = 2.0;
    
}
`;
const fragmentShader =/*glsl*/`
precision mediump float;
varying vec4 v_Color;
void main(){
    float dis = distance(gl_PointCoord.xy,vec2(0.5));
    if(dis>0.5){
        discard;
    }
    gl_FragColor = vec4(v_Color);
}
`;
export { spaceCount, vertexShader, fragmentShader };