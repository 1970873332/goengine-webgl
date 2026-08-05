import { BaseMaterialAny } from "@goengine/webgl/src/material/Base";
import { BASE_FRAG } from "../glsl/fragment/Index";
import { BASE_VERT } from "../glsl/vertex/Index";
import ShaderMaterial from "../material/node/Shader";
import ShaderState, { ShaderStateAny } from "../state/Shader";
import MapCache from "./base/Map";

/**
 * 着色器缓存
 */
export default class CacheShader extends MapCache<ShaderStateAny> {
    /**
     * 顶点着色器ID
     * @param name
     * @returns
     */
    protected vertexID(name: string): string {
        return `${name}_vertex`;
    }
    /**
     * 片段着色器ID
     * @param name
     * @returns
     */
    protected fragmentID(name: string): string {
        return `${name}_fragment`;
    }
    /**
     * 存储
     * @param type
     * @param id
     * @param char
     */
    protected storage(type: GLenum, id: string, char: string): ShaderStateAny {
        if (this.has(id)) return this.get(id)!;
        const base: string = (() => {
                switch (type) {
                    case this.gl.VERTEX_SHADER:
                        return BASE_VERT;
                    case this.gl.FRAGMENT_SHADER:
                        return BASE_FRAG;
                    default:
                        throw new Error(`未知的着色器类型: ${type}`);
                }
            })(),
            shader = new ShaderState(type, `${base}\n${char}`.trim(), id)
                .trust()
                .compiled(this.gl);
        shader.complete && this.set(id, shader);
        return shader;
    }
    /**
     * 分配
     * @param material
     */
    public allocate(material: BaseMaterialAny): WebGL.Shader<ShaderStateAny> {
        if (material instanceof ShaderMaterial) {
            const {
                vertex: { id: vertexID, char: vertexChar },
                fragment: { id: fragmentID, char: fragmentChar },
            } = material;
            return {
                id: `${vertexID}|${fragmentID}`,
                vertex: this.storage(
                    this.gl.VERTEX_SHADER,
                    vertexID,
                    vertexChar,
                ),
                fragment: this.storage(
                    this.gl.FRAGMENT_SHADER,
                    fragmentID,
                    fragmentChar,
                ),
            };
        } else {
            const name: string = material.constructor.name,
                vertexID: string = this.vertexID(name),
                fragmentID: string = this.fragmentID(name),
                vertexChar: string = "",
                fragmentChar: string = "";
            return {
                id: `${vertexID}|${fragmentID}`,
                vertex: this.storage(
                    this.gl.VERTEX_SHADER,
                    vertexID,
                    vertexChar,
                ),
                fragment: this.storage(
                    this.gl.FRAGMENT_SHADER,
                    fragmentID,
                    fragmentChar,
                ),
            };
        }
    }
}
