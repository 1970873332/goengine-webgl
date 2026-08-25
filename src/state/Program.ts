import ShaderState from "./Shader";

const {
    LINK_STATUS
} = WebGLRenderingContext;

export default class ProgramState {

    /**
     * 获取uuid
     * @param vertex 
     * @param fragment 
     * @returns 
     */
    public static obtainUUID(vertex_uuid: string, fragment_uuid: string): string {
        return `${vertex_uuid}|${fragment_uuid}`;
    }

    /**
     * 程序
    */
    public readonly program?: WebGLProgram | null;
    /**
     * 程序id
     */
    public readonly uuid: string = "";
    /**
     * 是否就绪
     */
    public readonly ready: boolean = false;

    /**
     * 链接
     * @param gl 
     * @param vertexShaderState 
     * @param fragmentShaderState 
     * @returns 
     */
    public link(gl: Canvas.WebGLContext, vertexShaderState: ShaderState, fragmentShaderState: ShaderState): boolean {
        if (this.ready) return true;

        try {
            const program: WebGLProgram | null = this.program ?? gl.createProgram();

            if (!(program instanceof WebGLProgram)) throw new Error("程序创建失败");

            if (!vertexShaderState.compiled || !fragmentShaderState.compiled) throw new Error("着色器未编译");

            // 附加顶点着色器
            gl.attachShader(program, vertexShaderState.shader!);
            // 附加片元着色器
            gl.attachShader(program, fragmentShaderState.shader!);
            // 链接程序
            gl.linkProgram(program);

            // 检查程序连接状态
            if (!gl.getProgramParameter(program, LINK_STATUS)) {
                // 获取程序日志
                const info: string | null = gl.getProgramInfoLog(program);
                // 删除程序
                gl.deleteProgram(program);

                throw new Error(`程序链接失败:${info}`);
            }

            Object.assign(this, {
                program,
                ready: true,
                uuid: ProgramState.obtainUUID(vertexShaderState.uuid, fragmentShaderState.uuid)
            });

        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }

}