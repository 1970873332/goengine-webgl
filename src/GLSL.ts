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

export enum SideType {
    Front = 0,
    Back = 1,
    Double = 2,
}

export enum BlendType {
    None = 0,
    Normal = 1,
}
