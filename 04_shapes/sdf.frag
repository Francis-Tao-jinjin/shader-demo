#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float spiralSDF(vec2 st, float t) {
  float r = dot(st,st);
  float a = atan(st.y,st.x);
  return abs(sin(fract(log(r)*t+a*0.159)));
}

float polygonSDF(int edge, vec2 st, float t) {
  vec2 pos = st * t;
  // Angle and radius from the current pixel
  float a = atan(pos.x, pos.y) + PI;
  float r = TWO_PI / float(edge);
  // Shaping function that modulate the distance
  float d = cos(floor(0.5 + a/r) * r - a) * length(pos);
  return d;
}

float triSDF(vec2 st) {
    // st = (st*2.-1.)*2.;
  return max(abs(st.x) * 0.866025 + st.y * 0.5, -st.y * 0.5);
}

float rhombSDF(vec2 st) {
  return max(triSDF(st),
            triSDF(vec2(st.x,1.-st.y)));
}

float circleSDF(vec2 st) {
    return length(st);
}

float vesicaSDF(vec2 st, float w) {
    vec2 offset = vec2(w*.5,0.);
    return max( circleSDF(st-offset),
                circleSDF(st+offset));
}

float heartSDF(vec2 st) {
    float r = length(st)*5.;
    st = normalize(st);
    return r - 
         ((st.y*pow(abs(st.x),0.67))/ 
         (st.y+1.5)-(2.)*st.y+1.26);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy * 2. - 1.;
  st.x *= u_resolution.x / u_resolution.y;
  vec3 color = vec3(0.0);
  float d = 0.0;

  // d = polygonSDF(3, st, 3.0);
  // d = spiralSDF(st, 1.0);
  d = heartSDF(st * 1.0);
  // color = vec3(d);
  color = vec3(step(1., d));
  gl_FragColor = vec4(color, 1.0);
}