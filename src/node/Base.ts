import Vector3 from "@goengine/core/src/object/math/vector/Vector3";
import BaseNode, { BaseNodeConfig, BaseNodeEvent } from "@goengine/core/src/object/Node";

/**
 * gl基础节点
 */
export default abstract class BaseGLNode<
    C extends IConfig,
    E extends IEvent,
> extends BaseNode<C, E, IAny> {
    /**
     * 向上的向量
     */
    public readonly up = new Vector3(0, 1, 0);

    public setConfig(config: C): void {
        super.setConfig(config);

        const { up } = config;

        up && this.up.set(up.x, up.y, up.z, true);
    }

    public copy(target: this, silence?: boolean): this {
        const { up } = target;

        this.up.copy(up, true);

        return super.copy(target, silence);
    }
}

interface IConfig extends BaseNodeConfig {
    /**
     * 朝上的向量
     */
    up?: VectorObject.Vector3;
}

interface IEvent extends BaseNodeEvent {}

type IAny = BaseGLNode<any, any>;

export {
    IAny as BaseGLNodeAny,
    IConfig as BaseGLNodeConfig,
    IEvent as BaseGLNodeEvent,
};
