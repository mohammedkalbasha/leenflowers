/**
 * Interactive 3D Luxury Flower Bouquet & Petals Scene for Leen Flowers (متجر لين للزهور)
 * High compatibility (WebGL standard materials, mobile-responsive, zero CORS issues)
 */

export function initThreeFlowerScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (typeof THREE === 'undefined') {
    console.warn('Three.js is not loaded.');
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:20px; color:var(--text-muted);">
        <div style="font-size:3.5rem; margin-bottom:10px;">🌸</div>
        <h4 style="color:var(--text-main);">باقة ورد لين للزهور ثلاثية الأبعاد</h4>
        <p style="font-size:0.85rem;">زهور طبيعية منسقة بحب وإتقان</p>
      </div>
    `;
    return null;
  }

  // Determine container dimensions safely
  let width = container.clientWidth || container.offsetWidth || 420;
  let height = container.clientHeight || container.offsetHeight || 420;
  if (width < 100) width = 420;
  if (height < 100) height = 420;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0.8, 5.2);

  // Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'default'
    });
  } catch (e) {
    console.error('WebGL initialization failed', e);
    return null;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'pan-y'; // allow mobile vertical scrolling

  // Theme palettes configuration
  const themeColors = {
    blush: {
      mainRose: 0xd94b68,
      secondaryRose: 0xf48b9f,
      miniRose: 0xffadc0,
      stamen: 0xd4af37,
      stem: 0x2d5a37,
      leaf: 0x3b7548,
      vase: 0xffffff,
      vaseBorder: 0xd4af37,
      ambient: 0xffedf1,
      mainLight: 0xffffff,
      rimLight: 0xffc2ce
    },
    lavender: {
      mainRose: 0x765bb5,
      secondaryRose: 0x9b84d4,
      miniRose: 0xd5cbf2,
      stamen: 0x3b8465,
      stem: 0x24553b,
      leaf: 0x2f6d4d,
      vase: 0xffffff,
      vaseBorder: 0x8e7cc3,
      ambient: 0xf3f0fc,
      mainLight: 0xffffff,
      rimLight: 0xdad0fb
    },
    midnight: {
      mainRose: 0xd91e42,
      secondaryRose: 0xf24b6a,
      miniRose: 0xff7b93,
      stamen: 0xf5c065,
      stem: 0x1d3d28,
      leaf: 0x274e35,
      vase: 0x1e2433,
      vaseBorder: 0xf5c065,
      ambient: 0x1a1e2d,
      mainLight: 0xffeedd,
      rimLight: 0xf5c065
    }
  };

  let currentTheme = document.documentElement.getAttribute('data-theme') || 'blush';
  if (!themeColors[currentTheme]) currentTheme = 'blush';

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(themeColors[currentTheme].ambient, 1.3);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(themeColors[currentTheme].mainLight, 1.8);
  mainLight.position.set(4, 7, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.9);
  backLight.position.set(-4, -2, -4);
  scene.add(backLight);

  const rimLight = new THREE.PointLight(themeColors[currentTheme].rimLight, 1.8, 12);
  rimLight.position.set(0, 2.5, 2);
  scene.add(rimLight);

  // --- Bouquet Master Group ---
  const bouquet = new THREE.Group();
  scene.add(bouquet);

  // Storage for materials that change with theme
  const dynamicMaterials = [];

  // Helper to create a curved 3D petal
  function createPetal(width, length, curveZ, colorHex, isInner = false) {
    const geom = new THREE.PlaneGeometry(width, length, 8, 8);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      const normY = (y + length / 2) / length;
      const z = -Math.sin(normY * Math.PI) * curveZ - Math.sin((x / width) * Math.PI) * (curveZ * 0.35);
      pos.setZ(i, z);
    }
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.55,
      metalness: 0.08,
      side: THREE.DoubleSide
    });
    dynamicMaterials.push({ mat, type: isInner ? 'inner' : 'outer' });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Create a full 3D Rose Flower head
  function createRose(scale = 1.0, mainColor, secColor) {
    const roseGroup = new THREE.Group();

    // Central bud
    const coreGeom = new THREE.SphereGeometry(0.24 * scale, 12, 12);
    const coreMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.6
    });
    dynamicMaterials.push({ mat: coreMat, type: 'inner' });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.scale.set(0.7, 1.2, 0.7);
    core.position.y = 0.08 * scale;
    roseGroup.add(core);

    // Layers of curved petals
    const layers = [
      { count: 4, w: 0.5 * scale, l: 0.65 * scale, r: 0.16 * scale, tilt: 0.35, c: 0.28, inner: true },
      { count: 6, w: 0.7 * scale, l: 0.85 * scale, r: 0.32 * scale, tilt: 0.6, c: 0.38, inner: true },
      { count: 8, w: 0.95 * scale, l: 1.05 * scale, r: 0.52 * scale, tilt: 0.9, c: 0.48, inner: false },
      { count: 10, w: 1.2 * scale, l: 1.25 * scale, r: 0.75 * scale, tilt: 1.2, c: 0.58, inner: false }
    ];

    layers.forEach((layer, layerIdx) => {
      for (let i = 0; i < layer.count; i++) {
        const color = layer.inner ? mainColor : secColor;
        const petal = createPetal(layer.w, layer.l, layer.c, color, layer.inner);
        const angle = (i / layer.count) * Math.PI * 2 + (layerIdx * 0.45);
        const x = Math.cos(angle) * layer.r;
        const z = Math.sin(angle) * layer.r;

        petal.position.set(x, layerIdx * 0.04 * scale, z);
        petal.rotation.y = -angle - Math.PI / 2;
        petal.rotation.x = layer.tilt + (Math.random() * 0.08 - 0.04);
        petal.rotation.z = (Math.random() * 0.1 - 0.05);

        roseGroup.add(petal);
      }
    });

    return roseGroup;
  }

  // 1. Central Queen Rose (باقة ورد رئيسية)
  const centerRose = createRose(1.15, themeColors[currentTheme].mainRose, themeColors[currentTheme].secondaryRose);
  centerRose.position.set(0, 0.35, 0);
  bouquet.add(centerRose);

  // 2. Surrounding Side Roses (ورود إضافية لتشكيل باقة حقيقية)
  const sideRose1 = createRose(0.78, themeColors[currentTheme].secondaryRose, themeColors[currentTheme].miniRose);
  sideRose1.position.set(0.85, 0.15, 0.2);
  sideRose1.rotation.z = -0.4;
  sideRose1.rotation.y = 0.5;
  bouquet.add(sideRose1);

  const sideRose2 = createRose(0.75, themeColors[currentTheme].secondaryRose, themeColors[currentTheme].miniRose);
  sideRose2.position.set(-0.85, 0.1, 0.15);
  sideRose2.rotation.z = 0.45;
  sideRose2.rotation.y = -0.6;
  bouquet.add(sideRose2);

  const sideRose3 = createRose(0.7, themeColors[currentTheme].mainRose, themeColors[currentTheme].secondaryRose);
  sideRose3.position.set(0.1, 0.2, -0.75);
  sideRose3.rotation.x = -0.4;
  bouquet.add(sideRose3);

  // 3. Stems & Green Leaves
  const stemMat = new THREE.MeshStandardMaterial({
    color: themeColors[currentTheme].stem,
    roughness: 0.7
  });
  dynamicMaterials.push({ mat: stemMat, type: 'stem' });

  const leafMat = new THREE.MeshStandardMaterial({
    color: themeColors[currentTheme].leaf,
    roughness: 0.55,
    side: THREE.DoubleSide
  });
  dynamicMaterials.push({ mat: leafMat, type: 'leaf' });

  // Main Stems
  const stemGeom = new THREE.CylinderGeometry(0.06, 0.08, 2.4, 12);
  const stem1 = new THREE.Mesh(stemGeom, stemMat);
  stem1.position.set(0, -0.9, 0);
  bouquet.add(stem1);

  // Leaves
  function createLeafMesh(scale, x, y, z, rx, ry, rz) {
    const leafGeom = new THREE.PlaneGeometry(0.55 * scale, 1.1 * scale, 6, 6);
    const pos = leafGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const ny = (pos.getY(i) + 0.55) / 1.1;
      pos.setZ(i, -Math.sin(ny * Math.PI) * 0.25);
    }
    leafGeom.computeVertexNormals();

    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(x, y, z);
    leaf.rotation.set(rx, ry, rz);
    leaf.castShadow = true;
    return leaf;
  }

  bouquet.add(createLeafMesh(1.1, 0.7, -0.3, 0.4, 0.6, 0.8, -0.6));
  bouquet.add(createLeafMesh(1.0, -0.75, -0.35, 0.35, 0.5, -0.8, 0.6));
  bouquet.add(createLeafMesh(0.9, 0.1, -0.4, -0.65, -0.7, 0.2, 0.1));
  bouquet.add(createLeafMesh(0.85, -0.4, -0.7, 0.5, 0.8, -0.4, 0.5));

  // 4. Luxury Golden Ribbon Wrap around bouquet
  const ribbonGeom = new THREE.TorusGeometry(0.45, 0.05, 12, 32);
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: themeColors[currentTheme].stamen,
    metalness: 0.85,
    roughness: 0.25
  });
  dynamicMaterials.push({ mat: ribbonMat, type: 'gold' });

  const ribbon = new THREE.Mesh(ribbonGeom, ribbonMat);
  ribbon.rotation.x = Math.PI / 2;
  ribbon.position.set(0, -0.55, 0);
  bouquet.add(ribbon);

  // Second Ribbon loop
  const ribbonBowGeom = new THREE.TorusGeometry(0.22, 0.035, 12, 24);
  const ribbonBow1 = new THREE.Mesh(ribbonBowGeom, ribbonMat);
  ribbonBow1.position.set(0.18, -0.58, 0.42);
  ribbonBow1.rotation.y = 0.4;
  bouquet.add(ribbonBow1);

  const ribbonBow2 = new THREE.Mesh(ribbonBowGeom, ribbonMat);
  ribbonBow2.position.set(-0.18, -0.58, 0.42);
  ribbonBow2.rotation.y = -0.4;
  bouquet.add(ribbonBow2);

  // Position bouquet nicely in camera view
  bouquet.position.y = 0.2;

  // --- Falling & Floating Rose Petals ---
  const petalsCount = 28;
  const floatingPetals = [];
  const petalParticleGroup = new THREE.Group();
  scene.add(petalParticleGroup);

  const smallPetalGeom = new THREE.PlaneGeometry(0.22, 0.32, 4, 4);
  const pos = smallPetalGeom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, -Math.sin(((pos.getY(i) + 0.16) / 0.32) * Math.PI) * 0.12);
  }
  smallPetalGeom.computeVertexNormals();

  for (let i = 0; i < petalsCount; i++) {
    const pMat = new THREE.MeshStandardMaterial({
      color: themeColors[currentTheme].secondaryRose,
      roughness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88
    });
    dynamicMaterials.push({ mat: pMat, type: 'petal' });

    const pMesh = new THREE.Mesh(smallPetalGeom, pMat);
    pMesh.position.set(
      (Math.random() - 0.5) * 6,
      Math.random() * 5 - 1.5,
      (Math.random() - 0.5) * 4
    );
    pMesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    floatingPetals.push({
      mesh: pMesh,
      speedY: 0.006 + Math.random() * 0.012,
      speedRotX: (Math.random() - 0.5) * 0.02,
      speedRotY: (Math.random() - 0.5) * 0.02,
      swayOffset: Math.random() * Math.PI * 2
    });
    petalParticleGroup.add(pMesh);
  }

  // --- Interaction Tracking (Mouse & Touch Drag) ---
  let isDragging = false;
  let prevX = 0;
  let prevY = 0;
  let targetRotY = 0;
  let targetRotX = 0.1;
  let targetTiltZ = 0;

  function onPointerMove(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (isDragging) {
      const deltaX = clientX - prevX;
      const deltaY = clientY - prevY;
      targetRotY += deltaX * 0.012;
      targetRotX += deltaY * 0.01;
      targetRotX = Math.max(-0.4, Math.min(0.6, targetRotX));
      prevX = clientX;
      prevY = clientY;
    } else {
      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = normX * 0.45;
      targetRotX = 0.15 - normY * 0.25;
      targetTiltZ = -normX * 0.15;
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

  // Resize handler
  function handleResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth || 400;
    const h = container.clientHeight || 400;
    if (w < 50 || h < 50) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', handleResize);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(container);
  }

  // --- Dynamic Theme Updater ---
  function updateTheme3D(newTheme) {
    if (!themeColors[newTheme]) return;
    currentTheme = newTheme;
    const p = themeColors[newTheme];

    dynamicMaterials.forEach(({ mat, type }) => {
      if (type === 'inner') mat.color.setHex(p.mainRose);
      else if (type === 'outer' || type === 'petal') mat.color.setHex(p.secondaryRose);
      else if (type === 'stem') mat.color.setHex(p.stem);
      else if (type === 'leaf') mat.color.setHex(p.leaf);
      else if (type === 'gold') mat.color.setHex(p.stamen);
    });

    ambientLight.color.setHex(p.ambient);
    mainLight.color.setHex(p.mainLight);
    rimLight.color.setHex(p.rimLight);
  }

  // --- Render Loop ---
  let animId = null;
  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Gentle floating breathing animation
    bouquet.position.y = 0.2 + Math.sin(elapsedTime * 1.6) * 0.06;

    // Smooth inertia interpolation
    bouquet.rotation.x += (targetRotX - bouquet.rotation.x) * 0.08;
    bouquet.rotation.y += (targetRotY - bouquet.rotation.y) * 0.08;
    bouquet.rotation.z += (targetTiltZ - bouquet.rotation.z) * 0.08;

    // Subtle automatic spin when idle
    if (!isDragging) {
      targetRotY += 0.0025;
    }

    // Floating petals animation
    floatingPetals.forEach(p => {
      p.mesh.position.y -= p.speedY;
      p.mesh.position.x += Math.sin(elapsedTime * 1.2 + p.swayOffset) * 0.004;
      p.mesh.rotation.x += p.speedRotX;
      p.mesh.rotation.y += p.speedRotY;

      // Wrap around
      if (p.mesh.position.y < -2.6) {
        p.mesh.position.y = 2.8;
        p.mesh.position.x = (Math.random() - 0.5) * 5;
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
