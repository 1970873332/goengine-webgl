import ArrayAttribute from "@goengine/core/src/object/attribute/Array";
import Vector3 from "@goengine/core/src/object/math/vector/Vector3";
import BaseGeometry, {
    BaseGeometryAttribute,
    BaseGeometryConfig,
} from "@goengine/webgl/src/geometry/Base";
import { BaseGLNodeEvent } from "@goengine/webgl/src/node/Base";

/**
 * 立方几何体
 */
export default class BoxGeometry extends BaseGeometry<IConfig, IEvent> {
    /**
     * 默认位置
     */
    public static readonly position = new ArrayAttribute(
        new Float32Array([
            -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,

            0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,

            -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,

            -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,

            0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,

            -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
        ]),
        3,
    );
    /**
     * 默认uv
     */
    public static readonly uv = new ArrayAttribute(
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
    public static readonly index = new ArrayAttribute(
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
    public size = Vector3.zero().bindCallback(
        this.restructurePosition.bind(this),
    );

    public attribute: BaseGeometryAttribute = {
        position: BoxGeometry.position.clone(),
        uv: BoxGeometry.uv.clone(),
    };

    public index = BoxGeometry.index.clone();

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const {
            depth = this.size.depth,
            width = this.size.width,
            height = this.size.height,
        } = config;

        this.size.set(width, height, depth, true);

        this.restructurePosition();
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

interface IEvent extends BaseGLNodeEvent {}

export { IConfig as BoxGeometryConfig };
