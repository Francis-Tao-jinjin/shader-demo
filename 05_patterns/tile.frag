#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265358979323846

vec2 rotate2D(vec2 _st, float _angle){
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

float circle(vec2 _st, float _radius) {
  vec2 l = _st - vec2(0.5);
  return 1.0 - smoothstep(_radius - (_radius * 0.01),
                          _radius + (_radius * 0.01),
                          dot(l,l) * 4.0);
}

float box(vec2 _st, vec2 _size, float _smoothEdges) {
  vec2 size = vec2(0.5) - _size * 0.5;
  vec2 aa = vec2(_smoothEdges * 0.5);
  vec2 uv = smoothstep(size, size + aa, _st);
  uv *= smoothstep(size, size + aa, vec2(1.0) - _st);
  return uv.x * uv.y;
}

vec2 tile(vec2 _st, float _zoom) {
  _st *= _zoom;
  return fract(_st);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;// * 2. - 1.;
  // st.x *= u_resolution.x / u_resolution.y;
  vec3 color = vec3(0.0);

  // Divide the space in 4
  st = tile(st, 4.);

  // Use a matrix to rotate the space 45 degrees
  st = rotate2D(st, PI * sin(u_time));

  // color = vec3(st, 0.0);
  // color = vec3(circle(st ,0.2));
  color = vec3(box(st, vec2(0.7), 0.01));
  color = min(1.0 - vec3(box(st, vec2(0.4 + 0.2 * sin(u_time)), 0.01)), color);

  gl_FragColor = vec4(color, 1.0);
}



