import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from "three/examples/jsm/libs/stats.module.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import gsap from "gsap";
import GLSLChunk from './GLSLChunk';
import Track from './disposeManage';
import { WebGLRendererParameters } from "three";
export interface MyObject3D<T = THREE.BufferGeometry, U = THREE.ShaderMaterial> extends THREE.Object3D {
    geometry?: T;
    material?: U;
    children: MyObject3D<T, U>[];
}
export interface MyMesh<T = THREE.BufferGeometry, U = THREE.ShaderMaterial> extends THREE.Object3D {
    geometry: T;
    material: U;
    isMesh: true;
    updateMorphTargets: () => void;
    children: MyMesh<T, U>[];
}
export default class Main {
    //创建世界坐标轴及其他帮助调试的东西
    debug!: boolean;
    //canvas容器
    container!: HTMLElement | null;
    //场景
    scene!: THREE.Scene;
    //相机
    camera!: (THREE.PerspectiveCamera | THREE.OrthographicCamera) & { autoFov?: boolean; };
    //渲染器参数
    rendererParams!: Record<string, any>;
    //透视相机参数
    perspectiveCameraParams!: Record<string, any>;
    //正交相机参数
    orthographicCameraParams!: Record<string, any>;
    //相机坐标
    cameraPosition!: THREE.Vector3;
    //相机焦点
    lookAtPosition!: THREE.Vector3;
    //渲染器
    renderer!: THREE.WebGLRenderer;
    //轨道控制器
    controls?: OrbitControls;
    //鼠标坐标
    mousePos!: THREE.Vector2;
    //多媒体
    sound?: THREE.Audio;
    //射线投射器
    rayCaster?: THREE.Raycaster;
    // 性能监测器
    stats!: Stats;
    //时钟对象
    clock!: THREE.Clock;
    //u_Time
    time: {
        value: number;
    };
    //timeScale 时间倍率
    timeScale: number;
    //glb模型加载器
    modelLoaderByGLTF!: GLTFLoader;
    //Draco模型解码器
    modelLoaderByDraco!: GLTFLoader;
    //后期处理通道
    composer?: EffectComposer;
    //动画
    $gsap!: GSAP;
    //gui
    gui?: GUI;
    //track 销毁器
    track!: Track;
    geometry!: any;
    material?: any;
    //获取当前挂载对象宽高比
    getAspect = (el: HTMLElement): number => el.clientWidth / el.clientHeight;
    getNormalizedMousePos = (e: MouseEvent | Touch) => {
        return {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1
        };
    };
    rad2Deg = (rad: number) => rad * 180 / Math.PI;
    static GLSLChunk = GLSLChunk;
    constructor(el: string | HTMLElement, debug = false) {
        /**
         * @el:挂载对象
         * @debug:加载调试模型
         */
        this.debug = debug;
        this.container = typeof el === "string" ? document.querySelector(el) : el;
        this.perspectiveCameraParams = {
            fov: 75,
            near: 0.1,
            far: 30000,
            aspect: this.getAspect(this.container!)
        };
        this.orthographicCameraParams = {
            zoom: 2,
            near: -100,
            far: 1000
        };
        this.cameraPosition = new THREE.Vector3(0, 0, 40);
        this.lookAtPosition = new THREE.Vector3(0, 0, 0);
        this.rendererParams = {
            //输出通道
            outputEncoding: THREE.sRGBEncoding,
            config: {
                //a通道
                alpha: true,
                //抗锯齿
                antialias: true
            }
        };

        this.mousePos = new THREE.Vector2(-10000, -10000);//鼠标初始化
        this.$gsap = gsap;
        this.time = {
            value: 0.0
        };
        this.timeScale = 1.0;
        this.clock = new THREE.Clock();
        const { width, height } = this.container!.getBoundingClientRect();
        this.geometry = new THREE.PlaneGeometry(width / 20, height / 20, 1, 1);
        this.modelLoaderByGLTF = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/');
        this.modelLoaderByDraco = new GLTFLoader();
        this.modelLoaderByDraco.setDRACOLoader(draco);//创建Draco加载器
        this.track = new Track();
    }

    init() {
        this.createScene();
        this.createCamera('PerspectiveCamera');
        this.createRenderer();
        this.createLight();
        this.createControls();
        this.addListeners();
        this.createEvery();
        this.setAnimate();
    }
    prefix_init() {
        this.createRenderer();
        this.createLight();
        this.addListeners();
        this.createEvery();
        this.setAnimate();
    }
    //创建场景，并使用debug参数
    createScene(sceneName?: string, debugParams?: { helper?: boolean, stats?: boolean, gui?: boolean; }) {
        this.scene = new THREE.Scene();
        if (this.debug && debugParams) {
            debugParams.helper && this.scene.add(new THREE.AxesHelper(100));
            debugParams.stats && (this.stats = Stats());
            debugParams.stats && this.container!.appendChild(this.stats.domElement);
            debugParams.gui && (this.gui = new GUI());
        }
        sceneName && (this.scene.name = sceneName);
    }

    //创建相机
    createCamera(type: 'PerspectiveCamera' | 'OrthographicCamera', cameraPos?: THREE.Vector3, lookAtPos?: THREE.Vector3, cameraName?: string, autoFov?: boolean) {
        if (type === 'OrthographicCamera') this.createOrthographicCamera(cameraPos, lookAtPos, cameraName);
        else this.createPerspectiveCamera(cameraPos, lookAtPos, cameraName, autoFov);
    }

    //创建透视相机
    createPerspectiveCamera(cameraPos?: THREE.Vector3, lookAtPos?: THREE.Vector3, cameraName?: string, autoFov?: boolean) {
        const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
        let { fov } = perspectiveCameraParams;
        const { aspect, near, far } = perspectiveCameraParams;
        const { height } = this.container!.getBoundingClientRect();
        autoFov && (fov = this.rad2Deg(2 * Math.atan(height / 2 / (cameraPos ? cameraPos.z : cameraPosition.z))));

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.autoFov = autoFov;
        cameraPos ? this.camera.position.copy(cameraPos) : this.camera.position.copy(cameraPosition);
        lookAtPos ? this.camera.lookAt(lookAtPos) : this.camera.lookAt(lookAtPosition);
        cameraName && (this.camera.name = cameraName);
    }

    //更新透视相机
    updatePerspectiveCamera() {
        this.perspectiveCameraParams.aspect = this.getAspect(this.container!);
        this.camera && ((this.camera as THREE.PerspectiveCamera).aspect = this.perspectiveCameraParams.aspect);
        this.camera && this.camera.updateProjectionMatrix();
        this.camera && this.camera.autoFov && (this.camera as THREE.PerspectiveCamera).isPerspectiveCamera && ((this.camera as THREE.PerspectiveCamera).fov = this.rad2Deg(2 * Math.atan(window.innerHeight / 2 / this.camera.position.z)));
    }

    //创建正交相机
    createOrthographicCamera(cameraPos?: THREE.Vector3, lookAtPos?: THREE.Vector3, cameraName?: string) {
        this.updateOrthographicCamera();
        const { orthographicCameraParams, cameraPosition, lookAtPosition } = this;
        const { left, right, top, bottom, near, far } = orthographicCameraParams;
        this.camera = new THREE.OrthographicCamera(
            left,
            right,
            top,
            bottom,
            near,
            far
        );
        cameraPos ? this.camera.position.copy(cameraPos) : this.camera.position.copy(cameraPosition);
        lookAtPos ? this.camera.lookAt(lookAtPos) : this.camera.lookAt(lookAtPosition);
        cameraName && (this.camera.name = cameraName);
    }

    //更新正交相机
    updateOrthographicCamera() {
        const { zoom, near, far } = this.orthographicCameraParams;
        const aspect = this.getAspect(this.container!);
        this.orthographicCameraParams = {
            left: -zoom * aspect,
            right: zoom * aspect,
            top: zoom,
            bottom: -zoom,
            near,
            far,
            zoom
        };
    }

    //创建渲染器
    createRenderer(backgroundColor?: string, parameters?: WebGLRendererParameters) {
        const { outputEncoding, config } = this.rendererParams;
        this.renderer = new THREE.WebGLRenderer({ parameters, ...config });
        this.renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
        this.renderer.outputEncoding = outputEncoding;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.resizeRendererToDisplaySize();
        this.container!.appendChild(this.renderer.domElement);
        backgroundColor ? this.renderer.setClearColor(backgroundColor) : this.renderer.setClearColor('#000000');
    }

    //创建光源
    createLight(count?: 0 | 1 | 2) {
        this.scene.add(new THREE.AmbientLight('#fff'));
        if (count) {
            const dirLight = new THREE.DirectionalLight('#fff', 0.5);
            dirLight.position.set(200, 300, 400);
            this.scene.add(dirLight);
        }
        if (count && count > 1) {
            const dirLight2 = new THREE.DirectionalLight('#fff', 0.5);
            dirLight2.position.set(-200, 300, 400);
            this.scene.add(dirLight2);
        }
    }
    //创建雾
    createFog(color: THREE.Color, near: number, far: number): void {
        this.scene.fog = new THREE.Fog(color, near, far);
    }
    createFogExp2(color: string | number, density: number): void {
        this.scene.fog = new THREE.FogExp2(color, density);
    }
    //创建轨道控制器
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        const { lookAtPosition } = this;
        this.controls.target.copy(lookAtPosition);
        this.controls.update();
    }
    //创建样例平面
    createBaseMesh(size = 1) {
        const { width, height } = this.container!.getBoundingClientRect();
        this.geometry = new THREE.PlaneGeometry(width / size, height / size, 1, 1);
        const material = new THREE.ShaderMaterial({
            vertexShader: Main.GLSLChunk.Func.VertexShader,
            fragmentShader: Main.GLSLChunk.Func.FragmentShader,
            uniforms: {
                u_Time: this.time
            }
        });
        const plane = new THREE.Mesh(this.geometry, material);
        this.scene.add(plane);
    }
    //创建点选模型
    createRayCaster(debug = false, params: { click?: boolean, move?: boolean, out?: boolean, leave?: boolean; } = {
        click: false,
        move: false,
        out: false,
        leave: false
    }) {
        this.rayCaster = new THREE.Raycaster();
        this.trackMousePos(debug, params);
    }
    settimeScale(value: number) {
        this.timeScale = value;
    }
    //追踪鼠标位置
    trackMousePos(debug = false, params: { click?: boolean, move?: boolean, out?: boolean, leave?: boolean; } = {
        click: false,
        move: false,
        out: false,
        leave: false
    }) {
        const { click, move, out, leave } = params;
        move && window.addEventListener("mousemove", (e) => {
            //鼠标移动
            this.setMousePos(e, debug);
        });
        click && window.addEventListener("click", (e) => {
            //鼠标移动
            this.setMousePos(e, debug);
        });
        out && window.addEventListener("mouseout", () => {
            //鼠标离开某一个标签，或进入他的子标签
            this.clearMousePos();
        });
        leave && window.addEventListener("mouseleave", () => {
            //鼠标离开某一标签的范围
            this.clearMousePos();
        });
        window.addEventListener(
            "touchstart",
            (e: TouchEvent) => {
                //触摸事件
                this.setMousePos(e.touches[0], debug);
            },
            { passive: false }
        );
        window.addEventListener("touchmove", (e: TouchEvent) => {
            this.setMousePos(e.touches[0], debug);
        });
        window.addEventListener("touchend", () => {
            this.clearMousePos();
        });
    }

    //设置鼠标位置
    setMousePos(e: MouseEvent | Touch, debug = false) {
        const { x, y } = this.getNormalizedMousePos(e);
        this.mousePos.x = x;
        this.mousePos.y = y;
        debug && console.log("x=", this.mousePos.x, '\n', "y=", this.mousePos.y);
    }

    //初始化鼠标位置
    clearMousePos() {
        this.mousePos.x = 10000000;
        this.mousePos.y = 10000000;
    }

    getInterSects(): THREE.Intersection[] {
        this.rayCaster!.setFromCamera(this.mousePos, this.camera);
        return this.rayCaster!.intersectObjects([this.scene], true);
    }
    //获取鼠标移动方向,传入clientX,clientY
    normalizeVector2(vector: THREE.Vector2) {
        vector.x = (vector.x / document.body.clientWidth) * 2 - 1;
        vector.y = - (vector.y / window.innerHeight) * 2 + 1;
    }
    //加载其他
    createEvery() {
        this.createBaseMesh(20);
    }
    //改变背景
    changeBackground(value: THREE.Color) {
        this.renderer.setClearColor(value);
    }
    //添加监听事件
    addListeners() {
        this.onWindowResize();
    }
    //dispose
    dispose() {
        this.track.track(this.scene);
        window.removeEventListener("resize", this.handleSize);
        try {
            this.scene.clear();
            this.track && this.track.allDisTrack();
            this.renderer.dispose();
            this.renderer.forceContextLoss();

            const gl = this.renderer.domElement.getContext('webgl');

            gl && gl.getExtension("WEBGL_lose_context");
            this.container!.removeChild(this.renderer.domElement);
            this.stats && this.container!.removeChild(this.stats.domElement);
            this.gui && document.querySelector(".main")!.remove();
        } catch (e) {
            console.log(e);
        }
    }
    //日志
    info() {
        console.log(this.renderer.info);
        this.track.info();
    }
    //当窗口大小改变
    onWindowResize() {
        window.addEventListener("resize", this.handleSize);
    }
    handleSize = (e: Event) => {
        if (this.camera instanceof THREE.PerspectiveCamera) {
            this.updatePerspectiveCamera();
        } else if (this.camera instanceof THREE.OrthographicCamera) {
            const camera = this.camera;
            this.updateOrthographicCamera();
            const { left, right, top, bottom, near, far } = this.orthographicCameraParams;
            camera.left = left;
            camera.right = right;
            camera.top = top;
            camera.bottom = bottom;
            camera.near = near;
            camera.far = far;
            camera.updateProjectionMatrix();
        }
        this.renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
    };
    //获取随机颜色
    getRandomColor() {
        const color = new THREE.Color();
        color.setRGB(Math.random(), Math.random(), Math.random(), "srgb");
        return color;
    }
    //开启投影
    enableShadow() {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // 调整渲染器尺寸
    resizeRendererToDisplaySize() {
        const { renderer } = this;
        if (!renderer) {
            return;
        }
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const { clientWidth, clientHeight } = canvas;
        const width = (clientWidth * pixelRatio) | 0;
        const height = (clientHeight * pixelRatio) | 0;
        const isResizeNeeded = canvas.width !== width || canvas.height !== height;
        if (isResizeNeeded) {
            renderer.setSize(width, height, false);
        }
        return isResizeNeeded;
    }

    //动画
    update() {
    }

    //渲染
    setAnimate() {
        this.renderer.setAnimationLoop(() => {
            this.resizeRendererToDisplaySize();
            if (this.clock) {

                this.time.value = this.clock.getElapsedTime() * this.timeScale;
            }

            if (this.controls) {
                this.controls.update();
            }
            if (this.stats) {
                this.stats.update();
            }
            this.update();
            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        });
    }

}
