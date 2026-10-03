/**
 * Ultra-Realistic 3D Velvet Rose & Petals Scene for Leen Flowers (متجر لين للزهور)
 * Natural organic petal curves, velvet textures, golden ratio spiral, and calibrated studio lighting.
 */

export function initThreeFlowerScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (typeof THREE === 'undefined') {
    console.warn('Three.js is not loaded.');
    return null;
  }

  // Dimensions
  let width = container.clientWidth || 440;
  let height = container.clientHeight || 440;
  if (width < 100) width = 440;
  if (height < 100) height = 440;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0.6, 5.0);

  // High Quality Renderer with balanced tone mapping
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    console.error('WebGL init error', e);
    return null;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0; // Prevent white blowout!
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'pan-y';

  // --- Theme Color Definitions (Rich, saturated velvet colors) ---
  const themes = {
    blush: {
      petalBase: '#730d20',
      petalMid: '#b81938',
      petalEdge: '#d83756',
      petalRim: '#f26882',
      sheenColor: 0xff99aa,
      stemColor: 0x1d3d25,
      sepalColor: 0x275231,
      ambientColor: 0xffedf0,
      keyColor: 0xfff0e8,
      rimColor: 0xffa3b6,
      haloColor: 0xd4af37
    },
    lavender: {
      petalBase: '#3c256e',
      petalMid: '#5c3ca6',
      petalEdge: '#7f5ec9',
      petalRim: '#a98ee8',
      sheenColor: 0xd5c4ff,
      stemColor: 0x1d3b2a,
      sepalColor: 0x29533b,
      ambientColor: 0xf2effb,
      keyColor: 0xffffff,
      rimColor: 0xcaa9ff,
      haloColor: 0x8e7cc3
    },
    midnight: {
      petalBase: '#5e0516',
      petalMid: '#990c27',
      petalEdge: '#d4173b',
      petalRim: '#ff4d6d',
      sheenColor: 0xff8599,
      stemColor: 0x142b1a,
      sepalColor: 0x1c3a24,
      ambientColor: 0x1f2333,
      keyColor: 0xffe8cc,
      rimColor: 0xf5c065,
      haloColor: 0xf5c065
    }
  };

  let currentThemeName = document.documentElement.getAttribute('data-theme') || 'blush';
  if (!themes[currentThemeName]) currentThemeName = 'blush';
  let theme = themes[currentThemeName];

  // --- Calibrated Studio Lighting (Soft & Rich, NOT Overblown) ---
  const ambientLight = new THREE.AmbientLight(theme.ambientColor, 0.65);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(theme.keyColor, 1.15);
  keyLight.position.set(3, 5, 4);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const softFillLight = new THREE.DirectionalLight(0xffffff, 0.45);
  softFillLight.position.set(-3, 1, 2);
  scene.add(softFillLight);

  const rimLight = new THREE.PointLight(theme.rimColor, 1.2, 8);
  rimLight.position.set(0, 2.8, -2);
  scene.add(rimLight);

  // Group holding the entire flower
  const flowerGroup = new THREE.Group();
  scene.add(flowerGroup);

  // --- Procedural Organic Rose Petal Texture Generator ---
  function generatePetalTexture(baseHex, midHex, edgeHex, rimHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 512);

    // Natural curved heart/oval rose petal outline with alpha clip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(256, 480); // tapered stem base

    // Left curved margin
    ctx.bezierCurveTo(80, 420, 30, 240, 60, 140);
    // Left shoulder to top rounded lobes
    ctx.bezierCurveTo(80, 50, 190, 40, 256, 80);
    // Right shoulder
    ctx.bezierCurveTo(322, 40, 432, 50, 452, 140);
    // Right margin to base
    ctx.bezierCurveTo(482, 240, 432, 420, 256, 480);
    ctx.closePath();
    ctx.clip();

    // 1. Rich velvet radial gradient
    const grad = ctx.createRadialGradient(256, 450, 40, 256, 200, 320);
    grad.addColorStop(0, baseHex);
    grad.addColorStop(0.35, midHex);
    grad.addColorStop(0.75, edgeHex);
    grad.addColorStop(1, rimHex);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // 2. Micro velvet veins radiating from base
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    for (let a = -0.55; a <= 0.55; a += 0.05) {
      ctx.beginPath();
      ctx.moveTo(256, 470);
      const endX = 256 + Math.sin(a) * 380;
      const endY = 80 + Math.abs(a) * 80;
      const cpX = 256 + Math.sin(a) * 200 + (Math.random() * 10 - 5);
      const cpY = 280;
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();
    }

    // 3. Delicate velvet rim glow
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.stroke();

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }

  // --- Procedural Rose Leaf Texture Generator ---
  function generateLeafTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 512);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(128, 490);
    ctx.bezierCurveTo(20, 380, 10, 180, 128, 20); // leaf tip
    ctx.bezierCurveTo(246, 180, 236, 380, 128, 490);
    ctx.closePath();
    ctx.clip();

    // Dark forest green gradient
    const grad = ctx.createLinearGradient(128, 490, 128, 20);
    grad.addColorStop(0, '#162e1c');
    grad.addColorStop(0.5, '#244d2d');
    grad.addColorStop(1, '#33683f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // Central vein
    ctx.strokeStyle = '#478255';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(128, 490);
    ctx.lineTo(128, 30);
    ctx.stroke();

    // Side veins
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    for (let y = 100; y < 450; y += 35) {
      ctx.beginPath();
      ctx.moveTo(128, y);
      ctx.lineTo(60, y - 40);
      ctx.moveTo(128, y);
      ctx.lineTo(196, y - 40);
      ctx.stroke();
    }
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  // Initial textures
  let petalTexture = generatePetalTexture(theme.petalBase, theme.petalMid, theme.petalEdge, theme.petalRim);
  const leafTexture = generateLeafTexture();

  // --- Smooth Natural Curved Petal Mesh Builder ---
  function createCurvedPetalGeometry(width, height, cupDepth, curlBack) {
    const geom = new THREE.PlaneGeometry(width, height, 16, 16);
    const pos = geom.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Normalized coordinates: -1 to +1 horizontally, 0 to 1 vertically
      const u = x / (width * 0.5);
      const v = (y + height * 0.5) / height;

      // Natural cup curve: deep depression in the middle
      const cup = -Math.sin(v * Math.PI) * (1 - u * u) * cupDepth;

      // Top petal margin curling gracefully outward
      const curl = v > 0.75 ? Math.sin((v - 0.75) * 4 * (Math.PI * 0.5)) * curlBack : 0;

      // Slight wavy organic edge
      const wave = Math.sin(u * Math.PI * 3) * 0.02 * v;

      pos.setZ(i, cup + curl + wave);
    }

    geom.computeVertexNormals();
    return geom;
  }

  // Petal Material
  const petalMaterial = new THREE.MeshStandardMaterial({
    map: petalTexture,
    roughness: 0.42,
    metalness: 0.05,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1,
    shadowSide: THREE.DoubleSide
  });

  // --- Natural Fibonacci Spiral Golden Blooming Rose Head ---
  const roseHead = new THREE.Group();

  // Layers of petals expanding outward in golden angle spiral
  const petalLayers = [
    // Layer 1: Core tightly wound spiral bud
    { count: 4, w: 0.55, h: 0.75, r: 0.08, tilt: 0.2, cup: 0.25, curl: -0.05, yOffset: 0.2 },
    // Layer 2: Inner blooming core
    { count: 6, w: 0.75, h: 0.95, r: 0.18, tilt: 0.42, cup: 0.35, curl: 0.08, yOffset: 0.14 },
    // Layer 3: Middle velvet swirl
    { count: 8, w: 1.05, h: 1.25, r: 0.34, tilt: 0.65, cup: 0.45, curl: 0.18, yOffset: 0.08 },
    // Layer 4: Open radiant bloom
    { count: 10, w: 1.35, h: 1.5, r: 0.55, tilt: 0.92, cup: 0.55, curl: 0.28, yOffset: 0.02 },
    // Layer 5: Large outer drooping lush petals
    { count: 12, w: 1.65, h: 1.7, r: 0.82, tilt: 1.25, cup: 0.62, curl: 0.42, yOffset: -0.06 }
  ];

  petalLayers.forEach((layer, layerIdx) => {
    const geom = createCurvedPetalGeometry(layer.w, layer.h, layer.cup, layer.curl);

    for (let i = 0; i < layer.count; i++) {
      const mesh = new THREE.Mesh(geom, petalMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Golden ratio spiral angle: 137.5 degrees
      const phi = (i / layer.count) * Math.PI * 2 + layerIdx * 0.62;
      const x = Math.cos(phi) * layer.r;
      const z = Math.sin(phi) * layer.r;

      mesh.position.set(x, layer.yOffset + (Math.random() * 0.03 - 0.015), z);
      mesh.rotation.y = -phi - Math.PI / 2;
      mesh.rotation.x = layer.tilt + (Math.random() * 0.06 - 0.03);
      mesh.rotation.z = Math.random() * 0.08 - 0.04;

      roseHead.add(mesh);
    }
  });

  // Central rose core stamen with tiny golden pollen tips
  const centerCoreGeom = new THREE.SphereGeometry(0.2, 16, 16);
  const centerCoreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme.petalBase),
    roughness: 0.6
  });
  const centerCore = new THREE.Mesh(centerCoreGeom, centerCoreMat);
  centerCore.scale.set(0.8, 1.2, 0.8);
  centerCore.position.y = 0.25;
  roseHead.add(centerCore);

  // Glistening Dew Drops (Spheres with glassy specular)
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.92,
    ior: 1.33,
    transparent: true,
    opacity: 0.85
  });

  const dropGeom = new THREE.SphereGeometry(0.04, 8, 8);
  const dropCoords = [
    [0.35, 0.38, 0.45],
    [-0.42, 0.28, 0.38],
    [0.15, 0.48, -0.35],
    [0.55, 0.15, -0.2]
  ];
  dropCoords.forEach(([dx, dy, dz]) => {
    const drop = new THREE.Mesh(dropGeom, dropMat);
    drop.position.set(dx, dy, dz);
    drop.scale.set(1, 0.7, 1);
    roseHead.add(drop);
  });

  flowerGroup.add(roseHead);
  roseHead.position.y = 0.55;

  // --- Green Calyx (5 Sepals hugging flower base) ---
  const sepalMat = new THREE.MeshStandardMaterial({
    color: theme.sepalColor,
    roughness: 0.65,
    side: THREE.DoubleSide
  });

  const sepalGeom = new THREE.ConeGeometry(0.18, 0.85, 4);
  sepalGeom.translate(0, -0.35, 0);

  for (let s = 0; s < 5; s++) {
    const sepal = new THREE.Mesh(sepalGeom, sepalMat);
    const angle = (s / 5) * Math.PI * 2;
    sepal.position.set(Math.cos(angle) * 0.38, 0.38, Math.sin(angle) * 0.38);
    sepal.rotation.y = -angle;
    sepal.rotation.x = 0.65;
    sepal.castShadow = true;
    flowerGroup.add(sepal);
  }

  // --- Natural Curved Stem with Thorns ---
  const stemCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.42, 0),
    new THREE.Vector3(0.06, -0.6, 0.04),
    new THREE.Vector3(-0.08, -1.6, -0.04),
    new THREE.Vector3(0.02, -2.6, 0.0)
  );

  const stemGeom = new THREE.TubeGeometry(stemCurve, 32, 0.065, 12, false);
  const stemMat = new THREE.MeshStandardMaterial({
    color: theme.stemColor,
    roughness: 0.68,
    metalness: 0.05
  });
  const stem = new THREE.Mesh(stemGeom, stemMat);
  stem.castShadow = true;
  flowerGroup.add(stem);

  // Thorns
  const thornGeom = new THREE.ConeGeometry(0.045, 0.16, 4);
  thornGeom.rotateX(Math.PI / 2);
  const thornMat = new THREE.MeshStandardMaterial({ color: 0x5a1820, roughness: 0.5 });

  const thorn1 = new THREE.Mesh(thornGeom, thornMat);
  thorn1.position.set(0.07, -0.4, 0.05);
  thorn1.rotation.y = 0.8;
  flowerGroup.add(thorn1);

  const thorn2 = new THREE.Mesh(thornGeom, thornMat);
  thorn2.position.set(-0.08, -1.1, -0.03);
  thorn2.rotation.y = -2.2;
  flowerGroup.add(thorn2);

  // --- Natural Leaves with Leaf Vein Textures ---
  const leafMat = new THREE.MeshStandardMaterial({
    map: leafTexture,
    roughness: 0.52,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1
  });

  const leafGeom = new THREE.PlaneGeometry(0.7, 1.25, 8, 8);
  // Curve leaf slightly
  const lpos = leafGeom.attributes.position;
  for (let i = 0; i < lpos.count; i++) {
    const v = (lpos.getY(i) + 0.6) / 1.2;
    lpos.setZ(i, -Math.sin(v * Math.PI) * 0.18);
  }
  leafGeom.computeVertexNormals();

  const leaf1 = new THREE.Mesh(leafGeom, leafMat);
  leaf1.position.set(0.65, -0.5, 0.25);
  leaf1.rotation.set(0.4, 0.8, -0.5);
  leaf1.castShadow = true;
  flowerGroup.add(leaf1);

  const leaf2 = new THREE.Mesh(leafGeom, leafMat);
  leaf2.position.set(-0.7, -1.0, 0.2);
  leaf2.rotation.set(0.35, -1.1, 0.65);
  leaf2.castShadow = true;
  flowerGroup.add(leaf2);

  // Elegant golden ring halo around the rose
  const haloGeom = new THREE.TorusGeometry(1.65, 0.014, 16, 64);
  const haloMat = new THREE.MeshStandardMaterial({
    color: theme.haloColor,
    metalness: 0.85,
    roughness: 0.22
  });
  const halo = new THREE.Mesh(haloGeom, haloMat);
  halo.rotation.x = Math.PI / 2.3;
  halo.position.y = 0.55;
  flowerGroup.add(halo);

  // --- Falling & Floating Velvety Rose Petals ---
  const petalCount = 26;
  const floatingPetals = [];
  const petalParticleGroup = new THREE.Group();
  scene.add(petalParticleGroup);

  const smallPetalGeom = createCurvedPetalGeometry(0.35, 0.48, 0.12, 0.06);

  for (let i = 0; i < petalCount; i++) {
    const pMesh = new THREE.Mesh(smallPetalGeom, petalMaterial);
    pMesh.position.set(
      (Math.random() - 0.5) * 5.5,
      Math.random() * 5 - 1.5,
      (Math.random() - 0.5) * 4.5
    );
    pMesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    floatingPetals.push({
      mesh: pMesh,
      speedY: 0.007 + Math.random() * 0.011,
      rotX: (Math.random() - 0.5) * 0.016,
      rotY: (Math.random() - 0.5) * 0.016,
      rotZ: (Math.random() - 0.5) * 0.016,
      sway: Math.random() * Math.PI * 2
    });
    petalParticleGroup.add(pMesh);
  }

  // --- Smooth Interaction Tracking ---
  let isDragging = false;
  let prevX = 0;
  let prevY = 0;
  let targetRotY = 0;
  let targetRotX = 0.12;
  let targetTiltZ = 0;

  function onPointerMove(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (isDragging) {
      const deltaX = clientX - prevX;
      const deltaY = clientY - prevY;
      targetRotY += deltaX * 0.012;
      targetRotX += deltaY * 0.01;
      targetRotX = Math.max(-0.35, Math.min(0.55, targetRotX));
      prevX = clientX;
      prevY = clientY;
    } else {
      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = normX * 0.45;
      targetRotX = 0.15 - normY * 0.25;
      targetTiltZ = -normX * 0.12;
    }
  }

  function onPointerDown(e) {
    isDragging = true;
    prevX = e.touches ? e.touches[0].clientX : e.clientX;
    prevY = e.touches ? e.touches[0].clientY : e.clientY;
  }

  function onPointerUp() {
    isDragging = false;
  }

  container.addEventListener('mousemove', onPointerMove, { passive: true });
  container.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mouseup', onPointerUp);

  container.addEventListener('touchmove', onPointerMove, { passive: true });
  container.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // Resize
  function handleResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth || 440;
    const h = container.clientHeight || 440;
    if (w < 50 || h < 50) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', handleResize);
  if (window.ResizeObserver) {
    new ResizeObserver(handleResize).observe(container);
  }

  // --- Theme Updater ---
  function updateTheme3D(newTheme) {
    if (!themes[newTheme]) return;
    theme = themes[newTheme];

    // Re-generate petal texture with new rich tones
    petalTexture.dispose();
    petalTexture = generatePetalTexture(theme.petalBase, theme.petalMid, theme.petalEdge, theme.petalRim);
    petalMaterial.map = petalTexture;
    petalMaterial.needsUpdate = true;

    // Update colors
    centerCoreMat.color.set(theme.petalBase);
    stemMat.color.setHex(theme.stemColor);
    sepalMat.color.setHex(theme.sepalColor);
    haloMat.color.setHex(theme.haloColor);

    ambientLight.color.setHex(theme.ambientColor);
    keyLight.color.setHex(theme.keyColor);
    rimLight.color.setHex(theme.rimColor);
  }

  // --- Animation Loop ---
  let animId = null;
  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Natural breathing floating motion
    flowerGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.05;

    // Smooth inertia
    flowerGroup.rotation.x += (targetRotX - flowerGroup.rotation.x) * 0.08;
    flowerGroup.rotation.y += (targetRotY - flowerGroup.rotation.y) * 0.08;
    flowerGroup.rotation.z += (targetTiltZ - flowerGroup.rotation.z) * 0.08;

    // Subtle idle spin
    if (!isDragging) {
      targetRotY += 0.003;
    }

    // Spin halo gently
    halo.rotation.z += 0.006;

    // Animate falling petals
    floatingPetals.forEach(p => {
      p.mesh.position.y -= p.speedY;
      p.mesh.position.x += Math.sin(elapsedTime * 1.1 + p.sway) * 0.003;
      p.mesh.rotation.x += p.rotX;
      p.mesh.rotation.y += p.rotY;
      p.mesh.rotation.z += p.rotZ;

      if (p.mesh.position.y < -2.6) {
        p.mesh.position.y = 2.8;
        p.mesh.position.x = (Math.random() - 0.5) * 5.5;
      }
    });

    renderer.render(scene, camera);
  }

  animate();

  return {
    updateTheme3D,
    destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
    }
  };
}
