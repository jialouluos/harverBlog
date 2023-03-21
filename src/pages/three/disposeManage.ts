import * as THREE from 'three';
import { MyObject3D } from './Main';
const isObject3D = (object: unknown): object is MyObject3D => {
    if (object instanceof THREE.Object3D) {
        return true;
    } else {
        return false;
    }
};
export default class Track {
    sources!: Set<any>;
    /**
     * @track 捕获需要释放的对象
     * @trackByScene 从场景中捕获所有可释放的对象
     * @disTrack 删除已经捕获的单个对象
     * @disTrackByGroup 删除已经捕获的组及其所有子对象
     * @allDisTrack 释放所有捕获的对象
     * @info 查看状态
     */
    constructor() {
        this.sources = new Set();
    }
    track(obj: any) {
        if (!obj) return obj;
        //children
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                this.track(item);
            });
            return obj;
        }
        if (obj.dispose || obj instanceof THREE.Object3D) {
            this.sources.add(obj);//为后续释放将其从parent中移除
            if (isObject3D(obj)) {
                this.track(obj.geometry);
                this.track(obj.material);
                this.track(obj.children);
            }
        }
        if (obj instanceof THREE.Material) {
            for (const value of Object.values(obj)) {
                if (value instanceof THREE.Texture) {
                    this.track(value);
                }
            }
        }
        if (obj.uniforms) {
            for (const value of Object.values(obj.uniforms as { [uniform: string]: THREE.IUniform; })) {
                if (value) {
                    if (value instanceof THREE.Texture) {
                        this.track(value);
                    }
                }
            }
        }
        return obj;
    }
    trackByScene(scene: THREE.Scene) {
        scene.traverse(item => {
            if (item instanceof THREE.Object3D) {
                this.track(item);
            }
        });
    }
    disTrack(obj: any) {
        this.sources.delete(obj);
        if (obj instanceof THREE.Object3D) {
            if (obj.parent) {
                obj.parent.remove(obj);
            }
        }
        obj.dispose && obj.dispose();
        return obj;
    }
    disTrackByGroup(group: THREE.Group) {
        const values = [...group.children.values()] as any[];//拷贝留做副本去遍历
        for (const child of values) {
            if (isObject3D(child)) {
                this.disTrack(child.geometry);
                if (child.material) {
                    for (const value of Object.values(child.material)) {
                        if (value instanceof THREE.Texture) {
                            this.disTrack(value);
                        }
                    }
                    if (child.material.uniforms) {
                        for (const value of Object.values(child.material.uniforms as { [uniform: string]: THREE.IUniform; })) {
                            if (value) {
                                if (value instanceof THREE.Texture) {
                                    this.disTrack(value);
                                }
                            }
                        }
                    }
                    this.disTrack(child.material);
                }
                if (child instanceof THREE.Group) {
                    this.disTrackByGroup(child);
                }
            }
        }
        for (const child of values) {
            this.sources.has(child) && this.sources.delete(child);
        }
        group.parent && group.parent.remove(group);//?从父节点移除该节点
        this.sources.delete(group);//?从Set中移除该节点
        group.clear();
    }
    allDisTrack() {
        for (const item of this.sources) {
            if (item instanceof THREE.Object3D) {
                if (item.parent) {
                    item.parent.remove(item);
                }
            }
            item.dispose && item.dispose();
        }
        this.sources.clear();
    }
    info() {
        console.log(this.sources);
    }
}