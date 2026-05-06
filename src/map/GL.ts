import CanvasComponent, { CanvasComponentEvent } from "@core/component/draw/Canvas";
import Camera from "../camera/Camera";
import { Scene } from "../node/Index";
import WebglRenderer from "../render/Webgl";

/**
 * Webgl场景
 */
export default abstract class GLMap extends CanvasComponent<IEvent> {
    /**
     * 相机
     */
    public declare camera: Instance<typeof Camera>;
    /**
     * 渲染器
     */
    public declare webglRenderer: WebglRenderer;

    /**
     * 场景
     */
    public scene = new Scene();
}

interface IEvent extends CanvasComponentEvent { }