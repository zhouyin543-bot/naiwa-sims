// Furniture catalog, interactions, initial Nai Villa furniture placement, and room decor themes

export const ROOM_THEMES = [
  { id: 'cream',  label: '奶油暖木', floorColor: 0xe6cda6, wallColor: 0xfff8ea, accentColor: 0xf8d060 },
  { id: 'sakura', label: '奶粉樱桃', floorColor: 0xf0d5d9, wallColor: 0xfff1f5, accentColor: 0xf58cab },
  { id: 'mint',   label: '奶豆薄荷', floorColor: 0xd9e8dc, wallColor: 0xf3fbf5, accentColor: 0x62d97b },
  { id: 'cozy',   label: '焦糖复古', floorColor: 0xcfa982, wallColor: 0xf8eee0, accentColor: 0xe08f48 },
];

export const FURNITURE_CATALOG = {
  bed_yellow: {
    type: 'bed_yellow',
    name: '奶黄云朵床',
    icon: '🛏️',
    price: 260,
    size: [2, 2],
    summary: '精力++ · 舒适好眠',
    color: 0xf8d060,
    actions: [
      { id: 'sleep', label: '盖被子大睡一觉', icon: '😴', duration: 9, needs: { energy: 70, fun: 5 }, anim: 'sleep', moodlet: { id: 'rested', label: '睡饱饱', icon: '☀️', mood: 'happy', weight: 2, hours: 5 } },
      { id: 'nap', label: '小憩打个盹', icon: '💤', duration: 4, needs: { energy: 28 }, anim: 'sleep' },
      { id: 'bounce_bed', label: '在床上蹦迪发疯', icon: '🤸', duration: 3.5, needs: { fun: 26, energy: -8 }, anim: 'laugh', speech: '蹦床起飞咯！' },
    ],
  },
  bed_pink: {
    type: 'bed_pink',
    name: '奶粉樱花公主床',
    icon: '🎀',
    price: 340,
    size: [2, 2],
    summary: '精力+++ · 奶粉最爱',
    color: 0xf8a6be,
    actions: [
      { id: 'sleep', label: '在樱花床美美入睡', icon: '😴', duration: 8, needs: { energy: 85, fun: 10 }, anim: 'sleep', moodlet: { id: 'pink_dream', label: '粉红甜梦', icon: '🌸', mood: 'playful', weight: 2, hours: 6 } },
      { id: 'nap', label: '赖床打盹', icon: '💤', duration: 3.5, needs: { energy: 35 }, anim: 'sleep' },
    ],
  },
  bed_bean: {
    type: 'bed_bean',
    name: '奶豆迷你太空舱窝',
    icon: '🥚',
    price: 220,
    size: [1, 2],
    summary: '精力++ · 专注加成',
    color: 0xbce8a8,
    actions: [
      { id: 'sleep', label: '钻进迷你窝睡觉', icon: '😴', duration: 8.5, needs: { energy: 75 }, anim: 'sleep', moodlet: { id: 'brain_rest', label: '大脑充能', icon: '🧠', mood: 'focused', weight: 2, hours: 5 } },
    ],
  },
  sofa: {
    type: 'sofa',
    name: '巨型奶酪豆袋沙发',
    icon: '🛋️',
    price: 280,
    size: [3, 1],
    summary: '精力+ · 娱乐++ · 躺平神座',
    color: 0xffcf56,
    actions: [
      { id: 'lounging', label: '瘫在沙发上刷手机', icon: '📱', duration: 4.5, needs: { fun: 28, energy: 14 }, anim: 'sit', speech: '刷会儿奶蛙搞笑视频~' },
      { id: 'nap_sofa', label: '沙发眯一会儿', icon: '😪', duration: 4, needs: { energy: 24 }, anim: 'sit' },
      { id: 'laugh_sofa', label: '躺着捧腹狂笑', icon: '🤣', duration: 3.5, needs: { fun: 34 }, skill: { id: 'comedy', xp: 24 }, stat: 'laughs', anim: 'laugh', speech: '哈哈哈哈停不下来了！', moodlet: { id: 'hysterical', label: '笑到腹肌痛', icon: '🤣', mood: 'playful', weight: 2, hours: 4 } },
    ],
  },
  tv: {
    type: 'tv',
    name: '奶系大屏电视',
    icon: '📺',
    price: 320,
    size: [2, 1],
    summary: '娱乐+++ · 看抽象番剧',
    actions: [
      { id: 'watch_comedy', label: '看《奶蛙抽象大赏》', icon: '📺', duration: 5, needs: { fun: 42 }, skill: { id: 'comedy', xp: 20 }, anim: 'laugh', speech: '这集奶蛙太抽象了哈哈！', moodlet: { id: 'tv_fun', label: '笑出鹅叫', icon: '📺', mood: 'playful', weight: 2, hours: 4 } },
      { id: 'watch_cooking', label: '看美食吃播学做菜', icon: '🍳', duration: 5, needs: { fun: 24, hunger: -4 }, skill: { id: 'cooking', xp: 28 }, anim: 'sit', speech: '流口水了…记下配方！' },
    ],
  },
  fridge: {
    type: 'fridge',
    name: '双开门奶酪冰箱',
    icon: '🧊',
    price: 290,
    size: [1, 1],
    summary: '饥饿+++ · 随时炫饭',
    actions: [
      { id: 'quick_snack', label: '偷喝冰牛奶吃芝士', icon: '🧀', duration: 3.5, needs: { hunger: 36, fun: 8, bladder: -8 }, stat: 'snacks', anim: 'eat', speech: '冰冰凉凉真香！' },
      { id: 'cook_meal', label: '做一份豪华奶酪意面', icon: '🍝', duration: 6, cost: 15, needs: { hunger: 72, fun: 12 }, skill: { id: 'cooking', xp: 32 }, stat: 'snacks', anim: 'eat', speech: '五星级大厨出手！', moodlet: { id: 'good_meal', label: '吃饱喝足', icon: '🍝', mood: 'happy', weight: 2, hours: 5 } },
    ],
  },
  snack_shelf: {
    type: 'snack_shelf',
    name: '奶鼠豪华零食柜',
    icon: '🍿',
    price: 210,
    size: [2, 1],
    summary: '饥饿++ · 娱乐++ · 奶鼠双倍快乐',
    actions: [
      { id: 'eat_snacks', label: '嘎吱嘎吱狂炫零食', icon: '🍿', duration: 3.5, needs: { hunger: 40, fun: 25 }, stat: 'snacks', anim: 'eat', speech: '薯片、奶酪条、草莓干全都要！', moodlet: { id: 'snack_bliss', label: '零食幸福感', icon: '🍿', mood: 'happy', weight: 2, hours: 4 } },
      { id: 'hide_snacks', label: '藏私房零食防奶粉抢', icon: '🤫', duration: 3, needs: { fun: 16 }, anim: 'interact', speech: '藏在最底层，奶粉绝对找不到…' },
    ],
  },
  dining_table: {
    type: 'dining_table',
    name: '奶油圆餐桌',
    icon: '🍽️',
    price: 180,
    size: [2, 2],
    summary: '社交+ · 聚餐聊天桌',
    actions: [
      { id: 'tea_time', label: '泡一杯奶盖下午茶', icon: '🧋', duration: 4, cost: 10, needs: { hunger: 26, energy: 14, fun: 15, bladder: -10 }, anim: 'eat', speech: '奶盖配小饼干，神仙日子~' },
    ],
  },
  pc_desk: {
    type: 'pc_desk',
    name: '高配电脑学习桌',
    icon: '💻',
    price: 380,
    size: [2, 1],
    summary: '逻辑++ · 在家写代码赚钱 §',
    actions: [
      { id: 'code_freelance', label: '写代码接单赚外快 (+§95)', icon: '💰', duration: 6, needs: { fun: -6, energy: -12 }, earn: 95, skill: { id: 'logic', xp: 34 }, stat: 'research', anim: 'work', speech: '98% 大脑超频中，Bug 退散！', moodlet: { id: 'in_zone', label: '心流专注', icon: '💻', mood: 'focused', weight: 2, hours: 4 } },
      { id: 'post_meme', label: '发奶蛙抽象表情包 (+§45)', icon: '🐸', duration: 4, needs: { fun: 24, social: 14 }, earn: 45, skill: { id: 'comedy', xp: 24 }, stat: 'laughs', anim: 'work', speech: '哈哈哈热评第一了！' },
      { id: 'play_game', label: '打《合成大奶蛙》摸鱼', icon: '🎮', duration: 4.5, needs: { fun: 48, energy: -5 }, anim: 'work', speech: '差一点就合出巨型奶蛙了！' },
    ],
  },
  easel: {
    type: 'easel',
    name: '奶蛙博物馆画架',
    icon: '🎨',
    price: 250,
    size: [1, 1],
    summary: '艺术++ · 卖《奶蛙名画》赚大钱 §',
    actions: [
      { id: 'paint_art', label: '创作并出售《奶蛙名画》(+§110)', icon: '🖼️', duration: 6.5, needs: { fun: 26, energy: -8 }, earn: 110, skill: { id: 'painting', xp: 38 }, stat: 'paintings', anim: 'interact', speech: '这幅《呐喊奶蛙》必入博物馆！', moodlet: { id: 'inspired_art', label: '文艺复兴之魂', icon: '🎨', mood: 'confident', weight: 2, hours: 5 } },
    ],
  },
  bookshelf: {
    type: 'bookshelf',
    name: '《奶蛙学》大书架',
    icon: '📚',
    price: 190,
    size: [2, 1],
    summary: '逻辑++ · 魅力+ · 安静充电',
    actions: [
      { id: 'read_logic', label: '研读《奶鼠宇宙论》', icon: '📖', duration: 5, needs: { fun: 16 }, skill: { id: 'logic', xp: 30 }, stat: 'research', anim: 'interact', speech: '奶龙是神，奶鼠是宇宙…太深刻了！', moodlet: { id: 'deep_think', label: '脑洞大开', icon: '🧠', mood: 'focused', weight: 2, hours: 4 } },
      { id: 'read_charisma', label: '读《如何哄好傲娇奶粉》', icon: '💗', duration: 4.5, needs: { fun: 18 }, skill: { id: 'charisma', xp: 30 }, anim: 'interact', speech: '第一条：先给抱抱再递奶酪！' },
    ],
  },
  toilet: {
    type: 'toilet',
    name: '智能马桶',
    icon: '🚽',
    price: 160,
    size: [1, 1],
    summary: '如厕+++ · 清爽减压',
    actions: [
      { id: 'use_toilet', label: '畅快上厕所', icon: '🚽', duration: 3, needs: { bladder: 92, hygiene: -6 }, anim: 'sit', speech: '啊——浑身轻松！' },
    ],
  },
  shower: {
    type: 'shower',
    name: '暖泡泡淋浴浴缸',
    icon: '🛁',
    price: 280,
    size: [2, 1],
    summary: '卫生+++ · 泡泡解压',
    actions: [
      { id: 'take_bath', label: '洗香喷喷奶油泡泡浴', icon: '🫧', duration: 5, needs: { hygiene: 95, fun: 20, energy: 8 }, anim: 'interact', speech: '香香软软，亮晶晶！', moodlet: { id: 'fresh_clean', label: '香喷喷', icon: '🫧', mood: 'happy', weight: 2, hours: 5 } },
    ],
  },
  arcade: {
    type: 'arcade',
    name: '复古奶蛙街机',
    icon: '🕹️',
    price: 360,
    size: [1, 1],
    summary: '娱乐++++ · 搞笑+',
    actions: [
      { id: 'play_arcade', label: '猛搓街机刷新纪录', icon: '🕹️', duration: 4.5, needs: { fun: 62, energy: -6 }, skill: { id: 'comedy', xp: 18 }, anim: 'laugh', speech: '连击 99！这把稳了！', moodlet: { id: 'gamer_high', label: '街机大神', icon: '🕹️', mood: 'playful', weight: 2, hours: 4 } },
    ],
  },
  pink_cushion: {
    type: 'pink_cushion',
    name: '奶粉巨型爱心抱枕',
    icon: '💗',
    price: 150,
    size: [1, 1],
    summary: '娱乐++ · 吸引奶粉更爱串门',
    actions: [
      { id: 'hug_cushion', label: '埋进粉色爱心抱枕打滚', icon: '💗', duration: 3.5, needs: { fun: 28, social: 14, energy: 10 }, anim: 'cuddle', speech: '软乎乎的，闻起来像草莓牛奶~', moodlet: { id: 'soft_heart', label: '心都化了', icon: '💗', mood: 'playful', weight: 2, hours: 4 } },
    ],
  },
  swing: {
    type: 'swing',
    name: '前院双人花园秋千',
    icon: '🌿',
    price: 240,
    size: [2, 1],
    summary: '娱乐++ · 吹风放空',
    actions: [
      { id: 'use_swing', label: '在阳光下荡秋千发呆', icon: '☀️', duration: 5, needs: { fun: 38, energy: 10 }, anim: 'sit', speech: '微风吹过脸颊好舒服~', moodlet: { id: 'sunny_breeze', label: '阳光治愈', icon: '🌿', mood: 'happy', weight: 2, hours: 4 } },
    ],
  },
  plant: {
    type: 'plant',
    name: '治愈龟背竹盆栽',
    icon: '🪴',
    price: 90,
    size: [1, 1],
    summary: '装饰美化 · 提升居家好心情',
    actions: [
      { id: 'water_plant', label: '给绿植浇水说悄悄话', icon: '💧', duration: 3, needs: { fun: 12, social: 8 }, anim: 'interact', speech: '快快长高哦小叶子~' },
    ],
  },
  mailbox: {
    type: 'mailbox',
    name: '奶家花园信箱',
    icon: '📬',
    price: 0,
    notBuyable: true,
    size: [1, 1],
    summary: '收信 & 触发惊喜',
    actions: [
      { id: 'check_mail', label: '翻看信箱里的粉丝来信', icon: '💌', duration: 3, needs: { fun: 16, social: 12 }, earn: 30, anim: 'interact', speech: '哇！粉丝寄来了奶币打赏！' },
    ],
  },
};

export const INITIAL_FURNITURE = [
  // Bedroom (x: -7..0, z: -6..-1)
  { id: 'f_bed1', type: 'bed_yellow', x: -5.5, z: -4.6, rot: 0 },
  { id: 'f_bed2', type: 'bed_bean',   x: -1.4, z: -4.6, rot: 0 },
  { id: 'f_bed3', type: 'bed_yellow', x: -5.5, z: -2.2, rot: Math.PI / 2 },

  // Study & Studio (x: 0..4, z: -6..-1)
  { id: 'f_pc',    type: 'pc_desk',   x: 2.0, z: -5.1, rot: 0 },
  { id: 'f_easel', type: 'easel',     x: 0.9, z: -2.5, rot: Math.PI / 4 },
  { id: 'f_book',  type: 'bookshelf', x: 3.3, z: -3.2, rot: -Math.PI / 2 },

  // Bathroom (x: 4..7, z: -6..-1)
  { id: 'f_shower', type: 'shower', x: 5.5, z: -5.1, rot: 0 },
  { id: 'f_toilet', type: 'toilet', x: 6.2, z: -2.6, rot: -Math.PI / 2 },

  // Living Room (x: -7..1, z: -1..4)
  { id: 'f_sofa',  type: 'sofa',  x: -3.4, z: 0.6, rot: 0 },
  { id: 'f_tv',    type: 'tv',    x: -3.4, z: 3.1, rot: Math.PI },
  { id: 'f_plant', type: 'plant', x: -6.2, z: 3.2, rot: 0 },

  // Kitchen & Dining (x: 1..7, z: -1..4)
  { id: 'f_fridge', type: 'fridge',       x: 6.1, z: 0.2, rot: -Math.PI / 2 },
  { id: 'f_snack',  type: 'snack_shelf',  x: 3.4, z: -0.2, rot: 0 },
  { id: 'f_table',  type: 'dining_table', x: 4.0, z: 2.2, rot: 0 },

  // Front Yard (z: 4..10)
  { id: 'f_swing',   type: 'swing',   x: -4.2, z: 6.8, rot: 0 },
  { id: 'f_mailbox', type: 'mailbox', x: 3.6,  z: 7.4, rot: 0 },
];
