// Absurd Meme Random Events (Sims-style Chance Cards with branching choices!)

export const RANDOM_EVENTS = [
  {
    id: 'naifen_midnight_tea',
    tag: '💗 奶粉×奶鼠专属事件',
    emoji: '🧋',
    title: '奶粉拎着双倍珍珠奶茶敲窗户！',
    desc: '窗外突然冒出一张粉白大脸！奶粉举着两杯草莓芝士奶盖，嘴硬地说：“顺路多买了一杯，才不是专门给奶鼠送的，不开窗我就把你压成奶鼠饼！”',
    choices: [
      {
        title: '马上开窗抱抱贴贴并收下奶茶',
        sub: '奶鼠&奶粉 友谊+14、羁绊+15，奶鼠饥饿+35，获得「甜到心坎」情绪',
        apply(engine) {
          engine.adjustRelation('naishu', 'naifen', 14, 15);
          engine.adjustNeed('naishu', 'hunger', 35);
          engine.adjustNeed('naishu', 'social', 25);
          engine.addMoodlet('naishu', { id: 'tea_love', label: '草莓奶茶贴贴', icon: '🧋', mood: 'happy', weight: 3, hours: 6 });
          engine.summonNaifen(true);
          return '奶粉嘴角藏不住笑，顺手把奶鼠抱在怀里揉了好几下大耳朵！';
        },
      },
      {
        title: '抢走奶茶，顺手用红绳反套住奶粉！',
        sub: '奶鼠&奶粉 羁绊+18、娱乐+35，奶鼠获得「驯粉高手」自信情绪',
        apply(engine) {
          engine.adjustRelation('naishu', 'naifen', 8, 18);
          engine.adjustNeed('naishu', 'fun', 35);
          engine.adjustNeed('naishu', 'hunger', 25);
          engine.addMoodlet('naishu', { id: 'leash_win', label: '驯粉高手', icon: '🔴', mood: 'confident', weight: 3, hours: 5 });
          engine.summonNaifen(true);
          return '奶粉愣了两秒：“喂！你居然敢反套我！”然后乖乖跟着奶鼠进屋了。';
        },
      },
      {
        title: '拉上窗帘让奶蛙隔着玻璃捧腹大笑',
        sub: '奶蛙搞笑技能大幅提升，但奶粉气鼓鼓（友谊-6，羁绊+6）',
        apply(engine) {
          engine.adjustRelation('naishu', 'naifen', -6, 6);
          engine.addSkillXp('naiwa', 'comedy', 45);
          engine.adjustNeed('naiwa', 'fun', 40);
          return '奶粉在窗外握紧双拳气成樱花球，奶蛙在客厅笑到打滚！';
        },
      },
    ],
  },

  {
    id: 'naiwa_noise_complaint',
    tag: '🐸 奶蛙抽象事故',
    emoji: '📢',
    title: '奶蛙狂笑引发小区物业上门投诉！',
    desc: '奶蛙刚才连续捧腹大笑 3 分钟，震碎了两片树叶，物业大叔敲门说整条街都回荡着“嘎嘎嘎”的魔性笑声！',
    choices: [
      {
        title: '让奶豆用 98% 大脑当场写 3000 字声学辩护书',
        sub: '奶豆逻辑 XP+45，不仅免罚款，物业还给了 §120 科普稿费！',
        apply(engine) {
          engine.addSkillXp('naidou', 'logic', 45);
          engine.addFunds(120, '物业声学咨询费');
          engine.addMoodlet('naidou', { id: 'brain_carry', label: '大脑带飞全家', icon: '🧠', mood: 'focused', weight: 3, hours: 5 });
          return '物业大叔听完《奶蛙共鸣声波有益健康论》肃然起敬，反手转了 §120 顾问费！';
        },
      },
      {
        title: '奶蛙对着物业再笑一声：以魔法打败魔法！',
        sub: '全员娱乐+35、奶蛙搞笑 XP+40，但被罚 §60 静音费',
        apply(engine) {
          engine.addFunds(-60, '笑声静音罚款');
          engine.addSkillXp('naiwa', 'comedy', 40);
          engine.forEachPlayable((s) => engine.adjustNeed(s.id, 'fun', 35));
          return '物业大叔自己也笑岔气了，一边擦眼泪一边开了张 §60 的单子！';
        },
      },
      {
        title: '奶鼠赶紧塞两包芝士薯片请大叔吃',
        sub: '和平解决！全员社交+20，花 §30 买薯片补货',
        apply(engine) {
          engine.addFunds(-30, '公关薯片');
          engine.forEachPlayable((s) => engine.adjustNeed(s.id, 'social', 20));
          return '大叔嚼着芝士薯片满意地走了：“下次笑小声点哈~”';
        },
      },
    ],
  },

  {
    id: 'snack_mystery',
    tag: '🧀 零食悬案',
    emoji: '🕵️',
    title: '奶鼠的顶级奶酪库存神秘失踪！',
    desc: '奶鼠打开零食柜，发现珍藏的 5 袋特浓奶酪条不翼而飞！地上只留下一串可疑的粉红色脚印和几块饼干渣…',
    choices: [
      {
        title: '立刻当面质问奶粉！',
        sub: '触发奶粉傲娇坦白：其实偷偷帮奶鼠升级成了双倍豪华礼盒！羁绊+14、饥饿+45',
        apply(engine) {
          engine.adjustRelation('naishu', 'naifen', 12, 14);
          engine.adjustNeed('naishu', 'hunger', 45);
          engine.addMoodlet('naishu', { id: 'cheese_upgrade', label: '豪华奶酪惊喜', icon: '🧀', mood: 'happy', weight: 3, hours: 5 });
          return '奶粉脸一红把大礼盒塞过来：“那几袋快过期了，我给你换了限量版芝士桶，哼！”';
        },
      },
      {
        title: '让奶豆启动 98% 大脑法医级排查',
        sub: '奶豆逻辑 XP+40，竟在沙发缝翻出 §160 私房钱！',
        apply(engine) {
          engine.addSkillXp('naidou', 'logic', 40);
          engine.addFunds(160, '沙发缝考古发现');
          return '奶豆精准推算出零食被藏在抱枕下，还顺便挖出了奶蛙去年忘掉的 §160！';
        },
      },
      {
        title: '化悲愤为食欲，全家一起下厨现做芝士锅！',
        sub: '全员饥饿+50、彼此友谊+10、奶鼠厨艺 XP+35',
        apply(engine) {
          engine.addSkillXp('naishu', 'cooking', 35);
          engine.forEachPlayable((s) => engine.adjustNeed(s.id, 'hunger', 50));
          engine.adjustRelation('naiwa', 'naishu', 10, 5);
          engine.adjustRelation('naidou', 'naishu', 10, 5);
          return '热气腾腾的奶酪火锅端上桌，全家香迷糊了！';
        },
      },
    ],
  },

  {
    id: 'museum_commission',
    tag: '🎨 奶蛙博物馆邀约',
    emoji: '🖼️',
    title: '《奶蛙艺术馆》急聘特约画师！',
    desc: '线上爆火的“奶蛙博物馆”馆长发来私信，想收藏一幅新的传世名画《蒙娜丽鼠》或《神奈川冲浪奶蛙》，报酬丰厚！',
    choices: [
      {
        title: '奶蛙亲自上阵画《星月奶蛙夜》',
        sub: '获得稿费 §240，奶蛙绘画 XP+45，自信情绪 +3',
        apply(engine) {
          engine.addFunds(240, '奶蛙博物馆稿费');
          engine.addSkillXp('naiwa', 'painting', 45);
          engine.addMoodlet('naiwa', { id: 'museum_star', label: '名画入选展馆', icon: '🖼️', mood: 'confident', weight: 3, hours: 6 });
          return '画作上线 1 小时点赞破 10 万，§240 版权费秒到账！';
        },
      },
      {
        title: '让奶鼠当模特画《戴珍珠耳环的奶鼠》',
        sub: '获得稿费 §180，奶蛙&奶鼠友谊+16、羁绊+10，全员娱乐+25',
        apply(engine) {
          engine.addFunds(180, '模特肖像稿费');
          engine.adjustRelation('naiwa', 'naishu', 16, 10);
          engine.addSkillXp('naiwa', 'painting', 30);
          engine.forEachPlayable((s) => engine.adjustNeed(s.id, 'fun', 25));
          return '奶鼠的大圆耳朵挂上珍珠太绝了，连奶粉都买了一百张海报贴墙上！';
        },
      },
    ],
  },

  {
    id: 'naidou_paper_viral',
    tag: '🧠 奶豆学术奇迹',
    emoji: '🏆',
    title: '奶豆的《奶鼠宇宙论》登顶全网热搜！',
    desc: '奶豆熬夜写完的论文《论奶龙创世、奶鼠宇宙与奶蛙熵增》在“奶蛙大学”引发学术大地震，网友疯狂催更！',
    choices: [
      {
        title: '开一场线上学术直播卖电子教材',
        sub: '家庭资金 +§280，奶豆逻辑 XP+50，精力-15',
        apply(engine) {
          engine.addFunds(280, '奶蛙大学教材版税');
          engine.addSkillXp('naidou', 'logic', 50);
          engine.adjustNeed('naidou', 'energy', -15);
          engine.addMoodlet('naidou', { id: 'academic_fame', label: '奶界学术顶流', icon: '🏆', mood: 'confident', weight: 3, hours: 6 });
          return '直播间涌入十万奶家人，§280 稿费哗哗入账，奶豆头顶都在发光！';
        },
      },
      {
        title: '把致谢名单全写满室友和奶粉的名字',
        sub: '奶豆与全员友谊+15，家庭氛围拉满，全员开心！',
        apply(engine) {
          engine.adjustRelation('naidou', 'naiwa', 15, 6);
          engine.adjustRelation('naidou', 'naishu', 15, 6);
          engine.adjustRelation('naidou', 'naifen', 15, 6);
          engine.forEachPlayable((s) =>
            engine.addMoodlet(s.id, { id: 'paper_ack', label: '被写进宇宙论文', icon: '📜', mood: 'happy', weight: 2, hours: 5 })
          );
          return '奶蛙感动得大笑三声，奶鼠抱着奶豆转了两圈！';
        },
      },
    ],
  },

  {
    id: 'sofa_war',
    tag: '💥 客厅突发整活',
    emoji: '🛋️',
    title: '奶粉和奶鼠争夺巨型奶酪沙发主权！',
    desc: '黄金档电视节目开播，奶粉一屁股占了大半张奶酪沙发，奶鼠举着零食袋抗议：“这是我先躺热的位置！”',
    choices: [
      {
        title: '别抢了！俩人挤一起贴贴看电视',
        sub: '奶粉&奶鼠 友谊+15、羁绊+16，娱乐+35，双倍温馨！',
        apply(engine) {
          engine.adjustRelation('naishu', 'naifen', 15, 16);
          engine.adjustNeed('naishu', 'fun', 35);
          engine.adjustNeed('naishu', 'social', 30);
          engine.addMoodlet('naishu', { id: 'cozy_sofa', label: '和奶粉挤沙发贴贴', icon: '💗', mood: 'playful', weight: 3, hours: 5 });
          return '奶粉哼了一声往里挪了挪，顺手把毯子盖在了奶鼠身上💗';
        },
      },
      {
        title: '来一局“压扁弹起”决胜负！',
        sub: '奶粉把奶鼠压成饼又弹回，全屋爆笑！羁绊+12、全员娱乐+40',
        apply(engine) {
          engine.adjustRelation('naishu', 'naifen', 4, 12);
          engine.forEachPlayable((s) => engine.adjustNeed(s.id, 'fun', 40));
          engine.addMoodlet('naishu', { id: 'boing_war', label: '客厅蹦迪混战', icon: '💫', mood: 'dazed', weight: 2, hours: 3 });
          return '噗叽——咣！奶鼠弹到抱枕堆里，奶蛙在旁边笑出眼泪！';
        },
      },
    ],
  },

  {
    id: 'yellow_universe_guests',
    tag: '🌌 黄色抽象宇宙联动',
    emoji: '🦘',
    title: '美团袋鼠肥嘟嘟 & 牛来送外卖误入前院！',
    desc: '门口传来魔性电音！黄色抽象宇宙的另外两位巨头——肥嘟嘟袋鼠和小黄牛“牛来”提着神秘盲盒外卖找错了门牌号！',
    choices: [
      {
        title: '邀请他们在前院一起跳抽象广场舞！',
        sub: '全员娱乐+45、社交+35，奶蛙搞笑 XP+35',
        apply(engine) {
          engine.forEachPlayable((s) => {
            engine.adjustNeed(s.id, 'fun', 45);
            engine.adjustNeed(s.id, 'social', 35);
          });
          engine.addSkillXp('naiwa', 'comedy', 35);
          return '三大黄色抽象顶流世纪同框！路过的邻居拍视频直接上了热榜！';
        },
      },
      {
        title: '花 §45 买下他们车上的神秘豪华大餐',
        sub: '全员饥饿回满 +100，附赠限量周边卖了 §135（净赚 §90）！',
        apply(engine) {
          engine.addFunds(90, '抽象宇宙周边差价');
          engine.forEachPlayable((s) => engine.adjustNeed(s.id, 'hunger', 100));
          return '不仅吃撑了，盲盒里的绝版贴纸还转手赚了 §90！';
        },
      },
    ],
  },

  {
    id: 'best_villa_award',
    tag: '🏡 社区评选',
    emoji: '✨',
    title: '小区“最治愈合租小洋房”突击检查！',
    desc: '奶系社区居委会来评选本周最美小洋房，看看你们家的家具数量和温馨程度能拿什么奖！',
    choices: [
      {
        title: '自信开门展示我们的温馨奶家！',
        sub: '家具越多奖金越高（基础 §150 + 每件额外家具 §25），全员自信！',
        apply(engine) {
          const bonus = 150 + Math.max(0, engine.furniture.length - 14) * 25;
          engine.addFunds(bonus, '最美奶家洋房奖金');
          engine.forEachPlayable((s) =>
            engine.addMoodlet(s.id, { id: 'villa_pride', label: '明星合租屋', icon: '🏡', mood: 'confident', weight: 2, hours: 5 })
          );
          return `居委会大赞你们把家布置得奶里奶气，当场颁发奖金 §${bonus}！`;
        },
      },
      {
        title: '临时让奶蛙摆出《维纳斯奶蛙》雕塑姿势加艺术分',
        sub: '额外赢取 §200 艺术风采奖，奶蛙魅力 XP+35',
        apply(engine) {
          engine.addFunds(200, '艺术风采特别奖');
          engine.addSkillXp('naiwa', 'charisma', 35);
          return '奶蛙一动不动装雕塑太逼真了，评委当场鼓掌颁奖 §200！';
        },
      },
    ],
  },
];
