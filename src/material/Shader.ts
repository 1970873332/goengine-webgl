import IdentityComponent from "@core/component/Identity";
import { UniformType } from "@webgl/GLSL";
import { def as fragDefault } from "@webgl/glsl/fragment/Index";
import { def as vertDefault } from "@webgl/glsl/vertex/Index";
import BaseMaterial, { BaseMaterialEvent, MaterialConfig } from "./Base";

/**
 * 着色器材质
 */
export default class ShaderMaterial<
    T extends IUniforms
> extends BaseMaterial<IConfig<T>, IEvent> {
    constructor(config?: IConfig<T>) {
        super();
        config && this.setConfig(config);
    }

    /**
     * uniforms
     */
    public readonly uniforms: T = {} as T;
    /**
     * 顶点着色器
     */
    public readonly vertex = new IdentityComponent(vertDefault);
    /**
     * 片元着色器
     */
    public readonly fragment = new IdentityComponent(fragDefault);

    public setConfig(config: IConfig<T>): void {
        super.setConfig(config);
        Object.assign(this.uniforms, config.uniforms);
        config.vertex && this.vertex.updateChar(config.vertex);
        config.fragment && this.fragment.updateChar(config.fragment);
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

