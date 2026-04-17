import DuplicatableComponent, { DuplicatableSaveJSON } from "@core/component/fussy/Duplicatable";
import ArrayAttribute from "@core/object/attribute/Array";
import { Vector4 } from "@core/object/math/Index";

/**
 * 基础几何
 */
export default abstract class BaseGeometry<
    C extends IConfig,
    E extends IEvent,
> extends DuplicatableComponent<Func.CallBack<BaseGeometry<C, E>>, E> {
    /**
     * 是否是几何
     */
    public readonly isGeometry: boolean = true;

    /**
     * 是否唯一
     */
    public readonly only: boolean = false;
    /**
     * 几何属性
     */
    public attribute: IAttribute = {};
    /**
     * 顶点索引
     */
    public index?: ArrayAttribute<Uint16Array<ArrayBuffer>>;

    /**
     * 设置配置
     * @param config
     */
    public setConfig(config: C): void { }
    /**
     * 重构位置属性
     * @param args
     */
    public restructurePosition(): void {
        throw new Error("未实现restructurePosition");
    }
    /**
     * 重构UV属性
     * @param args
     */
    public restructureUV(offset: Vector4): void {
        throw new Error("未实现restructureUV");
    }

    public toJSON(): ISaveJSON {
        return {
            ...super.toJSON()
        };
    }
}

interface IEvent { }

interface IConfig { }

interface IAttribute {
    /**
     * uv
     */
    uv?: ArrayAttribute<Float32Array<ArrayBuffer>>;
    /**
     * 法线
     */
    normal?: ArrayAttribute<Float32Array<ArrayBuffer>>;
    /**
     * 位置
     */
    position?: ArrayAttribute<Float32Array<ArrayBuffer>>;
}

interface ISaveJSON extends DuplicatableSaveJSON { }

export {
    IAttribute as BaseGeometryAttribute,
    IConfig as BaseGeometryConfig,
    IEvent as BaseGeometryEvent,
    ISaveJSON as BaseGeometrySaveJSON
};

