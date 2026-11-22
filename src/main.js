import * as THREE from 'three';
import { CHARACTER_TEMPLATES, MOOD_STYLES } from './data/characters.js';
import { FURNITURE_CATALOG } from './data/furniture.js';
import { createWorld } from './scene/world.js';
import { createSimRig } from './scene/simMesh.js';
import { createFurnitureMesh } from './scene/furnitureMeshes.js';
import { PathGrid } from './sim/pathfinding.js';
import { SimEngine } from './sim/engine.js';
import { HudController } from './ui/hud.js';
import { sfx } from './audio/sfx.js';

// ==================== THREE.JS SCENE & RENDERER ====================
const viewport = document.getElementById('viewport');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.2, 120);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
viewport.appendChild(renderer.domElement);

// Build 3D World
const world = createWorld(scene);
const pathGrid = new PathGrid();

// Furniture container
const furnitureGroup = new THREE.Group();
scene.add(furnitureGroup);

// Sim rigs container
const simsGroup = new THREE.Group();
scene.add(simsGroup);

// Iconic Red Leash Line (for Naishu walking Naifen!)
const leashGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
const leashMat = new THREE.LineBasicMaterial({ color: 0xe63946, linewidth: 3 });
const leashLine = new THREE.Line(leashGeo, leashMat);
leashLine.visible = false;
scene.add(leashLine);

// Placement Ghost for Buy Mode
let placementMode = null; // { type, rot, ghostGroup, ring }

// ==================== CAMERA CONTROLLER (SMOOTH SIMS ORBIT/PAN/ZOOM) ====================
const camState = {
  target: new THREE.Vector3(0, 0.6, 0.5),
  desiredTarget: new THREE.Vector3(0, 0.6, 0.5),
  yaw: Math.PI * 0.22,
  desiredYaw: Math.PI * 0.22,
  pitch: 0.72,
  desiredPitch: 0.72,
  distance: 18.5,
  desiredDistance: 18.5,
  followSimId: null,
};

function updateCamera(dt) {
  if (camState.followSimId) {
    const s = engine.sims[camState.followSimId];
    if (s && !s.atWork && (s.playable || s.visiting)) {
      camState.desiredTarget.set(s.x, 0.7, s.z);
    } else {
      camState.followSimId = null;
    }
  }

  // Keyboard pan/rotate
  const panSpeed = 10 * dt;
  const fwd = new THREE.Vector3(-Math.sin(camState.yaw), 0, -Math.cos(camState.yaw));
  const right = new THREE.Vector3(Math.cos(camState.yaw), 0, -Math.sin(camState.yaw));
  if (keys.has('KeyW') || keys.has('ArrowUp')) { camState.desiredTarget.addScaledVector(fwd, panSpeed); camState.followSimId = null; }
  if (keys.has('KeyS') || keys.has('ArrowDown')) { camState.desiredTarget.addScaledVector(fwd, -panSpeed); camState.followSimId = null; }
  if (keys.has('KeyA') || keys.has('ArrowLeft')) { camState.desiredTarget.addScaledVector(right, -panSpeed); camState.followSimId = null; }
  if (keys.has('KeyD') || keys.has('ArrowRight')) { camState.desiredTarget.addScaledVector(right, panSpeed); camState.followSimId = null; }
  if (keys.has('KeyQ')) camState.desiredYaw -= 1.6 * dt;
  if (keys.has('KeyE')) camState.desiredYaw += 1.6 * dt;

  // Clamp pan within cozy lot
  camState.desiredTarget.x = Math.max(-10, Math.min(10, camState.desiredTarget.x));
  camState.desiredTarget.z = Math.max(-7, Math.min(9.5, camState.desiredTarget.z));
  camState.desiredDistance = Math.max(7.5, Math.min(28, camState.desiredDistance));
  camState.desiredPitch = Math.max(0.35, Math.min(1.22, camState.desiredPitch));

  const lerp = 1 - Math.exp(-10 * dt);
  camState.target.lerp(camState.desiredTarget, lerp);
  camState.yaw += (camState.desiredYaw - camState.yaw) * lerp;
  camState.pitch += (camState.desiredPitch - camState.pitch) * lerp;
  camState.distance += (camState.desiredDistance - camState.distance) * lerp;

  const horiz = Math.cos(camState.pitch) * camState.distance;
  camera.position.set(
    camState.target.x + Math.sin(camState.yaw) * horiz,
    camState.target.y + Math.sin(camState.pitch) * camState.distance,
    camState.target.z + Math.cos(camState.yaw) * horiz
  );
  camera.lookAt(camState.target);
}

function projectWorldToScreen(x, y, z) {
  const v = new THREE.Vector3(x, y, z).project(camera);
  return {
    visible: v.z < 1,
    x: (v.x * 0.5 + 0.5) * window.innerWidth,
    y: (-v.y * 0.5 + 0.5) * window.innerHeight,
  };
}

// ==================== ENGINE & HUD WIRING ====================
let hud = null;
const engine = new SimEngine(pathGrid, {
  onToast: (t) => hud?.showToast(t),
  onFloatText: (x, y, z, txt, variant) => {
    const p = projectWorldToScreen(x, y, z);
    if (p.visible) hud?.spawnFloatText(p.x, p.y, txt, variant);
  },
  onEventModal: (ev) => hud?.showEventModal(ev),
  onFurnitureChanged: () => rebuildFurnitureMeshes(),
  onThemeChanged: (themeId) => world.applyTheme(themeId),
  onStateDirty: () => hud?.renderAll(),
});

// Sync initial theme
world.applyTheme(engine.roomTheme);

// Build 3D furniture meshes
function rebuildFurnitureMeshes() {
  while (furnitureGroup.children.length > 0) {
    furnitureGroup.remove(furnitureGroup.children[0]);
  }
  engine.furniture.forEach((f) => {
    const mesh = createFurnitureMesh(f);
    furnitureGroup.add(mesh);
  });
}
rebuildFurnitureMeshes();

// Build 3D Sim Rigs
const simRigs = {};
Object.values(CHARACTER_TEMPLATES).forEach((tpl) => {
  const rig = createSimRig(tpl);
  simsGroup.add(rig.root);
  simRigs[tpl.id] = rig;
});

// ==================== FURNITURE PLACEMENT MODE ====================
function startPlacement(type) {
  cancelPlacement();
  const def = FURNITURE_CATALOG[type];
  if (!def) return;
  const ghostMesh = createFurnitureMesh({ id: 'ghost', type, x: 0, z: 0, rot: 0 });
  ghostMesh.traverse((o) => {
    if (o.isMesh) {
      o.material = o.material.clone();
      o.material.transparent = true;
      o.material.opacity = 0.65;
    }
  });
  const ring = new THREE.Mesh(
    new THREE.PlaneGeometry(def.size[0], def.size[1]),
    new THREE.MeshBasicMaterial({ color: 0x2cc764, transparent: true, opacity: 0.36, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  ghostMesh.add(ring);

  scene.add(ghostMesh);
  placementMode = { type, rot: 0, ghostMesh, ring, x: 0, z: 1, valid: true };
  hud.showPlacementBanner(def.name);
  hud.closePieMenu();
}

function rotateGhost() {
  if (!placementMode) return;
  placementMode.rot = (placementMode.rot + Math.PI / 2) % (Math.PI * 2);
  placementMode.ghostMesh.rotation.y = placementMode.rot;
  sfx.click();
}

function cancelPlacement() {
  if (!placementMode) return;
  scene.remove(placementMode.ghostMesh);
  placementMode = null;
  hud?.hidePlacementBanner();
}

// Create HUD
const WALL_MODES = ['cutaway', 'full', 'down'];
hud = new HudController(engine, {
  onWallModeCycle: () => {
    const next = WALL_MODES[(WALL_MODES.indexOf(world.getWallMode()) + 1) % WALL_MODES.length];
    world.setWallMode(next);
    return next;
  },
  onFocusSim: (simId) => {
    const s = engine.sims[simId];
    if (s && !s.atWork) {
      camState.followSimId = simId;
      camState.desiredDistance = 12.5;
    }
  },
  onStartPlacement: (type) => startPlacement(type),
  onCancelPlacement: () => cancelPlacement(),
  onRotateGhost: () => rotateGhost(),
});

// ==================== POINTER, RAYCASTING & KEYBOARD ====================
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const keys = new Set();

let dragMode = null; // 'orbit' | 'pan' | null
let dragStart = { x: 0, y: 0 };
let draggedDist = 0;

function updateRay(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
}

renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

renderer.domElement.addEventListener('pointerdown', (e) => {
  dragStart = { x: e.clientX, y: e.clientY };
  draggedDist = 0;
  if (e.button === 2 || e.button === 1) {
    dragMode = 'orbit';
  } else if (e.button === 0) {
    dragMode = 'pan';
  }
});

window.addEventListener('pointermove', (e) => {
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;

  if (dragMode === 'orbit') {
    draggedDist += Math.hypot(dx, dy);
    camState.desiredYaw -= dx * 0.0065;
    camState.desiredPitch += dy * 0.0055;
    dragStart = { x: e.clientX, y: e.clientY };
    return;
  }

  if (dragMode === 'pan' && (draggedDist > 6 || Math.hypot(dx, dy) > 6)) {
    draggedDist += Math.hypot(dx, dy);
    const scale = camState.distance * 0.0014;
    const right = new THREE.Vector3(Math.cos(camState.yaw), 0, -Math.sin(camState.yaw));
    const fwd = new THREE.Vector3(-Math.sin(camState.yaw), 0, -Math.cos(camState.yaw));
    camState.desiredTarget.addScaledVector(right, -dx * scale);
    camState.desiredTarget.addScaledVector(fwd, dy * scale);
    camState.followSimId = null;
    dragStart = { x: e.clientX, y: e.clientY };
    return;
  }

  // Hover logic / Ghost preview
  updateRay(e.clientX, e.clientY);

  if (placementMode) {
    const pt = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, pt)) {
      const gx = Math.round(pt.x * 2) / 2;
      const gz = Math.round(pt.z * 2) / 2;
      const def = FURNITURE_CATALOG[placementMode.type];
      const rot90 = Math.abs(Math.sin(placementMode.rot)) > 0.7;
      const w = rot90 ? def.size[1] : def.size[0];
      const d = rot90 ? def.size[0] : def.size[1];
      const valid = pathGrid.canPlaceFurniture(gx, gz, w, d);
      placementMode.x = gx;
      placementMode.z = gz;
      placementMode.valid = valid;
      placementMode.ghostMesh.position.set(gx, 0, gz);
      placementMode.ring.material.color.setHex(valid ? 0x2cc764 : 0xef4444);
    }
    hud.showHoverTip(null);
    return;
  }

  // Hover highlight tooltip on Sims & Furniture
  const hits = raycaster.intersectObjects([simsGroup, furnitureGroup], true);
  if (hits.length > 0) {
    const ud = hits[0].object.userData;
    if (ud.pickType === 'sim') {
      const s = engine.sims[ud.simId];
      if (s) {
        renderer.domElement.style.cursor = 'pointer';
        hud.showHoverTip(`${s.name} · ${MOOD_STYLES[s.mood]?.label || '平静'}`, e.clientX, e.clientY);
        return;
      }
    } else if (ud.pickType === 'furniture') {
      const f = engine.furniture.find((i) => i.id === ud.furnitureId);
      const def = f && FURNITURE_CATALOG[f.type];
      if (def) {
        renderer.domElement.style.cursor = 'pointer';
        hud.showHoverTip(`${def.icon} ${def.name}`, e.clientX, e.clientY);
        return;
      }
    }
  }
  renderer.domElement.style.cursor = 'default';
  hud.showHoverTip(null);
});

window.addEventListener('pointerup', (e) => {
  const wasClick = draggedDist < 8;
  const prevMode = dragMode;
  dragMode = null;

  if (!wasClick) return;

  if (prevMode === 'orbit' && placementMode) {
    cancelPlacement();
    return;
  }

  if (e.button !== 0 || e.target !== renderer.domElement) return;

  updateRay(e.clientX, e.clientY);

  // Confirm furniture placement
  if (placementMode) {
    if (placementMode.valid) {
      engine.addFurnitureItem(placementMode.type, placementMode.x, placementMode.z, placementMode.rot);
      cancelPlacement();
    } else {
      hud.showToast({ icon: '⚠️', title: '这里放不下哦', body: '请把家具移到绿框空地上（避开墙体、门口和其他家具）。', variant: 'warn' });
    }
    return;
  }

  // Pick Sim -> Furniture -> Ground
  const simHits = raycaster.intersectObjects(simsGroup.children, true);
  if (simHits.length > 0) {
    const sid = simHits[0].object.userData.simId;
    const sim = engine.sims[sid];
    if (sim && !sim.atWork && (sim.playable || sim.visiting)) {
      hud.openSimPie(sim, e.clientX, e.clientY);
      return;
    }
  }

  const furnHits = raycaster.intersectObjects(furnitureGroup.children, true);
  if (furnHits.length > 0) {
    const fid = furnHits[0].object.userData.furnitureId;
    const furn = engine.furniture.find((f) => f.id === fid);
    if (furn) {
      hud.openFurniturePie(furn, e.clientX, e.clientY);
      return;
    }
  }

  const pt = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(groundPlane, pt)) {
    if (pt.x > -10 && pt.x < 10 && pt.z > -7.5 && pt.z < 9.5) {
      hud.openGroundPie(pt.x, pt.z, e.clientX, e.clientY);
      return;
    }
  }
  hud.closePieMenu();
});

renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  camState.desiredDistance += e.deltaY * 0.014;
}, { passive: false });

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  keys.add(e.code);
  if (e.code === 'Space') {
    e.preventDefault();
    hud.setSpeed(engine.speed === 0 ? 1 : 0);
  } else if (e.code === 'Digit1') {
    hud.setSpeed(1);
  } else if (e.code === 'Digit2') {
    hud.setSpeed(2);
  } else if (e.code === 'Digit3') {
    hud.setSpeed(3);
  } else if (e.code === 'KeyH') {
    document.getElementById('btn-wall-mode').click();
  } else if (e.code === 'KeyB') {
    document.getElementById('btn-buy-mode').click();
  } else if (e.code === 'KeyR' && placementMode) {
    rotateGhost();
  } else if (e.code === 'Escape') {
    cancelPlacement();
    hud.closePieMenu();
  } else if (e.code === 'Tab') {
    e.preventDefault();
    const list = engine.getPlayableSims();
    const idx = list.findIndex((s) => s.id === engine.selectedSimId);
    const next = list[(idx + 1) % list.length];
    if (next) engine.selectSim(next.id);
  }
});

window.addEventListener('keyup', (e) => keys.delete(e.code));

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==================== MAIN ANIMATION LOOP ====================
let lastTime = performance.now();
let uiSyncAcc = 0;

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.06, (now - lastTime) / 1000);
  lastTime = now;

  engine.tick(dt);
  world.updateTimeOfDay(engine.hour);
  updateCamera(dt);

  // Sync 3D Sim positions & animations
  Object.values(engine.sims).forEach((s) => {
    const rig = simRigs[s.id];
    if (!rig) return;
    const show = !s.atWork && (s.playable || s.visiting);
    rig.root.visible = show;
    if (!show) return;

    rig.root.position.set(s.x, 0, s.z);
    // Smooth yaw turn
    let diff = s.rotY - rig.root.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    rig.root.rotation.y += diff * Math.min(1, dt * 10);

    const moodStyle = MOOD_STYLES[s.mood] || MOOD_STYLES.fine;
    rig.updateVisual(dt, {
      isSelected: s.id === engine.selectedSimId,
      plumbobColor: moodStyle.plumbob,
      isMoving: s.anim === 'walk',
      anim: s.anim,
      mood: s.mood,
    });
  });

  // Update Red Leash visual when Naishu walks Naifen!
  if (engine.activeLeash) {
    const leader = engine.sims[engine.activeLeash.leaderId];
    const follower = engine.sims[engine.activeLeash.followerId];
    if (leader && follower) {
      leashLine.visible = true;
      const pos = leashLine.geometry.attributes.position;
      pos.setXYZ(0, leader.x, 0.72, leader.z);
      pos.setXYZ(1, follower.x, 0.85, follower.z);
      pos.needsUpdate = true;
    } else {
      leashLine.visible = false;
    }
  } else {
    leashLine.visible = false;
  }

  // Update projected 2D speech bubbles every frame
  hud.updateSpeechBubbles(projectWorldToScreen);

  // Smooth HUD sync at ~4Hz so progress bars & needs feel super alive without DOM thrash
  uiSyncAcc += dt;
  if (uiSyncAcc >= 0.25) {
    uiSyncAcc = 0;
    hud.renderClockAndFunds();
    hud.renderActiveSim();
    hud.renderSwitcher();
    hud.renderActionQueue();
    if (hud.activeTab === 'needs' || hud.activeTab === 'relations') {
      hud.renderDrawer();
    }
  }

  renderer.render(scene, camera);
}

// Welcome toast!
hud.showToast({
  icon: '🏡',
  title: '欢迎来到奶家小洋房！',
  body: '点任何家具或角色即可互动！听说隔壁的粉色「奶粉」马上就要来敲门找奶鼠啦💗',
  variant: 'gold',
});

requestAnimationFrame(animate);
