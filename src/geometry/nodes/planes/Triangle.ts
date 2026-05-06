import ArrayAttribute from "@core/object/attribute/Array";
import { Vector2 } from "@core/object/math/Index";
import BaseGeometry, { BaseGeometryAttribute, BaseGeometryConfig, BaseGeometrySaveJSON } from "@webgl/geometry/Base";
import { BaseGLNodeEvent } from "@webgl/node/Base";


/**
 * 三角几何体
 */
export default class TriangleGeometry extends BaseGeometry<IConfig, IEvent> {
    /**
     * 是否是三角几何体
     */
    public readonly isTriangleGeometry: boolean = true;

    constructor(config?: IConfig) {
        super();
        config && this.setConfig(config);
    }

    /**
     * 默认尺寸
     */
    public static readonly size = Vector2.one();
    /**
     * 默认位置
     */
    public static readonly position =
        new ArrayAttribute(
            new Float32Array([0.0, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]),
            3,
        );
    /**
     * 默认uv
     */
    public static readonly uv =
        new ArrayAttribute(new Float32Array([0.5, 1.0, 0.0, 0.0, 1.0, 0.0]), 2);

    /**
     * 尺寸属性
     */
    public size = TriangleGeometry.size
        .clone()
        .bindCallback(this.restructurePosition.bind(this));

    public attribute: BaseGeometryAttribute = {
        position: TriangleGeometry.position.clone(),
        uv: TriangleGeometry.uv.clone(),
    };

    public setConfig(config: IConfig): void {
        super.setConfig(config);
        this.size.set(
            config?.width ?? TriangleGeometry.size.width,
            config?.height ?? TriangleGeometry.size.height,
        );
    }

    public restructurePosition(): void {
        if (!this.attribute.position) return;
        const position: Float32Array<ArrayBuffer> =
            TriangleGeometry.position.array,
            target: Float32Array<ArrayBuffer> = new Float32Array(
                position.length,
            ),
            { width, height } = this.size;

        for (let i = 0; i < position.length; i += 3) {
            const ix: number = i,
                iy: number = i + 1,
                iz: number = i + 2,
                dx: number = position[ix],
                dy: number = position[iy],
                dz: number = position[iz];

            target[ix] = width * dx;
            target[iy] = height * dy;
            target[iz] = dz;
        }

        this.attribute.position.array = target;
    }

    public reInit(): void {
        super.reInit();
        this.size.reBindCallback(true, this.restructurePosition.bind(this));
    }

    public toJSON(): ISaveJSON {
        return {
            ...super.toJSON(),
            size: this.size.toArray(),
        };
    }
}

interface IConfig extends BaseGeometryConfig {
    /**
     * 宽度
     */
    width?: number;
    /**
     * 高度
     */
    height?: number;
}

interface IEvent extends BaseGLNodeEvent { }

interface ISaveJSON extends BaseGeometrySaveJSON {
    /**
     * 尺寸
     */
    size: number[];
}

export {
    IConfig as TriangleGeometryConfig,
    ISaveJSON as TriangleGeometrySaveJSON
};

