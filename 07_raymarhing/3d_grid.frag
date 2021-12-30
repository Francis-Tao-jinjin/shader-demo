/* party grid 3d, by mattz. 
   License Creative Commons Attribution 3.0 (CC BY 3.0) Unported License.

   Mouse rotates (or click in bottom left for auto-rotate).

*/
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;

const float farval = 10000.0;
const vec4 miss = vec4(vec3(0.0), farval);
const float rad = 0.25;

#define INT_FORLOOPS

const float nbox = 14.0;

// #ifdef INT_FORLOOPS
// #define LOOPTYPE int
// #define LOOP0 0
const int rsteps = 3*int(nbox);
// #else
// #define LOOPTYPE float
// #define LOOP0 0.
// const float rsteps = 3.*nbox;
// #endif

const float linewidth = 0.04;
const float kfog = -1.2/nbox;

vec3 L = normalize(vec3(-1.0, .5, -1.0));
mat3 Rview;

// Dave Hoskins' hash without sine https://www.shadertoy.com/view/4djSRW
#define HASHSCALE3 vec3(.1031, .1030, .0973)

vec3 hash33(vec3 p3) {
	p3 = fract(p3 * HASHSCALE3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract((p3.xxy + p3.yxx)*p3.zyx);

}

// RGB from hue
vec3 hue(float h) {
    vec3 c = mod(h*6.0 + vec3(2, 0, 4), 6.0);
    return h >= 1.0 ? vec3(h-1.0) : clamp(min(c, -c+4.0), 0.0, 1.0);
}

// rotate about x-axis 
mat3 rotX(in float t) {
    float cx = cos(t), sx = sin(t);
    return mat3(1., 0, 0, 
                0, cx, sx,
                0, -sx, cx);
}


// rotate about y-axis 
mat3 rotY(in float t) {
    float cy = cos(t), sy = sin(t);
    return mat3(cy, 0, -sy,
                0, 1., 0,
                sy, 0, cy);

}

// ray-sphere intersection
vec4 sphere(in vec3 o, in vec3 d, in vec3 ctr, in float r) {
	
    vec3 oc = o - ctr;
    
    float a = dot(d, d);
    float b = 2.0*dot(oc, d);
    float c = dot(oc, oc) - r*r;
        
    float D = b*b - 4.0*a*c;
    
    if (D > 0.0) {
        
        float sqrtD = sqrt(D);
        
        float t = 0.5 * ( -b - sqrtD ) / a;
        
        if (t >= 0.0) {
            vec3 n = normalize( oc + t*d );
            return vec4(n, t);	
        }
        
    }
    
    return miss;
		
}

// minimum of vector
float min3(vec3 a) {
	return min(a.x, min(a.y, a.z));
}

// max of vector
float max3(vec3 a) {
	return max(a.x, max(a.y, a.z));
}

// median of vector
float median3(vec3 x) {
    return dot(x, vec3(1)) - min3(x) - max3(x);
}

// ray-box intersection
float box(vec3 ro, vec3 rd, vec3 b) {
	
	vec3 rdi = 1.0/rd;	
		
	vec3 t1 = (-b - ro)*rdi;
	vec3 t2 = ( b - ro)*rdi;
	
	vec3 tmin = min(t1, t2);
	vec3 tmax = max(t1, t2);
    
  float ta = max3(tmin);
  float tb = min3(tmax);
	
	if (ta <= tb) {
		return ta;
	} else {
		return farval;
	}

}

// select whichever basis edge minimizes time to hit
vec3 bselect(vec3 k, vec3 d, vec3 b1, vec3 b2) {
	return (abs(dot(k,b1)*dot(d,b2)) < abs(dot(k,b2)*dot(d,b1))) ? b1 : b2;
}

// for stepping through cube lattice
float stepcube(in vec3 p, in vec3 d) {
	
	// g is half-integer coords from p in the direction of d
	vec3 g = floor(p+vec3(0.5))-vec3(0.5) + step(vec3(0.0), d);

	// k is the vector from p to the corner in direction d
	vec3 k = g-p;
	
	// select the basis vector representing the first to intersect	
	vec3 b = bselect(k, d, 
					 bselect(k, d, vec3(1.0, 0.0, 0.0), 
					 			   vec3(0.0, 1.0, 0.0)), 
						           vec3(0.0, 0.0, 1.0));
	
	// compute the distance along the ray to the nearest cube edge
	return dot(k,b) / dot(d, b);
}

// point in box?
bool inbox(vec3 c, float tol) {
    float cmin = min(c.x, min(c.y, c.z));
    float cmax = max(c.x, max(c.y, c.z));
    return cmin >= -tol && cmax < nbox + tol;
}

// fog blocking
float fog(vec3 x) {
  float l = length(x);
  l = max(0.0, l-nbox);
  return exp(kfog*l);
}

float sdSegment(vec3 p, vec3 a, vec3 b, float r) {
  float h = min(1.0, 
            max(0.0, 
                dot(p-a, b-a)/
                dot(b-a, b-a)));
  return length (p-a-(b-a) * h) - r;
}

float sdY(vec3 pos) {
  return sdSegment(pos, vec3(0.0), vec3(0., 10.0, 0.0), 1.0);
  // return abs(length(vec2(pos.x, pos.z)) - 1.0);
}

float sdX(vec3 p) {
  return abs(p.y);
}

float sdCapsule( vec3 p, vec3 a, vec3 b, float r ) {
	vec3 pa = p-a, ba = b-a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h ) - r;
}

float sdSphere(vec3 p) {
  return length(p) - 2.0;
}

float intersectAxis(vec3 ro, vec3 rd, float start, float end) {
  float depth = start;
  return depth;
}

// ray trace
vec3 shade(in vec3 ro, in vec3 rd) {
  vec3 eye = ro;
  vec3 dir = rd;
  // raytrace against bounding box
  float curw = box(eye, rd, 0.5*vec3(nbox+linewidth));
  // if (curw == farval) {
  //   return vec3(0);
  // }
  
  const float t_trans = 2.0;
  const float t_phase = 5.0;
  
	// added to cube step
	const float eps = 0.001;
  // center box grid
  eye += 0.5*nbox - 0.5;
  // pixel color
	vec3 color = vec3(0.0);
  // grid coverage
  float grid = 0.0;
  // pixel ray distance
  float rw = farval;
  // march along ray thru grid
	// for (LOOPTYPE i=LOOPTYPE(0); i<rsteps; ++i) {
  vec3 halfSize = vec3(float(rsteps) / 2.0);
  for (int i=0; i<rsteps; ++i) {
    // point in grid
    vec3 p = eye + curw * rd;

    p -= 0.5*nbox - 0.5;
    // coordinate transform;
    p.z *= 2.0 - p.y/10.0;

    p += 0.5*nbox - 0.5;

    // check if point inside box for grid rendering
    if (inbox(p+0.5, 0.5*linewidth)) {
      // xyz displacement from center of cell
      vec3 dctr = p - floor(p + 0.5);
      // xyz displacement from face
      vec3 dface = abs(0.5 - abs(dctr));
      // get median coordinate of face displacement
      float emid = median3(dface);
      // grid line
      float gbrt = smoothstep(linewidth, 0.0, emid) * fog(p-eye) * 2.0;
      grid = max(grid, 1.0*gbrt);
    }
    curw += stepcube(p, rd) + eps;    
	} // for each step along ray
  // mix sphere color and grid color

  color = vec3(grid);
	// return max(color, vec3(grid));
  return color;
}	

mat3 setCamera(vec3 ro, vec3 ta, float cr) {
  vec3 cw = normalize(ta - ro);
  vec3 cp = vec3(sin(cr), cos(cr), 0.0);
  vec3 cu = normalize(cross(cw, cp));
  vec3 cv = normalize(cross(cu, cw));
  return mat3(cu, cv, cw);
}

void main() {
 
    // vec2 uv = (gl_FragCoord.xy - .5*u_resolution.xy) * 0.8 / (u_resolution.y);
   
    // const vec3 tgt = vec3(0.0, 0.0, 0.0);
    // const vec3 cpos = vec3(0.0, 0.0, 1.8*nbox);
    // const vec3 up = vec3(0, 1, 0);

    // vec3 rz = normalize(tgt - cpos);
    // vec3 rx = normalize(cross(rz,vec3(0,1.,0)));
    // vec3 ry = cross(rx,rz);

    // float thetay = 0.1235*u_time;
    // float thetax = 0.75 * smoothstep(0.0, 5.0, u_time);

    // if (max(u_mouse.x, u_mouse.y) > 20.0) { 
    //   thetax = (u_mouse.y - .5*u_resolution.y) * -5.0/u_resolution.y; 
    //   thetay = (u_mouse.x - .5*u_resolution.x) * 5.0/u_resolution.x; 
    // }

    // Rview = mat3(rx,ry,rz)*rotY(thetay)*rotX(thetax); 
    // L = Rview * L;

    // vec3 rd = Rview * normalize(vec3(uv, 1.)),
    // ro = tgt + Rview*vec3(0,0,-length(cpos-tgt));

    vec2 mo = u_mouse.xy / u_resolution.xy;
    // float time = 32.0 + u_time * 1.5;
    float time = 0.0;

    // camera
    vec3 ta = vec3(0.0, -0.5, 0.0);
    vec3 ro = ta + normalize(vec3(30.0 * cos(0.1 * time + 7.0*mo.x), 0.0 + 40.0*(1.0 - mo.y-0.5), 30.0*sin(0.1*time + 7.0*mo.x))) * 30.0;
    // camera-to-world transformtion
    mat3 ca = setCamera(ro, ta, 0.0);
    
    vec3 total = vec3(0.0);

    vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy)/u_resolution.y;
    const float fl = 2.5;
    // ray direction
    vec3 rd = ca*normalize(vec3(p, fl));
    gl_FragColor = vec4(shade(ro, rd), 1.0);
}
