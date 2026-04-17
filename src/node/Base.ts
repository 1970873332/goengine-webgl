import { Vector3 } from "@core/object/math/Index";
import BaseNode, { BaseNodeConfig, BaseNodeEvent } from "@core/object/Node";

/**
 * gl基础节点
 */
export default abstract class BaseGLNode<
    C extends IConfig,
    E extends IEvent,
> extends BaseNode<C, E, BaseGLNode<any, any>> {
    /**
     * 是否是gl节点
     */
    public readonly isGLNode: boolean = true;

    /**
     * 向上的向量
     */
    public up = new Vector3(0, 1, 0);

    public setConfig(config: C): void {
        super.setConfig(config);
        config.up && this.up.copy(config.up);
    }

    public copy(target: this): this {
        const {
            up,
        } = target;

        this.up.copy(up, true);

        return super.copy(target);
    }
}

interface IConfig extends BaseNodeConfig, Partial<Pick<BaseGLNode<any, any>, "up">> { }

interface IEvent extends BaseNodeEvent { }

export { IConfig as BaseGLNodeConfig, IEvent as BaseGLNodeEvent };

