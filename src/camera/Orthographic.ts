import { Vector2, Vector4 } from "@core/object/math/Index";
import Camera, { CameraConfig, CameraEvent } from "./Camera";

/**
 * 正交相机
 */
export default class OrthographicCamera extends Camera<IConfig, IEvent> {
    /**
     * 是否是正交相机
     */
    public readonly isOrthographicCamera: boolean = true;

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
    public readonly viewConfig = new Vector4(
        1,
        1,
        -1,
        -1,
    ).bindCallback(this.updateProjectionMatrix.bind(this));

    public setConfig(config: IConfig): void {
        super.setConfig(config);
        this.config.set(
            config?.near ?? this.config.near,
            config?.far ?? this.config.far,
            true,
        );
        this.viewConfig.set(
            config?.top ?? this.viewConfig.top,
            config?.right ?? this.viewConfig.right,
            config?.bottom ?? this.viewConfig.bottom,
            config?.left ?? this.viewConfig.left,
            true,
        );
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

    public copy(target: this, update?: boolean): this {
        const { near, far } = target.config,
            { top, right, bottom, left } = target.viewConfig;
        this.setConfig({
            near,
            far,
            top,
            right,
            bottom,
            left,
        });
        !update && this.updateProjectionMatrix();
        return this;
    }

    public reInit(): void {
        super.reInit();
        this.config.reBindCallback(true, this.updateProjectionMatrix.bind(this));
        this.viewConfig.reBindCallback(true, this.updateProjectionMatrix.bind(this));
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

interface IEvent extends CameraEvent { }

export { IConfig as isOrthographicCameraConfig };

