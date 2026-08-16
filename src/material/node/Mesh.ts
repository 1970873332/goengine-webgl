import { Texture } from "three";
import BaseMaterial, { BaseMaterialEvent, MaterialConfig } from "../Base";

/**
 * 网格材质
 */
export default class MeshMaterial extends BaseMaterial<IConfig, IEvent> {
    /**
     * 网格材质
     * @param config 配置
     */
    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }

    /**
     * 纹理贴图
     */
    public texture?: Texture;
    /**
     * 纹理透明度
     */
    public textureAlpha: number = 1;

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const { texture = this.texture, textureAlpha = this.textureAlpha } =
            config;

        Object.assign(this, { texture, textureAlpha });
    }
}

interface IConfig
    extends
        MaterialConfig,
        Partial<Pick<MeshMaterial, "texture" | "textureAlpha">> {}

interface IEvent extends BaseMaterialEvent {}

export { IConfig as MeshMaterialConfig };
