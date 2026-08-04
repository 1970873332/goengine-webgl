import { BaseGeometryAny } from "@goengine/webgl/src/geometry/Base";
import { BaseMaterialAny } from "@goengine/webgl/src/material/Base";
import BaseGLNode, { BaseGLNodeConfig } from "../Base";

/**
 * 网格
 */
export default class Mesh<
    G extends BaseGeometryAny,
    M extends BaseMaterialAny,
    C extends IConfig,
    E extends {},
> extends BaseGLNode<C, E> {
    constructor(
        public geometry?: G,
        public material?: M,
        config?: C,
    ) {
        super();

        config && this.setConfig(config);
    }

    public copy(target: this, silence?: boolean): this {
        const { geometry, material } = target;

        Object.assign(this, { geometry, material });

        return super.copy(target, silence);
    }
}

interface IConfig extends BaseGLNodeConfig {}

type IAny = Mesh<BaseGeometryAny, BaseMaterialAny, any, any>;

export { IAny as MeshAny, IConfig as MeshConfig };
