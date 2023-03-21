import * as THREE from 'three';
type getType = "TorusGeometry" | "Box" | "Sphere" | "Random";
type T_ResultType = [THREE.BufferAttribute, THREE.BufferAttribute, THREE.BufferAttribute | null, THREE.BufferAttribute | null];
export interface I_ResultType {
    preBufferAttribute: THREE.BufferAttribute;
    nextBufferAttribute: THREE.BufferAttribute;
    processBufferAttribute: THREE.BufferAttribute;
    pivotScaleBufferAttribute: THREE.BufferAttribute;
    angleBufferAttribute: THREE.BufferAttribute;
    colorBufferAttribute: THREE.BufferAttribute;
    [key: string]: THREE.BufferAttribute;
}
/**
 * @用于管理粒子的生成以及Buffer替换
 */
abstract class Base {
    abstract random_x: number;
    abstract random_y: number;
    abstract random_z: number;
    abstract maxCount: number;
}
export default class ParticleManage implements Base {

    random_x: number;
    random_y: number;
    random_z: number;
    maxCount: number;

    constructor() {
        this.random_x = 0.5;
        this.random_y = 0.5;
        this.random_z = 0.5;
        this.maxCount = 2000;//每次渲染2000个粒子，应该还是没多大问题的
    }
    public getMesh(meshType: getType, size: number, isRandom: boolean, duration: number, tra: [number, number, number], isToGeometry: true, isColor: boolean): THREE.BufferGeometry;
    public getMesh(meshType: getType, size: number, isRandom: boolean, duration: number, tra: [number, number, number], isToGeometry: false, isColor: boolean): I_ResultType;
    public getMesh(meshType: getType, size: number, isRandom: boolean, duration: number, tra: [number, number, number] = [0, 0, 0], isToGeometry: boolean, isColor: boolean): I_ResultType | THREE.BufferGeometry | void {
        let result: T_ResultType;
        if (meshType === "TorusGeometry") {
            result = this.getTorusGeometry(size, isRandom, tra);
        } else if (meshType === "Sphere") {
            result = this.getSphere(size, isRandom, tra);
        } else if (meshType === "Box") {
            result = this.getBox(size, isRandom, tra);
        } else if (meshType === "Random") {
            result = this.getRandom(size, isRandom, tra);
        } else return;

        if (isToGeometry) return this.getOtherAttribute(result, duration, true, isColor);
        else return this.getOtherAttribute(result, duration, false, isColor);

    }
    public getRandomStarrySky(isRandom: boolean, duration: number, radius = 1000): THREE.BufferGeometry {
        const buffgeometry = new THREE.BufferGeometry();
        const randomArray = [];
        const processArray = [];
        const colorArray = [];
        for (let i = 0, len = 30; i < len; i++) {
            randomArray.push([THREE.MathUtils.randFloat(100, 400), THREE.MathUtils.randFloatSpread(1000), THREE.MathUtils.randFloatSpread(5000)]);
            randomArray.push([THREE.MathUtils.randFloat(-400, -100), THREE.MathUtils.randFloatSpread(5000), THREE.MathUtils.randFloatSpread(5000)]);
            randomArray.push([THREE.MathUtils.randFloatSpread(5000), THREE.MathUtils.randFloat(-100, 100), THREE.MathUtils.randFloat(100, 400)]);
            randomArray.push([THREE.MathUtils.randFloatSpread(5000), THREE.MathUtils.randFloat(-100, 100), THREE.MathUtils.randFloat(-400, -100)]);
            colorArray.push([1 - i / len, THREE.MathUtils.randFloat(0.4, 1), THREE.MathUtils.randFloat(0.4, 1), THREE.MathUtils.randFloat(0.5, 1)]);
            processArray.push([i / len * duration, duration]);
        }
        buffgeometry.setAttribute("a_Process", new THREE.BufferAttribute(new Float32Array(processArray.flat()), 2));
        buffgeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(randomArray.flat()), 3));
        buffgeometry.setAttribute("a_Color", new THREE.BufferAttribute(new Float32Array(colorArray.flat()), 4));
        return buffgeometry;
    }
    private getTorusGeometry(size: number, isRandom: boolean, tra: [number, number, number] = [0, 0, 0]): T_ResultType {
        const geometry = new THREE.TorusGeometry(size, 3, 16, 100);
        const buffer = geometry.getAttribute("position");
        const len = geometry.getAttribute("position").count;
        const randomArray: [number, number, number][] = [];
        const preArray: [number, number, number][] = [];
        for (let i = 0; i < len; i++) {
            randomArray.push([THREE.MathUtils.randFloatSpread(this.random_x), THREE.MathUtils.randFloatSpread(this.random_y), THREE.MathUtils.randFloatSpread(this.random_z)]);
            preArray.push([buffer.array[i * 3] + tra[0], buffer.array[i * 3 + 1] + tra[1], buffer.array[i * 3 + 2] + tra[2]]);
        }
        isRandom && preArray.sort(() => Math.random() - 0.5);
        const preBufferAttribute = new THREE.BufferAttribute(new Float32Array(preArray.flat()), 3);
        const randomBufferAttribute = new THREE.BufferAttribute(new Float32Array(randomArray.flat()), 3);
        return [randomBufferAttribute, preBufferAttribute, null, null];
    }

    private getBox(size: number, isRandom: boolean, tra: [number, number, number] = [0, 0, 0], width = size, height = size, depth = size): T_ResultType {
        const randomArray = [];
        const preArray = [];
        for (let i = 0; i < this.maxCount; i++) {
            preArray.push([THREE.MathUtils.randFloatSpread(width) + tra[0], THREE.MathUtils.randFloatSpread(height) + tra[1], THREE.MathUtils.randFloatSpread(depth) + tra[2]]);
            randomArray.push([THREE.MathUtils.randFloatSpread(this.random_x), THREE.MathUtils.randFloatSpread(this.random_y), THREE.MathUtils.randFloatSpread(this.random_z)]);
        }
        // for (let i = -width / 2; i < width / 2; i += 8) {
        //     for (let j = -height / 2; j < height / 2; j += 4) {
        //         for (let k = -depth / 2; k < depth / 2; k += 4) {
        //             preArray.push([i + type * 50, k, j]);
        //             randomArray.push([THREE.MathUtils.randFloatSpread(this.random_x), THREE.MathUtils.randFloatSpread(this.random_y), THREE.MathUtils.randFloatSpread(this.random_z)]);
        //         }
        //     }
        // }
        isRandom && preArray.sort(() => Math.random() - 0.5);
        const preBufferAttribute = new THREE.BufferAttribute(new Float32Array(preArray.flat()), 3);
        const randomBufferAttribute = new THREE.BufferAttribute(new Float32Array(randomArray.flat()), 3);
        return [randomBufferAttribute, preBufferAttribute, null, null];
    }
    private getRandom(size: number, isRandom: boolean, tra: [number, number, number] = [0, 0, 0]): T_ResultType {
        const randomArray: [number, number, number][] = [];
        const preArray: [number, number, number][] = [];
        for (let i = 0; i < size; i++) {
            randomArray.push([THREE.MathUtils.randFloatSpread(this.random_x), THREE.MathUtils.randFloatSpread(this.random_y), THREE.MathUtils.randFloatSpread(this.random_z)]);
            preArray.push([THREE.MathUtils.randFloatSpread(tra[0]), THREE.MathUtils.randFloatSpread(tra[1]), THREE.MathUtils.randFloatSpread(tra[2])]);
        }
        isRandom && preArray.sort(() => Math.random() - 0.5);
        const preBufferAttribute = new THREE.BufferAttribute(new Float32Array(preArray.flat()), 3);
        const randomBufferAttribute = new THREE.BufferAttribute(new Float32Array(randomArray.flat()), 3);
        return [randomBufferAttribute, preBufferAttribute, null, null];
    }
    private getSphere(size: number, isRandom: boolean, tra: [number, number, number] = [0, 0, 0]): T_ResultType {
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const buffer = geometry.getAttribute("position");
        const len = geometry.getAttribute("position").count;
        const randomArray = [];
        const preArray = [];
        for (let i = 0; i < len; i++) {
            randomArray.push([THREE.MathUtils.randFloatSpread(this.random_x), THREE.MathUtils.randFloatSpread(this.random_y), THREE.MathUtils.randFloatSpread(this.random_z)]);
            preArray.push([buffer.array[i * 3] + tra[0], buffer.array[i * 3 + 1] + tra[1], buffer.array[i * 3 + 2] + tra[2]]);
        }
        isRandom && preArray.sort(() => Math.random() - 0.5);
        const preBufferAttribute = new THREE.BufferAttribute(new Float32Array(preArray.flat()), 3);
        const randomBufferAttribute = new THREE.BufferAttribute(new Float32Array(randomArray.flat()), 3);
        return [randomBufferAttribute, preBufferAttribute, null, null];

    }
    public getModel(geometry: THREE.BufferGeometry, isRandom: boolean, duration: number, tra: [number, number, number] = [0, 0, 0], isColor: boolean): THREE.BufferGeometry {
        const buffer = geometry.getAttribute("position");
        const len = buffer.count;
        const randomArray = [];
        const preArray = [];
        for (let i = 0; i < len; i++) {
            randomArray.push([THREE.MathUtils.randFloatSpread(this.random_x), THREE.MathUtils.randFloatSpread(this.random_y), THREE.MathUtils.randFloatSpread(this.random_z)]);
            preArray.push([buffer.array[i * 3] + tra[0], buffer.array[i * 3 + 1] + tra[1], buffer.array[i * 3 + 2] + tra[2]]);
        }
        isRandom && preArray.sort(() => Math.random() - 0.5);
        const preBufferAttribute = new THREE.BufferAttribute(new Float32Array(preArray.flat()), 3);
        const randomBufferAttribute = new THREE.BufferAttribute(new Float32Array(randomArray.flat()), 3);
        return this.getOtherAttribute([randomBufferAttribute, preBufferAttribute, null, null], duration, true, isColor);
    }
    private getOtherAttribute([preBufferAttribute, nextBufferAttribute, preColorBufferAttribute, nextColorBufferAttribute]: T_ResultType, duration: number, isToGeometry: true, isColor: boolean): THREE.BufferGeometry;
    private getOtherAttribute([preBufferAttribute, nextBufferAttribute, preColorBufferAttribute, nextColorBufferAttribute]: T_ResultType, duration: number, isToGeometry: false, isColor: boolean): I_ResultType;
    private getOtherAttribute([preBufferAttribute, nextBufferAttribute, preColorBufferAttribute, nextColorBufferAttribute]: T_ResultType, duration: number, isToGeometry: boolean, isColor: boolean): I_ResultType | THREE.BufferGeometry {
        const processArray = [];
        const pivotScaleArray = [];
        const angleArray = [];
        const colorArray = [];
        const axis = new THREE.Vector3();
        for (let i = 0, len = preBufferAttribute.count; i < len; i++) {
            processArray.push([i / len * duration, duration]);
            pivotScaleArray.push(Math.random());
            axis.x = THREE.MathUtils.randFloatSpread(2);
            axis.y = THREE.MathUtils.randFloatSpread(2);
            axis.z = THREE.MathUtils.randFloatSpread(2);
            axis.normalize();
            const angle = Math.PI * THREE.MathUtils.randFloat(4, 8);
            angleArray.push([axis.x, axis.y, axis.z, angle]);
            if (!nextColorBufferAttribute) {
                if (isColor) {
                    colorArray.push([1 - i / len, THREE.MathUtils.randFloat(0.4, 0.6), i / len, 1]);
                }
                else {
                    colorArray.push([1.0, 1.0, 1.0, 1.0]);
                }
            }
        }
        if (isToGeometry) {
            const buffgeometry = new THREE.BufferGeometry();
            buffgeometry.setAttribute("position", preBufferAttribute);
            buffgeometry.setAttribute("a_NextPosition", nextBufferAttribute);
            buffgeometry.setAttribute("a_Color", preColorBufferAttribute ? preColorBufferAttribute : new THREE.BufferAttribute(new Float32Array(colorArray.flat()), 4));
            //传入顶点颜色
            buffgeometry.setAttribute("a_NextColor", nextColorBufferAttribute ? nextColorBufferAttribute : new THREE.BufferAttribute(new Float32Array(colorArray.flat()), 4));
            //给每个顶点设置一个process，便于动画
            buffgeometry.setAttribute("a_Process", new THREE.BufferAttribute(new Float32Array(processArray.flat()), 2));
            //传入一个控制路径中每个点的枢轴距离影响强度
            buffgeometry.setAttribute("a_PivotScale", new THREE.BufferAttribute(new Float32Array(pivotScaleArray), 1));
            //传入一个旋转数据，让他变得更加噪化
            buffgeometry.setAttribute("a_Angle", new THREE.BufferAttribute(new Float32Array(angleArray.flat()), 4));
            return buffgeometry;
        }
        else {
            return {
                preBufferAttribute,
                nextBufferAttribute,
                preColorBufferAttribute: preColorBufferAttribute ? preColorBufferAttribute : new THREE.BufferAttribute(new Float32Array(colorArray.flat()), 4),
                processBufferAttribute: new THREE.BufferAttribute(new Float32Array(processArray.flat()), 2),
                pivotScaleBufferAttribute: new THREE.BufferAttribute(new Float32Array(pivotScaleArray), 1),
                angleBufferAttribute: new THREE.BufferAttribute(new Float32Array(angleArray.flat()), 4),
                colorBufferAttribute: nextColorBufferAttribute ? nextColorBufferAttribute : new THREE.BufferAttribute(new Float32Array(colorArray.flat()), 4),
            };
        }

    }
    /**
     * 
     * @param currentBufferGeometry 当前几何体
     * @param nextBufferGeometry 接下来演变的几何体
     * @param isNative 是否是导入的模型
     * @param duration 进程时间
     * @param isToGeometry 返回处理好的几何体，如果为否则返回一系列BufferAttribute
     * @param isColor 如果为否则为白色，否则按照索引生成颜色
     */
    public HandlerCountPass(currentBufferGeometry: THREE.BufferGeometry, nextBufferGeometry: THREE.BufferGeometry, isRandom: boolean, isNative: boolean, duration: number, isToGeometry: true, isColor: boolean): THREE.BufferGeometry;
    public HandlerCountPass(currentBufferGeometry: THREE.BufferGeometry, nextBufferGeometry: THREE.BufferGeometry, isRandom: boolean, isNative: boolean, duration: number, isToGeometry: false, isColor: boolean): I_ResultType | void;
    public HandlerCountPass(currentBufferGeometry: THREE.BufferGeometry, nextBufferGeometry: THREE.BufferGeometry, isRandom: boolean, isNative: boolean, duration: number, isToGeometry: boolean, isColor: boolean): I_ResultType | void | THREE.BufferGeometry {
        //处理粒子数量的一个微通道
        const preArray = [];
        const currentCount = currentBufferGeometry.getAttribute("position").count;//这里获取position有两个用处，一:可以直接处理导入的模型，二:对于由该类生成的几何体position和a_NextPosition的数量是一致的
        const nextCount = nextBufferGeometry.getAttribute("position").count;
        const currentBuffer = currentBufferGeometry.getAttribute("a_NextPosition") as THREE.BufferAttribute;
        const nextBuffer = isNative ? nextBufferGeometry.getAttribute("position") as THREE.BufferAttribute : nextBufferGeometry.getAttribute("a_NextPosition") as THREE.BufferAttribute;
        const currentColorBuffer = currentBufferGeometry.getAttribute("a_NextColor") as THREE.BufferAttribute;
        const nextColorBuffer = isNative ? null : nextBufferGeometry.getAttribute("a_NextColor") as THREE.BufferAttribute;
        if (currentCount === nextCount) {
            //如果顶点数和现在一样多，那只需要将a_NextPosition变为position，将另一个缓冲几何体的position变为a_NextPosition即可
            if (isToGeometry)
                return this.getOtherAttribute([currentBuffer, nextBuffer, currentColorBuffer, nextColorBuffer], duration, true, isColor);
            else return this.getOtherAttribute([currentBuffer, nextBuffer, currentColorBuffer, nextColorBuffer], duration, false, isColor);
        } else {
            if (currentCount > nextCount) {
                //如果原来的顶点数比下一个要变换成的几何体多，那么就删除一部分顶点
                //可能会造成一定的视觉影响(某些顶点突然消失，也有降低该影响的思路:将储存顶点的排序随机化,顺带也可以剔除多余的顶点)，还有一个思路是:复制一部分顶点
                //还有一种思路 ,给出一个能承载顶点的最大值，少于最大值直接重复，这样就避免了删除,只采用了增添,即复制一部分顶点的变种想法
                //这里采用承载顶点的最大值方法(其他两种方法我都试过...都还不错，但是谁让我有强迫症捏，所以得用一种看起来没啥瑕疵的方法)
                const hybridArray: number[][] = [];//将顶点和颜色先储存在一起，以便随机
                const currentColorArray = [];
                const nextColorArray = [];
                for (let i = 0; i < currentCount; i++) {
                    const j = i % nextCount;
                    hybridArray.push([nextBuffer.array[j * 3], nextBuffer.array[j * 3 + 1], nextBuffer.array[j * 3 + 2], currentColorBuffer.array[i * 4], currentColorBuffer.array[i * 4 + 1], currentColorBuffer.array[i * 4 + 2], currentColorBuffer.array[i * 4 + 3], 1.0 - j / nextCount, j / nextCount, j / nextCount, 1]);
                }
                isRandom && hybridArray.sort(() => Math.random() - 0.5);
                for (let i = 0, len = hybridArray.length; i < len; i++) {
                    preArray.push(hybridArray[i].slice(0, 3));
                    currentColorArray.push(hybridArray[i].slice(3, 7));
                    isColor && nextColorArray.push(hybridArray[i].slice(7));
                    !isColor && nextColorArray.push([1.0, 1.0, 1.0, 1.0]);
                }
                const newPreBuffer = new THREE.BufferAttribute(new Float32Array(preArray.flat()), 3);
                const newPreColorBuffer = new THREE.BufferAttribute(new Float32Array(currentColorArray.flat()), 4);
                const nextColorBuffer = new THREE.BufferAttribute(new Float32Array(nextColorArray.flat()), 4);
                //由于重新修改过顶点的数量，那么就需要重新再计算一边其他顶点数据
                return this.getOtherAttribute([currentBuffer, newPreBuffer, newPreColorBuffer, nextColorBuffer], duration, true, isColor);
            } else {
                //如果原来的顶点数比下一个要变换成的几何体少，那么就复制一部分顶点,(如果采用承载顶点的最大值，则还需要更新顶点最大阈值)
                this.maxCount = nextCount;
                console.log("几何顶点数超过最大预设值,最大顶点变更为:", nextCount);
                const hybridArray: number[][] = [];//将顶点和颜色先储存在一起，以便随机
                const currentColorArray = [];
                const nextColorArray = [];
                for (let i = 0; i < nextCount; i++) {
                    const j = i % currentCount;
                    hybridArray.push([currentBuffer.array[j * 3], currentBuffer.array[j * 3 + 1], currentBuffer.array[j * 3 + 2], currentColorBuffer.array[j * 4], currentColorBuffer.array[j * 4 + 1], currentColorBuffer.array[j * 4 + 2], currentColorBuffer.array[j * 4 + 3], 1.0, THREE.MathUtils.randFloat(0.4, 0.6), i / nextCount, 1]);
                }
                isRandom && hybridArray.sort(() => Math.random() - 0.5);
                for (let i = 0, len = hybridArray.length; i < len; i++) {
                    preArray.push(hybridArray[i].slice(0, 3));
                    currentColorArray.push(hybridArray[i].slice(3, 7));
                    isColor && nextColorArray.push(hybridArray[i].slice(7));
                    !isColor && nextColorArray.push([1.0, 1.0, 1.0, 1.0]);
                }
                const newPreBuffer = new THREE.BufferAttribute(new Float32Array(preArray.flat()), 3);
                const newPreColorBuffer = new THREE.BufferAttribute(new Float32Array(currentColorArray.flat()), 4);
                const nextColorBuffer = new THREE.BufferAttribute(new Float32Array(nextColorArray.flat()), 4);
                return this.getOtherAttribute([newPreBuffer, nextBuffer, newPreColorBuffer, nextColorBuffer], duration, true, isColor);
            }
        }

    }

}
