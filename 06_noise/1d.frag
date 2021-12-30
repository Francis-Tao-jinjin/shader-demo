#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float noise1d(float x) {
  return fract(sin(x) * 43758.5453123);
}

float plotY(vec2 st, float x) {
  float d = smoothstep(st.y-0.1, st.y, x) - smoothstep(st.y, st.y+0.1, x);
  return d;
}

float scale = 50.0;

void main() {
  vec2 st = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution.y;
  // st *= 32.0;

  st *= scale;
  vec2 ipos = floor(st);
  vec2 fpos = fract(st);

  float color = 0.0;

  float rnd = 0.0;
  float ix = ipos.x;
  rnd = noise1d(ix);
  // 1d gradient is like interpolation
  // rnd = mix(noise1d(ix), noise1d(ix + 1.0), fpos.x);
  // rnd = mix(noise1d(ipos.x), noise1d(ipos.x + 1.0), smoothstep(0.,1.,fpos.x));

  // move random value to middle
  st.y = st.y / scale + 0.5;

  float d = plotY(st, rnd);
  color = d;

  gl_FragColor = vec4(vec3(color), 1.0);
}

