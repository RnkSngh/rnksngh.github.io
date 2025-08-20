precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  // Create animated pattern
  float wave1 = sin(uv.x * 10.0 + u_time) * 0.5 + 0.5;
  float wave2 = sin(uv.y * 8.0 + u_time * 0.8) * 0.5 + 0.5;
  float pattern = wave1 * wave2;
  
  // Create color gradient
  vec3 color1 = vec3(0.8, 0.2, 0.5);
  vec3 color2 = vec3(0.2, 0.6, 0.9);
  vec3 finalColor = mix(color1, color2, pattern);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
