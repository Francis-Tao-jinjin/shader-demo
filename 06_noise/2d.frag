#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float random(vec2 st) { 
  return fract(sin(
            dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 hash( vec2 p ) {
	p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float simplex_noise(vec2 p) {
  const float K1 = 0.366025404; // (sqrt(3)-1)/2;
  const float K2 = 0.211324865; // (3-sqrt(3))/6;
	vec2  i = floor( p + (p.x+p.y)*K1 );
  vec2  a = p - i + (i.x+i.y)*K2;
  float m = step(a.y,a.x); 
  vec2  o = vec2(m,1.0-m);
  vec2  b = a - o + K2;
	vec2  c = a - 1.0 + 2.0*K2;
  vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
  return dot( n, vec3(70.0) );
}

vec2 truchetPattern(vec2 st, float index) {
  index = fract((index - 0.5) * 2.0);
  if (index > 0.75) {
    st = vec2(1.0) - st;
  } else if(index > 0.5) {
    st = vec2(1.0 - st.x, st.y);
  } else if (index > 0.25) {
    st = 1.0 - vec2(1.0 - st.x, st.y);
  }
  return st;
}

void main() {
  vec2 st = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution.y;
  // st *= 32.0;
  // st *= 64.0;
  vec2 ipos = floor(st);
  vec2 fpos = fract(st);

  float color = 0.0;

  // vec2 tile = truchetPattern(fpos, random(ipos + u_time));
  
  // Maze
  // color = smoothstep(tile.x-0.3,tile.x,tile.y)-
  //           smoothstep(tile.x,tile.x+0.3,tile.y);

  // Circles
  // color = (step(length(tile),0.6) -
  //          step(length(tile),0.4) ) +
  //         (step(length(tile-vec2(1.)),0.6) -
  //          step(length(tile-vec2(1.)),0.4) );

  // Truchet (2 triangles)
  // color = step(tile.x,tile.y);

  float rnd = random(ipos + u_time);
  color = rnd;

  mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
  float f = 0.0;
  vec2 uv = st + u_time;
  f  = 0.5000*simplex_noise( uv ); uv = m*uv;
  f += 0.2500*simplex_noise( uv ); uv = m*uv;
  f += 0.1250*simplex_noise( uv ); uv = m*uv;
  f += 0.0625*simplex_noise( uv ); uv = m*uv;
  color = f;
  
  color = 0.5 + 0.5*color;
  gl_FragColor = vec4(vec3(color), 1.0);
}
