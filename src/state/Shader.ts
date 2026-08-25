
const {
    COMPILE_STATUS
} = WebGLRenderingContext;

/**
 * 着色器状态
 */
export default class ShaderState {
    constructor(
        /**
         * 着色器类型
         */
        public readonly type: GLenum,
        /**
         * 着色器id
         */
        public readonly uuid: string,
        /**
         * 着色器源码
         */
        public readonly source: string,
    ) { }

    /**
     * 着色器
     */
    public readonly shader?: WebGLShader | null;
    /**
     * 是否编译
     */
    public readonly compiled: boolean = false;

    /**
     * 初始化着色器
     * @param gl 
     * @returns 
     */
    public initShader(gl: Canvas.WebGLContext): WebGLShader | null {
        if (this.shader instanceof WebGLShader) return this.shader;

        const shader = gl.createShader(this.type);

        Object.assign(this, { shader })

        return shader;
    }
    /**
     * 编译
     * @param gl 
     * @returns 
     */
    public complete(gl: Canvas.WebGLContext): boolean {
        if (this.compiled) return true;

        try {
            const shader: WebGLShader | null = this.initShader(gl);

            if (!(shader instanceof WebGLShader)) throw new Error("着色器创建失败");

            // 设置着色器源码
            gl.shaderSource(shader, this.source);
            // 编译着色器
            gl.compileShader(shader);

            // 检查着色器编译状态
            if (!gl.getShaderParameter(shader, COMPILE_STATUS)) {
                // 获取着色器日志
                const info: string | null = gl.getShaderInfoLog(shader);
                // 删除着色器
                gl.deleteShader(shader);

                throw new Error(`着色器编译失败:\n${info}`);
            }

            Object.assign(this, {
                shader,
                compiled: true
            });

        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }
}
