import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const app = document.querySelector('#app');

const state = {
  screen: 'welcome',
  workspace: null,
};

const tools = [
  {
    id: 'wire',
    icon: '〰',
    name: 'سلك',
    description: 'سلك كهربائي مرن يُستخدم لتوصيل نقاط الدائرة معًا.'
  },
  {
    id: 'battery',
    icon: '🔋',
    name: 'بطارية',
    description: 'مصدر للطاقة الكهربائية، وله قطب موجب وقطب سالب.'
  },
  {
    id: 'resistor',
    icon: '▱',
    name: 'مقاومة',
    description: 'تقلل وتتحكم في التيار الكهربائي داخل الدائرة.'
  },
  {
    id: 'led',
    icon: '💡',
    name: 'LED',
    description: 'صمام ثنائي باعث للضوء، يحتاج إلى توصيل صحيح ومقاومة مناسبة.'
  },
  {
    id: 'breadboard',
    icon: '▦',
    name: 'بريدبورد',
    description: 'لوحة تجارب تسمح بتركيب المكونات وتوصيلها بدون لحام.'
  }
];

function render() {
  if (state.screen === 'welcome') {
    renderWelcome();
  } else if (state.screen === 'sessions') {
    renderSessions();
  } else {
    renderWorkspace();
  }
}

function renderWelcome() {
  app.innerHTML = `
    <main class="welcome-screen">
      <div class="welcome-glow"></div>

      <section class="welcome-card">
        <div class="logo-mark">⚡</div>

        <div class="eyebrow">ROBOTICS & ELECTRONICS</div>

        <h1>
          أهلًا بيك في كورس<br>
          <span>الروبوت والإلكترونيات</span>
        </h1>

        <p>
          اتعلم، جرّب، وابني دوائرك الإلكترونية في بيئة ثلاثية الأبعاد.
        </p>

        <button class="primary-btn" id="startBtn">
          ابدأ <span>←</span>
        </button>
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
      <button
        class="session-card ${open ? 'open' : 'locked'}"
        data-session="${i + 1}"
        ${open ? '' : 'disabled'}
      >
        <div class="session-icon">${open ? '▶' : '🔒'}</div>
        <div class="session-number">سيشن ${i + 1}</div>
        <div class="session-state">
          ${open ? 'متاح الآن' : 'مغلق'}
        </div>
      </button>
    `;
  }).join('');

  app.innerHTML = `
    <main class="sessions-screen">

      <header class="sessions-header">
        <div>
          <div class="eyebrow">ROBOTICS & ELECTRONICS</div>
          <h1>اختر السيشن</h1>
          <p>
            ابدأ من السيشن الأول وتعلّم الأساسيات خطوة بخطوة.
          </p>
        </div>

        <div class="progress-pill">
          <span></span> 1 / 8 مفتوح
        </div>
      </header>

      <section class="sessions-grid">
        ${cards}
      </section>

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

        <button class="back-btn" id="backBtn">
          → <span>السيشنز</span>
        </button>

        <div class="workspace-title">
          <strong>سيشن 1</strong>
          <span>البريدبورد الأساسي</span>
        </div>

        <div class="status-dot">
          <i></i> المحاكي يعمل
        </div>

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
          ${tools.map(tool => `
            <button
              class="tool-item"
              data-tool="${tool.id}"
              draggable="true"
            >
              <span class="tool-icon">${tool.icon}</span>
              <span class="tool-name">${tool.name}</span>
              <span class="tool-arrow">‹</span>
            </button>
          `).join('')}
        </div>

        <div class="description-box" id="descriptionBox">
          <div class="desc-label">الوصف</div>
          <div class="desc-content">
            مرّر الماوس على أي أداة لمعرفة وظيفتها.
          </div>
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

      <div class="drop-toast" id="dropToast">
        اسحب الأداة إلى المشهد
      </div>

    </main>
  `;

  document.querySelector('#backBtn').onclick = () => {
    state.screen = 'sessions';
    render();
  };

  setupWorkspace();
}

function setupWorkspace() {
  const container = document.querySelector('#canvas-wrap');

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x0b0f14);

  scene.fog = new THREE.Fog(
    0x0b0f14,
    20,
    55
  );

  const camera = new THREE.PerspectiveCamera(
    50,
    innerWidth / innerHeight,
    0.1,
    200
  );

  camera.position.set(7, 6, 8);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(
    Math.min(devicePixelRatio, 2)
  );

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(
    camera,
    renderer.domElement
  );

  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  controls.target.set(0, 0.5, 0);

  controls.minDistance = 2.5;
  controls.maxDistance = 25;

  controls.maxPolarAngle =
    Math.PI * 0.49;

  controls.enablePan = true;
  controls.screenSpacePanning = true;

  // =========================
  // الأرضية
  // =========================

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({
      color: 0x111820,
      roughness: 0.92,
      metalness: 0.05
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  scene.add(ground);

  const grid = new THREE.GridHelper(
    60,
    60,
    0x34414c,
    0x1d2831
  );

  grid.position.y = 0.012;

  scene.add(grid);

  // =========================
  // الإضاءة
  // =========================

  scene.add(
    new THREE.HemisphereLight(
      0xc9e7ff,
      0x182028,
      2
    )
  );

  const keyLight =
    new THREE.DirectionalLight(
      0xffffff,
      3.2
    );

  keyLight.position.set(
    7,
    12,
    5
  );

  keyLight.castShadow = true;

  keyLight.shadow.mapSize.set(
    2048,
    2048
  );

  scene.add(keyLight);

  const fillLight =
    new THREE.PointLight(
      0x79a8ff,
      22,
      25
    );

  fillLight.position.set(
    -7,
    5,
    -4
  );

  scene.add(fillLight);

  // =========================
  // منصة بسيطة
  // =========================

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.4,
      0.18,
      1.4
    ),
    new THREE.MeshStandardMaterial({
      color: 0x1a242d,
      roughness: 0.65
    })
  );

  base.position.y = 0.09;
  base.castShadow = true;
  base.receiveShadow = true;

  scene.add(base);

  // =========================
  // السلك التجريبي
  // =========================

  const wire = createDemoWire();

  wire.position.set(
    0,
    1.35,
    0
  );

  wire.userData.type = 'wire';

  scene.add(wire);

  const endpointA =
    createEndpoint();

  const endpointB =
    createEndpoint();

  endpointA.position.set(
    -0.62,
    1.35,
    0
  );

  endpointB.position.set(
    0.62,
    1.35,
    0
  );

  scene.add(
    endpointA,
    endpointB
  );

  // =========================
  // أدوات السحب
  // =========================

  document
    .querySelectorAll('.tool-item')
    .forEach(button => {

      const id =
        button.dataset.tool;

      const tool =
        tools.find(
          item => item.id === id
        );

      button.addEventListener(
        'mouseenter',
        () => {
          document.querySelector(
            '.desc-content'
          ).textContent =
            tool.description;
        }
      );

      button.addEventListener(
        'mouseleave',
        () => {
          document.querySelector(
            '.desc-content'
          ).textContent =
            'مرّر الماوس على أي أداة لمعرفة وظيفتها.';
        }
      );

      button.addEventListener(
        'dragstart',
        event => {

          event.dataTransfer.setData(
            'application/x-tool',
            id
          );

          document
            .querySelector('#dropToast')
            .classList.add('show');
        }
      );

      button.addEventListener(
        'dragend',
        () => {
          document
            .querySelector('#dropToast')
            .classList.remove('show');
        }
      );
    });

  renderer.domElement.addEventListener(
    'dragover',
    event => {
      event.preventDefault();
    }
  );

  renderer.domElement.addEventListener(
    'drop',
    event => {

      event.preventDefault();

      const id =
        event.dataTransfer.getData(
          'application/x-tool'
        );

      if (!id) return;

      spawnComponent(
        id,
        event.clientX,
        event.clientY,
        scene,
        camera
      );

      document
        .querySelector('#dropToast')
        .classList.remove('show');
    }
  );

  // =========================
  // تحريك المكونات
  // =========================

  setupObjectDragging(
    renderer,
    camera,
    scene,
    controls
  );

  // =========================
  // الأنيميشن
  // =========================

  const clock =
    new THREE.Clock();

  function animate() {

    requestAnimationFrame(
      animate
    );

    const dt =
      Math.min(
        clock.getDelta(),
        0.033
      );

    if (!wire.userData.settled) {

      wire.userData.velocityY =
        (wire.userData.velocityY || 0)
        - 8 * dt;

      wire.position.y +=
        wire.userData.velocityY * dt;

      if (
        wire.position.y <= 0.35
      ) {

        wire.position.y = 0.35;

        wire.userData.velocityY = 0;

        wire.userData.settled = true;
      }

      endpointA.position.y =
        wire.position.y;

      endpointB.position.y =
        wire.position.y;
    }

    controls.update();

    renderer.render(
      scene,
      camera
    );
  }

  animate();

  window.addEventListener(
    'resize',
    () => {

      camera.aspect =
        innerWidth / innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        innerWidth,
        innerHeight
      );
    }
  );

  state.workspace = {
    scene,
    camera,
    renderer,
    controls
  };
}

// =====================================================
// إنشاء سلك
// =====================================================

function createDemoWire() {

  const group =
    new THREE.Group();

  const curve =
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(
        -0.7,
        0,
        0
      ),
      new THREE.Vector3(
        -0.3,
        0.22,
        0
      ),
      new THREE.Vector3(
        0.15,
        -0.02,
        0
      ),
      new THREE.Vector3(
        0.7,
        0.12,
        0
      )
    ]);

  const tube =
    new THREE.Mesh(
      new THREE.TubeGeometry(
        curve,
        32,
        0.055,
        10,
        false
      ),
      new THREE.MeshStandardMaterial({
        color: 0x15191d,
        roughness: 0.5,
        metalness: 0.35
      })
    );

  tube.castShadow = true;

  group.add(tube);

  const metal =
    new THREE.MeshStandardMaterial({
      color: 0x9aa4aa,
      roughness: 0.3,
      metalness: 0.9
    });

  for (
    const x of [-0.7, 0.7]
  ) {

    const pin =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.045,
          0.045,
          0.28,
          12
        ),
        metal
      );

    pin.rotation.z =
      Math.PI / 2;

    pin.position.x = x;

    pin.castShadow = true;

    group.add(pin);
  }

  return group;
}

// =====================================================
// نقطة كهربائية
// =====================================================

function createEndpoint() {

  const mesh =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.085,
        16,
        16
      ),
      new THREE.MeshBasicMaterial({
        color: 0x5bd6ff
      })
    );

  mesh.userData.electricalNode =
    true;

  return mesh;
}

// =====================================================
// إنشاء المكونات
// =====================================================

function spawnComponent(
  id,
  screenX,
  screenY,
  scene,
  camera
) {

  const ndc =
    new THREE.Vector2(
      (screenX / innerWidth) * 2 - 1,
      -(screenY / innerHeight) * 2 + 1
    );

  const raycaster =
    new THREE.Raycaster();

  raycaster.setFromCamera(
    ndc,
    camera
  );

  const plane =
    new THREE.Plane(
      new THREE.Vector3(
        0,
        1,
        0
      ),
      -0.45
    );

  const point =
    new THREE.Vector3();

  raycaster.ray.intersectPlane(
    plane,
    point
  );

  let object;

  if (id === 'led') {
    object = createLED();
  }

  else if (id === 'resistor') {
    object = createResistor();
  }

  else if (id === 'battery') {
    object = createBattery();
  }

  else if (id === 'breadboard') {
    object = createBreadboard();
  }

  else if (id === 'wire') {
    object = createSmallWire();
  }

  if (!object) return;

  object.position.copy(point);

  object.userData.draggable = true;
  object.userData.tool = id;

  scene.add(object);
}

// =====================================================
// LED حقيقي الشكل
// =====================================================

function createLED() {

  const group =
    new THREE.Group();

  const metalMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x9da3a8,
      metalness: 0.9,
      roughness: 0.25
    });

  const redMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xff1e32,
      emissive: 0x3d0005,
      emissiveIntensity: 0.8,
      roughness: 0.25,
      metalness: 0.05
    });

  const body =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.14,
        0.14,
        0.20,
        24
      ),
      redMaterial
    );

  body.rotation.z =
    Math.PI / 2;

  body.position.x = 0;

  group.add(body);

  const dome =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.14,
        24,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      ),
      redMaterial
    );

  dome.rotation.z =
    -Math.PI / 2;

  dome.position.x =
    0.10;

  group.add(dome);

  for (
    const side of [-1, 1]
  ) {

    const leg =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.018,
          0.018,
          0.55,
          10
        ),
        metalMaterial
      );

    leg.rotation.z =
      Math.PI / 2;

    leg.position.x =
      side * 0.32;

    group.add(leg);
  }

  group.rotation.z =
    Math.PI / 2;

  return group;
}

// =====================================================
// مقاومة
// =====================================================

function createResistor() {

  const group =
    new THREE.Group();

  const bodyMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd6c49a,
      roughness: 0.55
    });

  const metal =
    new THREE.MeshStandardMaterial({
      color: 0xaeb5b9,
      metalness: 0.9,
      roughness: 0.25
    });

  const body =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.11,
        0.11,
        0.42,
        20
      ),
      bodyMaterial
    );

  body.rotation.z =
    Math.PI / 2;

  group.add(body);

  for (
    const x of [-0.55, 0.55]
  ) {

    const leg =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.018,
          0.018,
          0.7,
          10
        ),
        metal
      );

    leg.rotation.z =
      Math.PI / 2;

    leg.position.x = x;

    group.add(leg);
  }

  return group;
}

// =====================================================
// بطارية
// =====================================================

function createBattery() {

  const group =
    new THREE.Group();

  const body =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.30,
        0.30,
        0.75,
        32
      ),
      new THREE.MeshStandardMaterial({
        color: 0x20252b,
        metalness: 0.25,
        roughness: 0.45
      })
    );

  group.add(body);

  const positive =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.13,
        0.13,
        0.08,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: 0xc9cdd1,
        metalness: 0.9,
        roughness: 0.2
      })
    );

  positive.position.y =
    0.41;

  group.add(positive);

  const negative =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.25,
        0.25,
        0.04,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: 0x777e83,
        metalness: 0.8,
        roughness: 0.3
      })
    );

  negative.position.y =
    -0.395;

  group.add(negative);

  return group;
}

// =====================================================
// Breadboard
// =====================================================

function createBreadboard() {

  const group =
    new THREE.Group();

  const board =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.8,
        0.22,
        2.0
      ),
      new THREE.MeshStandardMaterial({
        color: 0xe8e7df,
        roughness: 0.8
      })
    );

  board.castShadow = true;
  board.receiveShadow = true;

  group.add(board);

  const holeMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x252a2d,
      roughness: 0.5
    });

  // فتحات تجريبية
  for (
    let x = -1.45;
    x <= 1.45;
    x += 0.16
  ) {

    for (
      let z = -0.72;
      z <= 0.72;
      z += 0.16
    ) {

      const hole =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.025,
            0.025,
            0.025,
            10
          ),
          holeMaterial
        );

      hole.rotation.x =
        Math.PI / 2;

      hole.position.set(
        x,
        0.125,
        z
      );

      group.add(hole);
    }
  }

  // خطوط التغذية
  const railMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xc84d55,
      roughness: 0.5
    });

  const blueMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x4268b3,
      roughness: 0.5
    });

  const redRail =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.3,
        0.025,
        0.035
      ),
      railMaterial
    );

  redRail.position.set(
    0,
    0.13,
    0.86
  );

  group.add(redRail);

  const blueRail =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.3,
        0.025,
        0.035
      ),
      blueMaterial
    );

  blueRail.position.set(
    0,
    0.13,
    -0.86
  );

  group.add(blueRail);

  return group;
}

// =====================================================
// سلك صغير
// =====================================================

function createSmallWire() {

  const group =
    new THREE.Group();

  const curve =
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(
        -0.8,
        0,
        0
      ),
      new THREE.Vector3(
        -0.3,
        0.3,
        0
      ),
      new THREE.Vector3(
        0.3,
        -0.1,
        0
      ),
      new THREE.Vector3(
        0.8,
        0,
        0
      )
    ]);

  const wire =
    new THREE.Mesh(
      new THREE.TubeGeometry(
        curve,
        24,
        0.045,
        8,
        false
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd52c35,
        roughness: 0.5,
        metalness: 0.1
      })
    );

  group.add(wire);

  return group;
}

// =====================================================
// تحريك العناصر
// =====================================================

function setupObjectDragging(
  renderer,
  camera,
  scene,
  controls
) {

  const raycaster =
    new THREE.Raycaster();

  const mouse =
    new THREE.Vector2();

  const plane =
    new THREE.Plane();

  const intersection =
    new THREE.Vector3();

  const offset =
    new THREE.Vector3();

  let selected = null;

  renderer.domElement.addEventListener(
    'pointerdown',
    event => {

      mouse.x =
        (event.clientX / innerWidth) * 2 - 1;

      mouse.y =
        -(event.clientY / innerHeight) * 2 + 1;

      raycaster.setFromCamera(
        mouse,
        camera
      );

      const draggableObjects =
        [];

      scene.traverse(object => {

        if (
          object.userData &&
          object.userData.draggable
        ) {
          draggableObjects.push(
            object
          );
        }
      });

      const hits =
        raycaster.intersectObjects(
          draggableObjects,
          true
        );

      if (!hits.length) return;

      let object =
        hits[0].object;

      while (
        object.parent &&
        !object.userData.draggable
      ) {
        object =
          object.parent;
      }

      selected = object;

      controls.enabled = false;

      plane.set(
        new THREE.Vector3(
          0,
          1,
          0
        ),
        -selected.position.y
      );

      raycaster.ray.intersectPlane(
        plane,
        intersection
      );

      offset.subVectors(
        selected.position,
        intersection
      );
    }
  );

  renderer.domElement.addEventListener(
    'pointermove',
    event => {

      if (!selected) return;

      mouse.x =
        (event.clientX / innerWidth) * 2 - 1;

      mouse.y =
        -(event.clientY / innerHeight) * 2 + 1;

      raycaster.setFromCamera(
        mouse,
        camera
      );

      if (
        raycaster.ray.intersectPlane(
          plane,
          intersection
        )
      ) {

        selected.position.copy(
          intersection
        );

        selected.position.add(
          offset
        );
      }
    }
  );

  renderer.domElement.addEventListener(
    'pointerup',
    () => {

      if (!selected) return;

      selected = null;

      controls.enabled = true;
    }
  );
}

render();
