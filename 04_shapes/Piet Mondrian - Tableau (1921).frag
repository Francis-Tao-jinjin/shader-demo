#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

// Paint colors.
vec3 red    = vec3(0.725, 0.141, 0.149);
vec3 blue   = vec3(0.012, 0.388, 0.624);
vec3 yellow = vec3(0.988, 0.784, 0.173);
vec3 beige  = vec3(.976, .949, .878);
vec3 black  = vec3(0.078, 0.09, 0.114);

float Band(float pos, float width) {
  float halfWidth = width * 0.5;
  return step(-halfWidth, pos) - step(halfWidth, pos);
}

float Rectangle(vec2 pos, float width, float height) {
  return Band(pos.x, width) * Band(pos.y, height);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;
  st -= 0.5;
  st.x *= u_resolution.x / u_resolution.y;
  vec3 color = beige;
  
  float width = 0.15;
  float margin = 0.015;
  float height = 0.3;

  // draw 4 vertical lines
  float blackRect = Band(st.x + width * 2., margin);
  blackRect += Band(st.x + width * 3.0, margin);
  blackRect += Band(st.x - width * 2.0, margin);
  blackRect += Band(st.x - width * 3.5, margin);

  //draw 2 horizontal lines
  blackRect += Band(st.y + height * 0.5, margin);
  blackRect += Band(st.y - height, margin);

  // red Rect
  vec2 rectPos = st - vec2(-width * 3.25, height + 0.1);
  float redRect = Rectangle(rectPos, width * 2.5, height * 0.7);

  // yellow Rect
  rectPos = st - vec2(width * 4.5, height + 0.1);
  float yellowRect = Rectangle(rectPos, width * 2., height * 0.7);

  // blue Rect
  rectPos = st - vec2(width * 4.5, -height - 0.03);
  float blueRect = Rectangle(rectPos, width * 2., height * 1.2);

  // beige Rect
  rectPos = st - vec2(-width * 3.3, -height - 0.037);
  float beigeRect = Rectangle(rectPos, width * 2.5, height * 1.2);

  color = mix(color, red, redRect);
  color = mix(color, yellow, yellowRect);
  color = mix(color, blue, blueRect);
  color = mix(color, black, blackRect);
  color = mix(color, beige, beigeRect);
  gl_FragColor = vec4(color, 1.0);
}
