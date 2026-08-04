import Vector2 from "@goengine/core/src/object/math/vector/Vector2";
import Vector4 from "@goengine/core/src/object/math/vector/Vector4";
import Camera, { CameraConfig, CameraEvent } from "./Camera";

/**
 * 正交相机
 */
export default class OrthographicCamera extends Camera<IConfig, IEvent> {
    /**
     * 正交相机
     * @param config 配置
     */
    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }
    /**
     * 配置
     */
    public readonly config = new Vector2(0.01, 1000).bindCallback(
        this.updateProjectionMatrix.bind(this),
    );
    /**
     * 视角配置
     */
    public readonly viewConfig = new Vector4(1, 1, -1, -1).bindCallback(
        this.updateProjectionMatrix.bind(this),
    );

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const {
            far = this.config.far,
            near = this.config.near,

            top = this.viewConfig.top,
            left = this.viewConfig.left,
            right = this.viewConfig.right,
            bottom = this.viewConfig.bottom,
        } = config;

        this.config.set(near, far, true);
        this.viewConfig.set(top, right, bottom, left, true);

        this.updateProjectionMatrix();
    }

    public updateProjectionMatrix(): void {
        const { near, far } = this.config,
            { top, right, bottom, left } = this.viewConfig,
            width: number = right - left,
            height: number = top - bottom;
        this.projectionMatrix.set([
            2 / width,
            0,
            0,
            0,

            0,
            2 / height,
            0,
            0,

            0,
            0,
            -2 / (far - near),
            0,

            -(right + left) / width,
            -(top + bottom) / height,
            -(far + near) / (far - near),
            1,
        ]);
    }

    public resize(size: Vector2): this {
        const { width, height } = size,
            halfWidth: number = width / 2,
            halfHeight: number = height / 2;
        this.viewConfig.set(halfHeight, halfWidth, -halfHeight, -halfWidth);
        return this;
    }

    public copy(target: this, silence?: boolean): this {
        const { config, viewConfig } = target;

        this.config.copy(config, true);
        this.viewConfig.copy(viewConfig, true);

        return super.copy(target, silence);
    }
}

interface IConfig extends CameraConfig {
    /**
     * 顶部
     */
    top?: number;
    /**
     * 右侧
     */
    right?: number;
    /**
     * 底部
     */
    bottom?: number;
    /**
     * 左侧
     */
    left?: number;
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

export { IConfig as isOrthographicCameraConfig };
