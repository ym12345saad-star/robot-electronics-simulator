import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import './style.css'

// ============================================================
// ROBOT & ELECTRONICS SIMULATOR
// Session 1 - Interactive 3D Workspace
// ============================================================

const app = document.querySelector('#app')

// ------------------------------------------------------------
// Application State
// ------------------------------------------------------------

const state = {
  screen: 'welcome',
  selectedTool: null,
  selectedObject: null,
  components: [],
}

// ------------------------------------------------------------
// Tools
// ------------------------------------------------------------

const tools = [
  {
    id: 'wire',
    icon: '〰',
    name: 'سلك',
    description: 'سلك كهربائي قابل للتحريك والتوصيل من الطرفين.',
  },
  {
    id: 'battery',
    icon: '🔋',
    name: 'بطارية',
    description: 'مصدر جهد كهربائي لتغذية الدائرة.',
  },
  {
    id: 'resistor',
    icon: '▱',
    name: 'مقاومة',
    description: 'تستخدم لتقليل التيار وحماية المكونات.',
  },
  {
    id: 'led',
    icon: '💡',
    name: 'LED',
    description: 'صمام ضوئي يصدر الضوء عند مرور التيار في الاتجاه الصحيح.',
  },
  {
    id: 'breadboard',
    icon: '▦',
    name: 'Breadboard',
    description: 'لوحة تجارب لتوصيل المكونات الإلكترونية بدون لحام.',
  },
]

// ------------------------------------------------------------
// HTML Screens
// ------------------------------------------------------------

function renderWelcome() {
  app.innerHTML = `
    <main class="welcome-screen">
      <div class="welcome-card">
        <div class="welcome-badge">ROBOT & ELECTRONICS</div>

        <h1>أهلًا بيك في كورس<br>الروبوت والإلكترونيات</h1>

        <p>
          تعلّم الإلكترونيات والروبوتات بطريقة تفاعلية
          داخل بيئة ثلاثية الأبعاد.
        </p>

        <button id="startButton" class="primary-button">
          ابدأ 🚀
        </button>
      </div>
    </main>
  `

  document
    .querySelector('#startButton')
    .addEventListener('click', () => {
      state.screen = 'sessions'
      render()
    })
}

function renderSessions() {
  app.innerHTML = `
    <main class="sessions-screen">
      <header class="page-header">
        <div>
          <div class="welcome-badge">ROBOT & ELECTRONICS</div>
          <h1>الجلسات التعليمية</h1>
          <p>ابدأ من الجلسة الأولى وتعلم خطوة بخطوة.</p>
        </div>
      </header>

      <section class="sessions-grid">
        ${Array.from({ length: 8 }, (_, index) => {
          const number = index + 1
          const unlocked = number === 1

          return `
            <button
              class="session-card ${unlocked ? 'unlocked' : 'locked'}"
              data-session="${number}"
              ${unlocked ? '' : 'disabled'}
            >
              <div class="session-number">${number}</div>

              <div class="session-content">
                <h2>
                  ${number === 1 ? 'البريدبورد الأساسي' : `Session ${number}`}
                </h2>

                <p>
                  ${
                    number === 1
                      ? 'تعرف على بيئة المحاكاة والمكونات الأساسية.'
                      : 'هذه الجلسة مقفولة حاليًا.'
                  }
                </p>
              </div>

              <div class="session-status">
                ${unlocked ? 'ابدأ ←' : '🔒'}
              </div>
            </button>
          `
        }).join('')}
      </section>
    </main>
  `

  document
    .querySelector('[data-session="1"]')
    .addEventListener('click', () => {
      state.screen = 'workspace'
      render()
    })
}

function renderWorkspace() {
  app.innerHTML = `
    <main class="workspace">
      <div class="workspace-topbar">
        <div>
          <strong>Session 1</strong>
          <span>البريدبورد الأساسي</span>
        </div>

        <button id="backButton" class="secondary-button">
          ← الجلسات
        </button>
      </div>

      <aside class="tools-panel">
        <div class="panel-title">
          <span>الأدوات</span>
          <small>اسحب وضع في المشهد</small>
        </div>

        <div id="toolsList" class="tools-list">
          ${tools
            .map(
              (tool) => `
                <button
                  class="tool-item"
                  draggable="true"
                  data-tool="${tool.id}"
                >
                  <span class="tool-icon">${tool.icon}</span>

                  <span class="tool-text">
                    <strong>${tool.name}</strong>
                    <small>${tool.description}</small>
                  </span>
                </button>
              `,
            )
            .join('')}
        </div>
      </aside>

      <div id="descriptionBox" class="description-box">
        اختر أداة من القائمة لعرض معلومات عنها.
      </div>

      <div id="scene" class="scene"></div>

      <div class="scene-help">
        <div>🖱️ اسحب المكونات لتحريكها</div>
        <div>🖱️ اسحب بالزر الأيسر لتحريك الكاميرا</div>
        <div>⚙️ عجلة الماوس للتكبير والتصغير</div>
      </div>

      <div class="axis-badges">
        <span class="axis-x">X</span>
        <span class="axis-y">Y</span>
        <span class="axis-z">Z</span>
      </div>
    </main>
  `

  document
    .querySelector('#backButton')
    .addEventListener('click', () => {
      state.screen = 'sessions'
      disposeScene()
      render()
    })

  setupToolUI()
  setupThreeScene()
}

// ------------------------------------------------------------
// Tool UI
// ------------------------------------------------------------

function setupToolUI() {
  const descriptionBox = document.querySelector('#descriptionBox')

  document.querySelectorAll('.tool-item').forEach((button) => {
    const toolId = button.dataset.tool
    const tool = tools.find((item) => item.id === toolId)

    button.addEventListener('mouseenter', () => {
      descriptionBox.textContent = tool.description
    })

    button.addEventListener('mouseleave', () => {
      descriptionBox.textContent =
        'اسحب أداة من القائمة وأسقطها داخل المشهد.'
    })

    button.addEventListener('click', () => {
      state.selectedTool = toolId

      document
        .querySelectorAll('.tool-item')
        .forEach((item) => item.classList.remove('active'))

      button.classList.add('active')

      descriptionBox.textContent =
        `الأداة المحددة: ${tool.name}. اسحبها إلى المشهد.`
    })

    button.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('tool-id', toolId)
      event.dataTransfer.effectAllowed = 'copy'
    })
  })
}

// ------------------------------------------------------------
// Three.js Variables
// ------------------------------------------------------------

let scene = null
let camera = null
let renderer = null
let controls = null
let animationFrame = null

let raycaster = null
let pointer = null
let groundPlane = null

let draggedObject = null
let dragOffset = new THREE.Vector3()
let dragStartPoint = new THREE.Vector3()

// ------------------------------------------------------------
// Setup Three.js
// ------------------------------------------------------------

function setupThreeScene() {
  const container = document.querySelector('#scene')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x07111f)

  scene.fog = new THREE.Fog(0x07111f, 15, 45)

  camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  )

  camera.position.set(8, 7, 9)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  renderer.setSize(
    container.clientWidth,
    container.clientHeight,
  )

  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)

  controls.enableDamping = true
  controls.dampingFactor = 0.08

  controls.minDistance = 3
  controls.maxDistance = 25

  controls.target.set(0, 0, 0)

  // ----------------------------------------------------------
  // Lights
  // ----------------------------------------------------------

  const hemisphereLight = new THREE.HemisphereLight(
    0xffffff,
    0x172033,
    2,
  )

  scene.add(hemisphereLight)

  const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    3,
  )

  directionalLight.position.set(6, 10, 5)

  directionalLight.castShadow = true

  directionalLight.shadow.mapSize.set(2048, 2048)

  scene.add(directionalLight)

  const pointLight = new THREE.PointLight(
    0x66ccff,
    25,
    15,
  )

  pointLight.position.set(-4, 5, 2)

  scene.add(pointLight)

  // ----------------------------------------------------------
  // Ground
  // ----------------------------------------------------------

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x111c2d,
    roughness: 0.8,
    metalness: 0.05,
  })

  groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    groundMaterial,
  )

  groundPlane.rotation.x = -Math.PI / 2
  groundPlane.receiveShadow = true

  scene.add(groundPlane)

  // ----------------------------------------------------------
  // Grid
  // ----------------------------------------------------------

  const grid = new THREE.GridHelper(
    40,
    40,
    0x3b506d,
    0x1b2a3e,
  )

  grid.position.y = 0.01

  scene.add(grid)

  // ----------------------------------------------------------
  // Center platform
  // ----------------------------------------------------------

  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.3, 8),
    new THREE.MeshStandardMaterial({
      color: 0x16243a,
      roughness: 0.65,
      metalness: 0.1,
    }),
  )

  platform.position.y = -0.15

  platform.receiveShadow = true

  scene.add(platform)

  // ----------------------------------------------------------
  // Raycasting
  // ----------------------------------------------------------

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  setupSceneInteraction(container)

  window.addEventListener('resize', resizeRenderer)

  animate()
}

// ------------------------------------------------------------
// Create Components
// ------------------------------------------------------------

function createComponent(toolId, position) {
  let object

  switch (toolId) {
    case 'led':
      object = createLED()
      break

    case 'breadboard':
      object = createBreadboard()
      break

    case 'resistor':
      object = createResistor()
      break

    case 'battery':
      object = createBattery()
      break

    case 'wire':
      object = createWire()
      break

    default:
      object = createGenericComponent(toolId)
  }

  object.position.copy(position)

  object.userData.isComponent = true
  object.userData.componentType = toolId
  object.userData.velocity = new THREE.Vector3()
  object.userData.isDragging = false

  scene.add(object)

  state.components.push(object)

  return object
}

// ------------------------------------------------------------
// Temporary LED
// ------------------------------------------------------------

function createLED() {
  const group = new THREE.Group()

  group.name = 'LED'

  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.28,
      0.28,
      0.35,
      24,
    ),
    new THREE.MeshStandardMaterial({
      color: 0x9e2f38,
      roughness: 0.3,
      metalness: 0.15,
    }),
  )

  body.position.y = 0.28

  body.castShadow = true

  group.add(body)

  // Dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.28,
      24,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    ),
    new THREE.MeshStandardMaterial({
      color: 0xff3948,
      emissive: 0x000000,
      roughness: 0.2,
      metalness: 0.05,
    }),
  )

  dome.position.y = 0.45

  dome.castShadow = true

  group.add(dome)

  // Legs
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0xb7c0ca,
    metalness: 0.8,
    roughness: 0.25,
  })

  const leg1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.8, 10),
    legMaterial,
  )

  leg1.position.set(-0.09, -0.1, 0)

  group.add(leg1)

  const leg2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.65, 10),
    legMaterial,
  )

  leg2.position.set(0.09, -0.025, 0)

  group.add(leg2)

  // Electrical connection points
  const pin1 = createElectricalPin(0x00ffff)
  pin1.position.set(-0.09, -0.5, 0)
  pin1.userData.pinType = 'anode'

  const pin2 = createElectricalPin(0xff00ff)
  pin2.position.set(0.09, -0.425, 0)
  pin2.userData.pinType = 'cathode'

  group.add(pin1)
  group.add(pin2)

  group.userData.electrical = {
    type: 'led',
    pins: {
      anode: pin1,
      cathode: pin2,
    },
    voltage: 2,
    current: 0,
    isOn: false,
  }

  return group
}

// ------------------------------------------------------------
// Breadboard
// ------------------------------------------------------------

function createBreadboard() {
  const group = new THREE.Group()

  group.name = 'Breadboard'

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.45, 2.7),
    new THREE.MeshStandardMaterial({
      color: 0xf0f0eb,
      roughness: 0.75,
    }),
  )

  body.position.y = 0.3

  body.castShadow = true
  body.receiveShadow = true

  group.add(body)

  // Hole rows
  const holeMaterial = new THREE.MeshStandardMaterial({
    color: 0x151a20,
    roughness: 0.5,
  })

  const holeGeometry = new THREE.CylinderGeometry(
    0.035,
    0.035,
    0.04,
    8,
  )

  const spacingX = 0.22
  const spacingZ = 0.22

  const startX = -1.95
  const startZ = -0.95

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 5; col++) {
      const hole = new THREE.Mesh(
        holeGeometry,
        holeMaterial,
      )

      hole.rotation.x = Math.PI / 2

      hole.position.set(
        startX + col * spacingX,
        0.54,
        startZ + row * spacingZ,
      )

      hole.userData.isElectricalPin = true
      hole.userData.componentType = 'breadboard-hole'
      hole.userData.row = row
      hole.userData.column = col

      group.add(hole)
    }
  }

  // Second section
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 5; col++) {
      const hole = new THREE.Mesh(
        holeGeometry,
        holeMaterial,
      )

      hole.rotation.x = Math.PI / 2

      hole.position.set(
        startX + 1.55 + col * spacingX,
        0.54,
        startZ + row * spacingZ,
      )

      hole.userData.isElectricalPin = true
      hole.userData.componentType = 'breadboard-hole'
      hole.userData.row = row
      hole.userData.column = col + 5

      group.add(hole)
    }
  }

  group.userData.electrical = {
    type: 'breadboard',
    holes: [],
  }

  return group
}

// ------------------------------------------------------------
// Resistor
// ------------------------------------------------------------

function createResistor() {
  const group = new THREE.Group()

  group.name = 'Resistor'

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.13,
      0.13,
      1.0,
      20,
    ),
    new THREE.MeshStandardMaterial({
      color: 0xd8b57c,
      roughness: 0.55,
    }),
  )

  body.rotation.z = Math.PI / 2
  body.castShadow = true

  group.add(body)

  const leadMaterial = new THREE.MeshStandardMaterial({
    color: 0xb9c2cc,
    metalness: 0.8,
    roughness: 0.25,
  })

  const lead1 = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.025,
      0.025,
      0.8,
      10,
    ),
    leadMaterial,
  )

  lead1.rotation.z = Math.PI / 2
  lead1.position.x = -0.9

  group.add(lead1)

  const lead2 = lead1.clone()

  lead2.position.x = 0.9

  group.add(lead2)

  group.userData.electrical = {
    type: 'resistor',
    resistance: 220,
    pins: [lead1, lead2],
  }

  return group
}

// ------------------------------------------------------------
// Battery
// ------------------------------------------------------------

function createBattery() {
  const group = new THREE.Group()

  group.name = 'Battery'

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.8, 0.8),
    new THREE.MeshStandardMaterial({
      color: 0x273447,
      roughness: 0.55,
      metalness: 0.15,
    }),
  )

  body.position.y = 0.45

  body.castShadow = true

  group.add(body)

  const positive = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16),
    new THREE.MeshStandardMaterial({
      color: 0xb9c0c7,
      metalness: 0.9,
      roughness: 0.2,
    }),
  )

  positive.position.set(0.42, 0.93, 0)

  group.add(positive)

  const negative = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16),
    new THREE.MeshStandardMaterial({
      color: 0xb9c0c7,
      metalness: 0.9,
      roughness: 0.2,
    }),
  )

  negative.position.set(-0.42, 0.93, 0)

  group.add(negative)

  group.userData.electrical = {
    type: 'battery',
    voltage: 5,
    positive,
    negative,
  }

  return group
}

// ------------------------------------------------------------
// Wire
// ------------------------------------------------------------

function createWire() {
  const group = new THREE.Group()

  group.name = 'Wire'

  const material = new THREE.MeshStandardMaterial({
    color: 0x21c7ff,
    roughness: 0.45,
    metalness: 0.2,
  })

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.8, 0.5, 0),
    new THREE.Vector3(0, 0.8, 0),
    new THREE.Vector3(0.8, 0.5, 0),
  ])

  const geometry = new THREE.TubeGeometry(
    curve,
    32,
    0.045,
    8,
    false,
  )

  const wire = new THREE.Mesh(geometry, material)

  wire.castShadow = true

  group.add(wire)

  const end1 = createElectricalPin(0x00ffff)
  end1.position.set(-0.8, 0.5, 0)

  const end2 = createElectricalPin(0x00ffff)
  end2.position.set(0.8, 0.5, 0)

  group.add(end1)
  group.add(end2)

  group.userData.electrical = {
    type: 'wire',
    ends: [end1, end2],
  }

  return group
}

// ------------------------------------------------------------
// Generic Component
// ------------------------------------------------------------

function createGenericComponent(toolId) {
  const group = new THREE.Group()

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.7, 1),
    new THREE.MeshStandardMaterial({
      color: 0x54657d,
      roughness: 0.6,
    }),
  )

  mesh.position.y = 0.35
  mesh.castShadow = true

  group.add(mesh)

  return group
}

// ------------------------------------------------------------
// Electrical Pin
// ------------------------------------------------------------

function createElectricalPin(color = 0x00ffff) {
  const pin = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 12, 12),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.35,
    }),
  )

  pin.userData.isElectricalPin = true

  return pin
}

// ------------------------------------------------------------
// Scene Interaction
// ------------------------------------------------------------

function setupSceneInteraction(container) {
  renderer.domElement.addEventListener(
    'pointerdown',
    onPointerDown,
  )

  renderer.domElement.addEventListener(
    'pointermove',
    onPointerMove,
  )

  renderer.domElement.addEventListener(
    'pointerup',
    onPointerUp,
  )

  renderer.domElement.addEventListener(
    'pointercancel',
    onPointerUp,
  )

  container.addEventListener('dragover', (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  })

  container.addEventListener('drop', (event) => {
    event.preventDefault()

    const toolId = event.dataTransfer.getData('tool-id')

    if (!toolId) return

    const point = getGroundPoint(
      event.clientX,
      event.clientY,
    )

    if (!point) return

    createComponent(
      toolId,
      new THREE.Vector3(
        point.x,
        getComponentGroundHeight(toolId),
        point.z,
      ),
    )
  })
}

// ------------------------------------------------------------
// Pointer Down
// ------------------------------------------------------------

function onPointerDown(event) {
  if (!scene) return

  updatePointer(event)

  raycaster.setFromCamera(pointer, camera)

  const intersections = raycaster.intersectObjects(
    state.components,
    true,
  )

  if (intersections.length === 0) {
    return
  }

  let object = intersections[0].object

  while (
    object.parent &&
    !object.userData.isComponent
  ) {
    object = object.parent
  }

  if (!object.userData.isComponent) return

  draggedObject = object

  draggedObject.userData.isDragging = true

  state.selectedObject = draggedObject

  // Prevent camera orbit while dragging
  controls.enabled = false

  const groundPoint = getGroundPoint(
    event.clientX,
    event.clientY,
  )

  if (groundPoint) {
    dragStartPoint.copy(groundPoint)

    dragOffset.copy(
      draggedObject.position,
    ).sub(groundPoint)

    dragOffset.y = 0
  }

  highlightObject(draggedObject, true)
}

// ------------------------------------------------------------
// Pointer Move
// ------------------------------------------------------------

function onPointerMove(event) {
  if (!draggedObject) return

  const groundPoint = getGroundPoint(
    event.clientX,
    event.clientY,
  )

  if (!groundPoint) return

  draggedObject.position.x =
    groundPoint.x + dragOffset.x

  draggedObject.position.z =
    groundPoint.z + dragOffset.z

  draggedObject.position.y =
    getComponentGroundHeight(
      draggedObject.userData.componentType,
    )

  draggedObject.userData.velocity.set(0, 0, 0)
}

// ------------------------------------------------------------
// Pointer Up
// ------------------------------------------------------------

function onPointerUp() {
  if (!draggedObject) return

  draggedObject.userData.isDragging = false

  highlightObject(draggedObject, false)

  draggedObject = null

  controls.enabled = true
}

// ------------------------------------------------------------
// Ground Raycast
// ------------------------------------------------------------

function getGroundPoint(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect()

  pointer.x =
    ((clientX - rect.left) / rect.width) * 2 - 1

  pointer.y =
    -((clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)

  const intersections =
    raycaster.intersectObject(
      groundPlane,
      false,
    )

  if (intersections.length === 0) {
    return null
  }

  return intersections[0].point
}

// ------------------------------------------------------------
// Component Height
// ------------------------------------------------------------

function getComponentGroundHeight(toolId) {
  switch (toolId) {
    case 'led':
      return 0

    case 'breadboard':
      return 0

    case 'resistor':
      return 0.2

    case 'battery':
      return 0

    case 'wire':
      return 0

    default:
      return 0
  }
}

// ------------------------------------------------------------
// Highlight Selected Object
// ------------------------------------------------------------

function highlightObject(object, active) {
  object.traverse((child) => {
    if (!child.isMesh) return

    if (!child.userData.originalEmissive) {
      child.userData.originalEmissive =
        child.material.emissive
          ? child.material.emissive.clone()
          : new THREE.Color(0x000000)

      child.userData.originalEmissiveIntensity =
        child.material.emissiveIntensity || 0
    }

    if (active) {
      if (child.material.emissive) {
        child.material.emissive.set(0x168cff)
        child.material.emissiveIntensity = 0.5
      }
    } else {
      if (child.material.emissive) {
        child.material.emissive.copy(
          child.userData.originalEmissive,
        )

        child.material.emissiveIntensity =
          child.userData.originalEmissiveIntensity
      }
    }
  })
}

// ------------------------------------------------------------
// Simple Gravity
// ------------------------------------------------------------

function updatePhysics(delta) {
  const gravity = -12

  for (const object of state.components) {
    if (object.userData.isDragging) continue

    const velocity = object.userData.velocity

    velocity.y += gravity * delta

    object.position.y += velocity.y * delta

    const minimumY = getComponentGroundHeight(
      object.userData.componentType,
    )

    if (object.position.y < minimumY) {
      object.position.y = minimumY

      velocity.y *= -0.18

      if (Math.abs(velocity.y) < 0.15) {
        velocity.y = 0
      }
    }
  }
}

// ------------------------------------------------------------
// Animation
// ------------------------------------------------------------

let previousTime = performance.now()

function animate() {
  animationFrame = requestAnimationFrame(animate)

  const currentTime = performance.now()

  const delta = Math.min(
    (currentTime - previousTime) / 1000,
    0.05,
  )

  previousTime = currentTime

  updatePhysics(delta)

  controls.update()

  renderer.render(scene, camera)
}

// ------------------------------------------------------------
// Resize
// ------------------------------------------------------------

function resizeRenderer() {
  if (!renderer || !camera) return

  const container = document.querySelector('#scene')

  if (!container) return

  camera.aspect =
    container.clientWidth /
    container.clientHeight

  camera.updateProjectionMatrix()

  renderer.setSize(
    container.clientWidth,
    container.clientHeight,
  )
}

// ------------------------------------------------------------
// Dispose Scene
// ------------------------------------------------------------

function disposeScene() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }

  window.removeEventListener(
    'resize',
    resizeRenderer,
  )

  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }

  scene = null
  camera = null
  renderer = null
  controls = null
  raycaster = null
  pointer = null
  groundPlane = null
  draggedObject = null

  state.components = []
}

// ------------------------------------------------------------
// Main Render
// ------------------------------------------------------------

function render() {
  if (state.screen === 'welcome') {
    renderWelcome()
  }

  if (state.screen === 'sessions') {
    renderSessions()
  }

  if (state.screen === 'workspace') {
    renderWorkspace()
  }
}

// ------------------------------------------------------------
// Start
// ------------------------------------------------------------

render()
