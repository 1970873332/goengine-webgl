import WeakMapCache from "./base/WeakMap";

export default class LocationCache extends WeakMapCache<WebGLProgram, TData> {
    /**
     * 获取属性位置
     * @param program 
     * @param key 
     * @returns 
     */
    public obtainAttribLocation(program: WebGLProgram, key: string): number {
        const cache: TData = this.get(program) ?? {};

        if (typeof cache[key] !== "number") {
            const location: number | null = this.gl.getAttribLocation(program, key);

            cache[key] = location;
        }

        if (!this.has(program)) this.set(program, cache);

        return cache[key] as number;
    }
    /**
     * 获取unifrom位置
     * @param program 
     * @param key 
     * @returns 
     */
    public obtainUnifromLocation(program: WebGLProgram, key: string): WebGLUniformLocation | null {
        const cache: TData = this.get(program) ?? {};

        if (!(cache[key] instanceof WebGLUniformLocation)) {
            const location: WebGLUniformLocation | null = this.gl.getUniformLocation(program, key);

            cache[key] = location;
        }

        if (!this.has(program)) this.set(program, cache);

        return cache[key];
    }

}

type TData = Record<string, WebGLUniformLocation | number | null>;

export {
    TData as LocationCacheData
};

