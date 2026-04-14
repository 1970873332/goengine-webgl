/**
 * 弱引用缓存映射
 */
export default class WeakMapCache<K extends object, T> extends WeakMap<K, T> {
    constructor(protected gl: GLSL.WebGLAllRenderingContext) {
        super();
    }
}
