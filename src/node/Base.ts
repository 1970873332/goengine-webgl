import { Matrix4, Vector3 } from "@core/object/math/Index";
import BaseNode, { BaseNodeConfig, BaseNodeEvent } from "@core/object/Node";

/**
 * gl基础节点
 */
export default abstract class BaseGLNode<
    C extends IConfig,
    E extends IEvent,
> extends BaseNode<C, E> {
    /**
     * 是否是gl节点
     */
    public readonly isGLNode: boolean = true;

    /**
     * 向上的向量
     */
    public up = new Vector3(0, 1, 0);
    /**
     * 矩阵
     */
    public matrix = new Matrix4();

    /**
     * 世界矩阵
     */
    public get worldMatrix(): Matrix4 {
        const m: Matrix4 = this.matrix.clone();
        if (this.parent.value instanceof BaseGLNode) {
            return m.multiply(this.parent.value.worldMatrix);
        }
        return m;
    }

    /**
     * 更新矩阵
     * @returns
     */
    public updateMatrix(): void {
        this.matrix.copy(
            Matrix4.compose(this.position, this.quaternion, this.scale),
        );
    }

    public setConfig(config: C): void {
        super.setConfig(config);
        config.up && this.up.copy(config.up);
    }

    protected rotationCallback(): void {
        super.rotationCallback();
        this.updateMatrix();
    }

    protected quaternionCallback(): void {
        super.quaternionCallback();
        this.updateMatrix();
    }

    protected positionCallback(): void {
        super.positionCallback();
        this.updateMatrix();
    }

    protected scaleCallback(): void {
        super.scaleCallback();
        this.updateMatrix();
    }

    public add(...nodes: BaseGLNode<any, any>[]): this {
        return super.add(...nodes);
    }

    public remove(node: BaseGLNode<any, any>, destory?: boolean): this {
        return super.remove(node, destory);
    }
}

interface IConfig extends BaseNodeConfig, Partial<Pick<BaseGLNode<any, any>, "up">> { }

interface IEvent extends BaseNodeEvent { }

export { IConfig as BaseGLNodeConfig, IEvent as BaseGLNodeEvent };

