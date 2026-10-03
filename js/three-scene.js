/**
 * Multi-Flower 3D Botanical System for Leen Flowers (متجر لين للزهور)
 * Displays a new flower on every visit (Rose, Tulip, Lily, Orchid)
 * with manual switch capability and theme responsiveness.
 */

export const FLOWER_TYPES = [
  { id: 'rose', name: 'الورد الجوري الملكي', icon: '🌹', desc: 'جوري طبيعي مخملي مع قطرات الندى' },
  { id: 'tulip', name: 'زهرة التوليب الفاخرة', icon: '🌷', desc: 'توليب هولندي أنيق بأوراق نضرة' },
  { id: 'lily', name: 'زهرة الليليوم واللوتس', icon: '🪷', desc: 'ليليوم متفتح مع أسدية ذهبية' },
  { id: 'orchid', name: 'زهرة الأوركيد الاستوائية', icon: '🌸', desc: 'أوركيد ملكي بتفاصيل استثنائية' }
];

const STORAGE_LAST_FLOWER = 'leen_last_flower_index';

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
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'pan-y';

  // --- Themes ---
  const themes = {
    blush: {
      petalBase: '#730d20',
      petalMid: '#b81938',
      petalEdge: '#d83756',
      petalRim: '#f26882',
      tulipBase: '#911d3b',
      tulipEdge: '#e64c72',
      lilyBase: '#fff0f3',
      lilyMid: '#f5829b',
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
      tulipBase: '#4d2d8c',
      tulipEdge: '#9374db',
      lilyBase: '#f4f0fc',
      lilyMid: '#8e72cf',
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
      tulipBase: '#780a1e',
      tulipEdge: '#e62e54',
      lilyBase: '#ffedf1',
      lilyMid: '#e63258',
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

  // Studio Lighting
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

  // Master flower group
  const flowerGroup = new THREE.Group();
  scene.add(flowerGroup);

  // Group containing the dynamic flower model
  let currentFlowerModelGroup = new THREE.Group();
  flowerGroup.add(currentFlowerModelGroup);

  // Falling Petals System
  const petalParticleGroup = new THREE.Group();
  scene.add(petalParticleGroup);
  let floatingPetals = [];

  // Golden Halo ring
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

  // --- Dynamic Textures ---
  function generatePetalTexture(baseHex, midHex, edgeHex, rimHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(256, 480);
    ctx.bezierCurveTo(80, 420, 30, 240, 60, 140);
    ctx.bezierCurveTo(80, 50, 190, 40, 256, 80);
    ctx.bezierCurveTo(322, 40, 432, 50, 452, 140);
    ctx.bezierCurveTo(482, 240, 432, 420, 256, 480);
    ctx.closePath();
    ctx.clip();

    const grad = ctx.createRadialGradient(256, 450, 40, 256, 200, 320);
    grad.addColorStop(0, baseHex);
    grad.addColorStop(0.35, midHex);
    grad.addColorStop(0.75, edgeHex);
    grad.addColorStop(1, rimHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    for (let a = -0.55; a <= 0.55; a += 0.05) {
      ctx.beginPath();
      ctx.moveTo(256, 470);
      const endX = 256 + Math.sin(a) * 380;
      const endY = 80 + Math.abs(a) * 80;
      ctx.quadraticCurveTo(256 + Math.sin(a) * 200, 280, endX, endY);
      ctx.stroke();
    }
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    return tex;
  }

  function generateLeafTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 512);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(128, 490);
    ctx.bezierCurveTo(20, 380, 10, 180, 128, 20);
    ctx.bezierCurveTo(246, 180, 236, 380, 128, 490);
    ctx.closePath();
    ctx.clip();

    const grad = ctx.createLinearGradient(128, 490, 128, 20);
    grad.addColorStop(0, '#162e1c');
    grad.addColorStop(0.5, '#244d2d');
    grad.addColorStop(1, '#33683f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    ctx.strokeStyle = '#478255';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(128, 490);
    ctx.lineTo(128, 30);
    ctx.stroke();
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  let petalTexture = generatePetalTexture(theme.petalBase, theme.petalMid, theme.petalEdge, theme.petalRim);
  const leafTexture = generateLeafTexture();

  // Helper: Curved Petal Mesh
  function createCurvedPetalGeometry(width, height, cupDepth, curlBack) {
    const geom = new THREE.PlaneGeometry(width, height, 16, 16);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const u = x / (width * 0.5);
      const v = (y + height * 0.5) / height;
      const cup = -Math.sin(v * Math.PI) * (1 - u * u) * cupDepth;
      const curl = v > 0.75 ? Math.sin((v - 0.75) * 4 * (Math.PI * 0.5)) * curlBack : 0;
      pos.setZ(i, cup + curl);
    }
    geom.computeVertexNormals();
    return geom;
  }

  // --- Botanical Stem & Leaves Generator ---
  function buildStemAndLeaves(height = 2.6, leafCount = 2) {
    const group = new THREE.Group();
    const stemCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(0.05, -0.5, 0.03),
      new THREE.Vector3(-0.06, -1.4, -0.03),
      new THREE.Vector3(0.02, -height, 0.0)
    );
    const stemGeom = new THREE.TubeGeometry(stemCurve, 32, 0.065, 12, false);
    const stemMat = new THREE.MeshStandardMaterial({ color: theme.stemColor, roughness: 0.65 });
    const stemMesh = new THREE.Mesh(stemGeom, stemMat);
    stemMesh.castShadow = true;
    group.add(stemMesh);

    const leafMat = new THREE.MeshStandardMaterial({
      map: leafTexture,
      roughness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.1
    });

    const leafGeom = new THREE.PlaneGeometry(0.7, 1.25, 8, 8);
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
    group.add(leaf1);

    if (leafCount >= 2) {
      const leaf2 = new THREE.Mesh(leafGeom, leafMat);
      leaf2.position.set(-0.7, -1.0, 0.2);
      leaf2.rotation.set(0.35, -1.1, 0.65);
      leaf2.castShadow = true;
      group.add(leaf2);
    }
    return group;
  }

  // ==========================================
  // Flower Model 1: Royal Dutch Rose (جوري ملكي)
  // ==========================================
  function buildRoseModel() {
    const group = new THREE.Group();
    const roseHead = new THREE.Group();

    const petalMat = new THREE.MeshStandardMaterial({
      map: petalTexture,
      roughness: 0.42,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.1
    });

    const layers = [
      { count: 4, w: 0.55, h: 0.75, r: 0.08, tilt: 0.2, cup: 0.25, curl: -0.05, y: 0.2 },
      { count: 6, w: 0.75, h: 0.95, r: 0.18, tilt: 0.42, cup: 0.35, curl: 0.08, y: 0.14 },
      { count: 8, w: 1.05, h: 1.25, r: 0.34, tilt: 0.65, cup: 0.45, curl: 0.18, y: 0.08 },
      { count: 10, w: 1.35, h: 1.5, r: 0.55, tilt: 0.92, cup: 0.55, curl: 0.28, y: 0.02 },
      { count: 12, w: 1.65, h: 1.7, r: 0.82, tilt: 1.25, cup: 0.62, curl: 0.42, y: -0.06 }
    ];

    layers.forEach((layer, layerIdx) => {
      const geom = createCurvedPetalGeometry(layer.w, layer.h, layer.cup, layer.curl);
      for (let i = 0; i < layer.count; i++) {
        const mesh = new THREE.Mesh(geom, petalMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const phi = (i / layer.count) * Math.PI * 2 + layerIdx * 0.62;
        mesh.position.set(Math.cos(phi) * layer.r, layer.y, Math.sin(phi) * layer.r);
        mesh.rotation.y = -phi - Math.PI / 2;
        mesh.rotation.x = layer.tilt;
        roseHead.add(mesh);
      }
    });

    // Core
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({ color: theme.petalBase, roughness: 0.6 })
    );
    core.scale.set(0.8, 1.2, 0.8);
    core.position.y = 0.25;
    roseHead.add(core);

    roseHead.position.y = 0.55;
    group.add(roseHead);
    group.add(buildStemAndLeaves(2.6, 2));
    return group;
  }

  // ==========================================
  // Flower Model 2: Elegance Tulip (توليب هولندي)
  // ==========================================
  function buildTulipModel() {
    const group = new THREE.Group();
    const tulipHead = new THREE.Group();

    const tulipTexture = generatePetalTexture(theme.tulipBase, theme.tulipEdge, theme.petalRim, '#ffffff');
    const tulipMat = new THREE.MeshStandardMaterial({
      map: tulipTexture,
      roughness: 0.38,
      metalness: 0.08,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.1
    });

    // 6 Large characteristic overlapping cup petals (3 inner, 3 outer)
    const innerGeom = createCurvedPetalGeometry(1.2, 1.8, 0.65, -0.15);
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(innerGeom, tulipMat);
      const angle = (i / 3) * Math.PI * 2;
      p.position.set(Math.cos(angle) * 0.25, 0.2, Math.sin(angle) * 0.25);
      p.rotation.y = -angle - Math.PI / 2;
      p.rotation.x = 0.28;
      p.castShadow = true;
      tulipHead.add(p);
    }

    const outerGeom = createCurvedPetalGeometry(1.35, 1.9, 0.72, 0.12);
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(outerGeom, tulipMat);
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 3;
      p.position.set(Math.cos(angle) * 0.38, 0.15, Math.sin(angle) * 0.38);
      p.rotation.y = -angle - Math.PI / 2;
      p.rotation.x = 0.42;
      p.castShadow = true;
      tulipHead.add(p);
    }

    // Tulip Pistil & Black-Golden Stamens
    const pistil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x224422, roughness: 0.4 })
    );
    pistil.position.y = 0.35;
    tulipHead.add(pistil);

    for (let i = 0; i < 6; i++) {
      const stamen = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 })
      );
      const a = (i / 6) * Math.PI * 2;
      stamen.position.set(Math.cos(a) * 0.12, 0.3, Math.sin(a) * 0.12);
      tulipHead.add(stamen);
    }

    tulipHead.position.y = 0.5;
    group.add(tulipHead);

    // Tulip has long elegant upright leaves
    const stemGroup = buildStemAndLeaves(2.8, 1);
    group.add(stemGroup);
    return group;
  }

  // ==========================================
  // Flower Model 3: Majestic Lily (ليليوم ولوتس)
  // ==========================================
  function buildLilyModel() {
    const group = new THREE.Group();
    const lilyHead = new THREE.Group();

    const lilyTexture = generatePetalTexture(theme.lilyBase, theme.lilyMid, theme.petalEdge, '#ffffff');
    const lilyMat = new THREE.MeshStandardMaterial({
      map: lilyTexture,
      roughness: 0.35,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.1
    });

    // 6 Star-shaped recurved reflexed petals curling back
    const petalGeom = createCurvedPetalGeometry(0.9, 2.1, 0.35, 0.75);

    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(petalGeom, lilyMat);
      const angle = (i / 6) * Math.PI * 2;
      const radius = (i % 2 === 0) ? 0.28 : 0.38;
      p.position.set(Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius);
      p.rotation.y = -angle - Math.PI / 2;
      p.rotation.x = 1.15; // wide star bloom
      p.castShadow = true;
      lilyHead.add(p);
    }

    // Long graceful stamens projecting forward with orange anthers
    for (let i = 0; i < 6; i++) {
      const stamen = new THREE.Group();
      const filament = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.02, 0.9, 6),
        new THREE.MeshStandardMaterial({ color: 0x88cc88 })
      );
      filament.position.y = 0.45;
      stamen.add(filament);

      // Anther (orange pollen tip)
      const anther = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.15, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xd95a14, roughness: 0.7 })
      );
      anther.position.y = 0.9;
      anther.rotation.z = Math.PI / 4;
      stamen.add(anther);

      const a = (i / 6) * Math.PI * 2;
      stamen.position.set(Math.cos(a) * 0.12, 0.2, Math.sin(a) * 0.12);
      stamen.rotation.x = 0.35;
      stamen.rotation.y = -a;
      lilyHead.add(stamen);
    }

    lilyHead.position.y = 0.45;
    group.add(lilyHead);
    group.add(buildStemAndLeaves(2.6, 2));
    return group;
  }

  // ==========================================
  // Flower Model 4: Wild Orchid (أوركيد ملكي)
  // ==========================================
  function buildOrchidModel() {
    const group = new THREE.Group();
    const orchidHead = new THREE.Group();

    const orchidTexture = generatePetalTexture('#5c1538', theme.petalEdge, '#f598b0', '#ffffff');
    const orchidMat = new THREE.MeshStandardMaterial({
      map: orchidTexture,
      roughness: 0.38,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.1
    });

    // 2 Large Lateral Wing Petals
    const wingGeom = createCurvedPetalGeometry(1.3, 1.4, 0.3, 0.2);
    const leftWing = new THREE.Mesh(wingGeom, orchidMat);
    leftWing.position.set(0.7, 0.35, 0);
    leftWing.rotation.set(0.2, -0.4, -0.3);
    orchidHead.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeom, orchidMat);
    rightWing.position.set(-0.7, 0.35, 0);
    rightWing.rotation.set(0.2, 0.4, 0.3);
    orchidHead.add(rightWing);

    // 1 Top Dorsal Sepal
    const topSepal = new THREE.Mesh(createCurvedPetalGeometry(0.8, 1.3, 0.2, -0.1), orchidMat);
    topSepal.position.set(0, 0.9, -0.1);
    topSepal.rotation.x = -0.2;
    orchidHead.add(topSepal);

    // 2 Lower Lateral Sepals
    const lowSepalGeom = createCurvedPetalGeometry(0.7, 1.2, 0.2, 0.1);
    const lowLeft = new THREE.Mesh(lowSepalGeom, orchidMat);
    lowLeft.position.set(0.4, -0.4, -0.05);
    lowLeft.rotation.set(0.4, 0.3, -0.8);
    orchidHead.add(lowLeft);

    const lowRight = new THREE.Mesh(lowSepalGeom, orchidMat);
    lowRight.position.set(-0.4, -0.4, -0.05);
    lowRight.rotation.set(0.4, -0.3, 0.8);
    orchidHead.add(lowRight);

    // Orchid Lip (Labellum) in the center
    const lipGeom = createCurvedPetalGeometry(0.8, 0.9, 0.65, -0.4);
    const lipMat = new THREE.MeshStandardMaterial({
      color: 0x990033,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    const lip = new THREE.Mesh(lipGeom, lipMat);
    lip.position.set(0, -0.1, 0.25);
    lip.rotation.x = 0.7;
    orchidHead.add(lip);

    // Golden Column in the center
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0xf5c065, metalness: 0.5 })
    );
    col.position.set(0, 0.15, 0.15);
    col.rotation.x = 0.5;
    orchidHead.add(col);

    orchidHead.position.y = 0.45;
    group.add(orchidHead);
    group.add(buildStemAndLeaves(2.6, 2));
    return group;
  }

  // --- Active Flower Switcher ---
  let activeFlowerIndex = 0;

  function loadFlower(flowerId) {
    // Clear previous model
    while (currentFlowerModelGroup.children.length > 0) {
      const obj = currentFlowerModelGroup.children[0];
      currentFlowerModelGroup.remove(obj);
    }

    let model;
    if (flowerId === 'tulip') model = buildTulipModel();
    else if (flowerId === 'lily') model = buildLilyModel();
    else if (flowerId === 'orchid') model = buildOrchidModel();
    else model = buildRoseModel();

    currentFlowerModelGroup.add(model);

    // Update floating petals to match
    initFloatingPetals();

    // Update UI badge
    updateFlowerBadge(flowerId);
  }

  // --- Floating Petals ---
  function initFloatingPetals() {
    while (petalParticleGroup.children.length > 0) {
      petalParticleGroup.remove(petalParticleGroup.children[0]);
    }
    floatingPetals = [];

    const smallPetalGeom = createCurvedPetalGeometry(0.32, 0.45, 0.12, 0.06);
    const particleMat = new THREE.MeshStandardMaterial({
      map: petalTexture,
      roughness: 0.45,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.1
    });

    for (let i = 0; i < 24; i++) {
      const pMesh = new THREE.Mesh(smallPetalGeom, particleMat);
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
  }

  // Pick flower on initial load (cycles automatically on every visit)
  let lastIdx = 0;
  try {
    const saved = localStorage.getItem(STORAGE_LAST_FLOWER);
    if (saved !== null) {
      lastIdx = (parseInt(saved, 10) + 1) % FLOWER_TYPES.length;
    } else {
      lastIdx = Math.floor(Math.random() * FLOWER_TYPES.length);
    }
    localStorage.setItem(STORAGE_LAST_FLOWER, lastIdx.toString());
  } catch (e) {
    lastIdx = 0;
  }
  activeFlowerIndex = lastIdx;
  loadFlower(FLOWER_TYPES[activeFlowerIndex].id);

  // --- Flower Switcher UI Badge ---
  function updateFlowerBadge(flowerId) {
    const badge = document.getElementById('flower-switcher-badge');
    const f = FLOWER_TYPES.find(x => x.id === flowerId) || FLOWER_TYPES[0];
    if (badge) {
      badge.innerHTML = `
        <span style="font-size:1.1rem;">${f.icon}</span>
        <span>وردة اليوم: <strong>${f.name}</strong></span>
        <span style="background:var(--primary); color:var(--primary-contrast); padding:2px 8px; border-radius:12px; font-size:0.72rem; margin-right:4px;">تبديل 🔀</span>
      `;
    }
  }

  // --- Interaction Tracking ---
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

  // Switch to next flower
  function nextFlower() {
    activeFlowerIndex = (activeFlowerIndex + 1) % FLOWER_TYPES.length;
    localStorage.setItem(STORAGE_LAST_FLOWER, activeFlowerIndex.toString());
    loadFlower(FLOWER_TYPES[activeFlowerIndex].id);
  }

  // Attach click to the switcher badge
  const switcherBadge = document.getElementById('flower-switcher-badge');
  if (switcherBadge) {
    switcherBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      nextFlower();
    });
  }

  // --- Theme Updater ---
  function updateTheme3D(newTheme) {
    if (!themes[newTheme]) return;
    theme = themes[newTheme];
    petalTexture.dispose();
    petalTexture = generatePetalTexture(theme.petalBase, theme.petalMid, theme.petalEdge, theme.petalRim);
    haloMat.color.setHex(theme.haloColor);
    ambientLight.color.setHex(theme.ambientColor);
    keyLight.color.setHex(theme.keyColor);
    rimLight.color.setHex(theme.rimColor);
    loadFlower(FLOWER_TYPES[activeFlowerIndex].id);
  }

  // --- Animation Loop ---
  let animId = null;
  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    flowerGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.05;
    flowerGroup.rotation.x += (targetRotX - flowerGroup.rotation.x) * 0.08;
    flowerGroup.rotation.y += (targetRotY - flowerGroup.rotation.y) * 0.08;
    flowerGroup.rotation.z += (targetTiltZ - flowerGroup.rotation.z) * 0.08;

    if (!isDragging) {
      targetRotY += 0.003;
    }
    halo.rotation.z += 0.006;

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
    nextFlower,
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
