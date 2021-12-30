#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;       // mouse position in screen pixels
uniform float u_time;       // Time in seconds since load

void main() {

  // gl_FragColor = vec4(1.000, 0.980, 0.376, 1.000); // r g b a
  
  // 1- let u_time affect output color;
  // gl_FragColor = vec4(sin(u_time)* vec3(1.000,0.980,0.376),1.000);

  // 2- let Fragment Coordinate afect output color;
  vec2 st = gl_FragCoord.xy / u_resolution;
  float screen_ratio = u_resolution.x / u_resolution.y;
  st.x *= screen_ratio;
  gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);


  // 3- let's see how to show the mouse cursor;
  // vec2 st = gl_FragCoord.xy / u_resolution;
  // vec2 m_pos = u_mouse / u_resolution;
  // float screen_ratio = u_resolution.x / u_resolution.y;
  // st.x *= screen_ratio;
  // m_pos.x *= screen_ratio;
  // float inv_len = 1.0 - clamp(length(st - m_pos), 0.0, 0.02) * 50.0;
  // gl_FragColor = vec4(st.x + inv_len, st.y + inv_len, 0.0, 1.0);
  // gl_FragColor = vec4( vec2(st) + inv_len * abs(sin(u_time * 2.0)) , 0.0, 1.0);
}