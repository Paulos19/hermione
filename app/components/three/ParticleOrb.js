/**
 * ParticleOrb.js
 *
 * High-performance 3D particle orb for production use.
 * Creates a volumetric sphere of particles with bloom effects,
 * procedural noise animation, and premium visual quality.
 *
 * Stack: Three.js, BufferGeometry, ShaderMaterial, GLSL
 */

import * as THREE from 'three';
import { EffectComposer } from 'three-stdlib';
import { RenderPass } from 'three-stdlib';
import { UnrealBloomPass } from 'three-stdlib';

// ═══════════════════════════════════════════════════════════
// GLSL SHADERS
// ═══════════════════════════════════════════════════════════

const VERTEX_SHADER = `
  // Uniforms
  uniform float uTime;
  uniform float uBreathing;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;

  // Attributes
  attribute float aSize;
  attribute float aSeed;
  attribute float aRandom;
  attribute vec3 aColor;

  // Varyings
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDistance;

  // Simplex 3D Noise (optimized)
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
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vColor = aColor;

    vec3 pos = position;

    // Mouse interaction - particles repel/attract from mouse
    vec3 mouseWorld = vec3(uMouse.x * 3.0, uMouse.y * 3.0, 0.0);
    vec3 toMouse = mouseWorld - pos;
    float mouseDistance = length(toMouse);
    float mouseForce = uMouseInfluence * smoothstep(3.0, 0.5, mouseDistance) * 0.5;
    pos += normalize(toMouse) * mouseForce * sin(aSeed * 6.28);

    // Procedural noise deformation
    float noise = snoise(pos * 1.5 + uTime * 0.15 + aSeed);
    float amplitude = 0.03;
    pos += normalize(pos) * noise * amplitude;

    // Breathing effect (subtle scale pulse)
    float breath = sin(uTime * 0.5 + aSeed * 3.14159) * 0.02 * uBreathing;
    pos *= 1.0 + breath;

    // Calculate view-space distance for depth attenuation
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vDistance = -mvPosition.z;

    // Atmospheric attenuation
    float attenuation = 1.0 - smoothstep(2.0, 8.0, vDistance);
    vAlpha = attenuation;

    // Size with distance attenuation - much larger particles
    gl_PointSize = aSize * (500.0 / -mvPosition.z);
    gl_PointSize = max(gl_PointSize, 1.0);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  // Uniforms
  uniform float uTime;

  // Varyings
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDistance;

  void main() {
    // Create circular particle with radial gradient
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    // Discard pixels outside circle
    if (dist > 0.5) discard;

    // Soft circular falloff (exponential)
    float falloff = 1.0 - smoothstep(0.0, 0.5, dist);
    falloff = pow(falloff, 1.5);

    // Bright center glow
    float coreGlow = 1.0 - smoothstep(0.0, 0.2, dist);
    coreGlow = pow(coreGlow, 2.0);

    // Mix colors: white center -> light gray -> subtle edge
    vec3 whiteCore = vec3(1.0, 1.0, 1.0);
    vec3 brightWhite = vColor * 1.2;
    vec3 edgeGray = vColor * 0.7;

    vec3 finalColor = mix(edgeGray, brightWhite, falloff);
    finalColor = mix(finalColor, whiteCore, coreGlow * 0.8);

    // Depth-based brightness (closer = brighter)
    float depthBrightness = 1.0 - smoothstep(2.0, 7.0, vDistance);

    // Final alpha with atmospheric attenuation
    float alpha = falloff * vAlpha * depthBrightness;

    // Boost for closer particles
    alpha *= 1.3;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════
// GAUSSIAN RANDOM (Box-Muller)
// ═══════════════════════════════════════════════════════════

function gaussianRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ═══════════════════════════════════════════════════════════
// COLOR PALETTE (Monochrome White)
// ═══════════════════════════════════════════════════════════

const WHITE_PALETTE = [
  new THREE.Color('#ffffff'),  // Pure white core
  new THREE.Color('#f0f0f0'),  // Bright white
  new THREE.Color('#e0e0e0'),  // Light gray
  new THREE.Color('#d0d0d0'),  // Medium white
  new THREE.Color('#c0c0c0'),  // Soft white
  new THREE.Color('#b0b0b0'),  // Edge white
];

// ═══════════════════════════════════════════════════════════
// PARTICLE ORB CLASS
// ═══════════════════════════════════════════════════════════

export class ParticleOrb {
  constructor(options = {}) {
    // Configuration
    this.config = {
      container: options.container,
      particleCount: options.particleCount || 70000,
      atmosphereCount: options.atmosphereCount || 500,
      radius: options.radius || 3.0,
      cameraZ: options.cameraZ || 9,
      fov: options.fov || 40,
      bloomStrength: options.bloomStrength || 2.2,
      bloomRadius: options.bloomRadius || 0.8,
      bloomThreshold: options.bloomThreshold || 0.05,
      rotationSpeedY: options.rotationSpeedY || 0.08,
      rotationSpeedX: options.rotationSpeedX || 0.02,
      breathingAmplitude: options.breathingAmplitude || 1.0,
      pixelRatio: options.pixelRatio || Math.min(window.devicePixelRatio, 2),
      background: options.background || 0x030303,
      ...options,
    };

    // State
    this.time = 0;
    this.isDisposed = false;
    this.animationId = null;
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };

    // Initialize
    this._init();
  }

  // ─────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────

  _init() {
    this._initScene();
    this._initCamera();
    this._initRenderer();
    this._initParticles();
    this._initAtmosphere();
    this._initPostProcessing();
    this._initResize();
    this._animate();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.background);
  }

  _initCamera() {
    const aspect = this.config.container.clientWidth / this.config.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      this.config.fov,
      aspect,
      0.1,
      100
    );
    this.camera.position.z = this.config.cameraZ;
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.renderer.setSize(
      this.config.container.clientWidth,
      this.config.container.clientHeight
    );
    this.renderer.setPixelRatio(this.config.pixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.config.container.appendChild(this.renderer.domElement);
  }

  _initParticles() {
    const { particleCount, radius } = this.config;

    // BufferGeometry
    this.particleGeometry = new THREE.BufferGeometry();

    // Arrays
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const seeds = new Float32Array(particleCount);
    const randoms = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Gaussian distribution for volumetric feel - denser at center
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      // Gaussian-like distribution using power function
      const r = radius * Math.pow(Math.random(), 0.5);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color based on distance from center - brighter at center
      const distFromCenter = Math.min(r / radius, 1.0);
      const colorIndex = Math.min(
        Math.floor(distFromCenter * (WHITE_PALETTE.length - 1)),
        WHITE_PALETTE.length - 1
      );
      const color = WHITE_PALETTE[colorIndex];

      // Add slight variation
      const variation = 0.9 + Math.random() * 0.2;
      colors[i * 3] = color.r * variation;
      colors[i * 3 + 1] = color.g * variation;
      colors[i * 3 + 2] = color.b * variation;

      // Size: much larger at center, smaller at edges
      const centerBias = 1.2 - distFromCenter * 0.8;
      sizes[i] = (0.03 + Math.random() * 0.08) * centerBias;

      seeds[i] = Math.random() * 100;
      randoms[i] = Math.random();
    }

    // Set attributes
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.particleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    this.particleGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    // ShaderMaterial
    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uBreathing: { value: this.config.breathingAmplitude },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    });

    // Points mesh
    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particles);
  }

  _initAtmosphere() {
    const { atmosphereCount, radius } = this.config;
    const innerRadius = radius * 1.3;
    const outerRadius = radius * 2.7;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(atmosphereCount * 3);
    const colors = new Float32Array(atmosphereCount * 3);
    const sizes = new Float32Array(atmosphereCount * 3);
    const seeds = new Float32Array(atmosphereCount);
    const randoms = new Float32Array(atmosphereCount);

    for (let i = 0; i < atmosphereCount; i++) {
      // Random position in shell
      const r = innerRadius + Math.random() * (outerRadius - innerRadius);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Very subtle white
      const brightness = 0.3 + Math.random() * 0.2;
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness * 0.95;
      colors[i * 3 + 2] = brightness * 0.8;

      // Very small particles
      sizes[i] = 0.008 + Math.random() * 0.015;

      seeds[i] = Math.random() * 100;
      randoms[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uBreathing: { value: 0.3 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    });

    this.atmosphere = new THREE.Points(geometry, material);
    this.scene.add(this.atmosphere);
  }

  _initPostProcessing() {
    const width = this.config.container.clientWidth;
    const height = this.config.container.clientHeight;

    this.composer = new EffectComposer(this.renderer);

    // Render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom pass
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      this.config.bloomStrength,
      this.config.bloomRadius,
      this.config.bloomThreshold
    );
    this.composer.addPass(this.bloomPass);
  }

  _initResize() {
    this.resizeObserver = new ResizeObserver(() => {
      this.resize(
        this.config.container.clientWidth,
        this.config.container.clientHeight
      );
    });
    this.resizeObserver.observe(this.config.container);

    // Mouse tracking
    this._onMouseMove = (e) => {
      const rect = this.config.container.getBoundingClientRect();
      this.targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.targetMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    this._onMouseLeave = () => {
      this.targetMouse.x = 0;
      this.targetMouse.y = 0;
    };

    this.config.container.addEventListener('mousemove', this._onMouseMove);
    this.config.container.addEventListener('mouseleave', this._onMouseLeave);
  }

  // ─────────────────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────────────────

  resize(width, height) {
    if (this.isDisposed) return;

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
  }

  update(delta) {
    if (this.isDisposed) return;

    this.time += delta;

    // Smooth mouse interpolation
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    // Calculate mouse influence (0 when mouse is away, 1 when near center)
    const mouseInfluence = Math.sqrt(this.mouse.x * this.mouse.x + this.mouse.y * this.mouse.y);

    // Update uniforms
    this.particleMaterial.uniforms.uTime.value = this.time;
    this.particleMaterial.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    this.particleMaterial.uniforms.uMouseInfluence.value = 1.0 - mouseInfluence * 0.5;

    this.atmosphere.material.uniforms.uTime.value = this.time;
    this.atmosphere.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    this.atmosphere.material.uniforms.uMouseInfluence.value = 1.0 - mouseInfluence * 0.5;

    // Rotation
    this.particles.rotation.y += delta * this.config.rotationSpeedY;
    this.particles.rotation.x += delta * this.config.rotationSpeedX;

    // Atmosphere rotates slightly different
    this.atmosphere.rotation.y += delta * this.config.rotationSpeedY * 0.5;
    this.atmosphere.rotation.z += delta * this.config.rotationSpeedX * 0.3;
  }

  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;

    // Cancel animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Remove mouse listeners
    if (this._onMouseMove) {
      this.config.container.removeEventListener('mousemove', this._onMouseMove);
    }
    if (this._onMouseLeave) {
      this.config.container.removeEventListener('mouseleave', this._onMouseLeave);
    }

    // Dispose geometries and materials
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
    this.atmosphere.geometry.dispose();
    this.atmosphere.material.dispose();

    // Dispose composer and renderer
    this.composer.dispose();
    this.renderer.dispose();

    // Remove DOM element
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  // ─────────────────────────────────────────────────────────
  // ANIMATION LOOP
  // ─────────────────────────────────────────────────────────

  _animate() {
    if (this.isDisposed) return;

    this.animationId = requestAnimationFrame(() => this._animate());

    const delta = 0.016; // ~60fps
    this.update(delta);

    // Render with post-processing
    this.composer.render();
  }
}

export default ParticleOrb;
