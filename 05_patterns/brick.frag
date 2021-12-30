#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265358979323846

vec2 brickTile(vec2 _st, float _zoom) {
  _st *= _zoom;

  // Here is where the offset is happening
  // _st.x += step(1., mod(_st.y, 2.0)) * 0.5;
  _st.x += (step(1., mod(_st.y, 2.0)) - 0.5) * u_time;

  return fract(_st);
}

float box(vec2 _st, vec2 _size) {
  _size = vec2(0.5) - _size * 0.5;
  vec2 uv = smoothstep(_size, _size + vec2(1e-4), _st);
  uv *= smoothstep(_size, _size + vec2(1e-4), vec2(1.0) - _st);
  return uv.x * uv.y;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  vec3 color = vec3(0.0);

  st.y *= 2.0;
  st = brickTile(st, 5.0);

  color = vec3(box(st, vec2(0.9)));

  gl_FragColor = vec4(color, 1.0);
}