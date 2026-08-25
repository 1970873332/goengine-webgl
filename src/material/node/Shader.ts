import IdentityComponent from "@goengine/core/src/component/Identity";
import { UniformType } from "@goengine/webgl/src/GLSL";
import { BASE_FRAG, DEFAULT_FRAG } from "@goengine/webgl/src/glsl/fragment/Index";
import { BASE_VERT, DEFAULT_VERT } from "@goengine/webgl/src/glsl/vertex/Index";
import BaseMaterial, { BaseMaterialEvent, MaterialConfig } from "../Base";

/**
 * 着色器材质
 */
export default class ShaderMaterial<T extends IUniforms> extends BaseMaterial<
    IConfig<T>,
    IEvent
> {
    /**
     * 着色器材质
     * @param config 配置
     */
    constructor(config?: IConfig<T>) {
        super();

        config && this.setConfig(config);
    }

    /**
     * uniforms
     */
    public readonly uniforms: Partial<T> = {};
    /**
     * 顶点着色器
     */
    public readonly vertex = new IdentityComponent(`${BASE_VERT}\n${DEFAULT_VERT}`.trim());
    /**
     * 片元着色器
     */
    public readonly fragment = new IdentityComponent(`${BASE_FRAG}\n${DEFAULT_FRAG}`.trim());

    public setConfig(config: IConfig<T>): void {
        super.setConfig(config);

        const { vertex, fragment, uniforms } = config;

        Object.assign(this, { uniforms });

        vertex && this.vertex.updateChar(vertex);
        fragment && this.fragment.updateChar(fragment);
    }
}

interface IConfig<T extends IUniforms> extends MaterialConfig {
    /**
     * uniforms
     */
    uniforms: T;
    /**
     * 顶点着色器
     */
    vertex?: string;
    /**
     * 片元着色器
     */
    fragment?: string;
}

interface IEvent extends BaseMaterialEvent { }

interface IAttribute {
    /**
     * 类型
     */
    type: UniformType;
    /**
     * 值
     */
    value: unknown;
}

interface IUniforms extends Record<string, IAttribute> { }

export { IUniforms as ShaderMaterialUniform };
