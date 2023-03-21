export default {
    Func: {
        VertexShader:/*glsl */`
        varying vec2 v_uv;
        void main(){
            vec4 vmPosition = modelViewMatrix * vec4(position,1.0);
            gl_Position = projectionMatrix * vmPosition;
            v_uv = uv;
        }`,
        FragmentShader:/*glsl*/`
        precision mediump float;
        varying vec2 v_uv;
        uniform float u_Time;
        void main(){
            vec2 st =  v_uv;
            vec3 col = 0.5 + 0.5*cos(u_Time+st.xyx+vec3(0,2,4));
            gl_FragColor = vec4(col,1.0);
        }
        `,
        uvToCenter:/*glsl */ `
        vec2 uvToCenter(vec2 uv){
            return (uv-0.5) *2.0 ;
        }`,
        /**
         *@smoothMin https://www.iquilezles.org/www/articles/smin/smin.htm
         *@smoothMin(float a,float b,float k):float
         */
        smoothMin:/*glsl */`
        float smoothMin(float a,float b,float k){
            float h=clamp(.5+.5*(b-a)/k,0.,1.);
            return mix(b,a,h)-k*h*(1.-h);
        }`,
        fresnel:/*glsl */`
        float fresnel(float bias,float scale,float power,vec3 I,vec3 N){
            return bias+scale*pow(1.+dot(I,N),power);
        }`,
        /**
        *@snoise
        *@噪声
        *@snoise(vec3 v):float
        */
        snoise_v3_f:/*glsl */`
        vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

        float snoise(vec3 v){
            const vec2 C=vec2(1./6.,1./3.);
            const vec4 D=vec4(0.,.5,1.,2.);

            // First corner
            vec3 i=floor(v+dot(v,C.yyy));
            vec3 x0=v-i+dot(i,C.xxx);

            // Other corners
            vec3 g=step(x0.yzx,x0.xyz);
            vec3 l=1.-g;
            vec3 i1=min(g.xyz,l.zxy);
            vec3 i2=max(g.xyz,l.zxy);

            //  x0 = x0 - 0. + 0.0 * C
            vec3 x1=x0-i1+1.*C.xxx;
            vec3 x2=x0-i2+2.*C.xxx;
            vec3 x3=x0-1.+3.*C.xxx;

            // Permutations
            i=mod(i,289.);
            vec4 p=permute(permute(permute(
                        i.z+vec4(0.,i1.z,i2.z,1.))
                        +i.y+vec4(0.,i1.y,i2.y,1.))
                        +i.x+vec4(0.,i1.x,i2.x,1.));

                        // Gradients
                        // ( N*N points uniformly over a square, mapped onto an octahedron.)
                        float n_=1./7.;// N=7
                        vec3 ns=n_*D.wyz-D.xzx;

                        vec4 j=p-49.*floor(p*ns.z*ns.z);//  mod(p,N*N)

                        vec4 x_=floor(j*ns.z);
                        vec4 y_=floor(j-7.*x_);// mod(j,N)

                        vec4 x=x_*ns.x+ns.yyyy;
                        vec4 y=y_*ns.x+ns.yyyy;
                        vec4 h=1.-abs(x)-abs(y);

                        vec4 b0=vec4(x.xy,y.xy);
                        vec4 b1=vec4(x.zw,y.zw);

                        vec4 s0=floor(b0)*2.+1.;
                        vec4 s1=floor(b1)*2.+1.;
                        vec4 sh=-step(h,vec4(0.));

                        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
                        vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;

                        vec3 p0=vec3(a0.xy,h.x);
                        vec3 p1=vec3(a0.zw,h.y);
                        vec3 p2=vec3(a1.xy,h.z);
                        vec3 p3=vec3(a1.zw,h.w);

                        //Normalise gradients
                        vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
                        p0*=norm.x;
                        p1*=norm.y;
                        p2*=norm.z;
                        p3*=norm.w;

                        // Mix final noise value
                        vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
                        m=m*m;
                        return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),
                        dot(p2,x2),dot(p3,x3)));
        }`,
        curlNoise:/*glsl*/`
        vec3 snoiseVec3(vec3 x){
                        return vec3(snoise(vec3(x)*2.-1.),
                        snoise(vec3(x.y-19.1,x.z+33.4,x.x+47.2))*2.-1.,
                        snoise(vec3(x.z+74.2,x.x-124.5,x.y+99.4)*2.-1.)
                    );
        }
        vec3 curlNoise(vec3 p){
                    const float e=.1;
                    vec3 dx=vec3(e,0.,0.);
                    vec3 dy=vec3(0.,e,0.);
                    vec3 dz=vec3(0.,0.,e);

                    vec3 p_x0=snoiseVec3(p-dx);
                    vec3 p_x1=snoiseVec3(p+dx);
                    vec3 p_y0=snoiseVec3(p-dy);
                    vec3 p_y1=snoiseVec3(p+dy);
                    vec3 p_z0=snoiseVec3(p-dz);
                    vec3 p_z1=snoiseVec3(p+dz);

                    float x=p_y1.z-p_y0.z-p_z1.y+p_z0.y;
                    float y=p_z1.x-p_z0.x-p_x1.z+p_x0.z;
                    float z=p_x1.y-p_x0.y-p_y1.x+p_y0.x;

                    const float divisor=1./(2.*e);
                    return normalize(vec3(x,y,z)*divisor);
        }`,
        /**
         * @snoise
         * @噪声
         * @snoise(vec2 st):float
         */
        snoise_v2_f:/*glsl*/`
        vec2 random2(in vec2 _st ){
            _st = vec2(
            dot(_st,vec2(127.326,321.324)),
            dot(_st,vec2(15.31,45.332))
                    );
        return 2.0*fract(sin(_st)*432.23) +1.0; //1.0 ~ 3.0
        }
        float snoise(vec2 st){ //Gradient Noise
        vec2 i = fract(st);//取小数
        vec2 k = floor(st);//向负无穷取整
        vec2 u = i*i*(3.0-2.0*i);//插值函数
        return  mix(
                    mix(dot(random2(k + vec2(0.0,0.0)),i - vec2(0.0,0.0)),
                        dot(random2(k + vec2(0.0,1.0)),i - vec2(0.0,1.0)),
                         u.y),
                    mix(dot(random2(k + vec2(1.0,0.0)),i - vec2(1.0,0.0)),
                        dot(random2(k + vec2(1.0,1.0)),i - vec2(1.0,1.0)),
                         u.y),
                       u.x
                   );//二维noise
        }`,
        /**
        * @fbm
        * @分型布朗运动
        * @fbm(vec2 st):float
        */
        fbm:/*glsl*/`
        #define FBM_COUNT  5
        float fbm(vec2 st){
        float result =0.0;//输出值
        float A = 0.5;//振幅
        mat2 rotate = mat2(cos(0.5),sin(0.5),//旋转矩阵
                           -sin(0.5),cos(0.5));
        for(int i= 0;i<FBM_COUNT;i++){//分型布朗运动核心
            result += A * snoise(st);
            st *=2.;//频率2倍
            st *= rotate;
            A *=0.5;//振幅1/2倍
        }
        return result;
        }`,
        /**
         * @cnosie
         * @cnoise (vec2 P):float
         */
        cnosie:/*glsl */`
        vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        float cnoise(vec2 P){
          vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
          vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
          Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
          vec4 ix = Pi.xzxz;
          vec4 iy = Pi.yyww;
          vec4 fx = Pf.xzxz;
          vec4 fy = Pf.yyww;
          vec4 i = permute(permute(ix) + iy);
          vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
          vec4 gy = abs(gx) - 0.5;
          vec4 tx = floor(gx + 0.5);
          gx = gx - tx;
          vec2 g00 = vec2(gx.x,gy.x);
          vec2 g10 = vec2(gx.y,gy.y);
          vec2 g01 = vec2(gx.z,gy.z);
          vec2 g11 = vec2(gx.w,gy.w);
          vec4 norm = 1.79284291400159 - 0.85373472095314 *
            vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
          g00 *= norm.x;
          g01 *= norm.y;
          g10 *= norm.z;
          g11 *= norm.w;
          float n00 = dot(g00, vec2(fx.x, fy.x));
          float n10 = dot(g10, vec2(fx.y, fy.y));
          float n01 = dot(g01, vec2(fx.z, fy.z));
          float n11 = dot(g11, vec2(fx.w, fy.w));
          vec2 fade_xy = fade(Pf.xy);
          vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
          float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
          return 2.3 * n_xy;
        }`,
        rotateVector:/*glsl */`
            vec3 rotateVector(vec4 q, vec3 v) {
                return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
            }
        `,
        quatFromAxisAngle:/*glsl */`
            vec4 quatFromAxisAngle(vec3 axis, float angle) {
                float halfAngle = angle * 0.5;
                return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
            }
        `,
        rotate2d:/*glsl */`
        mat2 rotate2d(float _angle){
            return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
            }
        `
    },
    Funcs: {
        SDF:/*glsl */ `
        /// @note 球体
        /// @param p 光线的三维坐标
        /// @param s 球体的半径
        float sdf_Sphere(vec3 p, float s)
        {
            /// 半径为 s,注意图形内部距离为负
            return length(p) - s;
        }

        /// @note 圆角立方体
        /// @param p 光线的三维坐标
        /// @param b 立方体的长宽高
        /// @param r 控制圆角的程度
        float sdf_RoundBox(vec3 p, vec3 b, float r)
        {
            return length(max(abs(p) - b, 0.0)) - r;
        }
        /// @note 立方体
        /// @param p 光线的三维坐标
        /// @param b 立方体的长宽高
        float sdf_Box(vec3 p, vec3 b)
        {
            vec3 q=abs(p)-b;
            return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);
        }
        /// @note （纵向）圆环体
        /// @param p 光线的三维坐标
        /// @param t 圆环的半径
        float sdf_Torus(vec3 p, vec2 t)
        {
            // t.x 控制圆环半径， t.y 控制粗细
            vec2 q = vec2(length(p.xz) - t.x, p.y);
            return length(q) - t.y;
        }

        /// @note （横向）圆环体
        /// @param p 光线的三维坐标
        /// @param t 圆环的半径
        float sdf_Torus2(vec3 p, vec2 t)
        {
            // t.x 控制圆环半径， t.y 控制粗细
            // p.z = 0 为圆柱体
            vec2 q = vec2(length(p.xy) - t.x, p.z);
            return length(q) - t.y;
        }

        /// @note 胶囊体（圆角直线）
        /// @param p 光线的三维坐标
        /// @param a 起点
        /// @param b 终点
        /// @param r 粗细
        float sdf_Capsule(vec3 p, vec3 a, vec3 b, float r)
        {
            vec3 pa = p - a, ba = b - a;
            // |pa|*cos(theta) / |ba|
            float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
            // ba*h 表示 pa 投影到 ba 上的向量, pa - ba*h 表示 p 点到 ba 线段的距离向量
            // r 控制了直线的宽度
            return length(pa - ba * h) - r;
        }`,
        RayStep:/*glsl */ `
        const float _epsilon = 0.001;//步进间距判定值
        const int MAX_STEP = 256;//最大步进数
        const float MAX_DIST =100.;//最大步进距离
        float RayMarch(vec3 ro, vec3 rd){
            float dN = 0.0;
            for (int i = 0; i < MAX_STEP; i++)
            {
                vec3 p = ro + rd * dN;
                float d = GetSDF(p);//GetSDF需要自己单独定义
                dN += d;
                if (dN > MAX_DIST || d < _epsilon)
                    break;
                }
            return dN;
        }`,
        /**
         *@rotation https://gist.github.com/yiwenl/3f804e80d0930e34a0b33359259b556c
         */
        Rotate:/*glsl */`
        mat4 rotationMatrix(vec3 axis,float angle){
            axis=normalize(axis);
            float s=sin(angle);
            float c=cos(angle);
            float oc=1.-c;
            return mat4(oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
                oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
                oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
            0.,0.,0.,1.);
        }
        vec3 rotate(vec3 v,vec3 axis,float angle){
            mat4 m=rotationMatrix(axis,angle);
            return(m*vec4(v,1.)).xyz;
        }`,
        catmullRomSpline:/*glsl */`
        vec4 catmullRomSpline(vec4 p0, vec4 p1, vec4 p2, vec4 p3, float t, vec2 c) {
            vec4 v0 = (p2 - p0) * c.x;
            vec4 v1 = (p3 - p1) * c.y;
            float t2 = t * t;
            float t3 = t * t * t;
            return vec4((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
        }
        vec4 catmullRomSpline(vec4 p0, vec4 p1, vec4 p2, vec4 p3, float t) {
            return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
        }

        vec3 catmullRomSpline(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t, vec2 c) {
            vec3 v0 = (p2 - p0) * c.x;
            vec3 v1 = (p3 - p1) * c.y;
            float t2 = t * t;
            float t3 = t * t * t;

            return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
        }
        vec3 catmullRomSpline(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
            return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
        }

        vec2 catmullRomSpline(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t, vec2 c) {
            vec2 v0 = (p2 - p0) * c.x;
            vec2 v1 = (p3 - p1) * c.y;
            float t2 = t * t;
            float t3 = t * t * t;

            return vec2((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
        }
        vec2 catmullRomSpline(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t) {
            return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
        }

        float catmullRomSpline(float p0, float p1, float p2, float p3, float t, vec2 c) {
            float v0 = (p2 - p0) * c.x;
            float v1 = (p3 - p1) * c.y;
            float t2 = t * t;
            float t3 = t * t * t;

            return float((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
        }
        float catmullRomSpline(float p0, float p1, float p2, float p3, float t) {
            return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
        }

        ivec4 getCatmullRomSplineIndices(float l, float p) {
            float index = floor(p);
            int i0 = int(max(0.0, index - 1.0));
            int i1 = int(index);
            int i2 = int(min(index + 1.0, l));
            int i3 = int(min(index + 2.0, l));

            return ivec4(i0, i1, i2, i3);
        }

        ivec4 getCatmullRomSplineIndicesClosed(float l, float p) {
            float index = floor(p);
            int i0 = int(index == 0.0 ? l : index - 1.0);
            int i1 = int(index);
            int i2 = int(mod(index + 1.0, l));
            int i3 = int(mod(index + 2.0, l));

            return ivec4(i0, i1, i2, i3);
        }`
    }
};