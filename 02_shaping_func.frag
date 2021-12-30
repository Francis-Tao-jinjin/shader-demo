#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float plot(vec2 st, float pct) {
  return smoothstep(pct, pct + 0.01, st.y) + smoothstep(pct, pct - 0.01, st.y);
  // return smoothstep(0.0, 0.01, abs(st.y - st.x));
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;

  // try out different equation 
  // float y = st.x;
  // float y = pow(st.x,5.0);
  // float y = exp(st.x) - 1.0;
  // float y = log(st.x) + 1.0;
  // float y = sqrt(st.x);

  // step: x < 0.5 ? return 0.0 : return 1.0
  // float y = step(0.5, st.x);

  // interpolation when X between 0.1 and 0.9
  // float y = smoothstep(0.1, 0.9, st.x);

  // try some Trigonometric Functions
  // float y = sin(2.0 * st.x + u_time * 2.0 * PI) * 0.5 + 0.5;
  // float y = abs(sin(2.0 * st.x + u_time * 2.0 * PI)) * 0.5 + 0.5;

  // Notice: fract() returns the fractional part of x. This is calculated as x - floor(x).
  // float y = fract(sin(4.0 * st.x + u_time * 1.0 * PI)) * 0.5 + 0.5;

  float y = ceil(sin(4.0 * st.x + u_time * 1.0 * PI)) * 0.5 + 0.5;

  vec3 color = vec3(st.x);
  vec3 lineColor = vec3(0.0,1.0,0.0);
  // plot a line
  float pct = plot(st, y);
  color = (pct) * color + (1.0 - pct) * lineColor;

  gl_FragColor = vec4(color, 1.0);
}