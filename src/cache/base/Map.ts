/**
 * 缓存映射
 */
export default class MapCache<T> extends Map<string, T> {
    constructor(protected gl: GLSL.WebGLAllRenderingContext) {
        super();
    }
}
