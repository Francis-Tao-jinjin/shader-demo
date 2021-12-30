#ifdef GL_ES
precision mediump float;
#endif

#define TWO_PI			6.283185307179586
#define PI				3.141592653589793

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 coord = (gl_FragCoord.xy / u_resolution.xy * 2.0) - 1.0;
    coord.x *= u_resolution.x / u_resolution.y;

    // coord *=20.0;
    vec3 color = vec3(0.0);
    float x = coord.x;
    float y = coord.y;

    coord.x = x;
    coord.y = y - x*y;
    // coord = floor(coord);
    float d = length(coord);
    d = pow((cos((pow(d, 1.3) - u_time *0.3 )*4.0*TWO_PI + PI) + 1.7)*0.5, 5.0);
    d = smoothstep(0.01, 0.13, d);
    color = mix(vec3(0.6, 0.8941, 0.9608), vec3(0.3137, 0.4667, 0.5294), d);
    gl_FragColor = vec4(vec3(color), 1.0);

    // color.r += abs(0.1 + length(coord) - 0.6 * abs(sin(u_time * 0.9 / 12.0 )));
    // color.g += abs(0.1 + length(coord) - 0.6 * abs(sin(u_time * 0.6 / 4.0 )));
    // color.b += abs(0.1 + length(coord) - 0.6 * abs(sin(u_time * 0.3 / 9.0 )));
    // gl_FragColor = vec4(vec3(0.1 / color), 1.0);
}