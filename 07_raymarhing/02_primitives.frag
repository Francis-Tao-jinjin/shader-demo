// Copyright Inigo Quilez, 2016 - https://iquilezles.org/

// List of other 3D SDFs:
//    https://www.shadertoy.com/playlist/43cXRl
// and
//    http://iquilezles.org/www/articles/distfunctions/distfunctions.htm

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;

vec2 opU( vec2 d1, vec2 d2 ) {
	return (d1.x<d2.x) ? d1 : d2;
}

float dot2(in vec2 v) {
  return dot(v, v);
}

float dot2(in vec3 v) {
  return dot(v,v);
}

float ndot(in vec2 a, in vec2 b) {
  return a.x*b.x - a.y*b.y;
}

float sdPlane(vec3 p) {
  return p.y;
}

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float sdBoundingBox(vec3 p, vec3 b, float e) {
  p = abs(p) - b;
  vec3 q = abs(p+e) - e;
  return min(
    min(
      length(max(vec3(p.x, q.y, q.z), 0.0)) + min(max(p.x, max(q.y, q.z)), 0.0),
      length(max(vec3(q.x, p.y, q.z), 0.0)) + min(max(q.x, max(p.y, q.z)), 0.0)),
    length(max(vec3(q.x, q.y, p.z), 0.0)) + min(max(q.x, max(q.y, p.z)), 0.0)
  );
}

float sdEllipsoid(vec3 p, vec3 r) {
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0 * (k0 - 1.0)/k1;
}

float sdTorus(vec3 p, vec2 t) {
  return length(vec2(length(p.xz) - t.x, p.y)) - t.y;
}

float sdCappedTorus(vec3 p, vec2 sc, float ra, float rb) {
  p.x = abs(p.x);
  float k = (sc.y * p.x > sc.x * p.y) ? dot(p.xy, sc) : length(p.xy);
  return sqrt(dot(p,p) + ra * ra - 2.0 * ra * k) - rb;
}

float sdHexPrism(vec3 p, vec2 h) {
  vec3 q = abs(p);
  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
  p = abs(p);
  p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;
  vec2 d = vec2(
      length(p.xy - vec2(clamp(p.x, -k.z*h.x, k.z*h.x), h.x))*sign(p.y - h.x),
      p.z-h.y );
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

// vertical
float sdCone( in vec3 p, in vec2 c, float h ) {
    vec2 q = h*vec2(c.x,-c.y)/c.y;
    vec2 w = vec2( length(p.xz), p.y );
    
	vec2 a = w - q*clamp( dot(w,q)/dot(q,q), 0.0, 1.0 );
    vec2 b = w - q*vec2( clamp( w.x/q.x, 0.0, 1.0 ), 1.0 );
    float k = sign( q.y );
    float d = min(dot( a, a ),dot(b, b));
    float s = max( k*(w.x*q.y-w.y*q.x),k*(w.y-q.y)  );
	return sqrt(d)*sign(s);
}

float sdPyramid( in vec3 p, in float h ){
  float m2 = h*h + 0.25;
  
  // symmetry
  p.xz = abs(p.xz);
  p.xz = (p.z>p.x) ? p.zx : p.xz;
  p.xz -= 0.5;

  // project into face plane (2D)
  vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);
  
  float s = max(-q.x,0.0);
  float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );
  
  float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
	float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
    
  float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);
  // recover 3D and scale, and add sign
  return sqrt( (d2+q.z*q.z)/m2 ) * sign(max(q.z,-p.y));;
}

float sdCappedCone( in vec3 p, in float h, in float r1, in float r2 ) {
  vec2 q = vec2( length(p.xz), p.y );
  
  vec2 k1 = vec2(r2,h);
  vec2 k2 = vec2(r2-r1,2.0*h);
  vec2 ca = vec2(q.x-min(q.x,(q.y < 0.0)?r1:r2), abs(q.y)-h);
  vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot2(k2), 0.0, 1.0 );
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s*sqrt( min(dot2(ca),dot2(cb)) );
}

float sdCappedCone(vec3 p, vec3 a, vec3 b, float ra, float rb) {
  float rba  = rb-ra;
  float baba = dot(b-a,b-a);
  float papa = dot(p-a,p-a);
  float paba = dot(p-a,b-a)/baba;

  float x = sqrt( papa - paba*paba*baba );

  float cax = max(0.0,x-((paba<0.5)?ra:rb));
  float cay = abs(paba-0.5)-0.5;

  float k = rba*rba + baba;
  float f = clamp( (rba*(x-ra)+paba*baba)/k, 0.0, 1.0 );

  float cbx = x-ra - f*rba;
  float cby = paba - f;
  
  float s = (cbx < 0.0 && cay < 0.0) ? -1.0 : 1.0;
  
  return s*sqrt( min(cax*cax + cay*cay*baba,
                      cbx*cbx + cby*cby*baba) );
}

float sdCylinder( vec3 p, vec2 h ) {
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

// c is the sin/cos of the desired cone angle
float sdSolidAngle(vec3 pos, vec2 c, float ra) {
  vec2 p = vec2( length(pos.xz), pos.y );
  float l = length(p) - ra;
	float m = length(p - c*clamp(dot(p,c),0.0,ra) );
  return max(l,m*sign(c.y*p.x-c.x*p.y));
}

float sdCapsule( vec3 p, vec3 a, vec3 b, float r ) {
	vec3 pa = p-a, ba = b-a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h ) - r;
}

mat3 setCamera(vec3 ro, vec3 ta, float cr) {
  vec3 cw = normalize(ta - ro);
  vec3 cp = vec3(sin(cr), cos(cr), 0.0);
  vec3 cu = normalize(cross(cw, cp));
  vec3 cv = normalize(cross(cu, cw));
  return mat3(cu, cv, cw);
}

vec2 map(vec3 pos) {
  vec2 res = vec2(1e10, 0.0);
  
  // bounding box
  if( sdBox( pos-vec3(0.0,0.3,-1.0),vec3(0.35,0.3,2.5) ) <res.x ) {
    // more primitives
    res = opU( res, vec2( sdBoundingBox( pos-vec3( 0.0,0.25, 0.0), vec3(0.3,0.25,0.2), 0.025 ), 16.9 ) );
    res = opU( res, vec2( sdTorus(      (pos-vec3( 1.0,0.30, 0.0)).xzy, vec2(0.25,0.05) ), 25.0 ) );
    res = opU( res, vec2( sdCone(        pos-vec3( 0.0,0.45,-1.0), vec2(0.6,0.8),0.45 ), 55.0 ) );
    res = opU( res, vec2( sdSphere(      pos-vec3(1.0,0.25, -1.0), 0.25 ), 26.9 ) );
    res = opU( res, vec2( sdCappedCone(  pos-vec3(0.0, 0.0, 1.0), 0.25, 0.25, 0.1 ), 13.67 ) );
    res = opU( res, vec2( sdSolidAngle(  pos-vec3( 1.0,0.00,1.0), vec2(3,4)/5.0, 0.4 ), 49.13 ) );

    // res = opU( res, vec2( sdCapsule(     pos-vec3( -1.0,0.00, 0.0),vec3(-0.1,0.1,-0.1), vec3(0.2,0.4,0.2), 0.1  ), 31.9 ) );
    res = opU( res, vec2( sdCapsule(     pos-vec3( -1.0,0.00, 0.0),vec3(-0.,0.1,-0.), vec3(0.,0.8,0.), 0.1  ), 31.9 ) );
	  res = opU( res, vec2( sdCylinder(    pos-vec3(-1.0,0.25, -1.0), vec2(0.15,0.25) ), 8.0 ) );
    res = opU( res, vec2( sdHexPrism(    pos-vec3( -1.0,0.2, 1.0), vec2(0.2,0.05) ), 18.4 ) );
  }
  return res;
}

vec2 sceneBoundBox(vec3 ro, vec3 rd, vec3 rad) {
  vec3 m = 1.0 / rd;
  vec3 n = m * ro;
  vec3 k = abs(m) * rad;
  vec3 t1 = -n - k;
  vec3 t2 = -n + k;
  return vec2(max(max(t1.x, t1.y), t1.z),
              min(min(t2.x, t2.y), t2.z));
}

vec2 raycast(vec3 ro, vec3 rd) {
  vec2 res = vec2(-1.0, -1.0);
  float tmin = 1.0;
  float tmax = 20.0;

  // floor plane
  float tp1 = (0.0 - ro.y)/rd.y;
  if (tp1 > 0.0) {
    tmax = min(tmax, tp1);
    res = vec2(tp1, 1.0);
  }

  vec2 tb = sceneBoundBox(ro - vec3(0.0,0.4,-0.5), rd, vec3(2.3, 0.41, 3.0));
  if( tb.x<tb.y && tb.y>0.0 && tb.x<tmax) {
      //return vec2(tb.x,2.0);
      tmin = max(tb.x,tmin);
      tmax = min(tb.y,tmax);

      float t = tmin;
      for( int i=0; i<70; i++ ){
        if (t >= tmax) {
          break;
        }
        vec2 h = map( ro+rd*t );
        if( abs(h.x)<(0.0001*t) )
        { 
            res = vec2(t,h.y); 
            break;
        }
        t += h.x;
      }
    }
  return res;
}


float calcShadow(vec3 ro, vec3 rd, float mint, float tmax) {
  float res = 1.0;
  float t = mint;
  // for (float t = mint; t<tmax; ) {
  for (int i = 0; i < 25; i++) {
    if (t >= tmax) {
      break;
    }
    float h = map(ro + rd * t).x;
    if (abs(h) < 0.0001 * t) {
      return 0.0;
    }
    t += h;
  }
  return 1.0;
}

// https://iquilezles.org/www/articles/rmshadows/rmshadows.htm
float calcSoftshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax )
{
    // bounding volume
    float tp = (0.8-ro.y)/rd.y; if( tp>0.0 ) tmax = min( tmax, tp );

    float res = 1.0;
    float t = mint;
    for( int i=0; i<24; i++ )
    {
		float h = map( ro + rd*t ).x;
        float s = clamp(8.0*h/t,0.0,1.0);
        res = min( res, s*s*(3.0-2.0*s) );
        t += clamp( h, 0.02, 0.2 );
        if( res<0.004 || t>tmax ) break;
    }
    return clamp( res, 0.0, 1.0 );
}

vec3 calcNormal(vec3 pos) {
  vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;
  return normalize( e.xyy*map( pos + e.xyy ).x + 
          e.yyx*map( pos + e.yyx ).x + 
          e.yxy*map( pos + e.yxy ).x + 
          e.xxx*map( pos + e.xxx ).x );
}

//https://blog.csdn.net/linjf520/article/details/105841074
float calcAO( in vec3 pos, in vec3 nor ) {
	float occ = 0.0;
  float sca = 1.0;
  for( int i=0; i<5; i++ ) {
    float h = 0.01 + 0.12 * float(i)/4.0;
    float d = map( pos + h*nor ).x;
    occ += (h-d)*sca;
    sca *= 0.95;
    if( occ>0.35 ) {
      break;
    }
  }
  return clamp( 1.0 - 3.0*occ, 0.0, 1.0 ) * (0.5+0.5*nor.y);
}

// apply filter to the checkerboard pattern to achive the antializing
// http://iquilezles.org/www/articles/checkerfiltering/checkerfiltering.htm
float checkersGradBox(vec2 p, vec2 dpdx, vec2 dpdy) {
  // vec2 q = floor(p);
  // return mod(q.x + q.y, 2.0);
    
  // filter kernel
  vec2 w = abs(dpdx)+abs(dpdy) + 0.001;
  // analytical integral (box filter)
  vec2 i = 2.0*(abs(fract((p-0.5*w)*0.5)-0.5)-abs(fract((p+0.5*w)*0.5)-0.5))/w;
  // xor pattern
  return 0.5 - 0.5*i.x*i.y;    
}

vec3 render(vec3 ro, vec3 rd, vec3 rdx, vec3 rdy) {
  // background
  vec3 col = vec3(0.7, 0.7, 0.9) - max(rd.y, 0.0) * 0.3;

  // raycast scene
  vec2 res = raycast(ro, rd);
  float t = res.x;
  float m = res.y;
  if (m > -0.5) {
    vec3 pos = ro + t*rd;
    vec3 nor = (m<1.5) ? vec3(0.0,1.0,0.0) : calcNormal(pos);
    vec3 ref = reflect( rd, nor );

    // material
    col = 0.2 + 0.2 * sin(m * 2.0 + vec3(0.0, 1.0, 2.0));
    float ks = 1.0;

    if (m < 1.5) {
      // project pixel footprint into the plane
      vec3 dpdx = ro.y*(rd/rd.y-rdx/rdx.y);
      vec3 dpdy = ro.y*(rd/rd.y-rdy/rdy.y);

      float f = checkersGradBox(3.0*pos.xz, 3.0*dpdx.xz, 3.0*dpdy.xz );
      col = 0.15 + f * vec3(0.05);
      ks = 0.4;
    }
    vec3 lin = vec3(0.0);
    // sun
    {
      vec3 lig = normalize( vec3(-0.5, 0.4, -0.6) );
      vec3 hal = normalize(lig - rd);
      float dif = clamp(dot(nor, lig), 0.0, 1.0);
      dif *= calcSoftshadow(pos, lig, 0.02, 2.5);
      float spe = pow( clamp( dot( nor, hal ), 0.0, 1.0 ),16.0);
      spe *= dif;
      spe *= 0.04+0.96*pow(clamp(1.0-dot(hal,lig),0.0,1.0),5.0);
      lin += col*2.20*dif*vec3(1.30,1.00,0.70);
      lin +=     5.00*spe*vec3(1.30,1.00,0.70)*ks;
    }
    float occ = calcAO( pos, nor );
    // sky
    {
      float dif = sqrt(clamp(0.5 + 0.5 * nor.y, 0.0, 1.0));
      dif *= occ;
      float spe = smoothstep(-0.2, 0.2, ref.y);
      spe *= dif;
      spe *= 0.04 + 0.96 * pow(clamp(1.0 + dot(nor, rd), 0.0, 1.0), 5.0);
      spe *= calcSoftshadow( pos, ref, 0.02, 2.5 );
      lin += col*0.60*dif*vec3(0.40,0.60,1.15);
      lin +=     2.00*spe*vec3(0.40,0.60,1.30)*ks;
    }
    {
      float dif = clamp( dot( nor, normalize(vec3(0.5,0.0,0.6))), 0.0, 1.0 )*clamp( 1.0-pos.y,0.0,1.0);
      dif *= occ;
      lin += col*0.55*dif*vec3(0.25,0.25,0.25);
    }
    // sss
    {
      float dif = pow(clamp(1.0+dot(nor,rd),0.0,1.0),2.0);
      dif *= occ;
      lin += col*0.25*dif*vec3(1.00,1.00,1.00);
    }
    col = lin;
    col = mix( col, vec3(0.7,0.7,0.9), 1.0-exp( -0.0001*t*t*t ) );
  }
  return vec3( clamp(col,0.0,1.0) );
}

void main() {
  vec2 mo = u_mouse.xy / u_resolution.xy;
  float time = 32.0 + u_time * 1.5;

  // camera
  vec3 ta = vec3(0.0, -0.5, 0.0);
  vec3 ro = ta + vec3(4.0 * cos(0.1 * time + 7.0*mo.x), 2.3 + 2.0*mo.y, 4.0*sin(0.1*time + 7.0*mo.x));
  // camera-to-world transformtion
  mat3 ca = setCamera(ro, ta, 0.0);
  
  vec3 total = vec3(0.0);

  vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy)/u_resolution.y;
  const float fl = 2.5;
  // ray direction
  vec3 rd = ca*normalize(vec3(p, fl));

  // ray differentials
  vec2 px = (2.0 * (gl_FragCoord.xy + vec2(1.0, 0.0)) - u_resolution.xy)/u_resolution.y;
  vec2 py = (2.0 * (gl_FragCoord.xy + vec2(0.0, 1.0)) - u_resolution.xy)/u_resolution.y;
  vec3 rdx = ca * normalize(vec3(px, fl));
  vec3 rdy = ca * normalize(vec3(py, fl));

  // render
  vec3 col = render(ro, rd, rdx, rdy);

  // gain
  // col = col*3.0/(2.5+col);
  
  //gamma
  col = pow(col, vec3(0.4545));
  total += col;
  gl_FragColor = vec4(total, 1.0);
}