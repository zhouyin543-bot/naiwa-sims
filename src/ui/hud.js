import {
  CHARACTER_TEMPLATES,
  NEED_META,
  SKILL_META,
  MOOD_STYLES,
  getRelationTitle,
  getCharacterAvatarSVG,
} from '../data/characters.js';
import { FURNITURE_CATALOG, ROOM_THEMES } from '../data/furniture.js';
import { SOCIAL_CATEGORIES, getAvailableSocialInteractions } from '../data/interactions.js';
import { sfx } from '../audio/sfx.js';

function needColor(val) {
  if (val >= 65) return '#2cc764';
  if (val >= 35) return '#f59e0b';
  return '#ef4444';
}

export class HudController {
  constructor(engine, hooks) {
    this.engine = engine;
    this.hooks = hooks; // onWallModeCycle, onFocusSim, onStartPlacement, onCancelPlacement, onRotateGhost

    this.activeTab = 'needs';
    this.pieState = null;
    this.speechEls = new Map();

    this.cacheDom();
    this.bindStaticEvents();
    this.renderAll();
  }

  cacheDom() {
    this.$funds = document.getElementById('household-funds');
    this.$day = document.getElementById('clock-day');
    this.$time = document.getElementById('clock-time');
    this.$phase = document.getElementById('clock-weather');
    this.$wallLabel = document.getElementById('wall-mode-label');
    this.$autonomyBtn = document.getElementById('btn-autonomy');
    this.$autonomyLabel = document.getElementById('autonomy-label');
    this.$naifenBtnLabel = document.getElementById('naifen-btn-label');
    this.$buyBtn = document.getElementById('btn-buy-mode');
    this.$soundBtn = document.getElementById('btn-sound');

    this.$toastStack = document.getElementById('toast-stack');
    this.$actionQueue = document.getElementById('action-queue');
    this.$overlays = document.getElementById('world-overlays');
    this.$hoverTip = document.getElementById('hover-tooltip');

    this.$placementBanner = document.getElementById('placement-banner');
    this.$placementText = document.getElementById('placement-text');

    this.$activeRing = document.getElementById('active-mood-ring');
    this.$activeAvatar = document.getElementById('active-avatar');
    this.$activeMoodLabel = document.getElementById('active-mood-label');
    this.$activeName = document.getElementById('active-sim-name');
    this.$activeAction = document.getElementById('active-sim-action');
    this.$activeTraits = document.getElementById('active-sim-traits');
    this.$moodlets = document.getElementById('moodlets-strip');

    this.$switcher = document.getElementById('household-switcher');
    this.$naifenChip = document.getElementById('naifen-status-chip');
    this.$naifenStatusText = document.getElementById('naifen-status-text');

    this.$drawer = document.getElementById('inspector-drawer');
    this.$drawerTitle = document.getElementById('drawer-title');
    this.$drawerBody = document.getElementById('drawer-body');
    this.$drawerCollapse = document.getElementById('btn-toggle-drawer');

    this.$pie = document.getElementById('pie-menu');
    this.$pieTitle = document.getElementById('pie-target-title');
    this.$pieCats = document.getElementById('pie-categories');
    this.$pieOpts = document.getElementById('pie-options');

    this.$eventBackdrop = document.getElementById('event-modal-backdrop');
    this.$eventTag = document.getElementById('event-tag');
    this.$eventEmoji = document.getElementById('event-emoji');
    this.$eventTitle = document.getElementById('event-title');
    this.$eventDesc = document.getElementById('event-desc');
    this.$eventChoices = document.getElementById('event-choices');

    this.$helpBackdrop = document.getElementById('help-modal-backdrop');
  }

  bindStaticEvents() {
    // Speed controls
    document.querySelectorAll('.speed-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setSpeed(Number(btn.dataset.speed));
      });
    });

    document.getElementById('btn-wall-mode').addEventListener('click', () => {
      sfx.click();
      const mode = this.hooks.onWallModeCycle();
      this.$wallLabel.textContent = mode === 'cutaway' ? '半切墙' : mode === 'full' ? '全墙' : '隐藏墙';
    });

    this.$autonomyBtn.addEventListener('click', () => {
      sfx.click();
      this.engine.autonomy = !this.engine.autonomy;
      this.$autonomyBtn.classList.toggle('active', this.engine.autonomy);
      this.$autonomyLabel.textContent = this.engine.autonomy ? '自主AI开' : '自主AI关';
    });

    document.getElementById('btn-trigger-event').addEventListener('click', () => {
      this.engine.triggerRandomEvent();
    });

    document.getElementById('btn-call-naifen').addEventListener('click', () => {
      if (this.engine.sims.naifen.playable) {
        this.engine.selectSim('naifen');
        this.hooks.onFocusSim('naifen');
      } else {
        this.engine.summonNaifen();
        this.hooks.onFocusSim('naifen');
      }
      this.renderAll();
    });

    this.$buyBtn.addEventListener('click', () => {
      sfx.click();
      this.setTab('shop');
      this.$drawer.classList.remove('collapsed');
      this.$drawerCollapse.textContent = '▾';
    });

    this.$soundBtn.addEventListener('click', () => {
      const muted = sfx.toggleMute();
      this.$soundBtn.textContent = muted ? '🔇' : '🔊';
    });

    document.getElementById('btn-save').addEventListener('click', () => {
      this.engine.saveToStorage(true);
    });

    document.getElementById('btn-help').addEventListener('click', () => {
      sfx.click();
      this.$helpBackdrop.hidden = false;
    });
    document.getElementById('btn-close-help').addEventListener('click', () => {
      this.$helpBackdrop.hidden = true;
    });
    document.getElementById('btn-start-play').addEventListener('click', () => {
      sfx.click();
      this.$helpBackdrop.hidden = true;
    });
    document.getElementById('btn-reset-save').addEventListener('click', () => {
      this.engine.resetSave();
      this.$helpBackdrop.hidden = true;
    });

    // Double-click portrait to focus camera
    document.getElementById('active-portrait-btn').addEventListener('dblclick', () => {
      this.hooks.onFocusSim(this.engine.selectedSimId);
    });

    this.$naifenChip.addEventListener('click', () => {
      if (this.engine.sims.naifen.visiting || this.engine.sims.naifen.playable) {
        this.hooks.onFocusSim('naifen');
      } else {
        this.engine.summonNaifen();
      }
    });

    // Inspector tabs & collapse
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        sfx.click();
        this.setTab(btn.dataset.tab);
        this.$drawer.classList.remove('collapsed');
        this.$drawerCollapse.textContent = '▾';
      });
    });

    this.$drawerCollapse.addEventListener('click', () => {
      const collapsed = this.$drawer.classList.toggle('collapsed');
      this.$drawerCollapse.textContent = collapsed ? '▴' : '▾';
    });

    document.getElementById('pie-close').addEventListener('click', () => this.closePieMenu());
    document.getElementById('btn-rotate-ghost').addEventListener('click', () => this.hooks.onRotateGhost());
    document.getElementById('btn-cancel-place').addEventListener('click', () => this.hooks.onCancelPlacement());
  }

  setSpeed(sp) {
    this.engine.speed = sp;
    document.querySelectorAll('.speed-btn').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.speed) === sp);
    });
    sfx.click();
  }

  setTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    this.$buyBtn.classList.toggle('active', tab === 'shop');
    this.renderDrawer();
  }

  showPlacementBanner(itemName) {
    this.$placementText.textContent = `正在摆放「${itemName}」· 点击绿框空地放置 · R 旋转 · ESC 取消`;
    this.$placementBanner.hidden = false;
  }

  hidePlacementBanner() {
    this.$placementBanner.hidden = true;
  }

  showToast({ icon, title, body, variant = 'normal' }) {
    const el = document.createElement('div');
    el.className = `toast-item ${variant}`;
    el.innerHTML = `<span class="toast-ico">${icon}</span><div class="toast-text"><strong>${title}</strong><span>${body}</span></div>`;
    this.$toastStack.appendChild(el);
    while (this.$toastStack.children.length > 4) {
      this.$toastStack.firstElementChild.remove();
    }
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      el.style.transition = 'all 0.25s ease';
      setTimeout(() => el.remove(), 260);
    }, 4800);
  }

  showHoverTip(text, x, y) {
    if (!text) {
      this.$hoverTip.hidden = true;
      return;
    }
    this.$hoverTip.textContent = text;
    this.$hoverTip.style.left = `${x}px`;
    this.$hoverTip.style.top = `${y}px`;
    this.$hoverTip.hidden = false;
  }

  // ==================== PIE MENU ====================
  openFurniturePie(furn, screenX, screenY) {
    const def = FURNITURE_CATALOG[furn.type];
    if (!def) return;
    sfx.pieOpen();
    this.pieState = { kind: 'furniture', furn };
    this.$pieTitle.textContent = `${def.icon} ${def.name}`;
    this.$pieCats.innerHTML = '';
    this.$pieOpts.innerHTML = '';

    def.actions.forEach((act) => {
      const btn = document.createElement('button');
      btn.className = 'pie-opt-btn';
      const sub = act.earn ? `+§${act.earn}` : act.cost ? `-§${act.cost}` : '';
      btn.innerHTML = `<span>${act.icon} ${act.label}</span><span class="pie-opt-sub">${sub}</span>`;
      btn.addEventListener('click', () => {
        this.engine.queueFurnitureAction(this.engine.selectedSimId, furn.id, act);
        this.closePieMenu();
      });
      this.$pieOpts.appendChild(btn);
    });

    if (!def.notBuyable) {
      const sellBtn = document.createElement('button');
      sellBtn.className = 'pie-opt-btn';
      sellBtn.innerHTML = `<span>🗑️ 卖掉此家具</span><span class="pie-opt-sub">+§${Math.round(def.price * 0.7)}</span>`;
      sellBtn.addEventListener('click', () => {
        this.engine.sellFurnitureItem(furn.id);
        this.closePieMenu();
      });
      this.$pieOpts.appendChild(sellBtn);
    }

    this.positionPie(screenX, screenY);
  }

  openSimPie(targetSim, screenX, screenY) {
    const actor = this.engine.getSelectedSim();
    sfx.pieOpen();
    this.$pieCats.innerHTML = '';
    this.$pieOpts.innerHTML = '';

    if (actor.id === targetSim.id) {
      // Self interactions!
      this.$pieTitle.textContent = `✨ ${actor.name}（自己）`;
      const selfOpts = [
        {
          label: '🤣 原地捧腹狂笑发疯',
          sub: '娱乐++',
          run: () => {
            sfx.laugh();
            this.engine.say(actor.id, '哈哈哈哈哈嘎嘎嘎！', 'laugh', 3.5);
            this.engine.adjustNeed(actor.id, 'fun', 22);
            this.engine.addSkillXp(actor.id, 'comedy', 15);
            actor.stats.laughs += 1;
            this.engine.addMoodlet(actor.id, { id: 'self_laugh', label: '莫名笑点低', icon: '🤣', mood: 'playful', weight: 2, hours: 3 });
          },
        },
        {
          label: `💼 出门上班：${actor.career.title}`,
          sub: `+§${actor.career.payPerShift}`,
          run: () => this.engine.sendToWork(actor.id),
        },
        {
          label: '🎲 触发一条今日随机抽象事件',
          sub: '惊喜分支',
          run: () => this.engine.triggerRandomEvent(),
        },
      ];
      selfOpts.forEach((o) => {
        const btn = document.createElement('button');
        btn.className = 'pie-opt-btn';
        btn.innerHTML = `<span>${o.label}</span><span class="pie-opt-sub">${o.sub}</span>`;
        btn.addEventListener('click', () => {
          o.run();
          this.closePieMenu();
        });
        this.$pieOpts.appendChild(btn);
      });
      this.positionPie(screenX, screenY);
      return;
    }

    // Social interactions with another Sim!
    const rel = this.engine.getRelation(actor.id, targetSim.id);
    const all = getAvailableSocialInteractions(actor, targetSim, rel);
    const hasSpecial = all.some((i) => i.cat === 'special');
    let activeCat = hasSpecial ? 'special' : 'friendly';

    this.$pieTitle.textContent = `💬 ${actor.name} → ${targetSim.name}（友谊 ${rel.friendship} / 羁绊 ${rel.bond}）`;

    const renderCatOptions = () => {
      this.$pieCats.innerHTML = '';
      SOCIAL_CATEGORIES.forEach((c) => {
        const list = all.filter((i) => i.cat === c.id);
        if (list.length === 0) return;
        const cb = document.createElement('button');
        cb.className = `pie-cat-btn ${c.id === 'special' ? 'special' : ''} ${activeCat === c.id ? 'active' : ''}`;
        cb.textContent = `${c.icon} ${c.label}`;
        cb.addEventListener('click', () => {
          sfx.click();
          activeCat = c.id;
          renderCatOptions();
        });
        this.$pieCats.appendChild(cb);
      });

      this.$pieOpts.innerHTML = '';
      all.filter((i) => i.cat === activeCat).forEach((inter) => {
        const btn = document.createElement('button');
        btn.className = `pie-opt-btn ${inter.specialStyle === 'pink' ? 'pink-opt' : inter.specialStyle === 'gold' ? 'gold-opt' : ''}`;
        const sub = inter.locked
          ? inter.lockHint
          : inter.bond >= 10
          ? `羁绊+${inter.bond}`
          : inter.friendship >= 0
          ? `友谊+${inter.friendship}`
          : `整蛊`;
        btn.innerHTML = `<span>${inter.icon} ${inter.label}</span><span class="pie-opt-sub">${sub}</span>`;
        if (inter.locked) {
          btn.style.opacity = '0.58';
          btn.addEventListener('click', () => {
            this.showToast({ icon: '💗', title: '羁绊还差一点点！', body: `多和奶粉贴贴或整蛊，把友谊刷到 65 或羁绊刷到 60 就能邀请她同居啦！（当前友谊 ${rel.friendship} / 羁绊 ${rel.bond}）`, variant: 'pink' });
          });
        } else {
          btn.addEventListener('click', () => {
            this.engine.queueSocialAction(actor.id, targetSim.id, inter);
            this.closePieMenu();
          });
        }
        this.$pieOpts.appendChild(btn);
      });
    };

    renderCatOptions();
    this.positionPie(screenX, screenY);
  }

  openGroundPie(wx, wz, screenX, screenY) {
    const actor = this.engine.getSelectedSim();
    sfx.pieOpen();
    this.$pieTitle.textContent = `📍 地面`;
    this.$pieCats.innerHTML = '';
    this.$pieOpts.innerHTML = '';

    const walkBtn = document.createElement('button');
    walkBtn.className = 'pie-opt-btn';
    walkBtn.innerHTML = `<span>👣 让 ${actor.name} 走到这里</span><span class="pie-opt-sub">移动</span>`;
    walkBtn.addEventListener('click', () => {
      this.engine.queueWalkTo(actor.id, wx, wz);
      this.closePieMenu();
    });
    this.$pieOpts.appendChild(walkBtn);
    this.positionPie(screenX, screenY);
  }

  positionPie(x, y) {
    this.$pie.hidden = false;
    const w = 276;
    const h = 300;
    const left = Math.max(12, Math.min(window.innerWidth - w - 12, x + 10));
    const top = Math.max(70, Math.min(window.innerHeight - h - 110, y - 30));
    this.$pie.style.left = `${left}px`;
    this.$pie.style.top = `${top}px`;
  }

  closePieMenu() {
    this.$pie.hidden = true;
    this.pieState = null;
  }

  // ==================== EVENT MODAL ====================
  showEventModal(ev) {
    this.$eventTag.textContent = ev.tag;
    this.$eventEmoji.textContent = ev.emoji;
    this.$eventTitle.textContent = ev.title;
    this.$eventDesc.textContent = ev.desc;
    this.$eventChoices.innerHTML = '';

    ev.choices.forEach((ch, idx) => {
      const btn = document.createElement('button');
      btn.className = 'event-choice-btn';
      btn.innerHTML = `<strong>${ch.title}</strong><span>${ch.sub}</span>`;
      btn.addEventListener('click', () => {
        this.$eventBackdrop.hidden = true;
        this.engine.resolveEventChoice(idx);
      });
      this.$eventChoices.appendChild(btn);
    });

    this.$eventBackdrop.hidden = false;
  }

  // ==================== 3D PROJECTED OVERLAYS ====================
  spawnFloatText(screenX, screenY, text, variant = 'pos') {
    const el = document.createElement('div');
    el.className = `float-feedback ${variant}`;
    el.textContent = text;
    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;
    this.$overlays.appendChild(el);
    setTimeout(() => el.remove(), 1550);
  }

  updateSpeechBubbles(projectFn) {
    Object.values(this.engine.sims).forEach((s) => {
      const existing = this.speechEls.get(s.id);
      if (!s.speech || s.atWork || (!s.playable && !s.visiting)) {
        if (existing) {
          existing.remove();
          this.speechEls.delete(s.id);
        }
        return;
      }
      const pos = projectFn(s.x, s.species === 'naidou' ? 1.25 : 1.95, s.z);
      if (!pos.visible) {
        if (existing) existing.style.display = 'none';
        return;
      }
      let el = existing;
      if (!el) {
        el = document.createElement('div');
        this.$overlays.appendChild(el);
        this.speechEls.set(s.id, el);
      }
      el.style.display = 'block';
      el.className = `speech-bubble ${s.speech.style || ''}`;
      el.textContent = s.speech.text;
      el.style.left = `${pos.x}px`;
      el.style.top = `${pos.y}px`;
    });
  }

  // ==================== FULL HUD REFRESH ====================
  renderAll() {
    this.renderClockAndFunds();
    this.renderActiveSim();
    this.renderSwitcher();
    this.renderActionQueue();
    this.renderDrawer();
  }

  renderClockAndFunds() {
    const c = this.engine.getFormattedClock();
    this.$day.textContent = c.dayStr;
    this.$time.textContent = c.timeStr;
    this.$phase.textContent = c.phase;
    this.$funds.textContent = `§ ${this.engine.funds.toLocaleString()}`;

    const nf = this.engine.sims.naifen;
    if (nf.playable) {
      this.$naifenBtnLabel.textContent = '定位奶粉';
      this.$naifenStatusText.textContent = '💗 奶粉已是正式同居室友！';
    } else if (nf.visiting) {
      this.$naifenBtnLabel.textContent = '定位奶粉';
      this.$naifenStatusText.textContent = '💗 奶粉正在屋里粘着奶鼠！';
    } else {
      this.$naifenBtnLabel.textContent = '喊奶粉串门';
      this.$naifenStatusText.textContent = '🌸 奶粉在隔壁粉红小屋（点击喊来玩）';
    }
  }

  renderActiveSim() {
    const s = this.engine.getSelectedSim();
    const tpl = CHARACTER_TEMPLATES[s.id];
    const moodStyle = MOOD_STYLES[s.mood] || MOOD_STYLES.fine;

    this.$activeAvatar.innerHTML = getCharacterAvatarSVG(s.id);
    this.$activeRing.style.background = moodStyle.ring;
    this.$activeMoodLabel.textContent = moodStyle.label;
    this.$activeMoodLabel.style.background = moodStyle.color;
    this.$activeName.textContent = s.name;
    this.$activeAction.textContent = s.atWork
      ? `💼 上班中（剩 ${Math.ceil(s.workHoursLeft)}h）`
      : s.currentTask
      ? `${s.currentTask.icon} ${s.currentTask.label}`
      : '✨ 自由活动中';

    this.$activeTraits.innerHTML = tpl.traits.map((t) => `<span class="trait-tag">${t}</span>`).join('');
    this.$moodlets.innerHTML = s.moodlets
      .slice(-3)
      .map((m) => {
        const cls = m.mood === 'playful' ? 'playful' : m.mood === 'focused' ? 'focused' : m.mood === 'dazed' ? 'dazed' : (m.mood === 'angry' || m.mood === 'sad' || m.mood === 'uncomfortable') ? 'bad' : '';
        return `<span class="moodlet-pill ${cls}">${m.icon} ${m.label} +${m.weight}</span>`;
      })
      .join('');
  }

  renderSwitcher() {
    const playables = this.engine.getPlayableSims();
    this.$switcher.innerHTML = '';
    playables.forEach((s) => {
      const avg = Object.values(s.needs).reduce((a, b) => a + b, 0) / 6;
      const btn = document.createElement('button');
      btn.className = `sim-switch-btn ${s.id === this.engine.selectedSimId ? 'selected' : ''}`;
      btn.title = `点击切换控制 ${s.name}，双击聚焦镜头`;
      btn.innerHTML = `
        <div class="switch-avatar">${getCharacterAvatarSVG(s.id)}</div>
        <div class="switch-info">
          <strong>${s.name}</strong>
          <div class="switch-need-bar"><div class="switch-need-fill" style="width:${Math.round(avg)}%;background:${needColor(avg)}"></div></div>
        </div>
      `;
      btn.addEventListener('click', () => this.engine.selectSim(s.id));
      btn.addEventListener('dblclick', () => {
        this.engine.selectSim(s.id);
        this.hooks.onFocusSim(s.id);
      });
      this.$switcher.appendChild(btn);
    });
  }

  renderActionQueue() {
    const s = this.engine.getSelectedSim();
    const list = [];
    if (s.currentTask) list.push({ ...s.currentTask, active: true });
    s.queue.forEach((q) => list.push({ ...q, active: false }));

    this.$actionQueue.innerHTML = '';
    list.forEach((t) => {
      const chip = document.createElement('div');
      chip.className = `queue-chip ${t.active ? 'active-task' : ''}`;
      const pct = t.active ? Math.round((t.progress || 0) * 100) : 0;
      chip.innerHTML = `
        <span class="queue-icon-ring">${t.icon || '✨'}</span>
        <span>${t.label}</span>
        <button class="queue-cancel" title="取消此行动">✕</button>
        ${t.active ? `<div class="queue-progress-bar" style="width:${pct}%"></div>` : ''}
      `;
      chip.querySelector('.queue-cancel').addEventListener('click', () => {
        this.engine.cancelTask(s.id, t.id);
      });
      this.$actionQueue.appendChild(chip);
    });
  }

  renderDrawer() {
    const s = this.engine.getSelectedSim();
    const titles = {
      needs: `❤️ ${s.name} 的六大需求`,
      relations: `💞 ${s.name} 的关系与羁绊`,
      skills: `⭐ ${s.name} 的事业与技能`,
      aspirations: `🏆 ${s.name} 的人生抱负`,
      shop: '🛋️ 简化建造与装修商店',
    };
    this.$drawerTitle.textContent = titles[this.activeTab] || '';

    if (this.activeTab === 'needs') {
      this.$drawerBody.innerHTML = `<div class="needs-list">${NEED_META.map((n) => {
        const val = Math.round(s.needs[n.id]);
        return `<div class="need-row">
          <span class="need-label">${n.icon} ${n.label}</span>
          <div class="need-track"><div class="need-fill" style="width:${val}%;background:${needColor(val)}"></div></div>
          <span class="need-pct">${val}%</span>
        </div>`;
      }).join('')}</div>`;
      return;
    }

    if (this.activeTab === 'relations') {
      const others = Object.values(this.engine.sims)
        .filter((o) => o.id !== s.id)
        .sort((a, b) => {
          const aSpec = (s.id === 'naishu' && a.id === 'naifen') || (s.id === 'naifen' && a.id === 'naishu') ? 1 : 0;
          const bSpec = (s.id === 'naishu' && b.id === 'naifen') || (s.id === 'naifen' && b.id === 'naishu') ? 1 : 0;
          if (bSpec !== aSpec) return bSpec - aSpec;
          return this.engine.getRelation(s.id, b.id).bond - this.engine.getRelation(s.id, a.id).bond;
        });
      this.$drawerBody.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'rel-list';

      others.forEach((o) => {
        const rel = this.engine.getRelation(s.id, o.id);
        const isPair = (s.id === 'naishu' && o.id === 'naifen') || (s.id === 'naifen' && o.id === 'naishu');
        const card = document.createElement('div');
        card.className = `rel-card ${isPair ? 'special-pair' : ''}`;
        const fPct = Math.round((rel.friendship + 100) / 2);
        const bPct = Math.round(rel.bond);
        const canInvite = o.id === 'naifen' && !o.playable && (rel.friendship >= 65 || rel.bond >= 60);

        card.innerHTML = `
          <div class="rel-top">
            <div class="rel-name-wrap">
              <div class="switch-avatar" style="width:28px;height:28px">${getCharacterAvatarSVG(o.id)}</div>
              <strong>${o.name}${o.isNeighbor && !o.playable ? ' (邻居)' : ''}</strong>
            </div>
            <span class="rel-badge ${isPair ? 'pink' : ''}">${getRelationTitle(s.id, o.id, rel)}</span>
          </div>
          <div class="rel-bars">
            <div class="rel-bar-row">
              <span>友谊</span>
              <div class="need-track"><div class="need-fill" style="width:${fPct}%;background:#2cc764"></div></div>
              <span>${rel.friendship}</span>
            </div>
            <div class="rel-bar-row">
              <span>${isPair ? '相爱相杀' : '羁绊'}</span>
              <div class="need-track"><div class="need-fill" style="width:${bPct}%;background:#f06292"></div></div>
              <span>${rel.bond}</span>
            </div>
          </div>
          <div class="rel-actions"></div>
        `;
        const actWrap = card.querySelector('.rel-actions');

        if (o.id === 'naifen' && !o.visiting && !o.playable) {
          const callBtn = document.createElement('button');
          callBtn.className = 'rel-mini-btn';
          callBtn.textContent = '📞 喊来串门';
          callBtn.addEventListener('click', () => this.engine.summonNaifen());
          actWrap.appendChild(callBtn);
        } else {
          const goBtn = document.createElement('button');
          goBtn.className = 'rel-mini-btn';
          goBtn.textContent = '🎯 镜头定位';
          goBtn.addEventListener('click', () => this.hooks.onFocusSim(o.id));
          actWrap.appendChild(goBtn);
        }

        if (canInvite) {
          const invBtn = document.createElement('button');
          invBtn.className = 'rel-mini-btn golden';
          invBtn.textContent = '🏠 邀请搬来同居！';
          invBtn.addEventListener('click', () => {
            if (!o.visiting) this.engine.summonNaifen(true);
            this.engine.moveInNaifen();
          });
          actWrap.appendChild(invBtn);
        }

        wrap.appendChild(card);
      });

      this.$drawerBody.appendChild(wrap);
      return;
    }

    if (this.activeTab === 'skills') {
      const skLv = s.skills[s.career.skillId]?.level || 1;
      const pay = Math.round(s.career.payPerShift * (1 + (skLv - 1) * 0.2));
      this.$drawerBody.innerHTML = `
        <div class="career-card">
          <div class="career-top">
            <strong>💼 ${s.career.title}</strong>
            <span class="career-pay">§${pay} / 班</span>
          </div>
          <div class="career-sub">班次 ${s.career.shiftHours} 小时 · 提升对应技能可涨薪！</div>
          <button class="career-btn" id="btn-go-work" ${s.atWork ? 'disabled' : ''}>
            ${s.atWork ? `上班中（还剩 ${Math.ceil(s.workHoursLeft)} 小时）` : '立刻出门去上班赚奶币！'}
          </button>
        </div>
        <div class="skills-grid">
          ${SKILL_META.map((sk) => {
            const st = s.skills[sk.id];
            return `<div class="skill-row">
              <span>${sk.icon} ${sk.label}</span>
              <div class="need-track"><div class="need-fill" style="width:${st.xp}%;background:#3b82f6"></div></div>
              <span class="need-pct">Lv.${st.level}</span>
            </div>`;
          }).join('')}
        </div>
      `;
      const workBtn = this.$drawerBody.querySelector('#btn-go-work');
      if (workBtn) workBtn.addEventListener('click', () => this.engine.sendToWork(s.id));
      return;
    }

    if (this.activeTab === 'aspirations') {
      const asp = CHARACTER_TEMPLATES[s.id].aspiration;
      this.$drawerBody.innerHTML = `
        <div class="asp-card">
          <div class="asp-title">🏆 ${asp.title}</div>
          <div class="asp-desc">${asp.desc}</div>
          ${asp.goals.map((g) => {
            const cur = this.engine.getGoalProgress(s, g);
            const done = cur >= g.target;
            return `<div class="asp-goal ${done ? 'done' : ''}">
              <span>${done ? '✅' : '⬜'} ${g.text}</span>
              <strong>${cur}/${g.target}</strong>
            </div>`;
          }).join('')}
        </div>
      `;
      return;
    }

    if (this.activeTab === 'shop') {
      this.$drawerBody.innerHTML = '';
      // Room Theme Quick Swatches
      const themeLabel = document.createElement('div');
      themeLabel.style.cssText = 'font-size:11px;font-weight:800;color:var(--ink-soft);margin-bottom:6px;';
      themeLabel.textContent = '🎨 一键切换全屋装修风格（免费）';
      this.$drawerBody.appendChild(themeLabel);

      const themeRow = document.createElement('div');
      themeRow.className = 'theme-row';
      ROOM_THEMES.forEach((t) => {
        const b = document.createElement('button');
        b.className = `theme-swatch ${this.engine.roomTheme === t.id ? 'active' : ''}`;
        b.textContent = t.label;
        b.addEventListener('click', () => this.engine.setRoomTheme(t.id));
        themeRow.appendChild(b);
      });
      this.$drawerBody.appendChild(themeRow);

      // Buyable Furniture Grid
      const shopLabel = document.createElement('div');
      shopLabel.style.cssText = 'font-size:11px;font-weight:800;color:var(--ink-soft);margin-bottom:6px;';
      shopLabel.textContent = '🛋️ 购买新家具（点击后在 3D 地面落位）';
      this.$drawerBody.appendChild(shopLabel);

      const grid = document.createElement('div');
      grid.className = 'shop-grid';
      Object.values(FURNITURE_CATALOG)
        .filter((f) => !f.notBuyable)
        .forEach((f) => {
          const card = document.createElement('button');
          card.className = 'shop-item';
          card.innerHTML = `
            <div class="si-top"><span class="si-ico">${f.icon}</span><span class="si-price">§${f.price}</span></div>
            <div class="si-name">${f.name}</div>
            <div class="si-effect">${f.summary}</div>
          `;
          card.addEventListener('click', () => {
            if (this.engine.funds < f.price) {
              this.showToast({ icon: '💸', title: '奶币不够啦', body: `需要 §${f.price}，快让奶豆接单或奶蛙画名画赚奶币！`, variant: 'warn' });
              return;
            }
            this.hooks.onStartPlacement(f.type);
          });
          grid.appendChild(card);
        });
      this.$drawerBody.appendChild(grid);
    }
  }
}
