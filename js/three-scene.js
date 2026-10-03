/**
 * Interactive 3D Flower Scene for Leen Flowers (متجر لين للزهور)
 * Built with Three.js (Procedural Velvet Rose, Golden Accents, Drifting Petal Particles)
 */

export function initThreeFlowerScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found.`);
    return null;
  }

  // Ensure Three.js is available
  if (typeof THREE === 'undefined') {
    console.warn('Three.js is not loaded globally.');
    return null;
  }

  // Scene & Camera
  const scene = new THREE.Scene();
  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1.2, 5.5);

  // Renderer with High DPI support
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Group that holds the entire flower
  const flowerGroup = new THREE.Group();
  scene.add(flowerGroup);

  // Theme palettes configuration
  const themeColors = {
    blush: {
      innerPetals: 0xd94b68,
      outerPetals: 0xf27d92,
      petalRim: 0xffadc0,
      stem: 0x3d6647,
      goldAccent: 0xd4af37,
      ambient: 0xffeef2,
      pointLight: 0xffc4d0,
      lightIntensity: 1.5
    },
    lavender: {
      innerPetals: 0x6f52b8,
      outerPetals: 0x9882d4,
      petalRim: 0xd8cff7,
      stem: 0x2e684f,
      goldAccent: 0xc4b2e8,
      ambient: 0xf2effa,
      pointLight: 0xdfd4ff,
      lightIntensity: 1.6
    },
    midnight: {
      innerPetals: 0xbe1938,
      outerPetals: 0xeb3b5a,
      petalRim: 0xffd276,
      stem: 0x1d3b2b,
      goldAccent: 0xf5c065,
      ambient: 0x24283b,
      pointLight: 0xffd276,
      lightIntensity: 2.2
    }
  };

  let currentTheme = 'blush';

  // --- Lighting Setup ---
  const ambientLight = new THREE.AmbientLight(themeColors.blush.ambient, 1.2);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
  mainLight.position.set(5, 8, 6);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xffdbe6, 0.8);
  fillLight.position.set(-5, -2, -3);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(themeColors.blush.pointLight, 2.0, 10);
  rimLight.position.set(0, 3, 2);
  scene.add(rimLight);

  // --- Procedural Flower Construction ---
  const petalMaterials = [];

  // Helper to create a curved velvet petal geometry
  function createPetalGeometry(width, length, curve) {
    const geom = new THREE.PlaneGeometry(width, length, 12, 12);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Curve petal along vertical and horizontal axes
      const normY = (y + length / 2) / length;
      const zCurve = -Math.sin(normY * Math.PI) * curve - Math.sin((x / width) * Math.PI) * (curve * 0.3);
      pos.setZ(i, zCurve);
    }
    geom.computeVertexNormals();
    return geom;
  }

  // Create Rose Core & Petal Layers
  const layers = [
    { count: 4, width: 0.6, length: 0.8, radius: 0.2, angle: 0.35, curve: 0.35, isInner: true },
    { count: 6, width: 0.8, length: 1.0, radius: 0.35, angle: 0.55, curve: 0.45, isInner: true },
    { count: 8, width: 1.1, length: 1.2, radius: 0.55, angle: 0.8, curve: 0.55, isInner: false },
    { count: 10, width: 1.3, length: 1.4, radius: 0.8, angle: 1.1, curve: 0.65, isInner: false },
    { count: 12, width: 1.5, length: 1.5, radius: 1.05, angle: 1.35, curve: 0.75, isInner: false }
  ];

  const roseHead = new THREE.Group();

  layers.forEach((layer, layerIdx) => {
    for (let i = 0; i < layer.count; i++) {
      const petalGeom = createPetalGeometry(layer.width, layer.length, layer.curve);
      
      const mat = new THREE.MeshPhysicalMaterial({
        color: layer.isInner ? themeColors[currentTheme].innerPetals : themeColors[currentTheme].outerPetals,
        roughness: 0.42,
        metalness: 0.05,
        clearcoat: 0.25,
        clearcoatRoughness: 0.2,
        sheen: 0.8,
        sheenRoughness: 0.4,
        sheenColor: new THREE.Color(themeColors[currentTheme].petalRim),
        side: THREE.DoubleSide
      });
      petalMaterials.push({ mat, isInner: layer.isInner });

      const petalMesh = new THREE.Mesh(petalGeom, mat);
      petalMesh.castShadow = true;
      petalMesh.receiveShadow = true;

      const angle = (i / layer.count) * Math.PI * 2 + (layerIdx * 0.4);
      const x = Math.cos(angle) * layer.radius;
      const z = Math.sin(angle) * layer.radius;

      petalMesh.position.set(x, layerIdx * 0.05, z);
      petalMesh.rotation.y = -angle - Math.PI / 2;
      petalMesh.rotation.x = layer.angle + (Math.random() * 0.1 - 0.05);
      petalMesh.rotation.z = Math.random() * 0.1 - 0.05;

      roseHead.add(petalMesh);
    }
  });

  // Central rose bud core
  const coreGeom = new THREE.SphereGeometry(0.35, 16, 16);
  const coreMat = new THREE.MeshStandardMaterial({
    color: themeColors[currentTheme].innerPetals,
    roughness: 0.5
  });
  const coreMesh = new THREE.Mesh(coreGeom, coreMat);
  coreMesh.scale.set(0.6, 1.2, 0.6);
  coreMesh.position.y = 0.1;
  roseHead.add(coreMesh);
  petalMaterials.push({ mat: coreMat, isInner: true });

  // Stem & Leaves
  const stemCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.08, -1.2, 0.05),
    new THREE.Vector3(-0.06, -2.4, -0.05),
    new THREE.Vector3(0.02, -3.2, 0.0)
  );
  const stemGeom = new THREE.TubeGeometry(stemCurve, 32, 0.075, 12, false);
  const stemMat = new THREE.MeshStandardMaterial({
    color: themeColors[currentTheme].stem,
    roughness: 0.65,
    metalness: 0.1
  });
  const stemMesh = new THREE.Mesh(stemGeom, stemMat);
  stemMesh.castShadow = true;
  flowerGroup.add(stemMesh);

  // Leaves
  function createLeaf(scale, rotY, rotZ, posY) {
    const leafGeom = createPetalGeometry(0.6, 1.1, 0.35);
    const leafMat = new THREE.MeshStandardMaterial({
      color: themeColors[currentTheme].stem,
      roughness: 0.55,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const leafMesh = new THREE.Mesh(leafGeom, leafMat);
    leafMesh.scale.set(scale, scale, scale);
    leafMesh.position.set(0, posY, 0);
    leafMesh.rotation.y = rotY;
    leafMesh.rotation.z = rotZ;
    leafMesh.rotation.x = 0.4;
    return leafMesh;
  }

  const leaf1 = createLeaf(0.9, 0.8, -0.6, -0.8);
  const leaf2 = createLeaf(0.85, -1.5, 0.7, -1.6);
  flowerGroup.add(leaf1);
  flowerGroup.add(leaf2);

  // Golden Ring/Halo accent around the flower head
  const ringGeom = new THREE.TorusGeometry(1.6, 0.015, 16, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: themeColors[currentTheme].goldAccent,
    metalness: 0.85,
    roughness: 0.2
  });
  const goldRing = new THREE.Mesh(ringGeom, ringMat);
  goldRing.rotation.x = Math.PI / 2.3;
  goldRing.position.y = 0.1;
  flowerGroup.add(goldRing);

  // Add the rose head to the main flower group
  flowerGroup.add(roseHead);
  flowerGroup.position.y = 0.5;

  // --- Falling & Drifting Petals Particle System ---
  const petalCount = 36;
  const particleGroup = new THREE.Group();
  scene.add(particleGroup);

  const particles = [];
  const singlePetalGeom = createPetalGeometry(0.25, 0.35, 0.2);

  for (let i = 0; i < petalCount; i++) {
    const pMat = new THREE.MeshStandardMaterial({
      color: themeColors[currentTheme].outerPetals,
      roughness: 0.45,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    const pMesh = new THREE.Mesh(singlePetalGeom, pMat);
    pMesh.position.set(
      (Math.random() - 0.5) * 6,
      Math.random() * 6 - 2,
      (Math.random() - 0.5) * 5
    );

    pMesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    const speed = 0.008 + Math.random() * 0.012;
    const rotSpeed = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02
    };

    particles.push({ mesh: pMesh, speed, rotSpeed, mat: pMat });
    particleGroup.add(pMesh);
  }

  // --- Interaction Tracking (Mouse & Touch) ---
  let targetRotationX = 0.15;
  let targetRotationY = 0;
  let targetTiltZ = 0;
  let isPointerDown = false;
  let prevPointerX = 0;
  let prevPointerY = 0;

  function onPointerMove(e) {
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

    if (isPointerDown) {
      const deltaX = clientX - prevPointerX;
      const deltaY = clientY - prevPointerY;
      targetRotationY += deltaX * 0.012;
      targetRotationX += deltaY * 0.012;
      prevPointerX = clientX;
      prevPointerY = clientY;
    } else {
      targetRotationY = normX * 0.55;
      targetRotationX = 0.2 - normY * 0.4;
      targetTiltZ = -normX * 0.2;
    }
  }

  function onPointerDown(e) {
    isPointerDown = true;
    prevPointerX = e.touches ? e.touches[0].clientX : e.clientX;
    prevPointerY = e.touches ? e.touches[0].clientY : e.clientY;
  }

  function onPointerUp() {
    isPointerDown = false;
  }

  container.addEventListener('mousemove', onPointerMove, { passive: true });
  container.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mouseup', onPointerUp);

  container.addEventListener('touchmove', onPointerMove, { passive: true });
  container.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // Resize handler
  function onResize() {
    if (!container) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  }
  window.addEventListener('resize', onResize);

  // --- Theme Update API ---
  function updateTheme3D(themeName) {
    if (!themeColors[themeName]) return;
    currentTheme = themeName;
    const palette = themeColors[themeName];

    // Update petal colors
    petalMaterials.forEach(({ mat, isInner }) => {
      mat.color.setHex(isInner ? palette.innerPetals : palette.outerPetals);
      if (mat.sheenColor) {
        mat.sheenColor.setHex(palette.petalRim);
      }
    });

    // Update stem & leaves
    stemMat.color.setHex(palette.stem);
    ringMat.color.setHex(palette.goldAccent);

    // Update particles
    particles.forEach(p => {
      p.mat.color.setHex(palette.outerPetals);
    });

    // Update lights
    ambientLight.color.setHex(palette.ambient);
    rimLight.color.setHex(palette.pointLight);
    rimLight.intensity = palette.lightIntensity;
  }

  // --- Animation Loop ---
  let clock = new THREE.Clock();
  let animId = null;

  function animate() {
    animId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Gentle floating breathing animation for flower
    flowerGroup.position.y = 0.5 + Math.sin(elapsedTime * 1.5) * 0.08;

    // Smooth inertia interpolation towards mouse/touch targets
    flowerGroup.rotation.x += (targetRotationX - flowerGroup.rotation.x) * 0.06;
    flowerGroup.rotation.y += (targetRotationY - flowerGroup.rotation.y) * 0.06;
    flowerGroup.rotation.z += (targetTiltZ - flowerGroup.rotation.z) * 0.06;

    // Autonomous slow rotation
    if (!isPointerDown) {
      targetRotationY += 0.003;
    }

    // Slowly spin the golden halo ring
    goldRing.rotation.z += 0.005;

    // Animate falling drifting petals
    particles.forEach(p => {
      p.mesh.position.y -= p.speed;
      p.mesh.position.x += Math.sin(elapsedTime + p.speed * 100) * 0.004;
      p.mesh.rotation.x += p.rotSpeed.x;
      p.mesh.rotation.y += p.rotSpeed.y;
      p.mesh.rotation.z += p.rotSpeed.z;

      // Wrap around when falling beneath view
      if (p.mesh.position.y < -3.2) {
        p.mesh.position.y = 3.2;
        p.mesh.position.x = (Math.random() - 0.5) * 6;
      }
    });

    renderer.render(scene, camera);
  }

  animate();

  return {
    updateTheme3D,
    destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
  };
}
