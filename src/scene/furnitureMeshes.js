import * as THREE from 'three';

function mat(color, roughness = 0.65, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addBox(parent, w, h, d, color, x, y, z, roughness = 0.68) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, roughness));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// Procedural cute CanvasTexture for Easel / Wall "Milk Frog Starry Night" painting!
export function createNaiwaArtTexture(variant = 'starry') {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');

  if (variant === 'starry') {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#1d376c');
    g.addColorStop(0.65, '#3b6cb7');
    g.addColorStop(1, '#1e2c4a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    // Swirls & stars
    ctx.strokeStyle = 'rgba(255, 232, 130, 0.7)';
    ctx.lineWidth = 6;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(55 + i * 50, 56 + (i % 2) * 28, 18, 0, Math.PI * 1.6);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffe87c';
    ctx.beginPath(); ctx.arc(204, 52, 22, 0, Math.PI * 2); ctx.fill();
    // Naiwa silhouette in foreground!
    ctx.fillStyle = '#f8d060';
    ctx.beginPath(); ctx.ellipse(128, 178, 56, 62, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff5d6';
    ctx.beginPath(); ctx.ellipse(128, 198, 36, 32, 0, 0, Math.PI * 2); ctx.fill();
    // Green eyes
    [104, 152].forEach((ex) => {
      ctx.fillStyle = '#83cc73';
      ctx.beginPath(); ctx.arc(ex, 148, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(ex, 148, 6.5, 0, Math.PI * 2); ctx.fill();
    });
    // Laugh mouth
    ctx.fillStyle = '#5c2228';
    ctx.beginPath(); ctx.ellipse(128, 170, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    // Heart Sunset Naishu + Naifen photo frame!
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#ff9ab8');
    g.addColorStop(0.55, '#ffd09c');
    g.addColorStop(1, '#fff1c9');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    // Naishu left
    ctx.fillStyle = '#f9d566';
    ctx.beginPath(); ctx.arc(72, 118, 28, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(132, 118, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4a582';
    ctx.beginPath(); ctx.arc(72, 118, 18, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(132, 118, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f9d566';
    ctx.beginPath(); ctx.ellipse(102, 186, 44, 52, 0, 0, Math.PI * 2); ctx.fill();
    // Naifen right
    ctx.fillStyle = '#f8a6be';
    ctx.beginPath(); ctx.ellipse(184, 182, 48, 60, 0, 0, Math.PI * 2); ctx.fill();
    // Eyes
    [86, 118, 168, 200].forEach((ex, idx) => {
      ctx.fillStyle = '#83cc73';
      ctx.beginPath(); ctx.arc(ex, idx < 2 ? 168 : 156, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(ex, idx < 2 ? 168 : 156, 5, 0, Math.PI * 2); ctx.fill();
    });
    // Pink heart in sky
    ctx.fillStyle = '#ff4d88';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('💗', 106, 64);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createFurnitureMesh(item) {
  const g = new THREE.Group();
  const type = item.type;

  switch (type) {
    case 'bed_yellow':
    case 'bed_pink': {
      const quilt = type === 'bed_pink' ? 0xf8a6be : 0xf8d060;
      const wood = type === 'bed_pink' ? 0xf6dce3 : 0xd3a776;
      addBox(g, 1.8, 0.22, 1.9, wood, 0, 0.18, 0);
      addBox(g, 1.85, 0.85, 0.14, wood, 0, 0.50, -0.92); // headboard
      addBox(g, 1.68, 0.24, 1.76, 0xffffff, 0, 0.38, 0.02, 0.82); // mattress
      addBox(g, 1.72, 0.18, 1.20, quilt, 0, 0.48, 0.30, 0.85); // quilt
      // Two fluffy pillows
      [-0.42, 0.42].forEach((px) => {
        const pil = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 10), mat(0xfffdf8, 0.88));
        pil.scale.set(1.1, 0.45, 0.72);
        pil.position.set(px, 0.56, -0.58);
        pil.castShadow = true;
        g.add(pil);
      });
      break;
    }

    case 'bed_bean': {
      // Cozy compact mint pod bed for tiny Naidou!
      addBox(g, 0.96, 0.20, 1.55, 0x9cd6a2, 0, 0.16, 0);
      addBox(g, 0.86, 0.18, 1.42, 0xf8fff6, 0, 0.32, 0, 0.85);
      addBox(g, 0.90, 0.15, 0.92, 0xbce8a8, 0, 0.40, 0.22, 0.85);
      const pil = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), mat(0xfff6bf, 0.85));
      pil.scale.set(1.2, 0.45, 0.75);
      pil.position.set(0, 0.46, -0.45);
      g.add(pil);
      break;
    }

    case 'sofa': {
      // Giant Cheese Beanbag Sofa!
      addBox(g, 2.65, 0.36, 0.95, 0xf8cb4c, 0, 0.24, 0, 0.85);
      addBox(g, 2.65, 0.62, 0.26, 0xf2bc3a, 0, 0.65, -0.36, 0.85);
      addBox(g, 0.28, 0.55, 0.95, 0xf2bc3a, -1.24, 0.46, 0, 0.85);
      addBox(g, 0.28, 0.55, 0.95, 0xf2bc3a, 1.24, 0.46, 0, 0.85);
      // Throw pillows (pink Naifen pillow + mint Naidou pillow!)
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.16), mat(0xf8a6be, 0.88));
      p1.position.set(-0.78, 0.60, -0.14); p1.rotation.z = 0.18; g.add(p1);
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.16), mat(0x8ee29c, 0.88));
      p2.position.set(0.82, 0.60, -0.14); p2.rotation.z = -0.15; g.add(p2);
      break;
    }

    case 'tv': {
      addBox(g, 1.8, 0.46, 0.52, 0xc79563, 0, 0.23, 0);
      addBox(g, 1.46, 0.84, 0.08, 0x262d36, 0, 0.92, 0, 0.35);
      const scr = new THREE.Mesh(
        new THREE.PlaneGeometry(1.34, 0.72),
        new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x38bdf8, emissiveIntensity: 0.45, roughness: 0.2 })
      );
      scr.position.set(0, 0.92, 0.045);
      g.add(scr);
      break;
    }

    case 'fridge': {
      addBox(g, 0.86, 1.85, 0.82, 0xfff8e7, 0, 0.925, 0, 0.35);
      addBox(g, 0.88, 0.03, 0.84, 0xd8cdb8, 0, 1.18, 0.01);
      addBox(g, 0.05, 0.35, 0.05, 0x94a3b8, -0.32, 1.44, 0.43, 0.3);
      addBox(g, 0.05, 0.42, 0.05, 0x94a3b8, -0.32, 0.84, 0.43, 0.3);
      // Cute fridge magnets
      addBox(g, 0.12, 0.12, 0.03, 0xf8d060, 0.18, 1.56, 0.42);
      addBox(g, 0.12, 0.12, 0.03, 0xf8a6be, 0.02, 1.42, 0.42);
      break;
    }

    case 'snack_shelf': {
      // Naishu's iconic Luxury Snack Cabinet!
      addBox(g, 1.75, 1.55, 0.42, 0xd9a870, 0, 0.775, -0.06);
      addBox(g, 1.62, 1.38, 0.08, 0xfff5e0, 0, 0.80, -0.18);
      // Shelves & colorful snack bags / cheese wheels clearly visible from front!
      [0.42, 0.86, 1.28].forEach((sy) => {
        addBox(g, 1.64, 0.05, 0.44, 0xc79258, 0, sy, 0.04);
      });
      const snackColors = [0xff6b6b, 0xf8d060, 0xf8a6be, 0x62d97b, 0x60a5fa];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
          addBox(g, 0.22, 0.28, 0.18, snackColors[(row * 3 + col) % 5], -0.60 + col * 0.30, 0.58 + row * 0.43, 0.14, 0.48);
        }
      }
      break;
    }

    case 'dining_table': {
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.09, 24), mat(0xf6dfba, 0.55));
      top.position.y = 0.72; top.castShadow = true; top.receiveShadow = true; g.add(top);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 0.70, 16), mat(0xd19f6a));
      leg.position.y = 0.35; leg.castShadow = true; g.add(leg);
      // Teapot centerpiece
      const pot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), mat(0xf8a6be, 0.35));
      pot.position.set(0, 0.86, 0); g.add(pot);
      // 3 Cute stools around it
      [0, 2.1, 4.2].forEach((ang) => {
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.08, 16), mat(0xf8d060));
        seat.position.set(Math.cos(ang) * 0.96, 0.44, Math.sin(ang) * 0.96);
        seat.castShadow = true; g.add(seat);
        const sleg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.42, 10), mat(0xc69663));
        sleg.position.set(Math.cos(ang) * 0.96, 0.21, Math.sin(ang) * 0.96);
        g.add(sleg);
      });
      break;
    }

    case 'pc_desk': {
      addBox(g, 1.72, 0.08, 0.78, 0xe8d0ad, 0, 0.74, 0);
      [-0.78, 0.78].forEach((lx) => addBox(g, 0.08, 0.72, 0.70, 0xc79d6c, lx, 0.36, 0));
      // Monitor + glowing screen
      addBox(g, 0.76, 0.48, 0.05, 0x263140, -0.1, 1.12, -0.18, 0.3);
      addBox(g, 0.10, 0.16, 0.08, 0x475569, -0.1, 0.84, -0.18);
      const mon = new THREE.Mesh(
        new THREE.PlaneGeometry(0.68, 0.40),
        new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 0.45 })
      );
      mon.position.set(-0.1, 1.12, -0.15);
      g.add(mon);
      // Keyboard & desk lamp
      addBox(g, 0.46, 0.03, 0.16, 0xf8fafc, -0.1, 0.79, 0.12);
      const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.18, 14), mat(0xf8d060, 0.4));
      lamp.position.set(0.60, 1.14, -0.18); g.add(lamp);
      addBox(g, 0.04, 0.36, 0.04, 0x94a3b8, 0.60, 0.94, -0.22);
      break;
    }

    case 'easel': {
      // Wooden A-frame easel + framed Starry Naiwa canvas!
      const leg1 = addBox(g, 0.06, 1.65, 0.06, 0xb8824d, -0.32, 0.78, 0);
      leg1.rotation.z = -0.12; leg1.rotation.x = -0.12;
      const leg2 = addBox(g, 0.06, 1.65, 0.06, 0xb8824d, 0.32, 0.78, 0);
      leg2.rotation.z = 0.12; leg2.rotation.x = -0.12;
      const leg3 = addBox(g, 0.06, 1.55, 0.06, 0xb8824d, 0, 0.74, -0.45);
      leg3.rotation.x = 0.32;
      addBox(g, 0.82, 0.06, 0.12, 0xb8824d, 0, 0.78, 0.06);
      const canvasMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.76, 0.76, 0.04),
        [
          mat(0xf5f0e4), mat(0xf5f0e4), mat(0xf5f0e4), mat(0xf5f0e4),
          new THREE.MeshStandardMaterial({ map: createNaiwaArtTexture('starry'), roughness: 0.6 }),
          mat(0xede4d0),
        ]
      );
      canvasMesh.position.set(0, 1.18, 0.02);
      canvasMesh.rotation.x = -0.14;
      canvasMesh.castShadow = true;
      g.add(canvasMesh);
      break;
    }

    case 'bookshelf': {
      addBox(g, 1.65, 1.75, 0.44, 0xbc8856, 0, 0.875, 0);
      addBox(g, 1.52, 1.60, 0.36, 0x8f6239, 0, 0.88, 0.06);
      const bookCols = [0xef4444, 0x3b82f6, 0xf8d060, 0x22c55e, 0xf472b6, 0xa855f7];
      [0.36, 0.78, 1.20, 1.56].forEach((by, r) => {
        addBox(g, 1.52, 0.04, 0.38, 0xbc8856, 0, by - 0.16, 0.04);
        for (let i = 0; i < 8; i++) {
          const bh = 0.24 + ((i + r) % 3) * 0.04;
          addBox(g, 0.13, bh, 0.24, bookCols[(i + r * 2) % bookCols.length], -0.60 + i * 0.17, by, 0.06, 0.6);
        }
      });
      break;
    }

    case 'toilet': {
      addBox(g, 0.56, 0.44, 0.64, 0xffffff, 0, 0.22, 0.05, 0.25);
      addBox(g, 0.54, 0.52, 0.24, 0xf8fafc, 0, 0.66, -0.22, 0.25);
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.42, 16), mat(0xffffff, 0.22));
      bowl.position.set(0, 0.24, 0.14); bowl.castShadow = true; g.add(bowl);
      break;
    }

    case 'shower': {
      addBox(g, 1.78, 0.54, 0.86, 0xffffff, 0, 0.27, 0, 0.22);
      addBox(g, 1.60, 0.12, 0.70, 0xbae6fd, 0, 0.50, 0, 0.18); // bubble water!
      // Tiny yellow rubber ducky!
      const duck = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), mat(0xf8d060, 0.4));
      duck.position.set(0.36, 0.58, 0.05); g.add(duck);
      // Chrome shower rod
      addBox(g, 0.05, 1.65, 0.05, 0xcbd5e1, -0.78, 0.90, -0.34, 0.25);
      addBox(g, 0.26, 0.05, 0.05, 0xcbd5e1, -0.66, 1.70, -0.34, 0.25);
      break;
    }

    case 'arcade': {
      addBox(g, 0.82, 1.65, 0.78, 0x3b82f6, 0, 0.825, 0, 0.45);
      addBox(g, 0.78, 0.26, 0.12, 0xf8d060, 0, 1.54, 0.36, 0.3);
      const scr = new THREE.Mesh(
        new THREE.PlaneGeometry(0.62, 0.48),
        new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xec4899, emissiveIntensity: 0.55 })
      );
      scr.position.set(0, 1.15, 0.40); g.add(scr);
      addBox(g, 0.76, 0.14, 0.28, 0x1e293b, 0, 0.82, 0.46);
      const stick = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mat(0xef4444, 0.3));
      stick.position.set(-0.18, 0.94, 0.48); g.add(stick);
      break;
    }

    case 'pink_cushion': {
      const heartShape = new THREE.Shape();
      heartShape.moveTo(0, -0.32);
      heartShape.bezierCurveTo(0.45, 0.05, 0.55, 0.48, 0.22, 0.54);
      heartShape.bezierCurveTo(0.06, 0.56, 0, 0.40, 0, 0.34);
      heartShape.bezierCurveTo(0, 0.40, -0.06, 0.56, -0.22, 0.54);
      heartShape.bezierCurveTo(-0.55, 0.48, -0.45, 0.05, 0, -0.32);
      const mesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(heartShape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.08, bevelSegments: 4 }),
        mat(0xf89bb8, 0.85)
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, 0.12, 0.1);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      break;
    }

    case 'swing': {
      addBox(g, 0.10, 1.75, 0.10, 0xb8824d, -0.85, 0.875, 0);
      addBox(g, 0.10, 1.75, 0.10, 0xb8824d, 0.85, 0.875, 0);
      addBox(g, 1.95, 0.10, 0.12, 0xb8824d, 0, 1.74, 0);
      // Hanging bench
      addBox(g, 1.25, 0.09, 0.52, 0xf8d060, 0, 0.54, 0);
      addBox(g, 1.25, 0.36, 0.08, 0xf8d060, 0, 0.76, -0.22);
      [-0.56, 0.56].forEach((rx) => addBox(g, 0.025, 1.15, 0.025, 0x94a3b8, rx, 1.14, 0));
      break;
    }

    case 'plant': {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.36, 16), mat(0xd98a5f, 0.72));
      pot.position.y = 0.18; pot.castShadow = true; g.add(pot);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mat(0x3ba85d, 0.65));
        leaf.scale.set(1.1, 0.35, 1.5);
        leaf.position.set(Math.cos(ang) * 0.22, 0.52 + (i % 2) * 0.16, Math.sin(ang) * 0.22);
        leaf.rotation.y = -ang;
        leaf.rotation.z = 0.35;
        leaf.castShadow = true;
        g.add(leaf);
      }
      break;
    }

    case 'mailbox': {
      addBox(g, 0.12, 1.05, 0.12, 0xb8824d, 0, 0.52, 0);
      addBox(g, 0.42, 0.30, 0.54, 0xf8d060, 0, 1.12, 0, 0.45);
      addBox(g, 0.04, 0.22, 0.08, 0xef4444, 0.24, 1.20, 0.06); // red flag!
      break;
    }

    default:
      addBox(g, 0.9, 0.7, 0.9, 0xf8d060, 0, 0.35, 0);
  }

  g.position.set(item.x, 0, item.z);
  g.rotation.y = item.rot || 0;
  g.userData = { pickType: 'furniture', furnitureId: item.id };
  g.traverse((obj) => {
    if (obj.isMesh) {
      obj.userData.pickType = 'furniture';
      obj.userData.furnitureId = item.id;
    }
  });
  return g;
}
