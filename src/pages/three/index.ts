import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { waveVertexShader, waveFragementShader } from './waveShader.js';
import { spaceCount, vertexShader, fragmentShader } from './MainShader.js';
import { MoveVertexShader, MoveFragementShader } from './moveShader.js';
import Main from './Main.js';
import ParticleManage from './ParticleManage.js';
import { Mesh } from 'three';
type T_ModelChildren = THREE.Group & { children: THREE.LineSegments[]; };
const isGroup: (group: unknown) => asserts group is T_ModelChildren = (group) => {
    if (!(group instanceof THREE.Group)) {
        throw new Error("模型加载失败 | 模型结构有误");
    }
};
type Empty = "" | null | undefined | [] | 0 | false;
const isEmpty = (value: unknown): value is Empty => {
    if (value instanceof Array) {
        if (value.length === 0) return true;
        else return false;
    }
    if (!value) return true;
    return false;
};

export default class BlogWelComePoints extends Main {
    RawPoints: [THREE.Vector3[], THREE.Vector3[]];
    FloatingParticles!: THREE.Group;
    Pos!: [number, number, number][];
    isComplete!: boolean;
    Process: { value: number; };
    options: {
        duration: number;
        pivotMax: number;
        pivotMin: number;
    };
    particleManage: ParticleManage;
    renderPass!: RenderPass;
    shaderPass!: ShaderPass;

    leftQueue: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>[];
    rightQueue: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>[];
    modelQueue: THREE.BufferGeometry[];
    texture!: THREE.Texture;
    isDispose: boolean;
    vectorTouchMove!: THREE.Vector2;
    isSmallScreen: boolean;
    constructor(el: string | HTMLElement, debug: boolean) {
        super(el, debug);
        this.RawPoints = [[], []];
        this.Process = {
            value: 0
        };
        this.options = {
            duration: 10,
            pivotMax: 2,
            pivotMin: 0,
        };
        this.particleManage = new ParticleManage();
        this.leftQueue = [];
        this.rightQueue = [];
        this.modelQueue = [];
        this.isDispose = false;
        this.isSmallScreen = window.matchMedia(`(max-width: ${776}px)`).matches;
    }
    init() {
        this.createScene("", { gui: true, stats: true });
        this.createCamera('PerspectiveCamera', new THREE.Vector3(0, 30, 120), new THREE.Vector3(0, 0, 0), "", false);
        this.texture = this.createTexture();
        this.prefix_init();
        // this.createControls();
        this.createFogExp2("#000000", 0.04);
    }
    prefix_init() {
        this.createRenderer();
        this.createLight(0);
        this.addListeners();
        this.createEvery();
        this.setAnimate();
        this.vectorTouchMove = new THREE.Vector2();
        this.container!.addEventListener('mousemove', this.onMouse);
    }
    onMouse = (event: any) => {
        event.preventDefault();
        this.vectorTouchMove.set(event.clientX, event.clientY);
        this.normalizeVector2(this.vectorTouchMove);
        this.camera.position.x = 0 + this.vectorTouchMove.x * 1;
        this.camera.position.y = 30 + this.vectorTouchMove.y * 1;
    };
    createEvery() {
        this.initModel();
    }
    initModel() {

        const promise_1 = new Promise((res) => {

            this.modelLoaderByGLTF.loadAsync("/static/models/捷克罗姆.glb").then(({ scene: model }) => {
                res(model.children[0]);
            }).catch(_ => {
                this.modelLoaderByGLTF.loadAsync("/public/static/models/捷克罗姆.glb").then(({ scene: model }) => {
                    res(model.children[0]);
                });
            });
        });
        const promise_2 = new Promise((res) => {
            this.modelLoaderByGLTF.loadAsync("/static/models/雷希拉姆.glb").then(({ scene: model }) => {
                res(model.children[0]);
            }).catch(_ => {
                this.modelLoaderByGLTF.loadAsync("/public/static/models/雷希拉姆.glb").then(({ scene: model }) => {
                    res(model.children[0]);
                });
            });
        });
        const promise_3 = new Promise((res) => {
            this.modelLoaderByGLTF.loadAsync("/static/models/酋雷姆.glb").then(({ scene: model }) => {
                res(model.children[0]);
            }).catch(_ => {
                this.modelLoaderByGLTF.loadAsync("/public/static/models/酋雷姆.glb").then(({ scene: model }) => {
                    res(model.children[0]);
                });
            });
        });
        Promise.all([promise_1, promise_2, promise_3]).then(res => {
            res.map((item: any) => {
                this.modelQueue.push(item.geometry.clone());
                const trackGroup = new THREE.Group();
                trackGroup.add(item);
                this.track.track(trackGroup);
                this.track.disTrackByGroup(trackGroup);
            });
            this.modelLoaderByGLTF.loadAsync("/static/models/螺旋线.glb").then(({ scene: model }) => {
                isGroup(model);
                this.track.track(model);
                this.onModelLoadComplete([model.children[0], model.children[1]], model);
            }).catch(_ => {
                this.modelLoaderByGLTF.loadAsync("/public/static/models/螺旋线.glb").then(({ scene: model }) => {
                    isGroup(model);
                    this.track.track(model);
                    this.onModelLoadComplete([model.children[0], model.children[1]], model);
                });
            });
        }, res => {
            throw new Error(res);
        });
    }
    loadWave() {
        const material = new THREE.ShaderMaterial({
            vertexShader: waveVertexShader,
            fragmentShader: waveFragementShader,
            uniforms: {
                ...THREE.ShaderLib.lambert.uniforms,
                u_Time: this.time,
                opacity: {
                    value: 0.0
                }
            },
            wireframe: true,
            transparent: true
        });
        material.lights = true;
        material.fog = true;
        this.track.track(material);
        const geometry = new THREE.PlaneBufferGeometry(200, 100, 50, 50);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x -= Math.PI * 0.5;
        mesh.position.copy(this.camera.position);
        mesh.position.z -= 40;
        mesh.position.y = 0;
        this.scene.add(mesh);
        this.$gsap.to(mesh.material.uniforms.opacity, {
            value: 1.0,
            duration: 2.0
        });
    }
    onModelLoadComplete([leftLine, rightLine]: [THREE.LineSegments, THREE.LineSegments], model: THREE.Group) {
        this.HandlerPointFromLineModel(leftLine, 0);//将模型上的顶点转到数组中
        this.HandlerPointFromLineModel(rightLine, 1, model);//将模型上的顶点转到数组中
        this.initMovePoints();//使用catmullRomSpline分割粒子
        this.createMovePoint(this.RawPoints[0], 0);//创建buffergeometry
        this.createMovePoint(this.RawPoints[1], 1);
        this.initPass();
        this.initGsap();
    }
    initMovePoints() {
        this.FloatingParticles = new THREE.Group();
        this.material = new THREE.ShaderMaterial({
            vertexColors: true,
            vertexShader,
            fragmentShader,
            uniforms: {
                u_Time: this.time,
                u_AutoRun: {
                    value: false
                },
                u_Path: {
                    value: []
                }
            },
            transparent: true
        });
        this.track.track(this.material);
        this.RawPoints[0] = this.mapProcessFromPoints(this.RawPoints[0])!;
        this.RawPoints[1] = this.mapProcessFromPoints(this.RawPoints[1])!;
        this.scene.add(this.FloatingParticles);
    }
    //将路径映射为一个0~1的process
    mapProcessFromPoints(Points: THREE.Vector3[]) {
        if (Points.length === 0) return;
        return new THREE.CatmullRomCurve3(Points).getSpacedPoints(spaceCount);
    }
    initGsap() {
        this.$gsap.to(this.Process, {
            value: this.options.duration * 3.0,
            duration: 2,
            ease: "sine.inOut",
            onComplete: () => {
                this.leftQueue.map(item => {
                    item.material.uniforms.u_AutoRun.value = true;
                });
                this.rightQueue.map(item => {
                    item.material.uniforms.u_AutoRun.value = true;
                });
                this.loadWave();
                this.resetGsap();
            }
        });
    }
    resetGsap() {
        this.options.duration = 1.0;
        this.leftQueue.map(item => {
            this.track.track(item);
            item.geometry = this.particleManage.HandlerCountPass(item.geometry, this.particleManage.getMesh("TorusGeometry", 10, true, this.options.duration, [this.isSmallScreen ? 10 : 30, 20, 70], true, true), false, false, this.options.duration, true, true);
        });
        this.rightQueue.map(item => {
            this.track.track(item);
            item.geometry = this.particleManage.HandlerCountPass(item.geometry, this.particleManage.getMesh("Sphere", 10, true, this.options.duration, [this.isSmallScreen ? -10 : -30, 35, 70], true, true), false, false, this.options.duration, true, true);
        });
        this.Process.value = 0;
        const gsap = this.$gsap.to(this.Process, {
            value: this.options.duration,
            duration: 2,
            ease: "back.inOut(1.02)",
            onUpdate: () => {
                if (this.isDispose) gsap.kill();
            },
            onComplete: () => {
                this.resetGsap1();
            }
        });
    }
    resetGsap1() {
        this.options.duration = 1.0;
        this.leftQueue.map(item => {
            this.track.track(item);
            item.geometry = this.particleManage.HandlerCountPass(item.geometry, this.particleManage.getModel(this.modelQueue[1], false, this.options.duration, [this.isSmallScreen ? -10 : -30, 35, 70], true), true, false, this.options.duration, true, true);
        });
        this.rightQueue.map(item => {
            this.track.track(item);
            item.geometry = this.particleManage.HandlerCountPass(item.geometry, this.particleManage.getModel(this.modelQueue[0], false, this.options.duration, [this.isSmallScreen ? 10 : 30, 20, 70], true), true, false, this.options.duration, true, true);
        });
        this.Process.value = 0;
        const gsap = this.$gsap.to(this.Process, {
            value: this.options.duration,
            duration: 2,
            ease: "back.inOut(1.01)",
            onUpdate: () => {
                if (this.isDispose) gsap.kill();
            },
            onComplete: () => {
                this.resetGsap2();
            }
        });
    }
    resetGsap2() {
        this.options.duration = 1.0;
        this.leftQueue.map(item => {
            this.track.track(item);
            item.geometry = this.particleManage.HandlerCountPass(item.geometry, this.particleManage.getModel(this.modelQueue[2], false, this.options.duration, [this.isSmallScreen ? 10 : 30, 20, 70], true), false, false, this.options.duration, true, true);
        });
        this.rightQueue.map(item => {
            this.track.track(item);
            item.geometry = this.particleManage.HandlerCountPass(item.geometry, this.particleManage.getModel(this.modelQueue[2], false, this.options.duration, [this.isSmallScreen ? -10 : -30, 20, 70], true), false, false, this.options.duration, true, true);
        });
        this.Process.value = 0;
        const gsap = this.$gsap.to(this.Process, {
            value: this.options.duration,
            duration: 2,
            ease: "back.inOut(1.1)",
            onUpdate: () => {
                if (this.isDispose) gsap.kill();
            },
            onComplete: () => {
                this.resetGsap3();
            }
        });
    }
    resetGsap3() {
        this.options.duration = 1;
        this.Process.value = 0;
        const material = new THREE.ShaderMaterial({
            vertexColors: true,
            vertexShader: MoveVertexShader,
            fragmentShader: MoveFragementShader,
            uniforms: {
                u_Texture: { value: this.texture },
                u_Time: this.Process,
                u_AutoRun: {
                    value: false
                }
            },
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        this.leftQueue.map(item => {
            this.track.track(item);
            item.geometry = this.particleManage.HandlerCountPass(item.geometry, this.particleManage.getMesh("Random", 8350, true, this.options.duration, [1000, 1000, 500], true, true), false, false, this.options.duration, true, true);
            this.track.track(item.material);
            item.material = material;
        });
        this.rightQueue.map(item => {
            this.track.track(item);
            item.geometry = this.particleManage.HandlerCountPass(item.geometry, this.particleManage.getMesh("Random", 8350, true, this.options.duration, [1000, 1000, 500], true, true), false, false, this.options.duration, true, true);
            this.track.track(item.material);
            item.material = material;
        });
        const gsap = this.$gsap.to(this.Process, {
            value: this.options.duration,
            duration: 4,
            ease: "back.inOut(1.1)",
            onUpdate: () => {
                if (this.isDispose) gsap.kill();
            },
            onComplete: () => {
                this.resetGsap4();
            }
        });
    }
    resetGsap4() {
        this.options.duration = 1.0;
        this.Process.value = 0;
        this.leftQueue.map(item => {
            this.track.track(item);
            item.material.uniforms.u_AutoRun.value = true;
        });
        this.rightQueue.map(item => {
            this.track.track(item);
            item.material.uniforms.u_AutoRun.value = true;
        });
        const gsap = this.$gsap.to(this.Process, {
            value: 2000,
            duration: 2000,
            repeat: -1,
            onUpdate: () => {
                if (this.isDispose) gsap.kill();
            }
        });
    }
    initPass() {
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.shaderPass = new ShaderPass(FXAAShader);
        const effectFilmBW = new FilmPass(0.75, 0.5, 648, false as any);
        const afterimagePass = new AfterimagePass();
        (afterimagePass.uniforms as any)['damp'].value = 0.8;
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(this.renderPass);
        this.composer.addPass(effectFilmBW);
        this.composer.addPass(afterimagePass);
        this.renderer.autoClear = false;
        this.track.track(this.renderPass.overrideMaterial);
        this.track.track(effectFilmBW.fsQuad);
        this.track.track(effectFilmBW.material);
        this.track.track(effectFilmBW.uniforms);
        this.track.track(afterimagePass.uniforms);
        this.track.track(afterimagePass.textureComp);
        this.track.track(afterimagePass.textureOld);
        this.track.track(afterimagePass.shaderMaterial);
        this.track.track(this.shaderPass.material);
        this.track.track(this.shaderPass.uniforms);
        this.track.track(FXAAShader);
        this.track.track(this.shaderPass.fsQuad);
    }
    dispose() {
        this.isDispose = true;
        this.modelQueue.map(item => {
            this.track.track(item);
        });

        super.dispose();
        this.container!.removeEventListener('mousemove', this.onMouse);
        this.info();
        this.renderer = null as any;
    }
    createMovePoint(PointArray: THREE.Vector3[], type: 0 | 1) {
        //传入顶点数据
        if (isEmpty(PointArray)) return;
        const pathArray = PointArray.map(item => {
            return new THREE.Vector4(item.x, item.y, item.z, THREE.MathUtils.randFloat(this.options.pivotMin, this.options.pivotMax));
        });
        const material = this.material.clone();
        //传入路径数据，额外加一个枢轴距离
        material.uniforms.u_Path.value = pathArray;
        material.uniforms.u_Time = this.Process;
        material.depthWrite = false;
        material.depthTest = false;
        let buffgeometry;
        if (type) {//右边
            buffgeometry = this.particleManage.getMesh("Random", 2000, true, this.options.duration, [500, 500, 500], true, true);
        } else {
            buffgeometry = this.particleManage.getMesh("Random", 2000, true, this.options.duration, [500, 500, 500], true, true);
        }
        this.track.track(buffgeometry);
        this.track.track(material);
        const point = new THREE.Points(buffgeometry, material);
        point.frustumCulled = false;
        if (type) this.rightQueue.push(point);
        else this.leftQueue.push(point);
        this.FloatingParticles.add(point);
    }
    createTexture() {
        const canvas = document.createElement('canvas')!;
        const ctx = canvas.getContext('2d')!;
        canvas.width = 256;
        canvas.height = 256;
        const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
        grad.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.arc(128, 128, 128, 0, Math.PI / 180, true);
        ctx.fill();

        const texture = new THREE.Texture(canvas);
        this.track.track(texture);
        texture.needsUpdate = true;
        return texture;
    }
    HandlerPointFromLineModel(model: THREE.LineSegments, index: 0 | 1, RawModel?: THREE.Group) {
        const points = this.RawPoints[index];
        const geoPoints = model.geometry.getAttribute("position");
        const { itemSize, count, array } = geoPoints;
        for (let i = 0, len = count * 3; i < len; i += itemSize) {
            points.push(new THREE.Vector3(array[i], array[i + 1], array[i + 2]));
        }
        RawModel && this.track.track(RawModel);//打工模型已无用
        RawModel && this.track.disTrackByGroup(RawModel);//将他从缓存中叉出去
    }
}


