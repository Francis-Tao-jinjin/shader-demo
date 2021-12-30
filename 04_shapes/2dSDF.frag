#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// a cirlce which center at (0, 0)
float sdCircle(vec2 pos, float radius) {
  return length(pos) - radius;
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p)-b;
  return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdOnion(float d, float radius) {
  return abs(d) - radius;
}

float scene(vec2 st) {
  float d = 1.0;
  d = sdCircle(st, 0.5);
  d = sdBox(st, vec2(0.5, 0.45));
  // d = min(sdBox(st, vec2(0.25, 0.75)), d);
  return d;
}

void main() {
  vec2 st = (2.0 * gl_FragCoord.xy - u_resolution.xy)/u_resolution.y;
  vec2 m = (2.0 * u_mouse.xy - u_resolution.xy)/u_resolution.y;

  float radius = 0.5;
  float d = scene(st);
  // d = sdOnion(d, 0.05);

  // coloring
  vec3 col = vec3(1.0) - sign(d) * vec3(0.1,0.4,0.7);
  col *= 1.0 - exp(-3.0 * abs(d));
  col *= 0.8 + 0.2 * cos(150.0 * d);
  col = mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.01, abs(d)));
  
  d = scene(m);
  col = mix(col, vec3(0.0, 1.0, 0.0), 1.0-smoothstep(0.0, 0.005, abs(length(st-m)-abs(d)-0.0025)));
  col = mix(col, vec3(1.0,1.0,0.0), 1.0-smoothstep(0.0, 0.005, length(st-m)-0.015));
  
  gl_FragColor = vec4(col, 1.0);
}