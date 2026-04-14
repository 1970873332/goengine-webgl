import DuplicatableComponent from "@core/component/fussy/Duplicatable";
import { BlendType, SideType } from "@webgl//GLSL";

/**
 * 基础材质
 */
export default abstract class BaseMaterial<
    C extends IConfig,
    E extends IEvent,
> extends DuplicatableComponent<Func.CallBack<BaseMaterial<C, E>>, E> {
    /**
     * 是否是材质
     */
    public readonly isMaterial: boolean = true;

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
            color,
            alpha,
            transparent,
            depthTest,
            depthWrite,
            side,
            blending,
        } = config;
        this.color = color ?? this.color;
        this.alpha = alpha ?? this.alpha;
        this.side = side ?? this.side;
        this.blending = blending ?? this.blending;
        this.depthTest = depthTest ?? this.depthTest;
        this.depthWrite = depthWrite ?? this.depthWrite;
        this.transparent = transparent ?? this.transparent;
    }

    public toJSON(): ISaveJSON {
        return {
            uuid: this.uuid,
            type: this.constructor.name,
            color: this.color,
            alpha: this.alpha,
            transparent: this.transparent,
            depthTest: this.depthTest,
            depthWrite: this.depthWrite,
            side: this.side,
            blending: this.blending,
        };
    }
}

interface IEvent { }

interface IConfig extends Partial<TOptions> { }

interface ISaveJSON extends TOptions {
    /**
     * 唯一标识
     */
    uuid: string;
    /**
     * 类型
     */
    type: string;
}

type TOptions = Pick<
    BaseMaterial<any, any>,
    | "color"
    | "alpha"
    | "transparent"
    | "depthTest"
    | "depthWrite"
    | "side"
    | "blending"
>;

export {
    IEvent as BaseMaterialEvent,
    ISaveJSON as BaseMaterialSaveJSON,
    IConfig as MaterialConfig
};

