import Matrix4 from "@goengine/core/src/object/math/matrix/Matrix4";
import BaseGLNode, { BaseGLNodeConfig, BaseGLNodeEvent } from "../node/Base";

/**
 * 相机
 */
export default abstract class Camera<
    C extends IConfig,
    E extends IEvent,
> extends BaseGLNode<C, E> {
    /**
     * 投影矩阵
     */
    public projectionMatrix = new Matrix4();

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

    public copy(target: this, silence?: boolean): this {
        const { projectionMatrix } = target;

        this.projectionMatrix.copy(projectionMatrix, true);

        return super.copy(target, silence);
    }
}

interface IConfig extends BaseGLNodeConfig {}

interface IEvent extends BaseGLNodeEvent {}

type IAny = Camera<any, any>;

export { IAny as CameraAny, IConfig as CameraConfig, IEvent as CameraEvent };
