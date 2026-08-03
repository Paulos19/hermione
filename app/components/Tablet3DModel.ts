import * as THREE from 'three';

export interface Tablet3DModelOptions {
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
}

export interface ProceduralModelResult {
  group: THREE.Group;
  tick?: (delta: number, elapsed: number) => void;
  dispose: () => void;
}

/**
 * Creates a procedural 3D Tablet model in Three.js based on Image 1 reference.
 * Follows img2threejs pipeline (Blockout -> Structural -> Form -> Material -> Surface).
 */
export function createTablet3DModel(options: Tablet3DModelOptions = {}): ProceduralModelResult {
  const {
    width = 3.4,
    height = 4.8,
    depth = 0.12,
    radius = 0.28
  } = options;

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Tablet3DRoot';

  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const materialsToDispose: THREE.Material[] = [];

  // PBR Materials derived from Imagem 1 pixel analysis
  const chassisMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b0b0d,
    metalness: 0.82,
    roughness: 0.22,
    envMapIntensity: 1.2
  });
  materialsToDispose.push(chassisMaterial);

  const glassBezelMaterial = new THREE.MeshStandardMaterial({
    color: 0x040405,
    metalness: 0.9,
    roughness: 0.08,
  });
  materialsToDispose.push(glassBezelMaterial);

  const cameraLensMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x091428,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  materialsToDispose.push(cameraLensMaterial);

  const buttonMaterial = new THREE.MeshStandardMaterial({
    color: 0x161618,
    metalness: 0.8,
    roughness: 0.3
  });
  materialsToDispose.push(buttonMaterial);

  // Helper to create rounded rectangle shape
  function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    return shape;
  }

  // 1. Chassis Body (Extruded Rounded Rectangle with Bevel)
  const mainShape = createRoundedRectShape(width, height, radius);
  const extrudeSettings = {
    steps: 1,
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4
  };

  const chassisGeometry = new THREE.ExtrudeGeometry(mainShape, extrudeSettings);
  chassisGeometry.center();
  geometriesToDispose.push(chassisGeometry);

  const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  rootGroup.add(chassisMesh);

  // 2. Front Glass Bezel Panel (Matching Imagem 1 Ultra-Thin Bezels)
  const bezelShape = createRoundedRectShape(width * 0.985, height * 0.985, radius * 0.95);
  const bezelGeometry = new THREE.ShapeGeometry(bezelShape);
  geometriesToDispose.push(bezelGeometry);

  const bezelMesh = new THREE.Mesh(bezelGeometry, glassBezelMaterial);
  bezelMesh.position.z = depth / 2 + 0.021; // Position right on front face
  rootGroup.add(bezelMesh);

  // 3. Camera Pinhole (Centered at top of bezel, exactly as in Imagem 1)
  const cameraHolderGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16);
  const cameraLensGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16);
  geometriesToDispose.push(cameraHolderGeo, cameraLensGeo);

  const cameraHolderMesh = new THREE.Mesh(cameraHolderGeo, glassBezelMaterial);
  cameraHolderMesh.rotation.x = Math.PI / 2;
  cameraHolderMesh.position.set(0, height / 2 - 0.1, depth / 2 + 0.023);
  rootGroup.add(cameraHolderMesh);

  const cameraLensMesh = new THREE.Mesh(cameraLensGeo, cameraLensMaterial);
  cameraLensMesh.rotation.x = Math.PI / 2;
  cameraLensMesh.position.set(0, height / 2 - 0.1, depth / 2 + 0.024);
  rootGroup.add(cameraLensMesh);

  // 4. Hardware Side Buttons (Volume & Power)
  const btnWidth = 0.015;
  const btnLength = 0.25;
  const btnDepth = 0.02;

  const btnGeo = new THREE.BoxGeometry(btnWidth, btnLength, btnDepth);
  geometriesToDispose.push(btnGeo);

  // Left volume buttons
  const volUp = new THREE.Mesh(btnGeo, buttonMaterial);
  volUp.position.set(-width / 2 - 0.01, 0.8, 0);
  rootGroup.add(volUp);

  const volDown = new THREE.Mesh(btnGeo, buttonMaterial);
  volDown.position.set(-width / 2 - 0.01, 0.4, 0);
  rootGroup.add(volDown);

  // Right power button
  const powerBtn = new THREE.Mesh(btnGeo, buttonMaterial);
  powerBtn.position.set(width / 2 + 0.01, 0.8, 0);
  rootGroup.add(powerBtn);

  // 5. Action Sockets & Metadata (userData.tick)
  rootGroup.userData = {
    type: 'tablet_3d_model',
    version: '1.4',
    screenSocket: {
      width: width * 0.94,
      height: height * 0.94,
      position: new THREE.Vector3(0, 0, depth / 2 + 0.022)
    }
  };

  const tick = (delta: number, elapsed: number) => {
    // Subtle idle floating animation
    rootGroup.position.y = Math.sin(elapsed * 1.5) * 0.04;
  };

  const dispose = () => {
    geometriesToDispose.forEach((g) => g.dispose());
    materialsToDispose.forEach((m) => m.dispose());
  };

  return {
    group: rootGroup,
    tick,
    dispose
  };
}
