// Author: Patricio Gonzalez Vivo

// Title: Interaction of color - IV
// Chapter: A color has many faces - the relativity of color

// "To begin the study of how color deceives and how to make use of this,
// the first excercise is
// to make one and the same color look different."
// 															Josef Albers

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float rect(in vec2 st, in vec2 size){
	size = 0.25-size*0.25;
    vec2 uv = smoothstep(size,size+size*vec2(0.002),st*(1.0-st));
	return uv.x*uv.y;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    vec3 influenced_color = vec3(0.577,0.441,0.700);
    vec3 influencing_color_A = vec3(0.319,0.167,0.365); 
    vec3 influencing_color_B = vec3(0.628,0.526,0.775);
    
    vec3 color = mix(influencing_color_A,
                     influencing_color_B,
                     step(.5,st.x)
                    //  step(.5,st.y)
                    );
    
    color = mix(color,
               influenced_color,
               rect(
                abs((st - vec2(0.5, 0)) * vec2(2., 1.)),
                 vec2(.05,.125)));

    gl_FragColor = vec4(color,1.0);
}