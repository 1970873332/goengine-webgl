import { Blend, CullFace, DepthFunc } from "../GLSL";

const {
    CCW,
    LESS,
    BACK,
    FRONT,
    BLEND,
    FUNC_ADD,
    SRC_ALPHA,
    ONE, ZERO,
    CULL_FACE,
    DEPTH_TEST,
    ONE_MINUS_SRC_ALPHA,
} = WebGLRenderingContext;

/**
 * 渲染状态
 */
export default class RenderState {
    constructor(protected gl: Canvas.WebGLContext) { }

    /**
     * 是否启用混合
     */
    public blend: boolean = false;
    /**
     * 当前混合模式
     */
    public blending: Blend = Blend.None;
    /**
     * 是否启用深度测试
     */
    public depthTest: boolean = false;
    /**
     * 是否写入深度
     */
    public depthWrite: boolean = true;
    /**
     * 深度比较函数
     */
    public depthFunc: DepthFunc = LESS;
    /**
     * 是否启用面剔除
     */
    public cull: boolean = false;
    /**
     * 当前剔除面
     */
    public cullFace: CullFace = CullFace.None;
    /**
     * 正面绕序
     */
    public frontFace: GLenum = CCW;
    /**
     * 颜色通道写入
     */
    public colorMask: [boolean, boolean, boolean, boolean] = [
        true,
        true,
        true,
        true,
    ];
    /**
     * 视口
     */
    public viewport: [number, number, number, number] = [0, 0, 0, 0];

    /**
     * 混合开关
     */
    public setBlend(enabled: boolean): void {
        if (this.blend !== enabled) {
            this.blend = enabled;
            enabled ? this.gl.enable(BLEND) : this.gl.disable(BLEND);
        }
    }

    /**
     * 混合模式
     */
    public setBlending(blending: Blend): void {
        if (this.blending !== blending) {
            this.blending = blending;
            switch (blending) {
                case Blend.None:
                    this.gl.blendFunc(ONE, ZERO);
                    break;
                case Blend.Normal:
                default:
                    this.gl.blendFunc(
                        SRC_ALPHA,
                        ONE_MINUS_SRC_ALPHA,
                    );
                    break;
            }
            this.gl.blendEquation(FUNC_ADD);
        }
    }

    /**
     * 深度测试开关
     */
    public setDepthTest(enabled: boolean): void {
        if (this.depthTest !== enabled) {
            this.depthTest = enabled;
            enabled
                ? this.gl.enable(DEPTH_TEST)
                : this.gl.disable(DEPTH_TEST);
        }
    }

    /**
     * 深度写入
     */
    public setDepthMask(mask: boolean): void {
        if (this.depthWrite !== mask) {
            this.depthWrite = mask;
            this.gl.depthMask(mask);
        }
    }

    /**
     * 深度比较函数
     */
    public setDepthFunc(func: DepthFunc): void {
        if (this.depthFunc !== func) {
            this.depthFunc = func;
            this.gl.depthFunc(func);
        }
    }

    /**
     * 颜色通道写入
     */
    public setColorMask(
        r: boolean,
        g: boolean,
        b: boolean,
        a: boolean,
    ): void {
        const { colorMask } = this;
        if (
            colorMask[0] !== r ||
            colorMask[1] !== g ||
            colorMask[2] !== b ||
            colorMask[3] !== a
        ) {
            this.colorMask = [r, g, b, a];
            this.gl.colorMask(r, g, b, a);
        }
    }

    /**
     * 面剔除开关
     */
    public setCull(enabled: boolean): void {
        if (this.cull !== enabled) {
            this.cull = enabled;
            enabled
                ? this.gl.enable(CULL_FACE)
                : this.gl.disable(CULL_FACE);
        }
    }

    /**
     * 剔除面
     */
    public setCullFace(face: CullFace): void {
        if (this.cullFace !== face) {
            this.cullFace = face;
            this.gl.cullFace(face === CullFace.Front ? FRONT : BACK);
        }
    }

    /**
     * 正面绕序
     */
    public setFrontFace(face: GLenum): void {
        if (this.frontFace !== face) {
            this.frontFace = face;
            this.gl.frontFace(face);
        }
    }

    /**
     * 视口
     */
    public setViewport(
        x: number,
        y: number,
        width: number,
        height: number,
    ): void {
        const { viewport } = this;
        if (
            viewport[0] !== x ||
            viewport[1] !== y ||
            viewport[2] !== width ||
            viewport[3] !== height
        ) {
            this.viewport = [x, y, width, height];
            this.gl.viewport(x, y, width, height);
        }
    }
}
