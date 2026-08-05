import DuplicatableComponent from "@goengine/core/src/component/fussy/Duplicatable";
import { BlendType, SideType } from "@goengine/webgl/src/GLSL";

/**
 * 基础材质
 */
export default abstract class BaseMaterial<
    C extends IConfig,
    E extends IEvent,
> extends DuplicatableComponent<Func.CallBack<BaseMaterial<C, E>>, E> {
    /**
     * 颜色
     */
    public color: number = 0xfff;
    /**
     * 颜色透明度
     */
    public alpha: number = 1;
    /**
     * 透明性
     */
    public transparent: boolean = false;
    /**
     * 深度测试
     */
    public depthTest: boolean = true;
    /**
     * 深度写入
     */
    public depthWrite: boolean = true;
    /**
     * 渲染面
     */
    public side: SideType = SideType.Front;
    /**
     * 混合模式
     */
    public blending: BlendType = BlendType.Normal;

    /**
     * 设置配置
     * @param config
     */
    public setConfig(config: C): void {
        const {
            side = this.side,
            alpha = this.alpha,
            color = this.color,
            blending = this.blending,
            depthTest = this.depthTest,
            depthWrite = this.depthWrite,
            transparent = this.transparent,
        } = config;

        Object.assign(this, {
            side,
            alpha,
            color,
            blending,
            depthTest,
            depthWrite,
            transparent,
        });
    }
}

interface IEvent {}

interface IConfig extends Partial<TOptions> {}

type TOptions = Pick<
    IAny,
    | "color"
    | "alpha"
    | "transparent"
    | "depthTest"
    | "depthWrite"
    | "side"
    | "blending"
>;

type IAny = BaseMaterial<any, any>;

export {
    IAny as BaseMaterialAny,
    IEvent as BaseMaterialEvent,
    IConfig as MaterialConfig,
};
