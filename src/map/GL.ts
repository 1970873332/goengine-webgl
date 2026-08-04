import CanvasComponent, {
    CanvasComponentEvent,
} from "@goengine/core/src/component/draw/Canvas";
import Scene from "@goengine/webgl/src/node/common/Scene";
import { CameraAny } from "../camera/Camera";
import WebglRenderer from "../render/Webgl";

/**
 * Webgl场景
 */
export default abstract class GLMap extends CanvasComponent<IEvent> {
    constructor(canvas: HTMLCanvasElement, config?: WebGLContextAttributes) {
        super(canvas, "webgl2", {
            alpha: true,
            depth: true,
            antialias: true,
            ...config,
        });
    }
    /**
     * 相机
     */
    declare public camera: CameraAny;
    /**
     * 渲染器
     */
    declare public webglRenderer: WebglRenderer;
    /**
     * 场景
     */
    public scene = new Scene();

    public destroy(): void {
        this.scene.destroy();
        this.camera.destroy();
        this.webglRenderer.destroy();

        super.destroy();
    }
}

interface IEvent extends CanvasComponentEvent {}
