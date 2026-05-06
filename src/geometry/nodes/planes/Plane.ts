import ArrayAttribute from "@core/object/attribute/Array";
import { Vector2, Vector4 } from "@core/object/math/Index";
import BaseGeometry, { BaseGeometryAttribute, BaseGeometryConfig, BaseGeometrySaveJSON } from "@webgl/geometry/Base";
import { BaseGLNodeEvent } from "@webgl/node/Base";


/**
 * 平面几何体
 */
export default class PlaneGeometry extends BaseGeometry<IConfig, IEvent> {
    /**
     * 是否是平面几何体
     */
    public readonly isPlaneGeometry: boolean = true;

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
            new Float32Array([
                -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0,
            ]),
            3,
        );
    /**
     * 默认uv
     */
    public static readonly uv = new ArrayAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2);
    /**
     * 默认顶点索引
     */
    public static readonly index = new ArrayAttribute(new Uint16Array([0, 1, 2, 0, 2, 3]), 3);

    /**
     * 尺寸属性
     */
    public readonly size = PlaneGeometry.size
        .clone()
        .bindCallback(this.restructurePosition.bind(this));

    public attribute: BaseGeometryAttribute = {
        position: PlaneGeometry.position.clone(),
        uv: PlaneGeometry.uv.clone(),
    };

    public index? = PlaneGeometry.index.clone();

    public setConfig(config: IConfig): void {
        super.setConfig(config);
        this.size.set(
            config?.width ?? PlaneGeometry.size.width,
            config?.height ?? PlaneGeometry.size.height,
        );
    }

    public restructurePosition(): void {
        if (!this.attribute.position) return;
        const position: Float32Array<ArrayBuffer> =
            PlaneGeometry.position.array,
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

    public restructureUV(offset: Vector4): void {
        if (!this.attribute.uv) return;
        const { x, y, width, height } = offset,
            uv_x: number = x,
            // 从左上角开始，所以y轴需要反向
            uv_y = 1.0 - y - height;

        this.attribute.uv.array = new Float32Array([
            uv_x,
            uv_y,
            uv_x + width,
            uv_y,
            uv_x + width,
            uv_y + height,
            uv_x,
            uv_y + height,
        ]);
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

export { IConfig as PlaneGeometryConfig, ISaveJSON as PlaneGeometrySaveJSON };

