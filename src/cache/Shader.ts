import { BaseMaterialAny } from "@goengine/webgl/src/material/Base";
import ShaderMaterial from "../material/node/Shader";
import ShaderState from "../state/Shader";
import MapCache from "./base/Map";


const {
    VERTEX_SHADER,
    FRAGMENT_SHADER
} = WebGLRenderingContext;

/**
 * 着色器状态缓存
 */
export default class ShaderStateCache extends MapCache<ShaderState> {

    /**
     * 分配
     * @param material
     */
    public allocate(material: BaseMaterialAny): [ShaderState, ShaderState] {

        if (material instanceof ShaderMaterial) {
            const {
                vertex: {
                    uuid: vertex_uuid,
                    char: vertex_char
                },
                fragment: {
                    uuid: fragment_uuid,
                    char: fragment_char
                }
            } = material;


            return [
                this.save(VERTEX_SHADER, vertex_uuid, vertex_char),
                this.save(FRAGMENT_SHADER, fragment_uuid, fragment_char)
            ];
        }

        return [] as any;
    }

    /**
     * 存储
     * @param type 
     * @param id 
     * @param source 
     * @returns 
     */
    public save(type: GLenum, id: string, source: string): ShaderState {
        if (this.has(id)) return this.get(id)!;

        const shaderState = new ShaderState(type, id, source);

        this.set(id, shaderState);

        return shaderState;
    }
}
