#ifdef GL_ES
precision mediump float;
#endif

#define TWO_PI			6.283185307179586
#define PI				3.141592653589793

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float speed = 0.1;

void main() {
  vec2 uv = (2. * gl_FragCoord.xy - u_resolution) / u_resolution.y;
  // uv *= 3.0;
  // uv = fract(uv) - 0.5;
  // uv *= 1.5;

	vec3 col = vec3(abs(uv), 0.5+0.5*sin(u_time));
	float x = (uv.x);
  float y = (uv.y);
	
	// float r = -sqrt(x*x + y*y); //uncoment this line to symmetric ripples
	
  float r = -length(uv);
  // r = mix(length(vec2(x*x, y*y)), r, sin(u_time) *0.5 + 0.5 );
	float z = 1.0 + 0.5*sin((r+u_time*speed)/0.033);
  // z = step(1., z);

	gl_FragColor = vec4(col*z,1.0);
}

