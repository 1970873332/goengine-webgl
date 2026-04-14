import CanvasComponent from "@core/component/draw/Canvas";
import { Group } from "@core/object/ctx2d/Index";

/**
 * 2D画布场景
 */
export default abstract class CTXMap extends CanvasComponent {
    /**
     * 场景根节点
     */
    public scene: Group = new Group();
}
