#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

float lerp(float a, float b, float w) {
  return a + (b-a)*w;
}

float sdBox( vec3 p, vec3 b ) {
  vec3 d = abs(p) - b;
  return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float sphereSDF(vec3 pos, float radius) {
  return length(pos) - radius;
}

float sdY(vec3 pos) {
  return abs(length(vec2(pos.x, pos.z)) - 0.05);
}

float sceneSDF(vec3 pos) {
  vec3 newPos = pos;//vec3(pos.xy, mod(pos.z, 2.0) - 1.0);
  // float d = sphereSDF(newPos + vec3(1.5,0.0,0.0) * sin(u_time * 2.0), 1.3);
  
  float d = 0.0;
  float ball = sphereSDF(newPos, 1.3);
  float box = sdBox(newPos, vec3(1.0));
  // d = min(ball, box);
  d = lerp(ball, box, (sin(u_time * 2.0) + 1.0)/2.0);

  d = min(d, sdY(pos));
  return d;
}

float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
  float depth = start;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec3 pos = eye + depth * marchingDirection;
    float dist = sceneSDF(pos);
    if (dist < EPSILON) {
      return depth;
    }
    depth += dist;
    if (depth >= end) {
      return end;
    }
  }
  return end;
}

/**
  fieldOfView: verical field of view in degrees
  https://webglfundamentals.org/webgl/lessons/webgl-visualizing-the-camera.html
  size: resolution of output image
  fragCoord: the x,y coordinate of the pixel in the output image
*/
vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
  vec2 xy = fragCoord - size / 2.0;
  float z = size.y / tan(radians(fieldOfView) / 2.0);
  return normalize(vec3(xy, -z));
}

// Using the gradient of the SDF, estimate the normal on the surface at point p.
vec3 surfaceNormal(vec3 p) {
  return normalize(vec3(
    sceneSDF(vec3(p.x + EPSILON, p.y, p.z)) - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)),
    sceneSDF(vec3(p.x, p.y + EPSILON, p.z)) - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)),
    sceneSDF(vec3(p.x, p.y, p.z + EPSILON)) - sceneSDF(vec3(p.x, p.y, p.z - EPSILON))
  ));
}

/**
  k_d: Diffuse color
  k_s: Specular color
  p: position of point being lit
  eye: the position of the camera
  https://en.wikipedia.org/wiki/Phong_reflection_model#Description
*/
vec3 phongContribForLight(vec3 k_d, vec3 k_s, float shininess, vec3 p, vec3 eye, vec3 lightPos, vec3 lightIntensity) {
  vec3 N = surfaceNormal(p);
  vec3 L = normalize(lightPos - p);
  vec3 V = normalize(eye - p);
  vec3 R = normalize(reflect(-L, N));

  float dotLN = dot(L, N);
  float dotRV = dot(R, V);

  if (dotLN < 0.0) {
    // Light not visible from this point on the surface
    return vec3(0.0, 0.0, 0.0);
  }
  if (dotRV < 0.0) {
    // Light reflection in opposite direction as viewer, apply only diffuse component
    return lightIntensity * (k_d * dotLN);
  }
  return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, shininess));
}

//  k_a: Ambient color
vec3 phongShading(vec3 k_a, vec3 k_d, vec3 k_s, float shininess, vec3 p, vec3 eye) {
  const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
    vec3 color = ambientLight * k_a;
    
    vec3 light1Pos = vec3(4.0 * sin(u_time),
                          2.0,
                          4.0 * cos(u_time));
    vec3 light1Intensity = vec3(0.4, 0.4, 0.4);
    
    color += phongContribForLight(k_d, k_s, shininess, p, eye,
                                  light1Pos,
                                  light1Intensity);
    
    vec3 light2Pos = vec3(2.0 * sin(0.37 * u_time),
                          2.0 * cos(0.37 * u_time),
                          2.0);
    vec3 light2Intensity = vec3(0.4, 0.4, 0.4);
    
    color += phongContribForLight(k_d, k_s, shininess, p, eye,
                                  light2Pos,
                                  light2Intensity);    
    return color;
}

mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
  // Based on gluLookAt man page
  vec3 f = normalize(center - eye);
  vec3 s = normalize(cross(f, up));
  vec3 u = cross(s, f);
  return mat4(
      vec4(s, 0.0),
      vec4(u, 0.0),
      vec4(-f, 0.0),
      vec4(0.0, 0.0, 0.0, 1)
  );
}

void main() {
  vec3 dir = rayDirection(45.0, u_resolution.xy, gl_FragCoord.xy);
  vec3 eye = vec3(16.0 * sin(u_time * 0.2), 10.0, 14.0 * cos(u_time * 0.2));
  mat4 viewToWorld = viewMatrix(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
  vec3 rayDir = (viewToWorld * vec4(dir, 0.0)).xyz;

  float dist = shortestDistanceToSurface(eye, rayDir, MIN_DIST, MAX_DIST);
  if (dist > MAX_DIST - EPSILON) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  // gl_FragColor = vec4(0.1333, 0.0078, 0.0078, 1.0);

  // The closest point on the surface to the eyepoint along the view ray 
  vec3 p = eye + dist * rayDir;
  vec3 K_a = vec3(0.2, 0.2, 0.2);
  vec3 K_d = vec3(0.9, 0.9, 0.9);
  vec3 K_s = vec3(1.0, 1.0, 1.0);
  float shininess = 10.0;

  vec3 color = phongShading(K_a, K_d, K_s, shininess, p, eye);
  gl_FragColor = vec4(color, 1.0);
}