import {
  CHARACTER_TEMPLATES,
  NEED_META,
  MOOD_STYLES,
  createInitialRelationships,
  relKey,
} from '../data/characters.js';
import { FURNITURE_CATALOG, INITIAL_FURNITURE } from '../data/furniture.js';
import { SOCIAL_INTERACTIONS } from '../data/interactions.js';
import { RANDOM_EVENTS } from '../data/events.js';
import { sfx } from '../audio/sfx.js';

const SAVE_KEY = 'naiwa_sims_3d_save_v1';
const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export class SimEngine {
  constructor(pathGrid, callbacks = {}) {
    this.pathGrid = pathGrid;
    this.cb = callbacks; // onToast, onFloatText, onEventModal, onFurnitureChanged, onThemeChanged, onStateDirty

    this.speed = 1; // 0, 1, 2, 3
    this.autonomy = true;
    this.day = 1;
    this.hour = 8.5; // 08:30 AM start
    this.funds = 1200;
    this.roomTheme = 'cream';
    this.selectedSimId = 'naiwa';

    this.furniture = [];
    this.sims = {};
    this.relationships = createInitialRelationships();

    this.activeEvent = null;
    this.nextEventHours = 3.5; // First random event happens ~3.5 sim hours in
    this.usedEventIds = new Set();
    this.naifenVisitTimer = 0.25; // Naifen knocks shortly after game starts!
    this.lastAutoSaveHour = 8;
    this.activeLeash = null; // { leaderId, followerId }

    this.initFreshState();
    this.loadFromStorage();
  }

  initFreshState() {
    this.day = 1;
    this.hour = 8.5;
    this.funds = 1200;
    this.roomTheme = 'cream';
    this.selectedSimId = 'naiwa';
    this.relationships = createInitialRelationships();
    this.furniture = INITIAL_FURNITURE.map((f) => ({ ...f }));
    this.pathGrid.rebuild(this.furniture);

    this.sims = {};
    Object.values(CHARACTER_TEMPLATES).forEach((tpl) => {
      this.sims[tpl.id] = {
        id: tpl.id,
        name: tpl.name,
        species: tpl.species,
        playable: tpl.playable,
        isNeighbor: tpl.isNeighbor,
        visiting: !tpl.isNeighbor,
        visitDurationLeft: 0,
        atWork: false,
        workHoursLeft: 0,
        x: tpl.spawn.x,
        z: tpl.spawn.z,
        rotY: 0,
        path: [],
        speed: tpl.species === 'naidou' ? 2.15 : 2.55,
        needs: {
          hunger: 76 + Math.random() * 14,
          bladder: 80 + Math.random() * 14,
          energy: 82 + Math.random() * 12,
          social: 68 + Math.random() * 16,
          hygiene: 84 + Math.random() * 12,
          fun: 72 + Math.random() * 16,
        },
        skills: {
          comedy: { level: tpl.id === 'naiwa' ? 2 : 1, xp: 15 },
          cooking: { level: tpl.id === 'naishu' ? 2 : 1, xp: 15 },
          logic: { level: tpl.id === 'naidou' ? 2 : 1, xp: 20 },
          painting: { level: 1, xp: 10 },
          charisma: { level: tpl.id === 'naifen' ? 2 : 1, xp: 15 },
        },
        career: { ...tpl.career },
        stats: {
          laughs: 0,
          paintings: 0,
          snacks: 0,
          research: 0,
          cuddles: 0,
          pranks: 0,
          naifenMovedIn: 0,
        },
        moodlets: [
          { id: 'new_day', label: '搬进奶家洋房', icon: '🏡', mood: 'happy', weight: 1, hours: 6 },
        ],
        mood: 'happy',
        queue: [],
        currentTask: null,
        anim: 'idle',
        idleTimer: 2 + Math.random() * 3,
        speech: null,
      };
    });
    // Naifen starts off-lot at her pink house next door until she walks over
    this.sims.naifen.visiting = false;
    this.sims.naifen.x = 10.2;
    this.sims.naifen.z = 9.2;
  }

  getPlayableSims() {
    return Object.values(this.sims).filter((s) => s.playable);
  }

  forEachPlayable(fn) {
    this.getPlayableSims().forEach(fn);
  }

  getSelectedSim() {
    return this.sims[this.selectedSimId] || this.sims.naiwa;
  }

  selectSim(id) {
    if (this.sims[id] && this.sims[id].playable) {
      this.selectedSimId = id;
      sfx.click();
      this.emitDirty();
    }
  }

  getRelation(a, b) {
    const k = relKey(a, b);
    if (!this.relationships[k]) this.relationships[k] = { friendship: 15, bond: 5 };
    return this.relationships[k];
  }

  adjustRelation(a, b, dFriend, dBond = 0) {
    if (a === b) return;
    const rel = this.getRelation(a, b);
    rel.friendship = Math.max(-100, Math.min(100, Math.round(rel.friendship + dFriend)));
    rel.bond = Math.max(0, Math.min(100, Math.round(rel.bond + dBond)));

    const sim = this.sims[a];
    if (sim && (dFriend !== 0 || dBond !== 0)) {
      const parts = [];
      if (dFriend > 0) parts.push(`友谊 +${dFriend}`);
      else if (dFriend < 0) parts.push(`友谊 ${dFriend}`);
      if (dBond > 0) parts.push(`羁绊 +${dBond}`);
      this.cb.onFloatText?.(sim.x, 1.9, sim.z, parts.join(' · '), dBond >= 10 ? 'pink' : dFriend >= 0 ? 'pos' : 'neg');
    }

    // Hint when Naifen move-in becomes unlocked!
    if ((a === 'naifen' || b === 'naifen') && !this.sims.naifen.playable && (rel.friendship >= 65 || rel.bond >= 60)) {
      if (!this._moveInHintShown) {
        this._moveInHintShown = true;
        this.toast('🏠', '同居条件达成！', '奶粉和奶鼠已经形影不离啦！点击奶粉选择「邀请奶粉搬来同居」即可解锁第 4 位可控室友！', 'pink');
      }
    }
  }

  adjustNeed(simId, needId, delta) {
    const s = this.sims[simId];
    if (!s || s.needs[needId] === undefined) return;
    s.needs[needId] = Math.max(0, Math.min(100, s.needs[needId] + delta));
  }

  addFunds(amount, reason = '') {
    this.funds = Math.max(0, Math.round(this.funds + amount));
    if (amount > 0) {
      sfx.cash();
      const s = this.getSelectedSim();
      this.cb.onFloatText?.(s.x, 2.1, s.z, `+§${amount} ${reason}`, 'gold');
    }
    this.emitDirty();
  }

  addMoodlet(simId, moodlet) {
    const s = this.sims[simId];
    if (!s) return;
    const existing = s.moodlets.find((m) => m.id === moodlet.id);
    if (existing) {
      existing.hours = moodlet.hours;
      existing.weight = moodlet.weight;
    } else {
      s.moodlets.push({ ...moodlet });
      if (s.moodlets.length > 5) s.moodlets.shift();
    }
    this.recomputeMood(s);
  }

  addSkillXp(simId, skillId, baseXp) {
    const s = this.sims[simId];
    if (!s || !s.skills[skillId]) return;
    const mult = CHARACTER_TEMPLATES[simId]?.skillMultipliers?.[skillId] || 1;
    const sk = s.skills[skillId];
    if (sk.level >= 10) return;
    sk.xp += Math.round(baseXp * mult);
    while (sk.xp >= 100 && sk.level < 10) {
      sk.xp -= 100;
      sk.level += 1;
      sfx.levelUp();
      this.toast('⭐', `${s.name} 技能升级！`, `${skillId === 'comedy' ? '搞笑抽象' : skillId === 'cooking' ? '厨艺零食' : skillId === 'logic' ? '大脑逻辑' : skillId === 'painting' ? '名画艺术' : '社交魅力'} 升到 Lv.${sk.level}！`, 'gold');
      this.cb.onFloatText?.(s.x, 2.2, s.z, `⭐ 升级 Lv.${sk.level}!`, 'gold');
    }
  }

  recomputeMood(s) {
    const scores = {};
    // Need-driven mood pressures
    const lowest = Math.min(...Object.values(s.needs));
    if (s.needs.hunger < 22) scores.angry = (scores.angry || 0) + 3;
    if (s.needs.energy < 20 || s.needs.bladder < 18 || s.needs.hygiene < 20) {
      scores.uncomfortable = (scores.uncomfortable || 0) + 3;
    }
    if (s.needs.social < 22 || s.needs.fun < 20) {
      scores.sad = (scores.sad || 0) + 2;
    }
    if (lowest > 65) scores.happy = (scores.happy || 0) + 1;

    for (const m of s.moodlets) {
      scores[m.mood] = (scores[m.mood] || 0) + m.weight;
    }

    let bestMood = 'fine';
    let bestScore = 0;
    for (const [mood, sc] of Object.entries(scores)) {
      if (sc > bestScore) {
        bestScore = sc;
        bestMood = mood;
      }
    }
    s.mood = bestMood;
  }

  say(simId, text, style = 'normal', duration = 3.6) {
    const s = this.sims[simId];
    if (!s || !text) return;
    s.speech = { text, style, timer: duration };
  }

  toast(icon, title, body, variant = 'normal') {
    this.cb.onToast?.({ icon, title, body, variant });
  }

  emitDirty() {
    this.cb.onStateDirty?.();
  }

  // ==================== TASK QUEUEING ====================
  queueWalkTo(simId, x, z) {
    const s = this.sims[simId];
    if (!s || s.atWork) return;
    this.enqueueTask(simId, {
      type: 'walk',
      label: '走过去',
      icon: '👣',
      x,
      z,
      duration: 0.2,
    });
  }

  queueFurnitureAction(simId, furnitureId, actionDef) {
    const s = this.sims[simId];
    const furn = this.furniture.find((f) => f.id === furnitureId);
    if (!s || !furn || s.atWork) return;

    if (actionDef.cost && this.funds < actionDef.cost) {
      this.toast('💸', '奶币不足', `需要 §${actionDef.cost}，快去画画、接单或上班赚钱吧！`, 'warn');
      return;
    }

    // Calculate a comfortable approach point near the furniture
    const angle = furn.rot || 0;
    const approachX = furn.x + Math.sin(angle) * 1.15;
    const approachZ = furn.z + Math.cos(angle) * 1.15;

    this.enqueueTask(simId, {
      type: 'furniture',
      furnitureId,
      action: actionDef,
      label: actionDef.label,
      icon: actionDef.icon,
      x: approachX,
      z: approachZ,
      lookAtX: furn.x,
      lookAtZ: furn.z,
      duration: actionDef.duration || 4,
    });
  }

  queueSocialAction(actorId, targetId, interactionDef) {
    const actor = this.sims[actorId];
    const target = this.sims[targetId];
    if (!actor || !target || actor.atWork || target.atWork) return;
    if (!target.visiting && !target.playable) {
      this.toast('🚪', '奶粉还没到家门口', '点右上角「喊奶粉串门」把她叫过来吧！', 'pink');
      return;
    }

    this.enqueueTask(actorId, {
      type: 'social',
      targetId,
      interaction: interactionDef,
      label: `${interactionDef.label}（${target.name}）`,
      icon: interactionDef.icon,
      duration: interactionDef.duration || 4,
    });
  }

  sendToWork(simId) {
    const s = this.sims[simId];
    if (!s || !s.playable || s.atWork) return;
    s.queue = [];
    s.currentTask = null;
    this.enqueueTask(simId, {
      type: 'go_work',
      label: `去上班：${s.career.title}`,
      icon: '💼',
      x: 0.2,
      z: 9.2,
      duration: 0.5,
    });
  }

  enqueueTask(simId, task) {
    const s = this.sims[simId];
    if (!s) return;
    if (s.queue.length >= 5) s.queue.pop();
    s.queue.push({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...task,
      stage: 'walk',
      elapsed: 0,
    });
    if (s.id === this.selectedSimId) sfx.queueAdd();
    this.emitDirty();
  }

  cancelTask(simId, taskId) {
    const s = this.sims[simId];
    if (!s) return;
    if (s.currentTask && s.currentTask.id === taskId) {
      if (this.activeLeash && (this.activeLeash.leaderId === simId || this.activeLeash.followerId === simId)) {
        this.activeLeash = null;
      }
      s.currentTask = null;
      s.path = [];
      s.anim = 'idle';
    } else {
      s.queue = s.queue.filter((t) => t.id !== taskId);
    }
    this.emitDirty();
  }

  // ==================== NAIFEN VISIT & MOVE-IN ====================
  summonNaifen(silent = false) {
    const nf = this.sims.naifen;
    if (!nf) return;
    if (nf.playable) {
      this.selectSim('naifen');
      return;
    }
    if (nf.visiting) {
      if (!silent) {
        this.toast('💗', '奶粉已经在屋里啦', '她正在粘着奶鼠不放呢，点击她可以互动！', 'pink');
      }
      return;
    }
    nf.visiting = true;
    nf.visitDurationLeft = 5.5;
    nf.x = 1.0;
    nf.z = 8.6;
    nf.path = [];
    nf.queue = [];
    nf.currentTask = null;

    sfx.doorbell();
    this.toast('💗', '叮咚！奶粉来敲门串门啦！', '“奶鼠在不在家呀？我带了草莓零食——才不是专门来看你的！”', 'pink');
    this.say('naifen', '奶鼠！我来找你玩啦💗', 'pink', 4.5);

    // Walk inside right toward Naishu!
    const ns = this.sims.naishu;
    this.enqueueTask('naifen', {
      type: 'walk',
      label: '进门找奶鼠',
      icon: '💗',
      x: ns.atWork ? 0.5 : Math.max(-5.5, Math.min(5.5, ns.x + 0.8)),
      z: ns.atWork ? 1.5 : Math.max(-4.8, Math.min(3.0, ns.z + 0.6)),
      duration: 0.3,
    });
    this.emitDirty();
  }

  moveInNaifen() {
    const nf = this.sims.naifen;
    if (!nf || nf.playable) return;
    nf.playable = true;
    nf.isNeighbor = false;
    nf.visiting = true;
    this.sims.naishu.stats.naifenMovedIn = 1;
    this.addFunds(500, '奶粉搬家礼金');

    // Automatically place Naifen's pink princess bed in bedroom if space allows!
    if (this.pathGrid.canPlaceFurniture(-3.2, -4.6, 2, 2)) {
      this.addFurnitureItem('bed_pink', -3.2, -4.6, 0, true);
    }

    sfx.levelUp();
    this.toast('🎉', '奶粉正式搬进奶家小洋房！', '解锁第 4 位可控角色「奶粉」+ 搬家礼金 §500！以后天天和奶鼠形影不离啦！', 'pink');
    this.say('naifen', '以后我们就是正式室友啦，奶鼠别想跑💗', 'pink', 5);
    this.say('naishu', '哇！以后每天都有草莓奶酪吃啦！', 'laugh', 5);
    this.emitDirty();
  }

  // ==================== STREAMLINED BUY / DECORATE ====================
  addFurnitureItem(type, x, z, rot = 0, free = false) {
    const def = FURNITURE_CATALOG[type];
    if (!def) return false;
    if (!free && this.funds < def.price) {
      this.toast('💸', '奶币不够啦', `购买「${def.name}」需要 §${def.price}。`, 'warn');
      return false;
    }
    if (!free) this.funds -= def.price;
    const item = {
      id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      type,
      x,
      z,
      rot,
    };
    this.furniture.push(item);
    this.pathGrid.rebuild(this.furniture);
    this.cb.onFurnitureChanged?.();
    if (!free) {
      sfx.cash();
      this.toast('🛋️', `已添置「${def.name}」`, `花费 §${def.price}，快让奶家人们去体验吧！`, 'gold');
    }
    this.emitDirty();
    return true;
  }

  sellFurnitureItem(furnitureId) {
    const idx = this.furniture.findIndex((f) => f.id === furnitureId);
    if (idx === -1) return;
    const item = this.furniture[idx];
    const def = FURNITURE_CATALOG[item.type];
    if (def?.notBuyable) return;
    const refund = Math.round((def?.price || 100) * 0.7);
    this.furniture.splice(idx, 1);
    this.pathGrid.rebuild(this.furniture);
    this.addFunds(refund, `卖掉${def?.name || '家具'}`);
    this.cb.onFurnitureChanged?.();
  }

  setRoomTheme(themeId) {
    this.roomTheme = themeId;
    sfx.click();
    this.cb.onThemeChanged?.(themeId);
    this.emitDirty();
  }

  // ==================== RANDOM ABSURD EVENTS ====================
  triggerRandomEvent() {
    if (this.activeEvent) return;
    let pool = RANDOM_EVENTS.filter((e) => !this.usedEventIds.has(e.id));
    if (pool.length === 0) {
      this.usedEventIds.clear();
      pool = RANDOM_EVENTS;
    }
    const ev = pool[Math.floor(Math.random() * pool.length)];
    this.usedEventIds.add(ev.id);
    this.activeEvent = ev;
    sfx.eventPop();
    this.cb.onEventModal?.(ev);
  }

  resolveEventChoice(choiceIdx) {
    if (!this.activeEvent) return;
    const ev = this.activeEvent;
    const choice = ev.choices[choiceIdx];
    this.activeEvent = null;
    if (choice) {
      const outcomeText = choice.apply(this);
      sfx.click();
      this.toast(ev.emoji, ev.title, outcomeText, 'gold');
      this.saveToStorage();
      this.emitDirty();
    }
  }

  // ==================== MAIN SIMULATION TICK ====================
  tick(rawDt) {
    if (this.speed === 0 || this.activeEvent) return;
    const dt = Math.min(rawDt, 0.08) * (this.speed === 1 ? 1 : this.speed === 2 ? 2.4 : 4.8);
    // 1 real second at 1x speed = 3 simulated minutes (0.05 sim hours) -> 1 full day ≈ 8 min at 1x, ~1.7 min at 3x
    const simHours = dt * 0.05;

    this.hour += simHours;
    if (this.hour >= 24) {
      this.hour -= 24;
      this.day += 1;
      this.toast('🌅', `迎来第 ${this.day} 天！`, '奶家小洋房阳光正好，今天又会发生什么抽象趣事呢？', 'gold');
      this.saveToStorage();
    }

    // Periodic autosave every 2 sim hours
    if (Math.floor(this.hour) !== this.lastAutoSaveHour && Math.floor(this.hour) % 2 === 0) {
      this.lastAutoSaveHour = Math.floor(this.hour);
      this.saveToStorage();
    }

    // Random event timer
    this.nextEventHours -= simHours;
    if (this.nextEventHours <= 0) {
      this.nextEventHours = 5.5 + Math.random() * 3.5;
      this.triggerRandomEvent();
    }

    // Naifen frequent neighbor visit scheduler
    const nf = this.sims.naifen;
    if (nf && !nf.playable) {
      if (!nf.visiting) {
        this.naifenVisitTimer -= simHours;
        if (this.naifenVisitTimer <= 0 && this.hour >= 7 && this.hour <= 22) {
          this.summonNaifen();
        }
      } else {
        nf.visitDurationLeft -= simHours;
        if (nf.visitDurationLeft <= 0 && !nf.currentTask) {
          // Walk home for a bit then return later
          nf.visiting = false;
          nf.x = 10.2;
          nf.z = 9.2;
          nf.path = [];
          this.naifenVisitTimer = 3.0 + Math.random() * 2.5;
          this.toast('👋', '奶粉暂时回隔壁啦', '临走前还回头盯了奶鼠一眼：“过会儿我再来找你！”', 'pink');
          this.emitDirty();
        }
      }
    }

    // Update each Sim
    Object.values(this.sims).forEach((s) => {
      if (!s.playable && !s.visiting) return;
      this.updateSim(s, dt, simHours);
    });
  }

  updateSim(s, dt, simHours) {
    // Speech bubble countdown
    if (s.speech) {
      s.speech.timer -= dt;
      if (s.speech.timer <= 0) s.speech = null;
    }

    // Work shift handling
    if (s.atWork) {
      s.workHoursLeft -= simHours;
      this.adjustNeed(s.id, 'energy', -simHours * 5.2);
      this.adjustNeed(s.id, 'fun', -simHours * 3.0);
      this.adjustNeed(s.id, 'hunger', -simHours * 3.5);
      if (s.workHoursLeft <= 0) {
        s.atWork = false;
        s.x = 0.2;
        s.z = 7.8;
        const skillLv = s.skills[s.career.skillId]?.level || 1;
        const pay = Math.round(s.career.payPerShift * (1 + (skillLv - 1) * 0.2));
        this.addFunds(pay, `${s.name}下班工资`);
        this.toast('💼', `${s.name} 下班回来啦！`, `作为「${s.career.title}」赚回了 §${pay}！`, 'gold');
        this.say(s.id, `下班啦！赚了 §${pay}！`, 'laugh', 4);
        this.queueWalkTo(s.id, (Math.random() - 0.5) * 4, 1.5);
        this.emitDirty();
      }
      return;
    }

    // Decay Needs
    const mults = CHARACTER_TEMPLATES[s.id]?.needMultipliers || {};
    NEED_META.forEach((n) => {
      const m = mults[n.id] || 1;
      // Don't decay energy while sleeping, etc.
      if (s.currentTask?.action?.anim === 'sleep' && n.id === 'energy') return;
      this.adjustNeed(s.id, n.id, -n.decayPerHour * m * simHours);
    });

    // Tick moodlets
    let moodDirty = false;
    for (let i = s.moodlets.length - 1; i >= 0; i--) {
      s.moodlets[i].hours -= simHours;
      if (s.moodlets[i].hours <= 0) {
        s.moodlets.splice(i, 1);
        moodDirty = true;
      }
    }
    this.recomputeMood(s);
    if (moodDirty) this.emitDirty();

    // Start next queued task if idle
    if (!s.currentTask && s.queue.length > 0) {
      s.currentTask = s.queue.shift();
      this.prepareTaskPath(s, s.currentTask);
      this.emitDirty();
    }

    if (s.currentTask) {
      this.stepTask(s, s.currentTask, dt);
    } else {
      s.anim = 'idle';
      s.idleTimer -= dt;
      if (s.idleTimer <= 0) {
        s.idleTimer = 3.5 + Math.random() * 4.0;
        if (s.id === 'naifen' && !s.playable) {
          this.runNaifenNeighborAI(s);
        } else if (this.autonomy) {
          this.runAutonomyAI(s);
        } else if (Math.random() < 0.25) {
          const lines = CHARACTER_TEMPLATES[s.id]?.idleLines || [];
          if (lines.length) this.say(s.id, lines[Math.floor(Math.random() * lines.length)], 'normal', 3.2);
        }
      }
    }
  }

  prepareTaskPath(s, task) {
    if (task.type === 'social') {
      const target = this.sims[task.targetId];
      if (!target || (!target.visiting && !target.playable) || target.atWork) {
        s.currentTask = null;
        return;
      }
      // Walk to a spot 1.15m in front of target
      const dx = s.x - target.x;
      const dz = s.z - target.z;
      const dist = Math.hypot(dx, dz) || 1;
      const gx = target.x + (dx / dist) * 1.15;
      const gz = target.z + (dz / dist) * 1.15;
      s.path = this.pathGrid.findPath(s.x, s.z, gx, gz);
    } else {
      s.path = this.pathGrid.findPath(s.x, s.z, task.x, task.z);
    }
    task.stage = 'walk';
  }

  stepTask(s, task, dt) {
    if (task.stage === 'walk') {
      if (s.path.length > 0) {
        s.anim = 'walk';
        const wp = s.path[0];
        const dx = wp.x - s.x;
        const dz = wp.z - s.z;
        const dist = Math.hypot(dx, dz);
        const step = s.speed * dt;
        if (dist <= step + 0.05) {
          s.x = wp.x;
          s.z = wp.z;
          s.path.shift();
        } else {
          s.x += (dx / dist) * step;
          s.z += (dz / dist) * step;
          s.rotY = Math.atan2(dx, dz);
        }
        return;
      }

      // Arrived!
      if (task.type === 'walk') {
        s.currentTask = null;
        s.anim = 'idle';
        this.emitDirty();
        return;
      }

      if (task.type === 'go_work') {
        s.atWork = true;
        s.workHoursLeft = s.career.shiftHours;
        s.currentTask = null;
        s.anim = 'idle';
        this.toast('💼', `${s.name} 出门上班去啦`, `预计 ${s.career.shiftHours} 小时后带着工资回家。`);
        this.emitDirty();
        return;
      }

      // Begin action stage
      task.stage = 'act';
      task.elapsed = 0;

      if (task.type === 'furniture') {
        s.rotY = Math.atan2(task.lookAtX - s.x, task.lookAtZ - s.z);
        if (task.action.cost) this.addFunds(-task.action.cost);
        if (task.action.speech) this.say(s.id, task.action.speech, task.action.anim === 'laugh' ? 'laugh' : 'normal', 3.5);
        if (task.action.anim === 'laugh') sfx.laugh();
      } else if (task.type === 'social') {
        const target = this.sims[task.targetId];
        if (!target || target.atWork) {
          s.currentTask = null;
          return;
        }
        // Face each other!
        s.rotY = Math.atan2(target.x - s.x, target.z - s.z);
        target.rotY = Math.atan2(s.x - target.x, s.z - target.z);
        // Pause target momentarily so they genuinely interact together!
        target.path = [];
        target.currentTask = null;

        const inter = task.interaction;
        if (inter.sfx && sfx[inter.sfx]) sfx[inter.sfx]();
        const style = inter.specialStyle === 'pink' ? 'pink' : inter.anim === 'laugh' ? 'laugh' : 'normal';
        this.say(s.id, inter.actorLine, style, inter.duration);
        setTimeout(() => {
          if (this.sims[target.id]) this.say(target.id, inter.targetLine, style, Math.max(2.5, inter.duration - 0.5));
        }, 700);

        if (inter.anim === 'leash') {
          this.activeLeash = { leaderId: s.id, followerId: target.id };
        }
      }
      return;
    }

    // Acting stage
    task.elapsed += dt;
    const progress = Math.min(1, task.elapsed / task.duration);
    task.progress = progress;

    if (task.type === 'furniture') {
      const act = task.action;
      s.anim = act.anim || 'interact';
      // Smooth continuous need recovery while performing action
      if (act.needs) {
        const frac = dt / task.duration;
        for (const [nid, val] of Object.entries(act.needs)) {
          this.adjustNeed(s.id, nid, val * frac);
        }
      }
      if (progress >= 1) {
        if (act.earn) {
          const skLv = act.skill ? (s.skills[act.skill.id]?.level || 1) : 1;
          const totalEarn = Math.round(act.earn * (1 + (skLv - 1) * 0.18));
          this.addFunds(totalEarn, act.label.slice(0, 6));
        }
        if (act.skill) this.addSkillXp(s.id, act.skill.id, act.skill.xp);
        if (act.stat && s.stats[act.stat] !== undefined) s.stats[act.stat] += 1;
        if (act.moodlet) this.addMoodlet(s.id, act.moodlet);
        s.currentTask = null;
        s.anim = 'idle';
        this.emitDirty();
      }
    } else if (task.type === 'social') {
      const inter = task.interaction;
      const target = this.sims[task.targetId];
      if (inter.anim === 'squash') {
        s.anim = 'squash_jumper';
        if (target) target.anim = 'squashed';
      } else if (inter.anim === 'leash') {
        s.anim = 'leash';
        if (target) target.anim = 'walk';
      } else {
        s.anim = inter.anim || 'talk';
        if (target) target.anim = inter.anim === 'prank' ? 'idle' : (inter.anim || 'talk');
      }

      if (progress >= 1) {
        if (this.activeLeash?.leaderId === s.id) this.activeLeash = null;
        if (target) {
          target.anim = 'idle';
          this.adjustRelation(s.id, target.id, inter.friendship || 0, inter.bond || 0);
          this.adjustNeed(s.id, 'social', inter.socialGain || 20);
          this.adjustNeed(target.id, 'social', inter.socialGain || 20);
          this.adjustNeed(s.id, 'fun', inter.funGain || 10);
          this.adjustNeed(target.id, 'fun', inter.funGain || 10);
          if (inter.hungerGainTarget) this.adjustNeed(target.id, 'hunger', inter.hungerGainTarget);
          if (inter.actorMoodlet) this.addMoodlet(s.id, inter.actorMoodlet);
          if (inter.targetMoodlet) this.addMoodlet(target.id, inter.targetMoodlet);
          if (inter.skill) this.addSkillXp(s.id, inter.skill.id, inter.skill.xp);
          if (inter.stat) {
            if (s.stats[inter.stat] !== undefined) s.stats[inter.stat] += 1;
            if (target.stats[inter.stat] !== undefined) target.stats[inter.stat] += 1;
          }
          if (inter.triggersMoveIn) {
            this.moveInNaifen();
          }
        }
        s.currentTask = null;
        s.anim = 'idle';
        this.emitDirty();
      }
    }
  }

  // ==================== AUTONOMY & NAIFEN CLINGY AI ====================
  runNaifenNeighborAI(nf) {
    const ns = this.sims.naishu;
    if (!ns || ns.atWork) {
      // Hang out in living room waiting for Naishu
      this.queueWalkTo('naifen', -2.5 + Math.random() * 4, 1.2 + Math.random() * 1.5);
      return;
    }

    // 75% chance to cling to Naishu (sweet cuddle OR chaotic squash prank!)
    if (Math.random() < 0.78 && !ns.currentTask) {
      const sweet = Math.random() < 0.56;
      const pickId = sweet
        ? (Math.random() < 0.65 ? 'naifen_cuddle_naishu' : 'heart_cave_selfie')
        : (Math.random() < 0.72 ? 'naifen_squash_naishu' : 'steal_snack');
      const inter = SOCIAL_INTERACTIONS.find((i) => i.id === pickId);
      if (inter) {
        this.queueSocialAction('naifen', 'naishu', inter);
        return;
      }
    }
    // Otherwise stroll right next to Naishu!
    this.queueWalkTo('naifen', Math.max(-6, Math.min(6, ns.x + (Math.random() - 0.5) * 1.8)), Math.max(-5, Math.min(3.2, ns.z + (Math.random() - 0.5) * 1.8)));
  }

  runAutonomyAI(s) {
    // Check urgent needs first
    const findFurn = (types) => this.furniture.find((f) => types.includes(f.type));

    if (s.needs.bladder < 35) {
      const f = findFurn(['toilet']);
      if (f) return this.queueFurnitureAction(s.id, f.id, FURNITURE_CATALOG[f.type].actions[0]);
    }
    if (s.needs.hunger < 42) {
      const prefer = s.id === 'naishu' ? ['snack_shelf', 'fridge'] : ['fridge', 'snack_shelf'];
      const f = findFurn(prefer);
      if (f) return this.queueFurnitureAction(s.id, f.id, FURNITURE_CATALOG[f.type].actions[0]);
    }
    if (s.needs.energy < 32) {
      const prefer = s.id === 'naidou' ? ['bed_bean', 'bed_yellow', 'sofa'] : s.id === 'naifen' ? ['bed_pink', 'bed_yellow', 'sofa'] : ['bed_yellow', 'sofa'];
      const f = findFurn(prefer);
      if (f) return this.queueFurnitureAction(s.id, f.id, FURNITURE_CATALOG[f.type].actions[0]);
    }
    if (s.needs.hygiene < 36) {
      const f = findFurn(['shower']);
      if (f) return this.queueFurnitureAction(s.id, f.id, FURNITURE_CATALOG[f.type].actions[0]);
    }
    if (s.needs.social < 48) {
      const others = Object.values(this.sims).filter((o) => o.id !== s.id && (o.playable || o.visiting) && !o.atWork && !o.currentTask);
      if (others.length > 0) {
        const tgt = others[Math.floor(Math.random() * others.length)];
        const pool = SOCIAL_INTERACTIONS.filter((i) => i.cat === 'friendly' || i.cat === 'funny');
        const inter = pool[Math.floor(Math.random() * pool.length)];
        return this.queueSocialAction(s.id, tgt.id, inter);
      }
    }
    if (s.needs.fun < 55) {
      const prefer = s.id === 'naiwa' ? ['sofa', 'easel', 'tv'] : s.id === 'naidou' ? ['pc_desk', 'bookshelf'] : ['tv', 'swing', 'sofa', 'arcade'];
      const f = findFurn(prefer);
      if (f) {
        const acts = FURNITURE_CATALOG[f.type].actions;
        return this.queueFurnitureAction(s.id, f.id, acts[Math.floor(Math.random() * acts.length)]);
      }
    }

    // Idle flavor: occasional signature line or gentle stroll
    if (Math.random() < 0.35) {
      const lines = CHARACTER_TEMPLATES[s.id]?.idleLines || [];
      if (lines.length) this.say(s.id, lines[Math.floor(Math.random() * lines.length)], 'normal', 3.4);
    }
    if (Math.random() < 0.30) {
      this.queueWalkTo(s.id, -4.5 + Math.random() * 9, -0.2 + Math.random() * 3.2);
    }
  }

  // ==================== TIME FORMATTING & SAVE/LOAD ====================
  getFormattedClock() {
    const h = Math.floor(this.hour) % 24;
    const m = Math.floor((this.hour - Math.floor(this.hour)) * 60);
    const weekday = WEEKDAYS[(this.day - 1) % 7];
    const phase = h >= 6 && h < 17 ? '☀️' : h >= 17 && h < 20 ? '🌇' : '🌙';
    return {
      dayStr: `第 ${this.day} 天 · ${weekday}`,
      timeStr: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      phase,
    };
  }

  getGoalProgress(sim, goal) {
    if (goal.stat) return Math.min(goal.target, sim.stats[goal.stat] || 0);
    if (goal.skill) return Math.min(goal.target, sim.skills[goal.skill]?.level || 1);
    if (goal.bondWith) return Math.min(goal.target, this.getRelation(sim.id, goal.bondWith).bond);
    if (goal.householdFunds) return Math.min(goal.target, this.funds);
    return 0;
  }

  saveToStorage(notify = false) {
    try {
      const payload = {
        day: this.day,
        hour: this.hour,
        funds: this.funds,
        roomTheme: this.roomTheme,
        selectedSimId: this.selectedSimId,
        furniture: this.furniture,
        relationships: this.relationships,
        sims: Object.fromEntries(
          Object.entries(this.sims).map(([id, s]) => [
            id,
            {
              playable: s.playable,
              isNeighbor: s.isNeighbor,
              visiting: s.visiting,
              x: s.x,
              z: s.z,
              needs: s.needs,
              skills: s.skills,
              stats: s.stats,
              moodlets: s.moodlets,
            },
          ])
        ),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      if (notify) {
        sfx.click();
        this.toast('💾', '存档已保存', '奶家小洋房的进度已安全存在浏览器本地。');
      }
    } catch (_) {
      // Ignore storage quota errors
    }
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (!p || !p.sims) return;
      this.day = p.day || 1;
      this.hour = typeof p.hour === 'number' ? p.hour : 8.5;
      this.funds = typeof p.funds === 'number' ? p.funds : 1200;
      this.roomTheme = p.roomTheme || 'cream';
      this.selectedSimId = p.selectedSimId || 'naiwa';
      if (Array.isArray(p.furniture) && p.furniture.length > 0) {
        this.furniture = p.furniture;
        this.pathGrid.rebuild(this.furniture);
      }
      if (p.relationships) this.relationships = p.relationships;
      for (const [id, saved] of Object.entries(p.sims)) {
        if (!this.sims[id]) continue;
        Object.assign(this.sims[id], {
          playable: saved.playable,
          isNeighbor: saved.isNeighbor,
          visiting: saved.visiting,
          x: saved.x,
          z: saved.z,
          needs: { ...this.sims[id].needs, ...saved.needs },
          skills: { ...this.sims[id].skills, ...saved.skills },
          stats: { ...this.sims[id].stats, ...saved.stats },
          moodlets: Array.isArray(saved.moodlets) ? saved.moodlets : [],
        });
        this.recomputeMood(this.sims[id]);
      }
    } catch (_) {
      // Fallback to fresh state
    }
  }

  resetSave() {
    localStorage.removeItem(SAVE_KEY);
    this.initFreshState();
    this.cb.onFurnitureChanged?.();
    this.cb.onThemeChanged?.(this.roomTheme);
    this.toast('🔄', '已重新开始', '欢迎回到奶家小洋房第一天！', 'gold');
    this.emitDirty();
  }
}
