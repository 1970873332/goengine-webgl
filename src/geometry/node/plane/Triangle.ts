import ArrayAttribute from "@goengine/core/src/object/attribute/Array";
import Vector2 from "@goengine/core/src/object/math/vector/Vector2";
import BaseGeometry, {
    BaseGeometryAttribute,
    BaseGeometryConfig,
} from "@goengine/webgl/src/geometry/Base";
import { BaseGLNodeEvent } from "@goengine/webgl/src/node/Base";

/**
 * 三角几何体
 */
export default class TriangleGeometry extends BaseGeometry<IConfig, IEvent> {
    /**
     * 默认位置
     */
    public static readonly position = new ArrayAttribute(
        new Float32Array([0.0, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]),
        3,
    );
    /**
     * 默认uv
     */
    public static readonly uv = new ArrayAttribute(
        new Float32Array([0.5, 1.0, 0.0, 0.0, 1.0, 0.0]),
        2,
    );

    /**
     * 尺寸属性
     */
    public size = Vector2.zero().bindCallback(
        this.restructurePosition.bind(this),
    );

    public attribute: BaseGeometryAttribute = {
        position: TriangleGeometry.position.clone(),
        uv: TriangleGeometry.uv.clone(),
    };

    public setConfig(config: IConfig): void {
        super.setConfig(config);

        const { width = this.size.width, height = this.size.height } = config;

        this.size.set(width, height, true);

        this.restructurePosition();
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

interface IEvent extends BaseGLNodeEvent {}

export { IConfig as TriangleGeometryConfig };
