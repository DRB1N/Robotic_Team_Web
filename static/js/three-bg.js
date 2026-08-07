import * as THREE from 'three';

const canvas = document.getElementById('three-bg');
if (!canvas) throw new Error('No #three-bg canvas found');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 12);

// ── Lighting ────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0x111133, 1.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x00f0ff, 30, 30);
pointLight1.position.set(5, 3, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff00aa, 20, 25);
pointLight2.position.set(-5, -2, 3);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0x00ff88, 15, 20);
pointLight3.position.set(0, 5, -3);
scene.add(pointLight3);

// ── Main geometry: Wireframe Icosahedron ────────────────
const icoGeom = new THREE.IcosahedronGeometry(3.5, 1);
const icoMat = new THREE.MeshBasicMaterial({
  color: 0x00f0ff,
  wireframe: true,
  transparent: true,
  opacity: 0.12,
});
const ico = new THREE.Mesh(icoGeom, icoMat);
scene.add(ico);

// Outer ring
const ringGeom = new THREE.TorusGeometry(4.8, 0.03, 16, 100);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xff00aa,
  transparent: true,
  opacity: 0.3,
});
const ring = new THREE.Mesh(ringGeom, ringMat);
ring.rotation.x = Math.PI / 2;
scene.add(ring);

// Second ring
const ring2Geom = new THREE.TorusGeometry(5.5, 0.02, 16, 80);
const ring2Mat = new THREE.MeshBasicMaterial({
  color: 0x00ff88,
  transparent: true,
  opacity: 0.25,
});
const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
ring2.rotation.x = Math.PI / 3;
ring2.rotation.y = Math.PI / 4;
scene.add(ring2);

// ── Particles ───────────────────────────────────────────
const particlesCount = 600;
const particlesGeom = new THREE.BufferGeometry();
const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);

const palette = [
  new THREE.Color(0x00f0ff),
  new THREE.Color(0xff00aa),
  new THREE.Color(0x00ff88),
  new THREE.Color(0xffe600),
];

for (let i = 0; i < particlesCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const radius = 6 + Math.random() * 10;

  positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = radius * Math.cos(phi);

  const col = palette[Math.floor(Math.random() * palette.length)];
  colors[i * 3] = col.r;
  colors[i * 3 + 1] = col.g;
  colors[i * 3 + 2] = col.b;
}

particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMat = new THREE.PointsMaterial({
  size: 0.04,
  vertexColors: true,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const particles = new THREE.Points(particlesGeom, particlesMat);
scene.add(particles);

// ── Floating small geometries ───────────────────────────
const floaters = [];
const floaterGroup = new THREE.Group();
scene.add(floaterGroup);

for (let i = 0; i < 8; i++) {
  const size = 0.15 + Math.random() * 0.3;
  let geom;
  const rand = Math.random();
  if (rand < 0.33) {
    geom = new THREE.OctahedronGeometry(size);
  } else if (rand < 0.66) {
    geom = new THREE.TetrahedronGeometry(size);
  } else {
    geom = new THREE.BoxGeometry(size, size, size);
  }

  const mat = new THREE.MeshStandardMaterial({
    color: palette[Math.floor(Math.random() * palette.length)],
    emissive: palette[Math.floor(Math.random() * palette.length)],
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.8,
  });

  const mesh = new THREE.Mesh(geom, mat);

  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  const r = 4.5 + Math.random() * 3;
  mesh.position.set(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );

  mesh.userData = {
    orbitRadius: r,
    orbitSpeed: 0.1 + Math.random() * 0.3,
    orbitOffset: Math.random() * Math.PI * 2,
    wobbleAmp: 0.5 + Math.random(),
    wobbleSpeed: 0.3 + Math.random() * 0.7,
    rotSpeed: (Math.random() - 0.5) * 0.02,
  };

  floaterGroup.add(mesh);
  floaters.push(mesh);
}

// ── Animation ───────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  ico.rotation.x += 0.0015;
  ico.rotation.y += 0.002;
  ico.rotation.z += 0.0008;

  ring.rotation.z += 0.003;
  ring2.rotation.x += 0.002;
  ring2.rotation.y += 0.0015;

  particles.rotation.y += 0.0005;
  particles.rotation.x += 0.0003;
  particles.rotation.z += 0.0002;

  floaters.forEach((m) => {
    const { orbitRadius, orbitSpeed, orbitOffset, wobbleAmp, wobbleSpeed, rotSpeed } = m.userData;
    const angle = orbitOffset + t * orbitSpeed;
    m.position.x = orbitRadius * Math.cos(angle);
    m.position.z = orbitRadius * Math.sin(angle);
    m.position.y += Math.sin(t * wobbleSpeed) * wobbleAmp * 0.003;
    m.rotation.x += rotSpeed;
    m.rotation.y += rotSpeed * 1.5;
  });

  // Mouse parallax
  const mx = (pointerX - 0.5) * 0.8;
  const my = (pointerY - 0.5) * 0.8;
  camera.position.x += (mx - camera.position.x) * 0.02;
  camera.position.y += (-my - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

// ── Mouse tracking ──────────────────────────────────────
let pointerX = 0.5, pointerY = 0.5;
document.addEventListener('mousemove', (e) => {
  pointerX = e.clientX / window.innerWidth;
  pointerY = e.clientY / window.innerHeight;
});

// ── Resize ──────────────────────────────────────────────
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ── Theme-aware particle opacity ────────────────────────
const themeObserver = new MutationObserver(() => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  particlesMat.opacity = isLight ? 0.3 : 0.7;
  icoMat.opacity = isLight ? 0.05 : 0.12;
  ringMat.opacity = isLight ? 0.15 : 0.3;
  ring2Mat.opacity = isLight ? 0.12 : 0.25;
});
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

animate();
