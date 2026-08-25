export enum AttributeKey {
    uv = "a_uv",
    normal = "a_normal",
    position = "a_position",
}

export enum UniformKey {
    viewMatrix = "u_viewMatrix",
    modelMatrix = "u_modelMatrix",
    projectionMatrix = "u_projectionMatrix",
}

export enum UniformType {
    Texture = "texture",
    Float = "float",
    Int = "int",
    Vec2 = "vec2",
    Vec3 = "vec3",
    Vec4 = "vec4",
    Mat2 = "mat2",
    Mat3 = "mat3",
    Mat4 = "mat4",
    Sampler2D = "sampler2D",
    Sampler3D = "sampler3D",
    SamplerCube = "samplerCube",
}

/**
 * 剔除面
 */
export enum CullFace {
    None = 0,
    Front = 1,
    Back = 2
}

/**
 * 混合模式
 */
export enum Blend {
    None = 0,
    Normal = 1,
}

/**
 * 深度比较函数
 */
export enum DepthFunc {
    Never = 0x0200,
    Less = 0x0201,
    Equal = 0x0202,
    LessEqual = 0x0203,
    Greater = 0x0204,
    NotEqual = 0x0205,
    GreaterEqual = 0x0206,
    Always = 0x0207,
}