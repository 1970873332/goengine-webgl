import ArrayAttribute from "@goengine/core/src/object/attribute/Array";
import { AttributeKey } from "@goengine/webgl/src/GLSL";
import { BaseGeometryAny, BaseGeometryAttribute } from "../geometry/Base";
import WeakMapCache from "./base/WeakMap";
import { State } from "./State";

/**
 * 缓冲缓存
 */
export default class BufferCache extends WeakMapCache<
    ArrayBuffer,
    WebGLBuffer
> {
    /**
     * 缓冲
     * @param id
     * @returns
     */
    protected buffer(id: ArrayBuffer): WebGLBuffer {
        return this.get(id) ?? this.gl.createBuffer();
    }
    /**
     * 绑定
     * @param geometry
     */
    public bind(
        geometry: BaseGeometryAny,
        program: WebGLProgram,
        state: State,
    ): void {
        // 绑定属性缓冲
        Object.keys(geometry.attribute).forEach((key) => {
            const attribute: ArrayAttribute<Float32Array<ArrayBuffer>> =
                    geometry.attribute[key as keyof BaseGeometryAttribute]!,
                source: ArrayBuffer = attribute.array.buffer,
                buffer: WebGLBuffer = this.buffer(source),
                local: number =
                    state.buffer.location[key] ??
                    this.gl.getAttribLocation(
                        program,
                        AttributeKey[key as keyof typeof AttributeKey] ?? key,
                    );
            if (local !== -1) {
                // 绑定缓冲
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
                // 指定缓冲读取规则
                this.gl.vertexAttribPointer(
                    local,
                    attribute.size,
                    this.gl.FLOAT,
                    false,
                    0,
                    0,
                );
                // 存储数据缓冲
                if (!this.has(source)) {
                    // 上传数据
                    this.gl.bufferData(
                        this.gl.ARRAY_BUFFER,
                        attribute.array,
                        this.gl.STATIC_DRAW,
                    );
                    // 启用属性
                    this.gl.enableVertexAttribArray(local);
                    this.set(source, buffer);
                }
                // 更新缓存位置
                if (!(key in state.buffer.location)) {
                    state.expire = true;
                    state.buffer.location[key] = local;
                }
            }
        });
        // 绑定索引缓冲
        if (geometry.index) {
            const source: ArrayBuffer = geometry.index.array.buffer,
                buffer: WebGLBuffer = this.buffer(source);
            // 绑定缓冲
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
            // 上传数据
            if (!this.has(source)) {
                this.gl.bufferData(
                    this.gl.ELEMENT_ARRAY_BUFFER,
                    geometry.index.array,
                    this.gl.STATIC_DRAW,
                );
                this.set(source, buffer);
            }
        }
    }
}
