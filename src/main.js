import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const app = document.querySelector('#app');

const state = {
  screen: 'welcome',
  workspace: null
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


// =====================================================
// بداية التطبيق
// =====================================================

function render() {
  if (state.screen === 'welcome') {
    renderWelcome();
  } else if (state.screen === 'sessions') {
    renderSessions();
  } else {
    renderWorkspace();
  }
}


// =====================================================
// شاشة الترحيب
// =====================================================

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


// =====================================================
// شاشة السيشنز
// =====================================================

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

        <div class="session-number">
          سيشن ${i + 1}
        </div>

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
          <div class="eyebrow">
            ROBOTICS & ELECTRONICS
          </div>

          <h1>اختر السيشن</h1>

          <p>
            ابدأ من السيشن الأول وتعلّم الأساسيات خطوة بخطوة.
          </p>
        </div>

        <div class="progress-pill">
          <span></span>
          1 / 8 مفتوح
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


// =====================================================
// مساحة العمل
// =====================================================

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
          <i></i>
          المحاكي يعمل
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
              <span class="tool-icon">
                ${tool.icon}
              </span>

              <span class="tool-name">
                ${tool.name}
              </span>

              <span class="tool-arrow">
                ‹
              </span>
            </button>
          `).join('')}

        </div>

        <div class="description-box" id="descriptionBox">

          <div class="desc-label">
            الوصف
          </div>

          <div class="desc-content">
            مرّر الماوس على أي أداة لمعرفة وظيفتها.
          </div>

        </div>

      </aside>

      <div class="scene-hint">
        <span>🖱️ دوران</span>
        <span>◉ تكبير</span>
        <span>⇧ تحريك</span>
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


// =====================================================
// إنشاء المشهد ثلاثي الأبعاد
// =====================================================

function setupWorkspace() {
  const container = document.querySelector('#canvas-wrap');

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x0b0f14);

  scene.fog = new THREE.Fog(
    0x0b0f14,
    20,
    55
  );


  // ---------------------------------------------------
  // الكاميرا
  // ---------------------------------------------------

  const camera = new THREE.PerspectiveCamera(
    50,
    innerWidth / innerHeight,
    0.1,
    200
  );

  camera.position.set(
    7,
    6,
    8
  );


  // ---------------------------------------------------
  // Renderer
  // ---------------------------------------------------

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

  container.appendChild(
    renderer.domElement
  );


  // ---------------------------------------------------
  // Orbit Controls
  // ---------------------------------------------------

  const controls = new OrbitControls(
    camera,
    renderer.domElement
  );

  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  controls.target.set(
    0,
    0.5,
    0
  );

  controls.minDistance = 2.5;
  controls.maxDistance = 25;

  controls.maxPolarAngle =
    Math.PI * 0.49;

  controls.enablePan = true;
  controls.screenSpacePanning = true;


  // ---------------------------------------------------
  // الأرضية
  // ---------------------------------------------------

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(
      60,
      60
    ),

    new THREE.MeshStandardMaterial({
      color: 0x111820,
      roughness: 0.92,
      metalness: 0.05
    })
  );

  ground.rotation.x =
    -Math.PI / 2;

  ground.receiveShadow = true;

  scene.add(ground);


  // ---------------------------------------------------
  // Grid
  // ---------------------------------------------------

  const grid = new THREE.GridHelper(
    60,
    60,
    0x34414c,
    0x1d2831
  );

  grid.position.y = 0.012;

  scene.add(grid);


  // ---------------------------------------------------
  // الإضاءة
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // منصة
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // السلك التجريبي
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // أدوات السحب من القائمة
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // استقبال الأداة داخل المشهد
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // تحريك المكونات
  // ---------------------------------------------------

  setupObjectDragging(
    renderer,
    camera,
    scene,
    controls
  );


  // ---------------------------------------------------
  // Animation
  // ---------------------------------------------------

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


    // سقوط السلك التجريبي
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


  // ---------------------------------------------------
  // Resize
  // ---------------------------------------------------

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
// إنشاء السلك التجريبي
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
// LED - الشكل الجديد
// =====================================================

function createLED() {

  const group =
    new THREE.Group();


  // ---------------------------------------------------
  // خامات
  // ---------------------------------------------------

  const metalMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xb8bdc1,
      metalness: 0.9,
      roughness: 0.22
    });


  const plasticMaterial =
    new THREE.MeshPhysicalMaterial({
      color: 0xff1d2e,
      roughness: 0.18,
      metalness: 0,
      transmission: 0.08,
      transparent: true,
      opacity: 0.92,
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
      emissive: 0x260006,
      emissiveIntensity: 0.35
    });


  const darkMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x25282b,
      roughness: 0.45,
      metalness: 0.25
    });


  // ---------------------------------------------------
  // جسم الـ LED السفلي
  // ---------------------------------------------------

  const body =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.18,
        0.18,
        0.18,
        32
      ),
      plasticMaterial
    );


  body.position.y = 0.34;

  body.castShadow = true;
  body.receiveShadow = true;

  group.add(body);


  // ---------------------------------------------------
  // قبة الـ LED
  // ---------------------------------------------------

  const dome =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.18,
        32,
        24,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      ),
      plasticMaterial
    );


  dome.position.y = 0.43;

  dome.castShadow = true;
  dome.receiveShadow = true;

  group.add(dome);


  // ---------------------------------------------------
  // حلقة صغيرة أسفل الجسم
  // ---------------------------------------------------

  const collar =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.185,
        0.185,
        0.055,
        32
      ),
      darkMaterial
    );


  collar.position.y = 0.245;

  collar.castShadow = true;

  group.add(collar);


  // ---------------------------------------------------
  // الرجل الطويلة - Anode
  // ---------------------------------------------------

  const longLeg =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.025,
        0.025,
        0.72,
        12
      ),
      metalMaterial
    );


  longLeg.position.set(
    -0.075,
    -0.05,
    0
  );


  longLeg.castShadow = true;

  group.add(longLeg);


  // ---------------------------------------------------
  // الرجل القصيرة - Cathode
  // ---------------------------------------------------

  const shortLeg =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.025,
        0.025,
        0.58,
        12
      ),
      metalMaterial
    );


  shortLeg.position.set(
    0.075,
    -0.12,
    0
  );


  shortLeg.castShadow = true;

  group.add(shortLeg);


  // ---------------------------------------------------
  // أطراف صغيرة في نهاية الأرجل
  // ---------------------------------------------------

  const longTip =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.028,
        0.028,
        0.08,
        12
      ),
      metalMaterial
    );


  longTip.position.set(
    -0.075,
    -0.45,
    0
  );


  longTip.castShadow = true;

  group.add(longTip);


  const shortTip =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.028,
        0.028,
        0.08,
        12
      ),
      metalMaterial
    );


  shortTip.position.set(
    0.075,
    -0.40,
    0
  );


  shortTip.castShadow = true;

  group.add(shortTip);


  // ---------------------------------------------------
  // البيانات الكهربائية
  // ---------------------------------------------------

  group.userData.pins = [
    {
      name: 'anode',
      type: 'positive',
      position: new THREE.Vector3(
        -0.075,
        -0.49,
        0
      )
    },

    {
      name: 'cathode',
      type: 'negative',
      position: new THREE.Vector3(
        0.075,
        -0.44,
        0
      )
    }
  ];


  group.userData.componentType =
    'led';


  group.userData.ledMaterial =
    plasticMaterial;


  return group;
}


// =====================================================
// المقاومة
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

  body.castShadow = true;

  group.add(body);


  // حلقات المقاومة
  const bandMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x8b4a2f,
      roughness: 0.5
    });


  for (
    const x of [-0.12, 0, 0.12]
  ) {

    const band =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.112,
          0.012,
          8,
          24
        ),
        bandMaterial
      );


    band.rotation.y =
      Math.PI / 2;

    band.position.x = x;

    group.add(band);

  }


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

    leg.castShadow = true;

    group.add(leg);

  }


  group.userData.pins = [
    {
      name: 'pin1',
      position: new THREE.Vector3(
        -0.9,
        0,
        0
      )
    },

    {
      name: 'pin2',
      position: new THREE.Vector3(
        0.9,
        0,
        0
      )
    }
  ];


  group.userData.componentType =
    'resistor';


  return group;
}


// =====================================================
// البطارية
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


  body.castShadow = true;

  group.add(body);


  // القطب الموجب
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

  positive.castShadow = true;

  group.add(positive);


  // القطب السالب
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


  group.userData.pins = [
    {
      name: 'positive',
      type: 'positive',
      position: new THREE.Vector3(
        0,
        0.45,
        0
      )
    },

    {
      name: 'negative',
      type: 'negative',
      position: new THREE.Vector3(
        0,
        -0.42,
        0
      )
    }
  ];


  group.userData.componentType =
    'battery';


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


  // ---------------------------------------------------
  // فتحات البريدبورد
  // ---------------------------------------------------

  const holeMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x252a2d,
      roughness: 0.5
    });


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


  // ---------------------------------------------------
  // خط التغذية الأحمر
  // ---------------------------------------------------

  const railMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xc84d55,
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


  // ---------------------------------------------------
  // خط التغذية الأزرق
  // ---------------------------------------------------

  const blueMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x4268b3,
      roughness: 0.5
    });


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


  group.userData.componentType =
    'breadboard';


  return group;
}


// =====================================================
// السلك الصغير
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


  wire.castShadow = true;

  group.add(wire);


  group.userData.componentType =
    'wire';


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


  // ---------------------------------------------------
  // بداية السحب
  // ---------------------------------------------------

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


      const draggableObjects = [];


      scene.traverse(
        object => {

          if (
            object.userData &&
            object.userData.draggable
          ) {

            draggableObjects.push(
              object
            );

          }

        }
      );


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


      // مستوى السحب
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


  // ---------------------------------------------------
  // أثناء السحب
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // انتهاء السحب
  // ---------------------------------------------------

  renderer.domElement.addEventListener(
    'pointerup',
    () => {

      if (!selected) return;


      selected = null;

      controls.enabled = true;

    }
  );
}


// =====================================================
// تشغيل البرنامج
// =====================================================

render();
