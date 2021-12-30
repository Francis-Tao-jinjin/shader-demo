#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;

float hash1(float n) {
  return fract(sin(n) * 43759.5453123);
}

const float PI = 3.1415926535897932384626433832795;
const float PHI = 1.6180339887498948482045868343656;

// create a bunch of rays in the half sphere
vec3 forwardSF(float i, float n) {
  float phi = 2.0 * PI * fract(i/PHI);
  float zi = 1.0 - (2.0 * i + 1.0) / n;
  float sinTheta = sqrt(1.0 - zi * zi);
  return vec3(cos(phi) * sinTheta, sin(phi)*sinTheta, zi);
}

vec2 map(vec3 q) {
  q *= 100.0;
  vec2 res = vec2(q.y, 2.0);

  float r = 15.0;
  // 2-
  // r += 3.0 * pow((sin(u_time * 2.0 * PI + q.y/50.0) * 0.5 + 0.5), 4.0);
  q.y -= r;

  // float x = abs(q.x);
  float x = q.x;
  float y = q.y;
  float z = q.z;

  // 1-
  // z *= 2.0 - y/15.0;
  // y = 4.0 + 1.2*y - x*sqrt((20.-x)/15.);

  float d = sqrt(x*x + y*y + z*z) - r;
  d/=3.0;
  if (d < res.x) {
    res = vec2(d, 1.0);
  }
  res.x /= 100.0;
  return res;
}

vec2 intersect(vec3 ro, vec3 rd) {
  const float maxd = 1.0;
  vec2 res = vec2(0.0);
  float t = 0.2;
  for (int i = 0; i < 200; i++) {
    vec2 h = map(ro + rd * t);
    if (h.x < 0.0 || t > maxd) {
      break;
    }
    t += h.x;
    res = vec2(t, h.y);
  }
  if (t > maxd) {
    res = vec2(-1.0);
  }
  return res;
}

vec3 calcNormal(vec3 pos) {
  vec3 eps = vec3(0.005, 0.0, 0.0);
  return normalize(
    vec3(
      map(pos + eps.xyy).x - map(pos-eps.xyy).x,
      map(pos + eps.yxy).x - map(pos-eps.yxy).x,
      map(pos + eps.yyx).x - map(pos-eps.yyx).x
    )
  );
}

float calcAO(vec3 pos, vec3 nor) {
  float ao = 0.0;
  const int steps = 30;
  for (int i = 0; i<steps; i++) {
    vec3 kk;
    vec3 ap = forwardSF(float(i), 64.0);
    ap *= sign(dot(ap, nor)) * hash1(float(i));
    ao += clamp(map(pos + nor* 0.01 + ap * 0.2).x*20.0, 0.0, 1.0);
  }
  ao /= float(steps);
  return clamp(ao, 0.0, 1.0);
}

vec3 render(vec2 p) {
  vec2 mo = u_mouse.xy / u_resolution.xy;
  float time = 32.0 + u_time * 1.5;
  // first setup camera
  vec3 ro = vec3(.5 * cos(0.1 * time + 7.0*mo.x), 0.25 + .2*mo.y, .5*sin(0.1*time + 7.0*mo.x));
  vec3 ta = vec3(0.0, 0.15, 0.0);
  // camera matrix
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = normalize(cross(uu, ww));
  // create view ray
  vec3 rd = normalize(p.x*uu + p.y*vv + 1.7*ww);

  // redner
  vec3 col = vec3(1.0, 0.9, 0.7);

  // raymarch
  vec3 uvw;
  vec2 res = intersect(ro, rd);
  float t = res.x;

  if (t>0.0) {
    vec3 pos = ro + t * rd;
    vec3 nor = calcNormal(pos);
    vec3 ref = reflect(rd, nor);
    float fre = clamp(1.0 + dot(nor, rd), 0.0, 1.0);
    float occ = calcAO( pos, nor );
    occ = occ*occ;

    if (res.y < 1.5) {
      col = vec3(0.9, 0.02, 0.01);
      col = col*0.72 + 0.2*fre*vec3(1.0,0.8,0.2);
      vec3 lin = 4.0 * vec3(0.7, 0.8, 1.0) * (0.5 + 0.5 * nor.y) * occ;
      lin += 0.8 * fre * vec3(1.0,1.0,1.0) * (0.6 + 0.4 * occ);
      col = col * lin;
      col += 4.0*vec3(0.8,0.9,1.00)*smoothstep(0.0,0.4,ref.y)*(0.06+0.94*pow(fre,5.0))*occ;
      col = pow(col,vec3(0.4545));
    } else {
      col *= clamp(sqrt(occ*1.8),0.0,1.0);
    }
  }
  col = clamp(col,0.0,1.0);
  return col;
}

void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy)/u_resolution.y;
  vec3 col = render(p);
  vec2 q = gl_FragCoord.xy/u_resolution.xy;

  // add the mask
  col *= 0.2 + 0.8*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.2);
  gl_FragColor = vec4(col, 1.0);
}