#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
	vec2 st = gl_FragCoord.xy/u_resolution;
    st = st * 2. - 1.;
    st.x *= u_resolution.x / u_resolution.y;
    float d = 0.0;
    //The DISTANCE from the pixel to the center
    d = distance(st,vec2(0.0));
    // 1: use step() to turn everything above 0.2 to white and everything below to black.
    // d = step(0.2, d);
    
    // 2: Inverse the colors of the background and foreground.
    // d = 1.0 - step(0.2, d);

    // 3: use smoothstep() to get nice smooth borders
    // d = 1.0 - smoothstep(0.2, 0.25, d);

    // 4: tring combine distances fields together using different functions and operations
    // d = distance(st,vec2(0.2)) + distance(st,vec2(-0.2));
    // d = distance(st,vec2(0.2)) * distance(st,vec2(-0.2));
    // d = min(distance(st,vec2(0.2)), distance(st,vec2(-0.2)));
    // d = max(distance(st,vec2(0.2)), distance(st,vec2(-0.2)));
    // d = pow(distance(st,vec2(0.2 * sin(u_time))), distance(st,vec2(-0.2 * sin(u_time))));
    
    d = length(abs(st) - .3);
    // d = length(abs(st) - .3 * sin(u_time));
    // d = length(min(abs(st) - .3 * sin(u_time), .0));
    // d = length(max(abs(st) - .3  * sin(u_time), .0));
    // vec3 color = vec3(fract(d * 10.0));
    vec3 color = vec3(step(.3, d));
    // vec3 color = vec3(step(.3, d) * step(d,.4));
    // vec3 color = vec3( smoothstep(.3,.4,d)* smoothstep(d-0.1, d, .4));
	gl_FragColor = vec4( color, 1.0 );
}
