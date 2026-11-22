import * as THREE from 'three';
import { createNaiwaArtTexture } from './furnitureMeshes.js';
import { ROOM_THEMES } from '../data/furniture.js';

function createWoodFloorTexture(baseHex = 0xe6cda6) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const col = new THREE.Color(baseHex);
  ctx.fillStyle = `#${col.getHexString()}`;
  ctx.fillRect(0, 0, 256, 256);

  // Warm plank seams
  ctx.strokeStyle = 'rgba(110, 76, 42, 0.16)';
  ctx.lineWidth = 2;
  for (let y = 0; y < 256; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
    const off = (y / 32) % 2 === 0 ? 90 : 180;
    ctx.beginPath(); ctx.moveTo(off, y); ctx.lineTo(off, y + 32); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createTileTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e7f5f8';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#d3ecf2';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillRect(64, 64, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWorld(scene) {
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  // Lighting setup (dynamic day/night!)
  const hemiLight = new THREE.HemisphereLight(0xdff4ff, 0x7cb66c, 0.85);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff5de, 1.35);
  sunLight.position.set(12, 18, 14);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.left = -16;
  sunLight.shadow.camera.right = 16;
  sunLight.shadow.camera.top = 16;
  sunLight.shadow.camera.bottom = -16;
  sunLight.shadow.camera.near = 2;
  sunLight.shadow.camera.far = 45;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Cozy warm indoor ceiling point light (glows at sunset/night)
  const indoorLight = new THREE.PointLight(0xffe4b3, 0.35, 22, 1.3);
  indoorLight.position.set(0, 3.6, -0.5);
  scene.add(indoorLight);

  // Lush suburban grass lawn
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(54, 54),
    new THREE.MeshStandardMaterial({ color: 0x8fd174, roughness: 0.92 })
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = -0.02;
  grass.receiveShadow = true;
  grass.userData = { pickType: 'ground' };
  worldGroup.add(grass);

  // Subtle decorative yard border lawn patch
  const yard = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 22),
    new THREE.MeshStandardMaterial({ color: 0x99da7c, roughness: 0.92 })
  );
  yard.rotation.x = -Math.PI / 2;
  yard.position.set(0, -0.01, 1);
  yard.receiveShadow = true;
  yard.userData = { pickType: 'ground' };
  worldGroup.add(yard);

  // Sidewalk & Front Stone Walkway
  const sidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(36, 0.08, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xe6e0d2, roughness: 0.88 })
  );
  sidewalk.position.set(0, 0.0, 10.6);
  sidewalk.receiveShadow = true;
  worldGroup.add(sidewalk);

  for (let i = 0; i < 4; i++) {
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.72, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: 0xebe4d4, roughness: 0.85 })
    );
    stone.position.set(0, 0.01, 5.8 + i * 1.15);
    stone.receiveShadow = true;
    stone.userData = { pickType: 'ground' };
    worldGroup.add(stone);
  }

  // Main House Floor (x: -7..7, z: -6..4)
  const floorMat = new THREE.MeshStandardMaterial({
    map: createWoodFloorTexture(ROOM_THEMES[0].floorColor),
    roughness: 0.78,
  });
  const houseFloor = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.14, 10.2), floorMat);
  houseFloor.position.set(0, -0.05, -1);
  houseFloor.receiveShadow = true;
  houseFloor.userData = { pickType: 'ground' };
  worldGroup.add(houseFloor);

  // Bathroom Tile Floor (x: 4..7, z: -6..-1)
  const bathFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 5.0),
    new THREE.MeshStandardMaterial({ map: createTileTexture(), roughness: 0.45 })
  );
  bathFloor.rotation.x = -Math.PI / 2;
  bathFloor.position.set(5.5, 0.025, -3.5);
  bathFloor.receiveShadow = true;
  bathFloor.userData = { pickType: 'ground' };
  worldGroup.add(bathFloor);

  // Cozy Living Room Rug
  const rug = new THREE.Mesh(
    new THREE.CylinderGeometry(1.75, 1.75, 0.025, 28),
    new THREE.MeshStandardMaterial({ color: 0xffe6a8, roughness: 0.95 })
  );
  rug.scale.set(1.35, 1, 0.92);
  rug.position.set(-3.3, 0.025, 1.8);
  rug.receiveShadow = true;
  rug.userData = { pickType: 'ground' };
  worldGroup.add(rug);

  // Wooden Front Porch Deck
  const porch = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.12, 1.6),
    new THREE.MeshStandardMaterial({ color: 0xc99969, roughness: 0.82 })
  );
  porch.position.set(0, -0.04, 4.8);
  porch.receiveShadow = true;
  porch.userData = { pickType: 'ground' };
  worldGroup.add(porch);

  // ==================== WALLS (WITH AUTHENTIC SIMS CUTAWAY!) ====================
  const wallMat = new THREE.MeshStandardMaterial({ color: ROOM_THEMES[0].wallColor, roughness: 0.85 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xd9b583, roughness: 0.65 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xc9ecff,
    roughness: 0.12,
    metalness: 0.1,
    transparent: true,
    opacity: 0.48,
  });

  const WALL_H = 2.65;
  const WALL_T = 0.22;
  const wallsBack = [];   // Stay UP in cutaway mode (North & West & back dividers)
  const wallsFront = [];  // Cut down in cutaway mode (South & East & mid-front)

  function makeWall(w, d, x, z, bucket, hasWindow = false) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_H, d), wallMat);
    mesh.position.y = WALL_H / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    grp.add(mesh);

    // Baseboard trim
    const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.18, d + 0.04), trimMat);
    base.position.y = 0.09;
    grp.add(base);

    if (hasWindow) {
      const winW = Math.min(2.1, Math.max(w, d) * 0.55);
      const isX = w >= d;
      const winFrame = new THREE.Mesh(
        new THREE.BoxGeometry(isX ? winW : w + 0.08, 1.15, isX ? d + 0.08 : winW),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
      );
      winFrame.position.y = 1.48;
      grp.add(winFrame);

      const pane = new THREE.Mesh(
        new THREE.BoxGeometry(isX ? winW - 0.18 : w + 0.12, 0.96, isX ? d + 0.12 : winW - 0.18),
        glassMat
      );
      pane.position.y = 1.48;
      grp.add(pane);
    }

    worldGroup.add(grp);
    bucket.push(grp);
    return grp;
  }

  // Outer North Wall (z = -6, x: -7..7) -> stays up in cutaway
  makeWall(14.22, WALL_T, 0, -6, wallsBack, true);
  // Outer West Wall (x = -7, z: -6..4) -> stays up in cutaway
  makeWall(WALL_T, 10.22, -7, -1, wallsBack, true);
  // Outer East Wall (x = 7, z: -6..4) -> cutaway cuts down
  makeWall(WALL_T, 10.22, 7, -1, wallsFront, true);
  // Outer South Wall (z = 4) with front doorway at x: -1..1
  makeWall(6.1, WALL_T, -4.0, 4, wallsFront, true);
  makeWall(6.1, WALL_T, 4.0, 4, wallsFront, true);

  // Interior horizontal divider wall at z = -1 with 3 wide doorways:
  // Bedroom entrance: x -4.5..-2.5 | Study entrance: x 0.5..2.5 | Bath entrance: x 4.5..6.5
  makeWall(2.5, WALL_T, -5.75, -1, wallsFront);
  makeWall(3.0, WALL_T, -1.0, -1, wallsFront);
  makeWall(2.0, WALL_T, 3.5, -1, wallsFront);

  // Interior vertical dividers (x = 0 and x = 4, z: -6..-1)
  makeWall(WALL_T, 5.0, 0, -3.5, wallsBack);
  makeWall(WALL_T, 5.0, 4, -3.5, wallsBack);

  // Framed Milk Frog & Naishu+Naifen Wall Paintings mounted on back walls!
  const artGroup = new THREE.Group();
  function hangPainting(x, y, z, rotY, variant) {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.38, 1.38, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xc79248, roughness: 0.45 })
    );
    frame.position.set(x, y, z);
    frame.rotation.y = rotY;
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(1.20, 1.20),
      new THREE.MeshStandardMaterial({ map: createNaiwaArtTexture(variant), roughness: 0.55 })
    );
    art.position.z = 0.045;
    frame.add(art);
    artGroup.add(frame);
  }
  hangPainting(-6.84, 1.55, 1.4, Math.PI / 2, 'starry');
  hangPainting(-3.5, 1.55, -5.84, 0, 'heart');
  worldGroup.add(artGroup);

  // Cute stylized Trees & Bushes around the garden + Neighbor Naifen's Pink Cottage in the background!
  function addTree(x, z, scale = 1.0, blossom = false) {
    const tg = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18 * scale, 0.25 * scale, 1.3 * scale, 10),
      new THREE.MeshStandardMaterial({ color: 0x9b6b43, roughness: 0.88 })
    );
    trunk.position.y = 0.65 * scale;
    trunk.castShadow = true;
    tg.add(trunk);

    const foliageColor = blossom ? 0xf8b5c9 : 0x5bbd68;
    const f1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.92 * scale, 16, 14),
      new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.82 })
    );
    f1.position.y = 1.85 * scale; f1.castShadow = true; tg.add(f1);
    const f2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.68 * scale, 14, 12),
      new THREE.MeshStandardMaterial({ color: blossom ? 0xffcde0 : 0x70cf78, roughness: 0.82 })
    );
    f2.position.set(0.45 * scale, 1.60 * scale, 0.25 * scale); f2.castShadow = true; tg.add(f2);
    tg.position.set(x, 0, z);
    worldGroup.add(tg);
  }

  addTree(-9.4, -4.5, 1.15, false);
  addTree(-9.6, 4.2, 1.0, true);
  addTree(9.5, -5.2, 1.1, false);
  addTree(9.4, 5.5, 1.05, true);
  addTree(-7.6, 8.2, 0.85, false);

  // Naifen's cute Pink Neighbor House next door (x = 13.5, z = 2.0)
  const pinkHouse = new THREE.Group();
  const phBody = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 3.2, 5.2),
    new THREE.MeshStandardMaterial({ color: 0xffdbe7, roughness: 0.85 })
  );
  phBody.position.y = 1.6; phBody.castShadow = true; phBody.receiveShadow = true;
  pinkHouse.add(phBody);
  const phRoof = new THREE.Mesh(
    new THREE.ConeGeometry(4.1, 2.0, 4),
    new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.72 })
  );
  phRoof.position.y = 4.2; phRoof.rotation.y = Math.PI / 4; phRoof.castShadow = true;
  pinkHouse.add(phRoof);
  pinkHouse.position.set(14.0, 0, 1.0);
  worldGroup.add(pinkHouse);

  // Subtle white garden fence along front edges with horizontal rails
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.72 });
  for (let fx = -9.5; fx <= 9.5; fx += 1.2) {
    if (Math.abs(fx) < 1.8) continue; // walkway gate opening
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.14), fenceMat);
    post.position.set(fx, 0.36, 9.1);
    post.castShadow = true;
    worldGroup.add(post);
  }
  [-5.75, 5.75].forEach((rx) => {
    [0.24, 0.54].forEach((ry) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.07, 0.06), fenceMat);
      rail.position.set(rx, ry, 9.1);
      rail.castShadow = true;
      worldGroup.add(rail);
    });
  });

  // Wall mode controller: 'cutaway' | 'full' | 'down'
  let wallMode = 'cutaway';
  function setWallMode(mode) {
    wallMode = mode;
    wallsBack.forEach((w) => {
      w.scale.y = mode === 'down' ? 0.12 : 1.0;
    });
    wallsFront.forEach((w) => {
      w.scale.y = mode === 'full' ? 1.0 : 0.12;
    });
    artGroup.visible = mode !== 'down';
  }
  setWallMode('cutaway');

  function applyTheme(themeId) {
    const t = ROOM_THEMES.find((r) => r.id === themeId) || ROOM_THEMES[0];
    floorMat.map = createWoodFloorTexture(t.floorColor);
    floorMat.needsUpdate = true;
    wallMat.color.setHex(t.wallColor);
  }

  function updateTimeOfDay(hour) {
    // hour in [0, 24)
    let skyColor = new THREE.Color(0x9bd7f8);
    let sunIntensity = 1.35;
    let sunColor = new THREE.Color(0xfff5de);
    let hemiIntensity = 0.85;
    let indoorIntensity = 0.25;

    if (hour >= 5 && hour < 8) {
      // Golden dawn
      const t = (hour - 5) / 3;
      skyColor.lerpColors(new THREE.Color(0x2d3e6e), new THREE.Color(0xffcfa6), t);
      sunColor.setHex(0xffd2a1);
      sunIntensity = 0.55 + t * 0.7;
      indoorIntensity = 0.9 - t * 0.6;
    } else if (hour >= 8 && hour < 17) {
      // Bright sunny Sims day!
      skyColor.setHex(0x9bd7f8);
      sunColor.setHex(0xfff6e2);
      sunIntensity = 1.35;
      hemiIntensity = 0.88;
      indoorIntensity = 0.22;
    } else if (hour >= 17 && hour < 20) {
      // Sunset apricot glow
      const t = (hour - 17) / 3;
      skyColor.lerpColors(new THREE.Color(0x9bd7f8), new THREE.Color(0xff9a76), Math.min(1, t * 1.4));
      if (t > 0.6) skyColor.lerp(new THREE.Color(0x293b66), (t - 0.6) / 0.4);
      sunColor.setHex(0xffb478);
      sunIntensity = 1.25 - t * 0.85;
      indoorIntensity = 0.35 + t * 1.1;
    } else {
      // Cozy bright Sims moonlight night (never too dark to see!)
      skyColor.setHex(0x273963);
      sunColor.setHex(0x9dc2ff);
      sunIntensity = 0.48;
      hemiIntensity = 0.52;
      indoorIntensity = 1.45;
    }

    scene.background = skyColor;
    scene.fog = new THREE.Fog(skyColor, 26, 56);
    sunLight.intensity = sunIntensity;
    sunLight.color.copy(sunColor);
    hemiLight.intensity = hemiIntensity;
    indoorLight.intensity = indoorIntensity;

    const sunAngle = ((hour - 6) / 12) * Math.PI;
    sunLight.position.set(
      Math.cos(sunAngle) * 16,
      Math.max(7, Math.sin(sunAngle) * 18 + 6),
      13
    );
  }

  return {
    setWallMode,
    getWallMode: () => wallMode,
    applyTheme,
    updateTimeOfDay,
  };
}
