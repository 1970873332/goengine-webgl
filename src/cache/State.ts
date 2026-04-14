import { AttributeKey, BlendType, SideType } from "@webgl/GLSL";
import { BaseGeometryAttribute } from "../geometry/Base";
import WeakMapCache from "./base/WeakMap";

/**
 * 状态缓存
 */
export default class StateCache extends WeakMapCache<WebGLProgram, IState> {
    /**
     * 当前使用的着色器程序
     */
    public currentProgram?: WebGLProgram;
    /**
     * 当前使用的纹理单元
     */
    public currentUnit: number = 0;
    /**
     * 最大纹理单元
     */
    public maxUnit?: number;

    /**
     * 下一个纹理单元
     */
    public get nextUnit(): number {
        return (
            (this.currentUnit + 1) %
            (this.maxUnit ??= this.gl.getParameter(
                this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS,
            ))
        );
    }

    /**
     * 使用着色器程序
     * @param program
     * @returns
     */
    public useProgram(program: WebGLProgram): void {
        if (this.currentProgram === program) return;
        this.gl.useProgram(program);
        this.currentProgram = program;
    }
    /**
     * 分配
     * @param program
     */
    public allocate(program: WebGLProgram): IState {
        if (this.has(program)) return this.get(program)!;
        const state: IState = {
            expire: false,
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
            },
            use: {
                cull: false,
                blend: false,
                depthTest: false,
                depthWrite: true,
            },
            apply: {
                cull: SideType.Back,
                blending: BlendType.None,
            },
        };
        this.set(program, state);
        return state;
    }
    /**
     * 纹理单元步进
     */
    public stepUnit(): number {
        return (this.currentUnit = this.nextUnit);
    }
}

interface IState {
    /**
     * 是否过期
     */
    expire: boolean;
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
    /**
     * 使用
     */
    use: IUse;
    /**
     *  应用
     */
    apply: IApply;
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

interface IUse {
    /**
     * 剔除面
     */
    cull: boolean;
    /**
     * 混合
     */
    blend: boolean;
    /**
     * 深度测试
     */
    depthTest: boolean;
    /**
     * 深度写入
     */
    depthWrite: boolean;
}

interface IApply {
    /**
     * 剔除面
     */
    cull: SideType;
    /**
     * 混合
     */
    blending: BlendType;
}

type TLocation = {
    [K in keyof BaseGeometryAttribute]: number;
} & {
    [key: string]: number;
};

export { IState as State };

