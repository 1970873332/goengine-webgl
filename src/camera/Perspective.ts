import Vector4 from "@goengine/core/src/object/math/vector/Vector4";
import Camera, { CameraConfig, CameraEvent } from "./Camera";

/**
 * 透视相机
 */
export default class PerspectiveCamera extends Camera<IConfig, IEvent> {
    /**
     * 透视相机
     * @param config 配置
     */
    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }
    /**
     * 配置
     */
    public readonly config = new Vector4(35, 1, 0.1, 1000).bindCallback(
        this.updateProjectionMatrix.bind(this),
    );

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const {
            fov = this.config.fov,
            far = this.config.far,
            near = this.config.near,
            aspect = this.config.aspect,
        } = config;

        this.config.set(fov, aspect, near, far, true);

        this.updateProjectionMatrix();
    }

    public updateProjectionMatrix(): void {
        const { near, far, aspect, fov } = this.config,
            fovRad: number = (fov * Math.PI) / 180,
            top: number = near * Math.tan(fovRad / 2),
            right: number = top * aspect,
            bottom: number = -top,
            left: number = -right,
            rl: number = right - left,
            tb: number = top - bottom,
            fn: number = far - near;
        this.projectionMatrix.set([
            (2 * near) / rl,
            0,
            0,
            0,

            0,
            (2 * near) / tb,
            0,
            0,

            (right + left) / rl,
            (top + bottom) / tb,
            -(far + near) / fn,
            -1,

            0,
            0,
            (-2 * far * near) / fn,
            0,
        ]);
    }

    public resize(aspect: number): this {
        this.config.aspect = aspect;
        return this;
    }

    public copy(target: this, silence?: boolean): this {
        const { config } = target;

        this.config.copy(config, true);

        return super.copy(target, silence);
    }
}

interface IConfig extends CameraConfig {
    /**
     * 角度
     */
    fov?: number;
    /**
     * 宽高比
     */
    aspect?: number;
    /**
     * 近
     */
    near?: number;
    /**
     * 远
     */
    far?: number;
}

interface IEvent extends CameraEvent {}

export { IConfig as IPerspectiveCameraConfig };
