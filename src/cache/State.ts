import { AttributeKey } from "@goengine/webgl/src/GLSL";
import { BaseGeometryAttribute } from "../geometry/Base";
import WeakMapCache from "./base/WeakMap";

/**
 * 状态缓存
 */
export default class StateCache extends WeakMapCache<WebGLProgram, IState> {
    /**
     * 纹理单元
     */
    public unit: number = 0;
    /**
     * 最大纹理单元
     */
    public maxUnit?: number;

    /**
     * 下一个纹理单元
     */
    public get nextUnit(): number {
        return (
            (this.unit + 1) %
            (this.maxUnit ??= this.gl.getParameter(
                this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS,
            ))
        );
    }

    /**
     * 分配
     * @param program
     */
    public allocate(program: WebGLProgram): IState {
        if (this.has(program)) return this.get(program)!;
        const state: IState = {
            buffer: {
                location: {
                    uv: this.gl.getAttribLocation(program, AttributeKey.uv),
                    normal: this.gl.getAttribLocation(
                        program,
                        AttributeKey.normal,
                    ),
                    position: this.gl.getAttribLocation(
                        program,
                        AttributeKey.position,
                    ),
                },
            },
            uniform: {
                location: {},
            },
            texture: {
                list: [],
            }
        };
        this.set(program, state);
        return state;
    }
    /**
     * 纹理单元步进
     */
    public stepUnit(): number {
        return (this.unit = this.nextUnit);
    }
}

interface IState {
    /**
     * 缓冲区
     */
    buffer: IBuffer;
    /**
     * uniform
     */
    uniform: IUniform;
    /**
     * 纹理
     */
    texture: ITexture;
}

interface IBuffer {
    /**
     * 位置
     */
    location: TLocation;
}

interface IUniform {
    /**
     * 位置
     */
    location: Record<string, WebGLUniformLocation>;
}

interface ITexture {
    /**
     * 列表
     */
    list: WebGLTexture[];
}

type TLocation = {
    [K in keyof BaseGeometryAttribute]: number;
} & {
    [key: string]: number;
};

export { IState as State };
