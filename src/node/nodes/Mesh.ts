import ResponseAttribute from "@core/object/attribute/Response";
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
        this.geometry.silentSetter(geometry);
        this.material.silentSetter(material);
    }
    /**
     * 几何
     */
    public geometry = new ResponseAttribute<G | undefined>(
        void 0,
    );
    /**
     * 材质
     */
    public material = new ResponseAttribute<M | undefined>(
        void 0,
    );

    public toJSON(): ISaveJSON {
        return {
            ...super.toJSON(),
            geometryID: this.geometry.value?.uuid,
            materialID: this.material.value?.uuid,
        };
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

