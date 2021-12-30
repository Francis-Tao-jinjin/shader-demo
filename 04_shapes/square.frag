#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution * 2. - 1.;
  st.x *= u_resolution.x / u_resolution.y;
  vec3 color = vec3(0.);
  
  /*
  // vec2 r = st;       // 1
  vec2 r = abs(st);     // 2, reflects them around zero.
  // color = vec3(r, 0.);  
  // color = vec3(max(r.x, r.y));  // 3, 
  // color = vec3( step(0.5, max(r.x, r.y)) );   // 4, as with the circular distance field, a step function change the field to a solid square shape.
  float s = max(r.x, r.y);
  // color = vec3(step(0.4, s) * step(s, 0.5));  // 5, By multiplying two step functions with reversed argument orders and different thresholds, we can make a hard edge which is as wide as we like.
  color = vec3(smoothstep(0.3, 0.4, s) * smoothstep(0.6, 0.5, s));  // 6, smoothstep can make the edge softer
  */
  
  // 1, subtract an offset - in this case 0.3 - from the abs
  //  this again gives a square in the middle with size determined by the offset amount
  color = vec3( length( max(abs(st / 1.0) - 0.3, 0.)) );
  color = step(0.2, color);   // 2

  gl_FragColor = vec4(color, 1.);
}
