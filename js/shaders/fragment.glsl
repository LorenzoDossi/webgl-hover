varying float vNoise;
varying vec2 vUv;

uniform sampler2D uImage;
uniform float time;

void main() {
  vec2 newUv =  vUv;
  vec4 oceanView = texture2D(uImage, newUv);

  gl_FragColor = vec4(oceanView);
  gl_FragColor.rgb += 0.05 * vec3(vNoise);
}
