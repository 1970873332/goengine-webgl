#version 300 es

//顶点坐标
in vec3 a_position;
//纹理坐标
in vec2 a_uv;

//输出纹理坐标
out vec2 v_uv;

//投影矩阵
uniform mat4 u_projectionMatrix;
//视图矩阵
uniform mat4 u_viewMatrix;
//模型矩阵
uniform mat4 u_modelMatrix;