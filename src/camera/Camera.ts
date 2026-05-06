import { Matrix4 } from "@core/object/math/Index";
import BaseGLNode, { BaseGLNodeConfig, BaseGLNodeEvent } from "../node/Base";

/**
 * 相机
 */
export default abstract class Camera<
    C extends IConfig,
    E extends IEvent,
> extends BaseGLNode<C, E> {
    /**
     * 是否是相机
     */
    public readonly isCamera: boolean = true;

    /**
     * 投影矩阵
     */
    public projectionMatrix: Matrix4 = new Matrix4();

    /**
     * 更新投影矩阵
     */
    public updateProjectionMatrix(): void {
        throw new Error("未实现updateProjectionMatrix");
    }
    /**
     * 重置尺寸
     */
    public resize(...args: any[]): this {
        throw new Error("未实现resize");
    }
}

interface IEvent extends BaseGLNodeEvent { }

interface IConfig extends BaseGLNodeConfig { }

export { IConfig as CameraConfig, IEvent as CameraEvent };

