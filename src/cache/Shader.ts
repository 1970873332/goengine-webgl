import { base as BaseFragment } from "../glsl/fragment/Index";
import { base as BaseVertex } from "../glsl/vertex/Index";
import BaseMaterial from "../material/Base";
import ShaderMaterial from "../material/Shader";
import ShaderState from "../states/Shader";
import MapCache from "./base/Map";

/**
 * 着色器缓存
 */
export default class CacheShader extends MapCache<ShaderState<any>> {
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
    protected storage(type: GLenum, id: string, char: string): ShaderState<any> {
        if (this.has(id)) return this.get(id)!;
        const base: string = (() => {
            switch (type) {
                case this.gl.VERTEX_SHADER:
                    return BaseVertex;
                case this.gl.FRAGMENT_SHADER:
                    return BaseFragment;
                default:
                    throw new Error(`未知的着色器类型: ${type}`);
            }
        })(),
            shader: ShaderState<any> = new ShaderState(
                type,
                `${base}\n${char}`.trim(),
                id,
            )
                .trust()
                .compiled(this.gl);
        shader.complete && this.set(id, shader);
        return shader;
    }
    /**
     * 分配
     * @param material
     */
    public allocate(material: BaseMaterial<any, any>): GLSL.Shader<ShaderState<any>> {
        if (material instanceof ShaderMaterial) {
            const {
                vertex: { id: vertexID, char: vertexChar },
                fragment: { id: fragmentID, char: fragmentChar },
            } = material;
            return {
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
