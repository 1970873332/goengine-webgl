import { Vector4 } from "@core/object/math/Index";
import Camera, { CameraConfig } from "./Camera";

/**
 * 透视相机
 */
export default class PerspectiveCamera<E extends Record<any, any>> extends Camera<IConfig, E> {
    /**
     * 是否是透视相机
     */
    public readonly isPerspectiveCamera: boolean = true;

    constructor(config?: IConfig) {
        super();
        config && this.setConfig(config);
    }

    /**
     * 配置
     */
    public readonly config = new Vector4(
        35,
        1,
        0.1,
        1000,
    ).bindCallback(this.updateProjectionMatrix.bind(this));

    public setConfig(config: IConfig): void {
        super.setConfig(config);
        this.config.set(
            config?.fov ?? this.config.fov,
            config?.aspect ?? this.config.aspect,
            config?.near ?? this.config.near,
            config?.far ?? this.config.far,
            true,
        );
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

    public copy(target: this, update?: boolean): this {
        const { fov, aspect, near, far } = target.config;
        this.setConfig({
            fov,
            aspect,
            near,
            far,
        });
        !update && this.updateProjectionMatrix();
        return this;
    }

    public reInit(): void {
        super.reInit();
        this.config.reBindCallback(true, this.updateProjectionMatrix.bind(this));
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

export { IConfig as IPerspectiveCameraConfig };

