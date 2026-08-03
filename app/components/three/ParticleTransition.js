/**
 * ParticleTransition.js
 *
 * Scroll-driven particle transition effect between sections.
 * Particles dissolve from one formation to another as user scrolls.
 *
 * Stack: Three.js, BufferGeometry, ShaderMaterial, GLSL
 */

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════
// VERTEX SHADER
// ═══════════════════════════════════════════════════════════

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uResolution;

  attribute vec3 aPositionStart;
  attribute vec3 aPositionEnd;
  attribute float aSize;
  attribute float aRandom;

  varying float vAlpha;
  varying float vProgress;

  // Simplex noise
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    // Interpolate between start and end positions
    float progress = clamp(uProgress, 0.0, 1.0);

    // Add noise-based displacement during transition
    float noise = snoise(vec3(position.xy * 2.0, uTime * 0.3));
    float noiseStrength = sin(progress * 3.14159) * 0.5; // Peak at middle

    // Calculate displaced position
    vec3 pos = mix(aPositionStart, aPositionEnd, progress);
    pos += normalize(pos) * noise * noiseStrength * 0.3;

    // Add swirl during transition
    float angle = progress * 3.14159 * 2.0 + aRandom * 6.28;
    float swirlStrength = sin(progress * 3.14159) * 0.2;
    pos.x += cos(angle) * swirlStrength * aRandom;
    pos.y += sin(angle) * swirlStrength * aRandom;

    // Size animation - particles shrink during transition, grow at end
    float sizeProgress = sin(progress * 3.14159);
    float size = aSize * (0.5 + sizeProgress * 0.5);

    // Alpha animation
    vAlpha = 0.3 + sizeProgress * 0.7;
    vProgress = progress;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_PointSize = max(gl_PointSize, 0.5);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ═══════════════════════════════════════════════════════════
// FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uProgress;

  varying float vAlpha;
  varying float vProgress;

  void main() {
    // Create circular particle
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    if (dist > 0.5) discard;

    // Soft falloff
    float falloff = 1.0 - smoothstep(0.0, 0.5, dist);
    falloff = pow(falloff, 2.0);

    // Color: white with slight blue tint during transition
    vec3 baseColor = vec3(0.9, 0.9, 0.95);
    vec3 transitionColor = vec3(0.8, 0.85, 1.0);
    vec3 finalColor = mix(baseColor, transitionColor, vProgress);

    // Core glow
    float coreGlow = 1.0 - smoothstep(0.0, 0.15, dist);
    finalColor = mix(finalColor, vec3(1.0), coreGlow * 0.5);

    float alpha = falloff * vAlpha * 0.6;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════
// PARTICLE TRANSITION CLASS
// ═══════════════════════════════════════════════════════════

export class ParticleTransition {
  constructor(options = {}) {
    this.config = {
      container: options.container,
      particleCount: options.particleCount || 3000,
      width: options.width || 8,
      height: options.height || 4,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      ...options,
    };

    this.time = 0;
    this.progress = 0;
    this.isDisposed = false;

    this._init();
  }

  _init() {
    this._initScene();
    this._initCamera();
    this._initRenderer();
    this._initParticles();
    this._initResize();
    this._animate();
  }

  _initScene() {
    this.scene = new THREE.Scene();
  }

  _initCamera() {
    const aspect = this.config.container.clientWidth / this.config.container.clientHeight;
    this.camera = new THREE.OrthographicCamera(
      -this.config.width / 2,
      this.config.width / 2,
      this.config.height / 2,
      -this.config.height / 2,
      0.1,
      100
    );
    this.camera.position.z = 10;
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    this.renderer.setSize(
      this.config.container.clientWidth,
      this.config.container.clientHeight
    );
    this.renderer.setPixelRatio(this.config.pixelRatio);

    this.config.container.appendChild(this.renderer.domElement);
  }

  _initParticles() {
    const { particleCount, width, height } = this.config;

    this.particleGeometry = new THREE.BufferGeometry();

    const positionsStart = new Float32Array(particleCount * 3);
    const positionsEnd = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const randoms = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Start position: scattered across the width
      const startX = (Math.random() - 0.5) * width * 1.5;
      const startY = (Math.random() - 0.5) * height * 2;
      const startZ = (Math.random() - 0.5) * 2;

      positionsStart[i * 3] = startX;
      positionsStart[i * 3 + 1] = startY;
      positionsStart[i * 3 + 2] = startZ;

      // End position: converge to center line
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.5;
      const endX = Math.cos(angle) * radius;
      const endY = Math.sin(angle) * radius * 0.3; // Flatten vertically
      const endZ = (Math.random() - 0.5) * 0.5;

      positionsEnd[i * 3] = endX;
      positionsEnd[i * 3 + 1] = endY;
      positionsEnd[i * 3 + 2] = endZ;

      sizes[i] = 0.02 + Math.random() * 0.04;
      randoms[i] = Math.random();
    }

    this.particleGeometry.setAttribute('aPositionStart', new THREE.BufferAttribute(positionsStart, 3));
    this.particleGeometry.setAttribute('aPositionEnd', new THREE.BufferAttribute(positionsEnd, 3));
    this.particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.particleGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    // Use position attribute for initial placement
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positionsStart, 3));

    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uResolution: { value: new THREE.Vector2(
          this.config.container.clientWidth,
          this.config.container.clientHeight
        )},
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particles);
  }

  _initResize() {
    this.resizeObserver = new ResizeObserver(() => {
      this.resize(
        this.config.container.clientWidth,
        this.config.container.clientHeight
      );
    });
    this.resizeObserver.observe(this.config.container);
  }

  // Public methods
  resize(width, height) {
    if (this.isDisposed) return;

    const aspect = width / height;
    this.camera.left = -this.config.width / 2;
    this.camera.right = this.config.width / 2;
    this.camera.top = this.config.height / 2;
    this.camera.bottom = -this.config.height / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.particleMaterial.uniforms.uResolution.value.set(width, height);
  }

  setProgress(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
  }

  update(delta) {
    if (this.isDisposed) return;

    this.time += delta;
    this.particleMaterial.uniforms.uTime.value = this.time;
    this.particleMaterial.uniforms.uProgress.value = this.progress;
  }

  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;

    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
    this.renderer.dispose();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  _animate() {
    if (this.isDisposed) return;

    requestAnimationFrame(() => this._animate());

    this.update(0.016);
    this.renderer.render(this.scene, this.camera);
  }
}

export default ParticleTransition;
