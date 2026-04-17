import { BaseNodeSaveJSON } from "@core/object/Node";
import BaseGeometry from "@webgl/geometry/Base";
import BaseMaterial from "@webgl/material/Base";
import BaseGLNode, { BaseGLNodeConfig } from "../Base";

/**
 * 网格
 */
export default class Mesh<
    G extends BaseGeometry<any, any>,
    M extends BaseMaterial<any, any>,
    C extends IConfig,
    E extends Record<any, any>
> extends BaseGLNode<C, E> {
    /**
     * 是否是网格
     */
    public readonly isMesh: boolean = true;

    constructor(geometry?: G, material?: M, config?: C) {
        super();
        config && this.setConfig(config);
        Object.assign(this, { geometry, material });
    }
    /**
     * 几何
     */
    public geometry: G | undefined;
    /**
     * 材质
     */
    public material: M | undefined;

    public toJSON(): ISaveJSON {
        return {
            ...super.toJSON(),
            geometryID: this.geometry?.uuid,
            materialID: this.material?.uuid,
        };
    }

    public copy(target: this): this {
        const {
            geometry,
            material,
        } = target;

        Object.assign(this, { geometry, material });

        return super.copy(target);
    }
}

interface IConfig extends BaseGLNodeConfig { }

interface ISaveJSON extends BaseNodeSaveJSON {
    /**
     * 几何id
     */
    geometryID?: string;
    /**
     * 材质id
     */
    materialID?: string;
}

export { IConfig as MeshConfig, ISaveJSON as MeshSaveJSON };

