#include "./lib.glsl"

#extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec4 v_position;
varying vec4 v_normal;
varying vec4 v_color;

void main() {
  
  vec3 color = vec3(0.0);
  float d = 0.;
  vec3 darkBlue = vec3(0.0196, 0.2549, 0.7608);
  vec3 lightBlue = vec3(0.3686, 0.5647, 0.9882);
  vec2 coord = st;
  coord.x *= pow(sin(u_time), 4.0) * 0.05 + 1.0;
  coord.y += pow(cos(u_time + coord.x * PI), 2.) * .1;

  vec2 q = coord;
  // checkerboard
  q = floor(q * 20.0);
  d = mod(q.x + q.y, 2.0);
  color = mix(lightBlue, darkBlue, d);

  float d2 = star( rotate2d(u_time * PI) * (coord + vec2(.0, -0.3)), .25, 5);
  color = mix(color, (vec3(1.0, 0.9255, 0.1137)), d2);

  q = coord + vec2(-0.2, -0.3);
  q = rotate2d(sin(u_time)*0.5) * q;
  float d3 = circle(q,.35);
  vec2 center = vec2(0.175, 0.0);
  d3 = min(d3-circle(rotate2d(PI * -0.35)*center + q-vec2(0.0, 0.19), 0.37), d3);
  d3 = clamp(d3, 0., 1.0);
  color = mix(color, (vec3(1.0, 0.9529, 0.6824)), d3);

  gl_FragColor = vec4(color.rgb, 1.0);
}


      