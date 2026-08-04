import IdentityComponent from "@goengine/core/src/component/Identity";

/**
 * 着色器状态
 */
export default class ShaderState<
    E extends IEvent,
> extends IdentityComponent<E> {
    constructor(
        public readonly type: GLenum,
        char: string,
        unverifiedID?: string,
    ) {
        super(char, unverifiedID);
    }

    /**
     * 是否有资源
     */
    public source: boolean = false;
    /**
     * 是否编译
     */
    public compile: boolean = false;
    /**
     * 是否完成
     */
    public complete: boolean = false;
    /**
     * 着色器
     */
    private shader?: WebGLShader | null;

    /**
     * webgl着色器
     */
    public get webglShader(): WebGLShader | null {
        return this.shader ?? null;
    }

    /**
     * 编译
     */
    public compiled(gl: Canvas.WebGLContext): this {
        if (this.complete) return this;
        // 创建着色器
        if ((this.shader ??= gl.createShader(this.type))) {
            const { shader } = this;
            // 上传着色器源代码
            if (!this.source) {
                gl.shaderSource(shader, this.char);
                this.source = !!gl.getShaderSource(shader);
            }
            // 编译着色器
            if (!this.compile) {
                gl.compileShader(shader);
                this.compile = !!gl.getShaderParameter(
                    shader,
                    gl.COMPILE_STATUS,
                );
            }
            // 异常处理
            if (!(this.complete = this.source && this.compile)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                delete this.shader;
            }
        }
        return this;
    }
}

type IAny = ShaderState<any>;

interface IEvent {}

export { IAny as ShaderStateAny };
