import { Texture } from "three";
import BaseMaterial, { BaseMaterialEvent, MaterialConfig } from "../Base";

/**
 * 网格材质
 */
export default class MeshMaterial extends BaseMaterial<IConfig, IEvent> {
    /**
     * 纹理贴图
     */
    public texture?: Texture;
    /**
     * 纹理透明度
     */
    public textureAlpha: number = 1;
}

interface IConfig
    extends
        MaterialConfig,
        Partial<Pick<MeshMaterial, "texture" | "textureAlpha">> {}

interface IEvent extends BaseMaterialEvent {}

export { IConfig as BaseMeshMaterialConfig };
