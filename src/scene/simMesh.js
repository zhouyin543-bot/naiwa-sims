import * as THREE from 'three';

function clayMat(color, roughness = 0.72) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
  });
}

function buildLathePear(height, maxRadius, topRadius, segments = 28) {
  // Smooth continuous pear-shaped silhouette (head + torso一体成型, zero neck seam!)
  const pts = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 = bottom, 1 = crown
    const y = t * height;
    let r;
    if (t < 0.08) {
      // Rounded bottom base
      const u = t / 0.08;
      r = Math.sin(u * Math.PI * 0.5) * maxRadius * 0.78;
    } else if (t < 0.48) {
      // Plump belly bulge
      const u = (t - 0.08) / 0.40;
      r = maxRadius * (0.78 + 0.22 * Math.sin(u * Math.PI * 0.65));
    } else if (t < 0.85) {
      // Smooth pear taper up into head
      const u = (t - 0.48) / 0.37;
      r = maxRadius * (1 - u) + topRadius * u;
    } else {
      // Smooth dome top of head
      const u = (t - 0.85) / 0.15;
      r = Math.cos(u * Math.PI * 0.5) * topRadius;
    }
    pts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

function buildEyePair(eyeRingColor, radius = 0.095, spacing = 0.16, y = 1.05, z = 0.25) {
  const group = new THREE.Group();
  const ringMat = clayMat(eyeRingColor, 0.45);
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.15, metalness: 0.05 });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const eyes = [];
  [-1, 1].forEach((side) => {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(side * spacing, y, z);

    // Protruding green-ringed sclera
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 14), ringMat);
    sclera.scale.set(1.0, 1.0, 0.72);
    eyeGroup.add(sclera);

    // Glossy black pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.54, 16, 12), pupilMat);
    pupil.position.set(0, 0, radius * 0.52);
    pupil.scale.set(1.0, 1.0, 0.55);
    eyeGroup.add(pupil);

    // Catchlight sparkle
    const glint = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.20, 10, 8), glintMat);
    glint.position.set(-radius * 0.22, radius * 0.24, radius * 0.76);
    eyeGroup.add(glint);

    group.add(eyeGroup);
    eyes.push(eyeGroup);
  });

  return { group, eyes };
}

function buildMouthVariants(y, z, width = 0.15, color = 0x5c2228) {
  const container = new THREE.Group();
  container.position.set(0, y, z);

  // 1. Neutral cute smile arc
  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-width, 0.018, 0.01),
    new THREE.Vector3(0, -0.032, 0.028),
    new THREE.Vector3(width, 0.018, 0.01),
  ]);
  const smile = new THREE.Mesh(
    new THREE.TubeGeometry(smileCurve, 12, 0.019, 8, false),
    clayMat(0x4a331d, 0.55)
  );
  container.add(smile);

  // 2. Wide maniacal open laugh mouth
  const laughGroup = new THREE.Group();
  const cavity = new THREE.Mesh(
    new THREE.SphereGeometry(width * 0.92, 16, 12),
    clayMat(color, 0.5)
  );
  cavity.scale.set(1.15, 0.85, 0.35);
  laughGroup.add(cavity);
  const teeth = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.45, width * 0.22, 0.03),
    clayMat(0xffffff, 0.35)
  );
  teeth.position.set(0, width * 0.42, 0.025);
  laughGroup.add(teeth);
  const tongue = new THREE.Mesh(
    new THREE.SphereGeometry(width * 0.48, 12, 10),
    clayMat(0xf0758c, 0.5)
  );
  tongue.position.set(0, -width * 0.36, 0.02);
  tongue.scale.set(1.1, 0.55, 0.5);
  laughGroup.add(tongue);
  laughGroup.visible = false;
  container.add(laughGroup);

  // 3. Grumpy frown (Naifen signature!)
  const frownCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-width * 0.85, -0.025, 0),
    new THREE.Vector3(0, 0.02, 0.015),
    new THREE.Vector3(width * 0.85, -0.025, 0),
  ]);
  const frown = new THREE.Mesh(
    new THREE.TubeGeometry(frownCurve, 12, 0.014, 8, false),
    clayMat(0x6e2a40, 0.6)
  );
  frown.visible = false;
  container.add(frown);

  // 4. Shocked O-mouth
  const shock = new THREE.Mesh(
    new THREE.TorusGeometry(width * 0.42, 0.016, 10, 16),
    clayMat(color, 0.5)
  );
  shock.visible = false;
  container.add(shock);

  return { container, smile, laughGroup, frown, shock };
}

function buildEyebrows(y, z, spacing, color = 0x8d4259) {
  const grp = new THREE.Group();
  const mat = clayMat(color, 0.6);
  const left = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.10, 6, 8), mat);
  left.position.set(-spacing, y, z);
  left.rotation.z = Math.PI / 2 - 0.22;
  const right = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.10, 6, 8), mat);
  right.position.set(spacing, y, z);
  right.rotation.z = Math.PI / 2 + 0.22;
  grp.add(left, right);
  return { grp, left, right };
}

function buildLimb(length, radiusTop, radiusBot, bodyColor, tipColor) {
  const pivot = new THREE.Group();
  const upper = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBot, length * 0.65, 14),
    clayMat(bodyColor)
  );
  upper.position.y = -length * 0.32;
  upper.castShadow = true;
  pivot.add(upper);

  const hand = new THREE.Mesh(
    new THREE.SphereGeometry(radiusBot * 1.15, 14, 12),
    clayMat(tipColor, 0.78)
  );
  hand.position.y = -length * 0.68;
  hand.scale.set(1.0, 0.85, 1.15);
  hand.castShadow = true;
  pivot.add(hand);

  return pivot;
}

export function createSimRig(template) {
  const root = new THREE.Group();
  root.userData = { pickType: 'sim', simId: template.id };

  const bodyRig = new THREE.Group();
  root.add(bodyRig);

  const p = template.palette;
  let leftArm = null;
  let rightArm = null;
  let leftLeg = null;
  let rightLeg = null;
  let leftEar = null;
  let rightEar = null;
  let tail = null;
  let eyeSet = null;
  let mouths = null;
  let brows = null;
  let headHeight = 1.65;

  if (template.species === 'naiwa' || template.species === 'naifen') {
    // Classic seamless pear-shaped Naiwa / Naifen!
    const torso = new THREE.Mesh(buildLathePear(1.22, 0.44, 0.27), clayMat(p.body));
    torso.position.y = 0.28;
    torso.castShadow = true;
    torso.receiveShadow = true;
    bodyRig.add(torso);

    // Cream oval belly patch
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 16), clayMat(p.belly, 0.78));
    belly.position.set(0, 0.68, 0.14);
    belly.scale.set(0.95, 0.92, 0.84);
    bodyRig.add(belly);

    // Protruding frog eyes
    eyeSet = buildEyePair(p.eyeRing, 0.095, 0.155, 1.24, 0.21);
    bodyRig.add(eyeSet.group);

    mouths = buildMouthVariants(1.08, 0.29, 0.13);
    bodyRig.add(mouths.container);

    // Expressive eyebrows (shown primarily for Naifen / angry / mischief states)
    brows = buildEyebrows(1.36, 0.24, 0.15, template.species === 'naifen' ? 0x9b3e5b : 0x6c5e43);
    brows.grp.visible = template.species === 'naifen';
    bodyRig.add(brows.grp);

    // Articulated arms with dark olive-brown / dusty-plum hands
    leftArm = buildLimb(0.56, 0.095, 0.075, p.body, p.limbs);
    leftArm.position.set(-0.37, 0.98, 0.02);
    leftArm.rotation.z = 0.22;
    bodyRig.add(leftArm);

    rightArm = buildLimb(0.56, 0.095, 0.075, p.body, p.limbs);
    rightArm.position.set(0.37, 0.98, 0.02);
    rightArm.rotation.z = -0.22;
    bodyRig.add(rightArm);

    // Legs & flat frog feet
    leftLeg = buildLimb(0.38, 0.12, 0.085, p.body, p.limbs);
    leftLeg.position.set(-0.20, 0.34, 0);
    bodyRig.add(leftLeg);

    rightLeg = buildLimb(0.38, 0.12, 0.085, p.body, p.limbs);
    rightLeg.position.set(0.20, 0.34, 0);
    bodyRig.add(rightLeg);

    headHeight = 1.62;
  } else if (template.species === 'naishu') {
    // Plump adorable Naishu with HUGE circular pink-inner ears & thin curved tail!
    const torso = new THREE.Mesh(buildLathePear(1.04, 0.42, 0.29), clayMat(p.body));
    torso.position.y = 0.22;
    torso.castShadow = true;
    torso.receiveShadow = true;
    bodyRig.add(torso);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.33, 20, 16), clayMat(p.belly, 0.78));
    belly.position.set(0, 0.56, 0.15);
    belly.scale.set(0.95, 0.88, 0.82);
    bodyRig.add(belly);

    // HUGE round circular mouse ears!
    const earOuterMat = clayMat(p.body);
    const earInnerMat = clayMat(p.earInner || 0xf4a582, 0.76);
    [-1, 1].forEach((side) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(side * 0.30, 1.24, 0.0);
      earPivot.rotation.z = -side * 0.25;
      earPivot.rotation.y = side * 0.18;

      const outer = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 14), earOuterMat);
      outer.scale.set(1.0, 1.0, 0.30);
      outer.castShadow = true;
      earPivot.add(outer);

      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 12), earInnerMat);
      inner.scale.set(1.0, 1.0, 0.24);
      inner.position.set(0, 0, 0.045);
      earPivot.add(inner);

      bodyRig.add(earPivot);
      if (side === -1) leftEar = earPivot;
      else rightEar = earPivot;
    });

    eyeSet = buildEyePair(p.eyeRing, 0.088, 0.15, 1.04, 0.24);
    bodyRig.add(eyeSet.group);

    mouths = buildMouthVariants(0.90, 0.31, 0.11);
    bodyRig.add(mouths.container);

    brows = buildEyebrows(1.16, 0.26, 0.14, 0x7a5c32);
    brows.grp.visible = false;
    bodyRig.add(brows.grp);

    // Cute shorter paws
    leftArm = buildLimb(0.42, 0.085, 0.068, p.body, p.limbs);
    leftArm.position.set(-0.34, 0.80, 0.06);
    leftArm.rotation.z = 0.26;
    bodyRig.add(leftArm);

    rightArm = buildLimb(0.42, 0.085, 0.068, p.body, p.limbs);
    rightArm.position.set(0.34, 0.80, 0.06);
    rightArm.rotation.z = -0.26;
    bodyRig.add(rightArm);

    leftLeg = buildLimb(0.28, 0.105, 0.08, p.body, p.limbs);
    leftLeg.position.set(-0.17, 0.24, 0);
    bodyRig.add(leftLeg);

    rightLeg = buildLimb(0.28, 0.105, 0.08, p.body, p.limbs);
    rightLeg.position.set(0.17, 0.24, 0);
    bodyRig.add(rightLeg);

    // Curved thin yellow mouse tail
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.30, -0.34),
      new THREE.Vector3(0.05, 0.22, -0.62),
      new THREE.Vector3(0.26, 0.24, -0.82),
      new THREE.Vector3(0.44, 0.34, -0.76),
    ]);
    tail = new THREE.Mesh(
      new THREE.TubeGeometry(tailCurve, 18, 0.032, 8, false),
      clayMat(p.body)
    );
    tail.castShadow = true;
    bodyRig.add(tail);

    headHeight = 1.56;
  } else {
    // Naidou (奶豆): Tiny irresistibly round yellow bean with 98% brain & super-short stubby legs!
    const bean = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 18), clayMat(p.body));
    bean.position.y = 0.44;
    bean.scale.set(1.06, 0.96, 1.0);
    bean.castShadow = true;
    bean.receiveShadow = true;
    bodyRig.add(bean);

    eyeSet = buildEyePair(p.eyeRing, 0.082, 0.165, 0.49, 0.30);
    bodyRig.add(eyeSet.group);

    mouths = buildMouthVariants(0.36, 0.35, 0.09);
    bodyRig.add(mouths.container);

    brows = buildEyebrows(0.60, 0.31, 0.15, 0x7d6528);
    brows.grp.visible = false;
    bodyRig.add(brows.grp);

    // Super stubby cute feet
    const footGeo = new THREE.CapsuleGeometry(0.062, 0.08, 6, 10);
    const footMat = clayMat(p.body);
    leftLeg = new THREE.Group();
    leftLeg.position.set(-0.14, 0.16, 0);
    const lf = new THREE.Mesh(footGeo, footMat);
    lf.position.y = -0.06;
    lf.castShadow = true;
    leftLeg.add(lf);
    bodyRig.add(leftLeg);

    rightLeg = new THREE.Group();
    rightLeg.position.set(0.14, 0.16, 0);
    const rf = new THREE.Mesh(footGeo, footMat);
    rf.position.y = -0.06;
    rf.castShadow = true;
    rightLeg.add(rf);
    bodyRig.add(rightLeg);

    headHeight = 1.02;
  }

  // Soft blush cheeks (shown during cuddle / happy!)
  const cheekMat = new THREE.MeshBasicMaterial({ color: 0xff7da4, transparent: true, opacity: 0.45 });
  const cheekGrp = new THREE.Group();
  const cheekY = template.species === 'naidou' ? 0.41 : template.species === 'naishu' ? 0.96 : 1.15;
  const cheekZ = template.species === 'naidou' ? 0.31 : 0.27;
  [-1, 1].forEach((s) => {
    const c = new THREE.Mesh(new THREE.CircleGeometry(0.055, 14), cheekMat);
    c.position.set(s * 0.21, cheekY, cheekZ);
    c.rotation.y = s * 0.32;
    cheekGrp.add(c);
  });
  cheekGrp.visible = false;
  bodyRig.add(cheekGrp);

  // Authentic rotating glowing Sims Plumbob above head!
  const plumbobGeo = new THREE.OctahedronGeometry(0.16, 0);
  plumbobGeo.scale(0.65, 1.35, 0.65);
  const plumbobMat = new THREE.MeshStandardMaterial({
    color: 0x2de06b,
    emissive: 0x1ac754,
    emissiveIntensity: 0.55,
    roughness: 0.18,
    metalness: 0.12,
    transparent: true,
    opacity: 0.92,
  });
  const plumbob = new THREE.Mesh(plumbobGeo, plumbobMat);
  plumbob.position.y = headHeight + 0.42;
  plumbob.visible = false;
  root.add(plumbob);

  // Subtle selection ground ring
  const selRing = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.52, 32),
    new THREE.MeshBasicMaterial({ color: 0x2cc764, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
  );
  selRing.rotation.x = -Math.PI / 2;
  selRing.position.y = 0.03;
  selRing.visible = false;
  root.add(selRing);

  // Special FX markers: pink heart / golden lightbulb / green stink puff
  const fxGroup = new THREE.Group();
  fxGroup.position.y = headHeight + 0.12;
  root.add(fxGroup);

  // 3D floating heart for Naifen x Naishu cuddles
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, -0.08);
  heartShape.bezierCurveTo(0.12, 0.02, 0.16, 0.14, 0.06, 0.16);
  heartShape.bezierCurveTo(0.02, 0.17, 0, 0.12, 0, 0.10);
  heartShape.bezierCurveTo(0, 0.12, -0.02, 0.17, -0.06, 0.16);
  heartShape.bezierCurveTo(-0.16, 0.14, -0.12, 0.02, 0, -0.08);
  const heartFx = new THREE.Mesh(
    new THREE.ExtrudeGeometry(heartShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3 }),
    new THREE.MeshStandardMaterial({ color: 0xff5e98, emissive: 0xff3b80, emissiveIntensity: 0.45, roughness: 0.3 })
  );
  heartFx.visible = false;
  fxGroup.add(heartFx);

  // Brain lightbulb for Naidou / Logic actions
  const bulbFx = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 12),
    new THREE.MeshStandardMaterial({ color: 0xfff066, emissive: 0xffd700, emissiveIntensity: 0.85, roughness: 0.2 })
  );
  bulbFx.visible = false;
  fxGroup.add(bulbFx);

  // Tag all child meshes for easy raycasting
  root.traverse((obj) => {
    if (obj.isMesh) {
      obj.userData.pickType = 'sim';
      obj.userData.simId = template.id;
    }
  });

  // Ground shadow blob for extra visual groundedness
  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(template.species === 'naidou' ? 0.32 : 0.44, 20),
    new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.16, depthWrite: false })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.015;
  root.add(shadowDisc);

  let blinkTimer = 1.5 + Math.random() * 3.0;
  let animPhase = Math.random() * 6.28;

  function setMouth(mode) {
    if (!mouths) return;
    mouths.smile.visible = mode === 'smile';
    mouths.laughGroup.visible = mode === 'laugh';
    mouths.frown.visible = mode === 'frown';
    mouths.shock.visible = mode === 'shock';
  }

  function updateVisual(dt, state) {
    animPhase += dt;

    // Reset default transforms gently
    bodyRig.position.set(0, 0, 0);
    bodyRig.rotation.set(0, 0, 0);
    bodyRig.scale.set(1, 1, 1);

    // Plumbob & selection ring
    plumbob.visible = state.isSelected;
    selRing.visible = state.isSelected;
    if (state.isSelected) {
      plumbob.rotation.y += dt * 2.2;
      plumbob.position.y = headHeight + 0.44 + Math.sin(animPhase * 3.2) * 0.07;
      plumbobMat.color.setHex(state.plumbobColor || 0x2de06b);
      plumbobMat.emissive.setHex(state.plumbobColor || 0x2de06b);
      selRing.material.color.setHex(state.plumbobColor || 0x2de06b);
    }

    // Blinking
    blinkTimer -= dt;
    let eyeScaleY = 1.0;
    if (state.anim === 'sleep') {
      eyeScaleY = 0.14;
    } else if (blinkTimer <= 0) {
      eyeScaleY = 0.12;
      if (blinkTimer < -0.11) blinkTimer = 2.2 + Math.random() * 3.2;
    }
    if (eyeSet) {
      eyeSet.eyes.forEach((e) => { e.scale.y = eyeScaleY; });
    }

    // Default eyebrows & cheeks
    cheekGrp.visible = state.anim === 'cuddle' || state.mood === 'playful';
    if (brows) {
      const showGrumpy = state.mood === 'angry' || state.anim === 'prank' || state.anim === 'squash' || (template.species === 'naifen' && state.anim !== 'cuddle');
      brows.grp.visible = showGrumpy;
      if (showGrumpy) {
        brows.left.rotation.z = Math.PI / 2 - (state.anim === 'prank' || state.mood === 'angry' ? 0.34 : 0.16);
        brows.right.rotation.z = Math.PI / 2 + (state.anim === 'prank' || state.mood === 'angry' ? 0.34 : 0.16);
      }
    }

    // FX icons
    heartFx.visible = state.anim === 'cuddle' || state.anim === 'leash';
    if (heartFx.visible) {
      heartFx.position.y = 0.15 + Math.sin(animPhase * 4.5) * 0.10;
      heartFx.rotation.y = animPhase * 2.4;
    }
    bulbFx.visible = state.anim === 'work' || (template.species === 'naidou' && state.mood === 'focused');
    if (bulbFx.visible) {
      bulbFx.position.y = 0.18 + Math.sin(animPhase * 3.5) * 0.06;
    }

    // Limb base reset
    if (leftArm)  { leftArm.rotation.set(0, 0, 0.22); }
    if (rightArm) { rightArm.rotation.set(0, 0, -0.22); }
    if (leftLeg)  { leftLeg.rotation.set(0, 0, 0); }
    if (rightLeg) { rightLeg.rotation.set(0, 0, 0); }
    if (leftEar)  { leftEar.rotation.x = 0; }
    if (rightEar) { rightEar.rotation.x = 0; }

    // Pose & animation modes
    if (state.isMoving) {
      const freq = template.species === 'naidou' ? 14 : 9.5;
      const s = Math.sin(animPhase * freq);
      bodyRig.position.y = Math.abs(s) * 0.08;
      bodyRig.rotation.z = s * 0.07;
      if (leftLeg) leftLeg.rotation.x = s * 0.55;
      if (rightLeg) rightLeg.rotation.x = -s * 0.55;
      if (leftArm) leftArm.rotation.x = -s * 0.45;
      if (rightArm) rightArm.rotation.x = s * 0.45;
      if (leftEar) leftEar.rotation.x = s * 0.16;
      if (rightEar) rightEar.rotation.x = -s * 0.16;
      if (tail) tail.rotation.y = s * 0.32;
      setMouth(state.mood === 'angry' ? 'frown' : 'smile');
    } else if (state.anim === 'laugh') {
      // Signature Naiwa doubling-over belly laugh!
      const s = Math.sin(animPhase * 18);
      bodyRig.rotation.x = 0.20 + s * 0.12;
      bodyRig.position.y = Math.abs(s) * 0.07;
      bodyRig.scale.set(1 + s * 0.04, 1 - s * 0.05, 1 + s * 0.04);
      if (leftArm)  { leftArm.rotation.set(-0.65, 0, -0.52); }
      if (rightArm) { rightArm.rotation.set(-0.65, 0, 0.52); }
      if (leftEar)  { leftEar.rotation.x = s * 0.25; }
      if (rightEar) { rightEar.rotation.x = -s * 0.25; }
      setMouth('laugh');
    } else if (state.anim === 'squashed') {
      // Naishu flattened into pancake and BOINGING back!
      const cycle = (animPhase * 1.4) % 1.0;
      if (cycle < 0.45) {
        bodyRig.scale.set(1.58, 0.24, 1.58);
        setMouth('shock');
      } else {
        const u = (cycle - 0.45) / 0.55;
        const bounce = Math.sin(u * Math.PI * 2.5) * Math.exp(-u * 3.5);
        bodyRig.scale.set(1 - bounce * 0.25, 1 + bounce * 0.35, 1 - bounce * 0.25);
        bodyRig.position.y = Math.max(0, bounce) * 0.35;
        setMouth('shock');
      }
    } else if (state.anim === 'squash_jumper') {
      // Naifen jumping gleefully during squash prank!
      const cycle = (animPhase * 1.4) % 1.0;
      const jumpY = cycle < 0.45 ? Math.sin((cycle / 0.45) * Math.PI) * 0.85 : 0;
      bodyRig.position.y = jumpY;
      if (leftArm)  leftArm.rotation.z = 1.2;
      if (rightArm) rightArm.rotation.z = -1.2;
      setMouth('laugh');
    } else if (state.anim === 'cuddle') {
      const sway = Math.sin(animPhase * 3.2) * 0.08;
      bodyRig.rotation.z = sway;
      if (leftArm)  { leftArm.rotation.set(-0.8, 0, -0.25); }
      if (rightArm) { rightArm.rotation.set(-0.8, 0, 0.25); }
      if (tail) tail.rotation.y = Math.sin(animPhase * 8) * 0.35;
      setMouth('smile');
    } else if (state.anim === 'leash') {
      const strut = Math.sin(animPhase * 7);
      bodyRig.position.y = Math.abs(strut) * 0.06;
      bodyRig.rotation.z = strut * 0.09;
      if (rightArm) rightArm.rotation.set(-0.65, 0, -0.35);
      setMouth('smile');
    } else if (state.anim === 'sleep') {
      bodyRig.position.y = 0.52;
      bodyRig.rotation.x = -Math.PI / 2;
      const breathe = Math.sin(animPhase * 1.8) * 0.03;
      bodyRig.scale.set(1 + breathe, 1, 1 - breathe);
      setMouth('smile');
    } else if (state.anim === 'sit') {
      bodyRig.position.y = -0.12;
      if (leftLeg) leftLeg.rotation.x = -1.1;
      if (rightLeg) rightLeg.rotation.x = -1.1;
      setMouth('smile');
    } else if (state.anim === 'eat' || state.anim === 'work' || state.anim === 'interact' || state.anim === 'talk') {
      const s = Math.sin(animPhase * 7.5);
      if (leftArm)  leftArm.rotation.set(-0.7 + s * 0.25, 0, -0.15);
      if (rightArm) rightArm.rotation.set(-0.7 - s * 0.25, 0, 0.15);
      bodyRig.scale.set(1 + s * 0.02, 1 - s * 0.02, 1);
      if (leftEar) leftEar.rotation.x = s * 0.12;
      if (rightEar) rightEar.rotation.x = -s * 0.12;
      setMouth(s > 0.25 ? 'laugh' : 'smile');
    } else if (state.anim === 'prank') {
      const s = Math.sin(animPhase * 12);
      bodyRig.rotation.z = s * 0.10;
      if (leftArm)  leftArm.rotation.set(-1.0, 0, 0.4);
      if (rightArm) rightArm.rotation.set(-1.0, 0, -0.4);
      setMouth('laugh');
    } else {
      // Gentle squishy breathing idle
      const br = Math.sin(animPhase * 2.4) * 0.025;
      bodyRig.scale.set(1 + br, 1 - br, 1 + br);
      if (tail) tail.rotation.y = Math.sin(animPhase * 2.5) * 0.15;
      setMouth(state.mood === 'angry' || state.mood === 'sad' ? 'frown' : 'smile');
    }
  }

  return {
    root,
    headHeight,
    updateVisual,
  };
}
