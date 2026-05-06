import { Texture } from "three";
import BaseMaterial, { BaseMaterialEvent, BaseMaterialSaveJSON, MaterialConfig } from "./Base";

/**
 * 网格材质
 */
export default class MeshMaterial extends BaseMaterial<IConfig, IEvent> {
    /**
     * 是否是网格材质
     */
    public readonly isMeshMaterial = true;

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

    public toJSON(): ISaveJSON {
        return {
            ...super.toJSON(),
            textureAlpha: this.textureAlpha,
        };
    }
}

interface IConfig
    extends
    MaterialConfig,
    Partial<Pick<MeshMaterial, "texture" | "textureAlpha">> { }

interface IEvent extends BaseMaterialEvent { }

interface ISaveJSON
    extends BaseMaterialSaveJSON, Pick<MeshMaterial, "textureAlpha"> { }

export {
    IConfig as BaseMeshMaterialConfig,
    ISaveJSON as BaseMeshMaterialSaveJSON
};

