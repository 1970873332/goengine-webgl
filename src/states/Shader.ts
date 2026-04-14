import IdentityComponent from "@core/component/Identity";

/**
 * 着色器状态
 */
export default class ShaderState<
    E extends IEvent,
> extends IdentityComponent<E> {
    /**
     * 着色器
     */
    protected declare shader_source: WebGLShader | null;

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
    public get shader(): WebGLShader | null {
        return this.shader_source;
    }
    protected set shader(v: WebGLShader | null) {
        this.shader_source = v;
    }

    /**
     * 编译
     */
    public compiled(gl: GLSL.WebGLAllRenderingContext): this {
        if (this.complete) return this;
        if ((this.shader ??= gl.createShader(this.type))) {
            if (!this.source) {
                gl.shaderSource(this.shader, this.char);
                this.source = !!gl.getShaderSource(this.shader);
            }
            if (!this.compile) {
                gl.compileShader(this.shader);
                this.compile = !!gl.getShaderParameter(
                    this.shader,
                    gl.COMPILE_STATUS,
                );
            }
            if (!(this.complete = this.source && this.compile)) {
                console.error(gl.getShaderInfoLog(this.shader));
                gl.deleteShader(this.shader);
                this.shader = null;
            }
        }
        return this;
    }
}

interface IEvent { }
