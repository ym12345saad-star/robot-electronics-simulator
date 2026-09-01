import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const app = document.querySelector('#app');

const state = {
  screen: 'welcome',
  tool: null,
  workspace: null,
};

const tools = [
  { id: 'wire', icon: '〰', name: 'سلك', description: 'سلك كهربائي مرن يُستخدم لتوصيل نقاط الدائرة معًا.' },
  { id: 'battery', icon: '🔋', name: 'بطارية', description: 'مصدر للطاقة الكهربائية، وله قطب موجب وقطب سالب.' },
  { id: 'resistor', icon: '▱', name: 'مقاومة', description: 'تقلل وتتحكم في التيار الكهربائي داخل الدائرة.' },
  { id: 'led', icon: '💡', name: 'LED', description: 'صمام ثنائي باعث للضوء، يحتاج إلى توصيل صحيح ومقاومة مناسبة.' },
  { id: 'breadboard', icon: '▦', name: 'بريدبورد', description: 'لوحة تجارب تسمح بتركيب المكونات وتوصيلها بدون لحام.' },
];

function render() {
  if (state.screen === 'welcome') renderWelcome();
  else if (state.screen === 'sessions') renderSessions();
  else renderWorkspace();
}

function renderWelcome() {
  app.innerHTML = `
    <main class="welcome-screen">
      <div class="welcome-glow"></div>
      <section class="welcome-card">
        <div class="logo-mark">⚡</div>
        <div class="eyebrow">ROBOTICS & ELECTRONICS</div>
        <h1>أهلًا بيك في كورس<br><span>الروبوت والإلكترونيات</span></h1>
        <p>اتعلم، جرّب، وابني دوائرك الإلكترونية في بيئة ثلاثية الأبعاد.</p>
        <button class="primary-btn" id="startBtn">ابدأ <span>←</span></button>
      </section>
    </main>
  `;
  document.querySelector('#startBtn').onclick = () => {
    state.screen = 'sessions';
    render();
  };
}

function renderSessions() {
  const cards = Array.from({ length: 8 }, (_, i) => {
    const open = i === 0;
    return `
      <button class="session-card ${open ? 'open' : 'locked'}" data-session="${i + 1}" ${open ? '' : 'disabled'}>
        <div class="session-icon">${open ? '▶' : '🔒'}</div>
        <div class="session-number">سيشن ${i + 1}</div>
        <div class="session-state">${open ? 'متاح الآن' : 'مغلق'}</div>
      </button>
    `;
  }).join('');

  app.innerHTML = `
    <main class="sessions-screen">
      <header class="sessions-header">
        <div>
          <div class="eyebrow">ROBOTICS & ELECTRONICS</div>
          <h1>اختر السيشن</h1>
          <p>ابدأ من السيشن الأول وتعلّم الأساسيات خطوة بخطوة.</p>
        </div>
        <div class="progress-pill"><span></span> 1 / 8 مفتوح</div>
      </header>
      <section class="sessions-grid">${cards}</section>
    </main>
  `;

  document.querySelector('[data-session="1"]').onclick = () => {
    state.screen = 'workspace';
    render();
  };
}

function renderWorkspace() {
  app.innerHTML = `
    <main class="workspace">
      <div id="canvas-wrap"></div>

      <header class="topbar">
        <button class="back-btn" id="backBtn">→ <span>السيشنز</span></button>
        <div class="workspace-title">
          <strong>سيشن 1</strong>
          <span>البريدبورد الأساسي</span>
        </div>
        <div class="status-dot"><i></i> المحاكي يعمل</div>
      </header>

      <aside class="tool-panel">
        <div class="panel-title">
          <div>
            <small>TOOLS</small>
            <h2>الأدوات</h2>
          </div>
          <div class="tool-count">5</div>
        </div>

        <div class="tools-list">
          ${tools.map(t => `
            <button class="tool-item" data-tool="${t.id}" draggable="true">
              <span class="tool-icon">${t.icon}</span>
              <span class="tool-name">${t.name}</span>
              <span class="tool-arrow">‹</span>
            </button>
          `).join('')}
        </div>

        <div class="description-box" id="descriptionBox">
          <div class="desc-label">الوصف</div>
          <div class="desc-content">مرّر الماوس على أي أداة لمعرفة وظيفتها.</div>
        </div>
      </aside>

      <div class="scene-hint">
        <span>🖱️</span> دوران
        <span>◉</span> تكبير
        <span>⇧</span> تحريك
      </div>

      <div class="scene-badge">
        <span class="axis x">X</span>
        <span class="axis y">Y</span>
        <span class="axis z">Z</span>
      </div>

      <div class="drop-toast" id="dropToast">اسحب الأداة إلى المشهد</div>
    </main>
  `;

  document.querySelector('#backBtn').onclick = () => {
    state.screen = 'sessions';
    state.workspace = null;
    render();
  };

  setupWorkspace();
}

function setupWorkspace() {
  const container = document.querySelector('#canvas-wrap');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0f14);
  scene.fog = new THREE.Fog(0x0b0f14, 20, 55);

  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(7, 6, 8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0.5, 0);
  controls.minDistance = 2.5;
  controls.maxDistance = 25;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.enablePan = true;
  controls.screenSpacePanning = true;

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x111820, roughness: 0.92, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(60, 60, 0x34414c, 0x1d2831);
  grid.position.y = 0.012;
  scene.add(grid);

  // Lighting
  scene.add(new THREE.HemisphereLight(0xc9e7ff, 0x182028, 2.0));

  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(7, 12, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -12;
  scene.add(key);

  const fill = new THREE.PointLight(0x79a8ff, 22, 25);
  fill.position.set(-7, 5, -4);
  scene.add(fill);

  // Small origin marker / reference object
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.18, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x1a242d, roughness: 0.65 })
  );
  base.position.y = 0.09;
  base.castShadow = true;
  base.receiveShadow = true;
  scene.add(base);

  // Demo wire: intentionally simple now; it will be replaced by a real flexible asset.
  const wire = createDemoWire();
  wire.position.set(0, 1.35, 0);
  wire.userData.type = 'wire';
  scene.add(wire);

  // Two electrical endpoints for the future snap system.
  const endpointA = createEndpoint();
  const endpointB = createEndpoint();
  endpointA.position.set(-0.62, 1.35, 0);
  endpointB.position.set(0.62, 1.35, 0);
  scene.add(endpointA, endpointB);

  // Drag/drop from UI.
  document.querySelectorAll('.tool-item').forEach(btn => {
    const id = btn.dataset.tool;
    const tool = tools.find(t => t.id === id);

    btn.addEventListener('mouseenter', () => {
      document.querySelector('.desc-content').textContent = tool.description;
    });
    btn.addEventListener('mouseleave', () => {
      document.querySelector('.desc-content').textContent = 'مرّر الماوس على أي أداة لمعرفة وظيفتها.';
    });

    btn.addEventListener('dragstart', e => {
      e.dataTransfer.setData('application/x-tool', id);
      document.querySelector('#dropToast').classList.add('show');
    });
    btn.addEventListener('dragend', () => {
      document.querySelector('#dropToast').classList.remove('show');
    });
  });

  renderer.domElement.addEventListener('dragover', e => e.preventDefault());
  renderer.domElement.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('application/x-tool');
    if (!id) return;
    spawnPlaceholderTool(id, e.clientX, e.clientY, scene, camera);
    document.querySelector('#dropToast').classList.remove('show');
  });

  // Basic raycasting so the demo wire can be selected.
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selected = null;

  renderer.domElement.addEventListener('pointerdown', e => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([wire], true);
    if (hits.length) {
      selected = wire;
      selected.traverse(o => {
        if (o.material?.emissive) o.material.emissive.setHex(0x173e54);
      });
    }
  });

  renderer.domElement.addEventListener('pointerup', () => {
    if (selected) {
      selected.traverse(o => {
        if (o.material?.emissive) o.material.emissive.setHex(0x000000);
      });
      selected = null;
    }
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.033);

    // Tiny demo gravity: the wire settles onto the ground.
    if (!wire.userData.settled) {
      wire.userData.velocityY = (wire.userData.velocityY ?? 0) - 8.0 * dt;
      wire.position.y += wire.userData.velocityY * dt;
      if (wire.position.y <= 0.35) {
        wire.position.y = 0.35;
        wire.userData.velocityY = 0;
        wire.userData.settled = true;
      }
      endpointA.position.y = wire.position.y;
      endpointB.position.y = wire.position.y;
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  state.workspace = { scene, camera, renderer, controls };
}

function createDemoWire() {
  const group = new THREE.Group();

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.7, 0, 0),
    new THREE.Vector3(-0.3, 0.22, 0),
    new THREE.Vector3(0.15, -0.02, 0),
    new THREE.Vector3(0.7, 0.12, 0),
  ]);

  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 32, 0.055, 10, false),
    new THREE.MeshStandardMaterial({ color: 0x15191d, roughness: 0.5, metalness: 0.35 })
  );
  tube.castShadow = true;
  group.add(tube);

  const metal = new THREE.MeshStandardMaterial({ color: 0x9aa4aa, roughness: 0.3, metalness: 0.9 });
  for (const x of [-0.7, 0.7]) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.28, 12), metal);
    pin.rotation.z = Math.PI / 2;
    pin.position.x = x;
    pin.castShadow = true;
    group.add(pin);
  }
  return group;
}

function createEndpoint() {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x5bd6ff })
  );
  mesh.userData.electricalNode = true;
  return mesh;
}

function spawnPlaceholderTool(id, x, y, scene, camera) {
  const tool = tools.find(t => t.id === id);
  const ndc = new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, camera);
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.55);
  const point = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, point);

  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.35, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x2b3741, roughness: 0.7 })
  );
  body.castShadow = true;
  group.add(body);

  group.position.copy(point);
  group.userData.tool = id;
  scene.add(group);

  // We intentionally show a neutral placeholder for components until real GLB assets are supplied.
  console.info(`Placed ${tool.name}. Replace placeholder with ${id}.glb later.`);
}

render();
