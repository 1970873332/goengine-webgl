import { Texture } from "three";
import BaseMaterial, { BaseMaterialSaveJSON, MaterialConfig } from "./Base";

/**
 * 网格材质
 */
export default class MeshMaterial<E extends Record<any, any>> extends BaseMaterial<IConfig, E> {
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
    Partial<Pick<MeshMaterial<any>, "texture" | "textureAlpha">> { }

interface ISaveJSON
    extends BaseMaterialSaveJSON, Pick<MeshMaterial<any>, "textureAlpha"> { }

export {
    IConfig as BaseMeshMaterialConfig,
    ISaveJSON as BaseMeshMaterialSaveJSON
};

