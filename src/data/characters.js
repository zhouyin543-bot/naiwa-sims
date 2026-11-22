// Character definitions for Naiwa (奶蛙), Naishu (奶鼠), Naidou (奶豆), and Neighbor/Roommate Naifen (奶粉)

export const NEED_META = [
  { id: 'hunger',  label: '饥饿', icon: '🍔', decayPerHour: 6.0 },
  { id: 'bladder', label: '如厕', icon: '🚽', decayPerHour: 7.5 },
  { id: 'energy',  label: '精力', icon: '😴', decayPerHour: 4.5 },
  { id: 'social',  label: '社交', icon: '💬', decayPerHour: 5.5 },
  { id: 'hygiene', label: '卫生', icon: '🛁', decayPerHour: 4.0 },
  { id: 'fun',     label: '娱乐', icon: '🎮', decayPerHour: 6.2 },
];

export const SKILL_META = [
  { id: 'comedy',   label: '搞笑抽象', icon: '🤣' },
  { id: 'cooking',  label: '厨艺零食', icon: '🧀' },
  { id: 'logic',    label: '大脑逻辑', icon: '🧠' },
  { id: 'painting', label: '名画艺术', icon: '🎨' },
  { id: 'charisma', label: '社交魅力', icon: '✨' },
];

export const MOOD_STYLES = {
  happy:       { label: '开心',     color: '#26c45e', ring: 'linear-gradient(145deg, #5ef090, #1eb253)', plumbob: 0x2de06b },
  playful:     { label: '狂喜上头', color: '#eb4b88', ring: 'linear-gradient(145deg, #ff8db8, #e03c7b)', plumbob: 0xff62a5 },
  focused:     { label: '专注',     color: '#2396f3', ring: 'linear-gradient(145deg, #6dc1ff, #1778d4)', plumbob: 0x35a8ff },
  confident:   { label: '自信爆棚', color: '#14b8a6', ring: 'linear-gradient(145deg, #5eead4, #0d9488)', plumbob: 0x2dd4bf },
  fine:        { label: '平静',     color: '#6ec47e', ring: 'linear-gradient(145deg, #a6e3b1, #5cb46d)', plumbob: 0x62d97b },
  dazed:       { label: '懵圈发呆', color: '#f59e0b', ring: 'linear-gradient(145deg, #fcd34d, #d97706)', plumbob: 0xfbbf24 },
  angry:       { label: '气呼呼',   color: '#ef4444', ring: 'linear-gradient(145deg, #fb7185, #dc2626)', plumbob: 0xef4444 },
  sad:         { label: '委屈巴巴', color: '#64748b', ring: 'linear-gradient(145deg, #94a3b8, #475569)', plumbob: 0x7c93b5 },
  uncomfortable: { label: '难受',   color: '#f97316', ring: 'linear-gradient(145deg, #fdba74, #ea580c)', plumbob: 0xf97316 },
};

export const CHARACTER_TEMPLATES = {
  naiwa: {
    id: 'naiwa',
    name: '奶蛙',
    species: 'naiwa',
    playable: true,
    isNeighbor: false,
    bio: '梨形肚肚大笑担当，随时能捧腹狂笑到全小区震动。',
    palette: {
      body: 0xf8d060,
      belly: 0xfff5d6,
      limbs: 0x6c5e43,
      eyeRing: 0x83cc73,
      accent: '#f8d060',
      badgeBg: '#fff3c4',
    },
    traits: ['抽象狂笑者', '社牛戏精', '文艺复兴魂'],
    needMultipliers: { fun: 0.75, social: 1.15, hunger: 1.0, energy: 1.0, bladder: 1.0, hygiene: 1.0 },
    skillMultipliers: { comedy: 1.5, painting: 1.35, charisma: 1.2 },
    career: {
      title: '抽象脱口秀演员',
      level: 1,
      payPerShift: 220,
      shiftHours: 4,
      skillId: 'comedy',
    },
    aspiration: {
      title: '奶蛙文艺复兴大师',
      desc: '用笑声和名画征服整个小区！',
      goals: [
        { id: 'laugh_3', text: '捧腹大笑或逗笑伙伴 3 次', target: 3, stat: 'laughs' },
        { id: 'paint_2', text: '在画架创作 2 幅《奶蛙名画》', target: 2, stat: 'paintings' },
        { id: 'comedy_3', text: '搞笑抽象技能达到 3 级', target: 3, skill: 'comedy' },
      ],
    },
    spawn: { x: -2.2, z: 1.6 },
    idleLines: [
      '哈哈哈哈哈哈哈哈！',
      '肚子一挺，烦恼清零~',
      '今天画一幅《星月奶蛙夜》吧！',
      '奶鼠别光吃零食，一起笑啊！',
    ],
  },

  naishu: {
    id: 'naishu',
    name: '奶鼠',
    species: 'naishu',
    playable: true,
    isNeighbor: false,
    bio: '大圆耳朵零食重度依赖，总是被黏人邻居奶粉又抱又欺负。',
    palette: {
      body: 0xf9d566,
      belly: 0xfff6dc,
      earInner: 0xf4a582,
      limbs: 0x736249,
      eyeRing: 0x83cc73,
      accent: '#f4a582',
      badgeBg: '#ffecd6',
    },
    traits: ['零食重度依赖', '吸粉体质', '迷糊小可爱'],
    needMultipliers: { hunger: 1.25, social: 1.05, fun: 0.9, energy: 1.0, bladder: 1.0, hygiene: 1.0 },
    skillMultipliers: { cooking: 1.5, charisma: 1.25 },
    career: {
      title: '奶酪零食首席试吃官',
      level: 1,
      payPerShift: 200,
      shiftHours: 4,
      skillId: 'cooking',
    },
    aspiration: {
      title: '终极零食与驯粉大师',
      desc: '吃遍天下奶酪，顺便把奶粉收服成室友！',
      goals: [
        { id: 'snacks_3', text: '狂炫零食或下厨做饭 3 次', target: 3, stat: 'snacks' },
        { id: 'naifen_bond', text: '与奶粉的羁绊达到 60', target: 60, bondWith: 'naifen' },
        { id: 'movein_naifen', text: '成功邀请奶粉搬来同居', target: 1, stat: 'naifenMovedIn' },
      ],
    },
    spawn: { x: 2.5, z: 1.8 },
    idleLines: [
      '嘎吱嘎吱…最后一片奶酪！',
      '怎么感觉门口有粉粉的气息…',
      '奶粉别老压扁我呀！',
      '耳朵好大，风声听得好清楚~',
    ],
  },

  naidou: {
    id: 'naidou',
    name: '奶豆',
    species: 'naidou',
    playable: true,
    isNeighbor: false,
    bio: '体型极小但 98% 都是大脑的理性宅豆，全家的智商与房租支柱。',
    palette: {
      body: 0xfbe263,
      belly: 0xfff9dd,
      limbs: 0x9b8347,
      eyeRing: 0x83cc73,
      accent: '#98d96e',
      badgeBg: '#eefbe3',
    },
    traits: ['98%都是大脑', '轻度社恐宅豆', '理性吐槽役'],
    needMultipliers: { social: 0.65, fun: 0.85, energy: 0.95, hunger: 0.9, bladder: 0.9, hygiene: 0.9 },
    skillMultipliers: { logic: 1.65, painting: 1.15 },
    career: {
      title: '奶鼠宇宙论首席研究员',
      level: 1,
      payPerShift: 260,
      shiftHours: 4,
      skillId: 'logic',
    },
    aspiration: {
      title: '奶界诺贝尔得主',
      desc: '用 98% 的大脑解开奶系宇宙终极方程！',
      goals: [
        { id: 'logic_3', text: '大脑逻辑技能达到 3 级', target: 3, skill: 'logic' },
        { id: 'code_3', text: '在电脑研究或接单 3 次', target: 3, stat: 'research' },
        { id: 'funds_2000', text: '家庭存款达到 § 2,000', target: 2000, householdFunds: true },
      ],
    },
    spawn: { x: 2.0, z: -3.2 },
    idleLines: [
      '根据奶鼠宇宙论，零食守恒…',
      '我的小短腿走得好累，但大脑在飞速运转。',
      '奶蛙又在客厅制造 90 分贝噪音了。',
      '奶粉今天又会怎么迫害奶鼠呢？记进观察日记。',
    ],
  },

  naifen: {
    id: 'naifen',
    name: '奶粉',
    species: 'naifen',
    playable: false, // Starts as frequent clingy neighbor NPC; unlocks playable when invited to move in!
    isNeighbor: true,
    bio: '粉白配色的傲娇黏人邻居，和奶鼠形影不离：一会儿抱怀里贴贴，一会儿跳起来压扁奶鼠！',
    palette: {
      body: 0xf8a6be,
      belly: 0xfff0f5,
      limbs: 0x8d5b6c,
      eyeRing: 0x83cc73,
      accent: '#f58cab',
      badgeBg: '#ffe6ef',
    },
    traits: ['奶鼠头号粘人精', '傲娇整蛊王', '粉白甜心'],
    needMultipliers: { social: 1.25, fun: 1.0, hunger: 1.0, energy: 1.0, bladder: 1.0, hygiene: 1.0 },
    skillMultipliers: { charisma: 1.45, comedy: 1.35, cooking: 1.2 },
    career: {
      title: '粉红甜品店霸总',
      level: 1,
      payPerShift: 240,
      shiftHours: 4,
      skillId: 'charisma',
    },
    aspiration: {
      title: '和奶鼠永远贴贴',
      desc: '每天都要和奶鼠打卡合影、又抱又闹！',
      goals: [
        { id: 'hug_3', text: '和奶鼠贴贴抱抱或合影 3 次', target: 3, stat: 'cuddles' },
        { id: 'prank_2', text: '压扁或整蛊奶鼠 2 次', target: 2, stat: 'pranks' },
        { id: 'charisma_3', text: '社交魅力技能达到 3 级', target: 3, skill: 'charisma' },
      ],
    },
    spawn: { x: 0.4, z: 9.2 }, // Front sidewalk
    idleLines: [
      '奶鼠！你在干嘛！快给我抱一下！',
      '哼，我才不是特意带草莓奶茶来看你的…',
      '手好痒，好想把奶鼠压成奶鼠饼！',
      '今天也要和奶鼠形影不离💗',
    ],
  },
};

export function relKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function createInitialRelationships() {
  // Canonical sorted keys via relKey()
  return {
    [relKey('naiwa', 'naishu')]:  { friendship: 48, bond: 22 },
    [relKey('naidou', 'naiwa')]:  { friendship: 36, bond: 15 },
    [relKey('naidou', 'naishu')]: { friendship: 45, bond: 25 },
    [relKey('naifen', 'naishu')]: { friendship: 42, bond: 44 }, // Already inseparable chaotic duo!
    [relKey('naifen', 'naiwa')]:  { friendship: 25, bond: 10 },
    [relKey('naidou', 'naifen')]: { friendship: 18, bond: 8 },
  };
}

export function getRelationTitle(a, b, rel) {
  const isSpecial = (a === 'naifen' && b === 'naishu') || (a === 'naishu' && b === 'naifen');
  if (isSpecial) {
    if (rel.bond >= 80 && rel.friendship >= 70) return '💗 形影不离灵魂伴侣';
    if (rel.bond >= 60) return '💞 贴贴冤家（可邀同居）';
    if (rel.friendship < 0) return '⚡ 刚打完架的冤家';
    return '🌸 相爱相杀固定搭档';
  }
  if (rel.friendship >= 80) return '🌟 过命合租铁哥们';
  if (rel.friendship >= 50) return '😊 默契好室友';
  if (rel.friendship >= 15) return '👋 熟悉伙伴';
  if (rel.friendship >= -15) return '😐 点头之交';
  return '💢 塑料室友';
}

// Inline SVG portrait generator so portraits match the exact clay look of each character!
export function getCharacterAvatarSVG(id) {
  switch (id) {
    case 'naiwa':
      return `<svg viewBox="0 0 64 64" width="100%" height="100%">
        <rect width="64" height="64" fill="#FFF7DF"/>
        <ellipse cx="32" cy="40" rx="21" ry="22" fill="#F8D060"/>
        <ellipse cx="32" cy="48" rx="14" ry="12" fill="#FFF4D1"/>
        <circle cx="22" cy="24" r="6.5" fill="#83CC73"/><circle cx="22" cy="24" r="3.4" fill="#181818"/><circle cx="20.6" cy="22.4" r="1.3" fill="#fff"/>
        <circle cx="42" cy="24" r="6.5" fill="#83CC73"/><circle cx="42" cy="24" r="3.4" fill="#181818"/><circle cx="40.6" cy="22.4" r="1.3" fill="#fff"/>
        <path d="M23 33 Q32 42 41 33 Z" fill="#5A2328"/>
      </svg>`;
    case 'naishu':
      return `<svg viewBox="0 0 64 64" width="100%" height="100%">
        <rect width="64" height="64" fill="#FFF4E6"/>
        <circle cx="15" cy="19" r="12" fill="#F9D566"/><circle cx="15.5" cy="19.5" r="8" fill="#F4A582"/>
        <circle cx="49" cy="19" r="12" fill="#F9D566"/><circle cx="48.5" cy="19.5" r="8" fill="#F4A582"/>
        <ellipse cx="32" cy="42" rx="19" ry="20" fill="#F9D566"/>
        <ellipse cx="32" cy="49" rx="12" ry="10" fill="#FFF6DC"/>
        <circle cx="24" cy="31" r="5.5" fill="#83CC73"/><circle cx="24" cy="31" r="3" fill="#181818"/><circle cx="22.8" cy="29.6" r="1.2" fill="#fff"/>
        <circle cx="40" cy="31" r="5.5" fill="#83CC73"/><circle cx="40" cy="31" r="3" fill="#181818"/><circle cx="38.8" cy="29.6" r="1.2" fill="#fff"/>
        <path d="M27 38 Q32 43 37 38" stroke="#5A3E24" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </svg>`;
    case 'naidou':
      return `<svg viewBox="0 0 64 64" width="100%" height="100%">
        <rect width="64" height="64" fill="#F1FBE9"/>
        <ellipse cx="32" cy="37" rx="18" ry="17" fill="#FBE263"/>
        <circle cx="23" cy="33" r="5.8" fill="#83CC73"/><circle cx="23" cy="33" r="3.2" fill="#181818"/><circle cx="21.8" cy="31.5" r="1.2" fill="#fff"/>
        <circle cx="41" cy="33" r="5.8" fill="#83CC73"/><circle cx="41" cy="33" r="3.2" fill="#181818"/><circle cx="39.8" cy="31.5" r="1.2" fill="#fff"/>
        <path d="M27 42 Q32 45 37 42" stroke="#6B5624" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      </svg>`;
    case 'naifen':
      return `<svg viewBox="0 0 64 64" width="100%" height="100%">
        <rect width="64" height="64" fill="#FFF0F5"/>
        <ellipse cx="32" cy="40" rx="21" ry="22" fill="#F8A6BE"/>
        <ellipse cx="32" cy="48" rx="14" ry="12" fill="#FFF0F5"/>
        <circle cx="22" cy="25" r="6.2" fill="#83CC73"/><circle cx="22" cy="25" r="3.3" fill="#181818"/><circle cx="20.7" cy="23.5" r="1.2" fill="#fff"/>
        <circle cx="42" cy="25" r="6.2" fill="#83CC73"/><circle cx="42" cy="25" r="3.3" fill="#181818"/><circle cx="40.7" cy="23.5" r="1.2" fill="#fff"/>
        <path d="M16 18 L27 21 M48 18 L37 21" stroke="#A14363" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M27 35 Q32 39 37 35" stroke="#8F2D4E" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      </svg>`;
    default:
      return '';
  }
}
