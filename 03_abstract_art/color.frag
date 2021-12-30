#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define RED vec3(1.0, 0.0, 0.0)
#define GREEN vec3(0.0, 1.0, 0.0)
#define BLUE vec3(0.0, 0.0, 1.0)


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 colorA = vec3(0.149, 0.141, 0.912);
vec3 colorB = vec3(1.000, 0.833, 0.224);

float plot(vec2 st, float pct) {
  return smoothstep(pct+0.01, pct, st.y) - smoothstep(pct, pct-0.01, st.y);
}

vec3 rgb2hsb(vec3 c) {
  vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz),
              vec4(c.gb, K.xy),
              step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r),
              vec4(c.r, p.yzx),
              step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
}

vec3 hsb2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
  rgb = rgb * rgb * (3.0 - 2.0 * rgb);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

float impulse( float k, float x ){
    float h = k*x;
    return h*exp(1.0-h);
}

float pcurve( float x, float a, float b ){
    float k = pow(a+b,a+b) / (pow(a,a)*pow(b,b));
    return k * pow( x, a ) * pow( 1.0-x, b );
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;
  vec3 color = vec3(0.0);

  // 1: hsb color
  // color = hsb2rgb(vec3(st.x, 1.0, st.y));

  // 2: color in radians
  // Map the angle (-PI to PI) to the Hue (from 0 to 1)
  // and the Saturation tothe radius
  // st = u_mouse / u_resolution;
  vec2 toCenter = vec2(0.5) - st;
  float angle = atan(toCenter.y, toCenter.x);
  float radius = length(toCenter) * 2.0;
  float rad = (angle/TWO_PI)+0.5;
  color = hsb2rgb(vec3(rad, radius, 1.0));

  // 3:
  // Mix uses pct (a value from 0-1) to mix the two colors
  // float pct = abs(sin(u_time));
  // color = mix(colorA, colorB, pct);

  // 4:
  // vec3 pct = vec3(st.x);
  // pct.r = smoothstep(0.0,1.0, st.x);
  // pct.g = (cos(PI * st.x + u_time) + 1.0) * 0.5;
  // pct.b = pow(st.x,0.5);
  // pct.b = (sin(PI * st.x + u_time) + 1.0) * 0.5;
  // pct.b = floor(sin(PI * st.x + u_time) * 5.0)/10.0 + 0.5;
  // color = mix(colorA, colorB, pct);
  // color = mix(color, RED, plot(st, pct.r));
  // color = mix(color, GREEN, plot(st, pct.g));
  // color = mix(color, BLUE, plot(st, pct.b));

  gl_FragColor = vec4(color, 1.0);
}