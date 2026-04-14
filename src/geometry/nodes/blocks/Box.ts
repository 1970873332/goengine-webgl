import ArrayAttribute from "@core/object/attribute/Array";
import { Vector3 } from "@core/object/math/Index";
import BaseGeometry, { BaseGeometryAttribute, BaseGeometryConfig, BaseGeometrySaveJSON } from "@webgl/geometry/Base";


/**
 * 立方几何体
 */
export default class BoxGeometry<E extends Record<any, any>> extends BaseGeometry<IConfig, E> {
    /**
     * 是否是立方几何体
     */
    public readonly isBoxGeometry: boolean = true;

    constructor(config?: IConfig) {
        super();
        config && this.setConfig(config);
    }

    /**
     * 默认尺寸
     */
    public static readonly size = new Vector3(1, 1, 1);
    /**
     * 默认位置
     */
    public static readonly position =
        new ArrayAttribute(
            new Float32Array([
                -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,

                0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,
                -0.5,

                -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,

                -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
                0.5,

                0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,

                -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
                -0.5,
            ]),
            3,
        );
    /**
     * 默认uv
     */
    public static readonly uv =
        new ArrayAttribute(
            new Float32Array([
                0, 0, 1, 0, 1, 1, 0, 1,

                0, 0, 1, 0, 1, 1, 0, 1,

                0, 0, 1, 0, 1, 1, 0, 1,

                0, 0, 1, 0, 1, 1, 0, 1,

                0, 0, 1, 0, 1, 1, 0, 1,

                0, 0, 1, 0, 1, 1, 0, 1,
            ]),
            2,
        );
    /**
     * 默认顶点索引
     */
    public static readonly index =
        new ArrayAttribute(
            new Uint16Array([
                0, 1, 2, 0, 2, 3,

                4, 5, 6, 4, 6, 7,

                8, 9, 10, 8, 10, 11,

                12, 13, 14, 12, 14, 15,

                16, 17, 18, 16, 18, 19,

                20, 21, 22, 20, 22, 23,
            ]),
            3,
        );


    /**
     * 尺寸属性
     */
    public size = BoxGeometry.size
        .clone()
        .bindCallback(this.restructurePosition.bind(this));

    public attribute: BaseGeometryAttribute = {
        position: BoxGeometry.position.clone(),
        uv: BoxGeometry.uv.clone(),
    };

    public index = BoxGeometry.index.clone();

    public setConfig(config: IConfig): void {
        super.setConfig(config);
        this.size.set(
            config?.width ?? BoxGeometry.size.width,
            config?.height ?? BoxGeometry.size.height,
            config?.depth ?? BoxGeometry.size.depth,
        );
    }

    public restructurePosition(): void {
        if (!this.attribute.position) return;
        const position: Float32Array<ArrayBuffer> = BoxGeometry.position.array,
            target: Float32Array<ArrayBuffer> = new Float32Array(
                position.length,
            ),
            { width, height, depth } = this.size;

        for (let i = 0; i < position.length; i += 3) {
            const ix: number = i,
                iy: number = i + 1,
                iz: number = i + 2,
                dx: number = position[ix],
                dy: number = position[iy],
                dz: number = position[iz];

            target[ix] = width * dx;
            target[iy] = height * dy;
            target[iz] = depth * dz;
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
     * 高低
     */
    height?: number;
    /**
     * 深度
     */
    depth?: number;
}

interface ISaveJSON extends BaseGeometrySaveJSON {
    /**
     * 尺寸
     */
    size: number[];
}

export { IConfig as BoxGeometryConfig, ISaveJSON as BoxGeometrySaveJSON };

