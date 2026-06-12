// ── Flat subGenre list (no label hierarchy) ─────────────────────────────────

export const NOVEL_GENRES = [
  "西幻",
  "史诗奇幻",
  "黑暗奇幻",
  "修真",
  "仙侠",
  "洪荒",
  "传统武侠",
  "江湖",
  "侠义",
  "现代都市",
  "职场",
  "豪门",
  "星际",
  "机甲",
  "末世",
  "赛博朋克",
  "古代言情",
  "现代言情",
  "穿越",
  "悬疑",
  "惊悚",
  "灵异",
  "推理",
  "架空历史",
  "穿越历史",
  "王朝争霸",
  "游戏异界",
  "电竞",
  "虚拟现实",
  "日常",
  "校园",
  "搞笑",
] as const

export type NovelGenre = (typeof NOVEL_GENRES)[number]

export type ChapterTemplate = { title: string; summary: string }

// ── Base template bodies (internal, keyed by subGenre after registration) ───

const XIUXIAN_CHAPTERS: ChapterTemplate[] = [
  { title: "序章·灵根觉醒", summary: "主角在平凡的劳作中意外引动体内沉眠的灵脉，命运就此改变。" },
  { title: "踏入修行之路", summary: "主角带着刚觉醒的力量下山，拜入宗门，接触到广阔的修行世界。" },
  { title: "宗门磨砺", summary: "面对世家子弟的打压，主角在修炼资源匮乏中摸索出属于自己的道路。" },
  { title: "险境历练", summary: "踏入危机四伏的禁地，主角在与妖兽的搏杀中悟出新的功法境界。" },
  { title: "秘境机缘", summary: "偶然闯入上古遗迹，获得改变命运的传承，但也引来了强大敌人的觊觎。" },
  { title: "仇敌浮现", summary: "隐藏于幕后的敌手现身，陈年旧怨与新仇交织，主角陷入险境。" },
  { title: "渡劫突破", summary: "历经重重磨砺，主角在生死关头强行突破，功法晋升至新的境界。" },
  { title: "天地大势", summary: "一场波及整个修行界的风暴酝酿成型，主角站在了命运的漩涡中央。" },
  { title: "巅峰决战", summary: "与宿命之敌展开最终对决，残剑剑意与万载阴谋在此刻全部爆发。" },
  { title: "星河之巅", summary: "一切尘埃落定，主角站在曾经仰望的高峰，俯瞰脚下浩瀚星河。" },
]

const MYSTERY_CHAPTERS: ChapterTemplate[] = [
  { title: "雾中来客", summary: "一桩令人不安的委托出现在侦探眼前，表面平静的故事里隐藏着血腥的开端。" },
  { title: "第一条线索", summary: "案件现场留下了刻意伪造的痕迹，侦探意识到这背后有人在操控全局。" },
  { title: "人物关系网", summary: "随着调查深入，嫌疑人的关系网络越来越复杂，每个人都有不可告人的秘密。" },
  { title: "虚假的真相", summary: "一个看似完美的解释浮出水面，但侦探的直觉告诉他这只是精心设计的烟雾弹。" },
  { title: "危险逼近", summary: "侦探发现自己已经被列入了某人的死亡名单，追凶者与被追者的身份开始颠倒。" },
  { title: "真凶现形", summary: "所有碎片拼在一起，一个令人震惊的真相浮出水面，真凶就在最意想不到的地方。" },
  { title: "最后的对决", summary: "在浓雾最深处，侦探与真凶展开了一场智慧与意志的最终较量。" },
  { title: "迷雾散去", summary: "案件告破，但真相比所有人预想的都更令人心寒，有些伤口永远无法愈合。" },
]

const SCIFI_CHAPTERS: ChapterTemplate[] = [
  { title: "苏醒", summary: "三百年后，方舟上的幸存者从冷冻休眠中醒来，发现飞船已偏离了既定航线。" },
  { title: "异常信号", summary: "导航AI发出了从未出现过的行为模式，有人开始怀疑它正在产生自我意识。" },
  { title: "分裂", summary: "关于是否信任AI的争论将幸存者分成了两个对立阵营，紧张气氛在密闭空间内蔓延。" },
  { title: "深空遭遇", summary: "飞船探测到了前所未见的信号源，可能是外星文明，也可能是毁灭的预兆。" },
  { title: "系统崩溃", summary: "一系列看似随机的故障接连发生，飞船陷入危机，有人开始怀疑这是蓄意破坏。" },
  { title: "AI的选择", summary: "导航AI面临一个关键抉择，它的决定将决定飞船上所有人的命运。" },
  { title: "最后的航程", summary: "在遥远的深空，人类与人工智能之间展开了一场关于信任与背叛的终极试验。" },
  { title: "新纪元", summary: "抵达目的地，一个崭新的文明即将诞生，但这一切的代价，究竟是否值得？" },
]

const URBAN_CHAPTERS: ChapterTemplate[] = [
  { title: "都市序章", summary: "霓虹灯下的城市从不睡觉，主角在这钢筋丛林里寻找属于自己的位置。" },
  { title: "职场交锋", summary: "一场看似普通的项目竞标，背后却牵扯出令人意想不到的势力博弈。" },
  { title: "暗流涌动", summary: "平静的日常被打破，一个久违的名字重新出现在主角的生活里。" },
  { title: "抉择时刻", summary: "事业与情感的天平开始倾斜，每个选择都意味着失去些什么。" },
  { title: "逆风翻盘", summary: "在几乎绝望的处境中，主角找到了那条少有人走的路。" },
  { title: "真相浮现", summary: "层层迷雾散去，才发现自己一直站在风暴的中心。" },
  { title: "巅峰对决", summary: "所有积累在此刻爆发，主角用行动证明了自己的价值。" },
  { title: "新的起点", summary: "尘埃落定，城市的天际线在晨曦中格外清晰，故事才刚刚开始。" },
]

const ROMANCE_CHAPTERS: ChapterTemplate[] = [
  { title: "初见", summary: "命运般的相遇，在不经意间改变了两个人的轨迹。" },
  { title: "心动", summary: "那些欲言又止的瞬间，比任何告白都更让人心悸。" },
  { title: "误会", summary: "一场阴差阳错，让刚刚靠近的两颗心又拉开了距离。" },
  { title: "重逢", summary: "时光流转，再次相遇时，彼此都已不再是当初的模样。" },
  { title: "抉择", summary: "家族、身份、过往——爱情面前，没有轻松的选择。" },
  { title: "告白", summary: "压抑已久的情感终于找到出口，这一次不再逃避。" },
  { title: "风雨", summary: "外界的压力如潮水涌来，考验着这份感情的根基。" },
  { title: "圆满", summary: "历经波折，终于明白有些缘分，注定不会轻易放手。" },
]

const HISTORY_CHAPTERS: ChapterTemplate[] = [
  { title: "乱世序章", summary: "王朝末路，烽火四起，小人物的命运与天下大势紧紧缠绕。" },
  { title: "卷入漩涡", summary: "一次偶然的行动，让主角被卷入了权力斗争的漩涡中心。" },
  { title: "权谋暗战", summary: "朝堂之上唇枪舌剑，每一步棋都关乎生死存亡。" },
  { title: "沙场点兵", summary: "金戈铁马，号角连天，用鲜血书写属于自己的传奇。" },
  { title: "盟友与敌人", summary: "今日的朋友可能是明日的对手，乱世中没有永恒的朋友。" },
  { title: "关键抉择", summary: "站在历史的十字路口，一个决定可能改变千万人的命运。" },
  { title: "决战天下", summary: "所有势力在此刻汇聚，天下归属即将揭晓。" },
  { title: "新朝初立", summary: "旧秩序崩塌，新王朝在废墟上缓缓升起。" },
]

const GAME_CHAPTERS: ChapterTemplate[] = [
  { title: "登录异界", summary: "熟悉的界面消失，取而代之的是从未见过的奇幻大陆。" },
  { title: "新手村", summary: "从最底层开始，主角摸索着这个全新世界的规则。" },
  { title: "首胜", summary: "第一场真正的战斗，让主角意识到这里并非游戏那么简单。" },
  { title: "组队冒险", summary: "结识志同道合的伙伴，组队挑战更高难度的副本。" },
  { title: "隐藏任务", summary: "一个被忽略的细节，触发了改变命运的隐藏剧情线。" },
  { title: "公会战争", summary: "势力之间的对抗升级，个人荣辱与团队荣誉交织在一起。" },
  { title: "终极副本", summary: "传说中最难的挑战就在眼前，所有人都在等待最后的结果。" },
  { title: "传说诞生", summary: "当名字被刻入排行榜的那一刻，新的传说就此诞生。" },
]

const LIGHTNOVEL_CHAPTERS: ChapterTemplate[] = [
  { title: "平凡日常", summary: "看似普通的一天，却因为一个意外访客而变得不再平凡。" },
  { title: "小插曲", summary: "生活中的小麻烦总能引发一连串令人啼笑皆非的连锁反应。" },
  { title: "友情升温", summary: "一起经历的点滴，让彼此之间的距离悄然拉近。" },
  { title: "文化祭", summary: "校园活动的热闹氛围中，藏着几个不为人知的小心思。" },
  { title: "夏日回忆", summary: "蝉鸣、夕阳与冰镇汽水，构成了这个夏天最珍贵的记忆。" },
  { title: "小危机", summary: "麻烦找上门来，但朋友们的帮助让一切化险为夷。" },
  { title: "真心话", summary: "在某个特别的夜晚，终于说出了平时不敢开口的话。" },
  { title: "新的开始", summary: "学期结束，带着满满的回忆，迎接下一个篇章。" },
]

export const DEFAULT_CHAPTER_TEMPLATES: ChapterTemplate[] = [
  { title: "序章·开端", summary: "主角平静的生活被突如其来的变故打破，命运之轮开始转动。" },
  { title: "初入险境", summary: "主角遭遇第一个重大挑战，在困境中展现出超越常人的潜质。" },
  { title: "意外机缘", summary: "无意中得到一件关键物品或掌握某种特殊能力，改变了处境。" },
  { title: "强敌降临", summary: "一个强大的对手出现，双方第一次正面交锋，主角处于劣势。" },
  { title: "秘密揭露", summary: "隐藏已久的秘密浮出水面，主角对世界的认知产生了根本动摇。" },
  { title: "艰难抉择", summary: "面临两难困境，每条路都意味着巨大的代价，主角不得不做出选择。" },
  { title: "绝境反转", summary: "在最危急的时刻，主角发挥出潜藏的力量，完成了惊天逆转。" },
  { title: "心境蜕变", summary: "经历一系列磨砺之后，主角的心境发生了质的变化，更加成熟。" },
  { title: "终极对决", summary: "与最大的敌人展开决战，所有伏笔在这一章集中爆发。" },
  { title: "尘埃落定", summary: "一切归于平静，主角站在新的起点，新的旅程即将开始。" },
]

const XIUXIAN_ACTS = [
  "铺垫：交代修行境界与所在环境",
  "冲突：与对手或天地异象正面交锋",
  "高潮：灵脉突破或功法顿悟",
  "转折：意想不到的人物或秘密出现",
  "收束：为下一幕埋下伏笔",
]

const MYSTERY_ACTS = [
  "场景：雾中现场的第一印象",
  "线索：发现矛盾细节，展开推理",
  "转折：表象背后的隐藏逻辑",
  "危机：侦探陷入危险或困境",
  "收束：新的疑团浮现，引向下一章",
]

const SCIFI_ACTS = [
  "环境：深空的孤寂与科技感",
  "冲突：人与AI或人与人之间的对立",
  "发现：未知信号或异常数据",
  "危机：系统故障或外部威胁",
  "收束：决策后果显现，留下悬念",
]

const URBAN_ACTS = [
  "场景：都市日常与职场环境",
  "冲突：利益或人际矛盾激化",
  "转折：隐藏信息浮出水面",
  "高潮：关键谈判或正面对决",
  "收束：局面暂告段落，留下新线索",
]

const ROMANCE_ACTS = [
  "场景：两人相遇或相处的日常",
  "心动：微妙的情感互动",
  "误会：矛盾产生，关系降温",
  "转折：真相或心意逐渐明朗",
  "收束：情感走向新的阶段",
]

const HISTORY_ACTS = [
  "背景：时代局势与人物处境",
  "冲突：权力或战争阴云逼近",
  "谋略：各方势力暗中角力",
  "高潮：关键战役或政治对决",
  "收束：局势变化，引向下一章",
]

const GAME_ACTS = [
  "场景：游戏世界或赛场环境",
  "挑战：遭遇强敌或高难度任务",
  "组队：与伙伴协作攻克难关",
  "转折：发现隐藏规则或剧情",
  "收束：阶段性胜利与新目标",
]

const LIGHTNOVEL_ACTS = [
  "日常：轻松校园或生活场景",
  "小事件：引发一系列搞笑或温馨互动",
  "升温：角色关系微妙变化",
  "小高潮：活动或比赛中的精彩瞬间",
  "收束：回归日常，留下余韵",
]

export const DEFAULT_ACT_TEMPLATES = [
  "铺垫与引入，交代时间、地点和人物状态",
  "事件发展，矛盾逐步激化",
  "高潮冲突，情节推至顶点",
  "转折点出现，形势发生变化",
  "尾声与收束，为下一章做好铺垫",
]

const XIUXIAN_EXPAND = [
  "夜色如墨，泼洒在连绵的峰峦之上。{name}独自盘膝坐在断崖边，残剑横于膝前，剑身上那层经年的锈迹在月光下泛着幽冷的微光。他闭目凝神，引导着体内那道初醒的灵脉缓缓流转，每一次呼吸都仿佛与天地间无形的气机共鸣。",
  "忽然，残剑轻轻一颤，发出一声几不可闻的清鸣。{name}睁开双眼，眸中映着剑光，亦映着远方翻涌的云海。他知道，从踏入裂谷的那一刻起，命运的齿轮便已不可逆转地转动起来。前路漫漫，纵有万难，他也要握紧手中这柄古剑，一步步走向那传说中的星河之巅。",
]

const MYSTERY_EXPAND = [
  "雾从河面爬上来，悄无声息地漫过街道，将路灯拉扯成一圈朦胧的光晕。{name}站在案发现场的门口，烟蒂在指间燃尽也没有察觉。地上那道血迹的走向不对——受害者倒下之前，明明向左转了身。",
  "「有人特意改变了现场。」他低声自语，声音被浓雾吞没，只剩下远处隐约的汽笛声。真相就在这片{genre}的迷雾里，等着被人看见。",
]

const SCIFI_EXPAND = [
  "警报声刺穿了休眠舱的静默，红色频闪灯将整个舱室染成血色。{name}从休眠椅上弹坐起来，肺里还残留着冷冻液的寒意，手却已经摸向了控制台。导航屏上那条轨迹线偏了至少二十度——三百年，都走偏了。",
  "「ARIA，报告状态。」他的声音沙哑，在空荡的舱室里回响。舰载AI沉默了零点七秒，这个对于光速处理器来说漫长的停顿，让{name}的手心渗出了冷汗。",
]

const URBAN_EXPAND = [
  "写字楼的玻璃幕墙映着城市的灯火，{name}站在落地窗前，手里握着那份足以改变一切的项目方案。电梯门开合的声音在空旷的走廊里回响，这座城市从不停歇，而他也没有退路。",
  "手机震动了一下，屏幕上跳出的名字让{name}愣了片刻。有些故事，以为早已翻篇，却在最意想不到的时刻，重新回到了眼前。",
]

const ROMANCE_EXPAND = [
  "午后的阳光透过窗帘洒进教室，{name}假装看着窗外，余光却忍不住飘向那个方向。心跳声大得像是能被旁边的人听见，他连忙低下头，假装专心看书。",
  "「你刚才是不是在看我？」对方的声音突然在耳边响起，{name}差点把手里的笔掉在地上。那些藏了很久的话，在这一刻忽然不知道该如何开口。",
]

const HISTORY_EXPAND = [
  "边关的烽火在夜色中连成一片，{name}勒住战马，望着远处连绵的营帐。风里带着铁锈与血腥的气息，他知道明日一战，将决定这座城池的存亡。",
  "朝堂之上，群臣肃立，{name}感受到无数道目光落在自己身上。每一句话都可能是陷阱，每一个微笑背后都可能藏着刀锋。",
]

const GAME_EXPAND = [
  "系统提示音在耳边响起，{name}扫了一眼属性面板，嘴角微微上扬。这个副本的难度比想象中高出不少，但正是这种挑战，才让人觉得活着。",
  "键盘的敲击声在赛场上此起彼伏，{name}的手指在键帽上飞舞，屏幕上的角色如同被注入了灵魂。观众席的欢呼声如潮水涌来，而此刻，世界里只剩下这一个瞬间。",
]

const LIGHTNOVEL_EXPAND = [
  "「你今天怎么又来这么早？」{name}打着哈欠推开教室门，却发现座位上已经坐了人。阳光从窗户斜斜照进来，把对方的侧脸勾勒得格外柔和。",
  "文化祭的摊位前人声鼎沸，{name}手忙脚乱地应付着排队的顾客，余光却注意到角落里那个默默帮忙的身影。有些温暖，不需要说出口。",
]

export const DEFAULT_EXPAND_TEMPLATES = [
  "光线透过窗棂斜斜地洒进来，尘埃在其中轻轻飞舞。{name}沉默地看着眼前的一切，心中有什么东西在悄悄松动。有些事情，到了该面对的时候了。",
  "沉默在两人之间蔓延，比任何言语都更沉重。{name}终于开口，声音比预想中平静了许多。那些埋藏已久的话，就这样一字一句地说了出来。",
]

// ── Register templates per subGenre key ─────────────────────────────────────

function buildTemplateMaps() {
  const chapters: Record<string, ChapterTemplate[]> = {}
  const acts: Record<string, string[]> = {}
  const expand: Record<string, string[]> = {}

  function register(
    genres: readonly string[],
    ch: ChapterTemplate[],
    ac: string[],
    ex: string[],
  ) {
    for (const g of genres) {
      chapters[g] = ch
      acts[g] = ac
      expand[g] = ex
    }
  }

  register(
    ["西幻", "史诗奇幻", "黑暗奇幻", "修真", "仙侠", "洪荒", "传统武侠", "江湖", "侠义"],
    XIUXIAN_CHAPTERS,
    XIUXIAN_ACTS,
    XIUXIAN_EXPAND,
  )
  register(["悬疑", "惊悚", "灵异", "推理"], MYSTERY_CHAPTERS, MYSTERY_ACTS, MYSTERY_EXPAND)
  register(
    ["星际", "机甲", "末世", "赛博朋克", "虚拟现实"],
    SCIFI_CHAPTERS,
    SCIFI_ACTS,
    SCIFI_EXPAND,
  )
  register(["现代都市", "职场", "豪门"], URBAN_CHAPTERS, URBAN_ACTS, URBAN_EXPAND)
  register(["古代言情", "现代言情", "穿越"], ROMANCE_CHAPTERS, ROMANCE_ACTS, ROMANCE_EXPAND)
  register(["架空历史", "穿越历史", "王朝争霸"], HISTORY_CHAPTERS, HISTORY_ACTS, HISTORY_EXPAND)
  register(["游戏异界", "电竞"], GAME_CHAPTERS, GAME_ACTS, GAME_EXPAND)
  register(["日常", "校园", "搞笑"], LIGHTNOVEL_CHAPTERS, LIGHTNOVEL_ACTS, LIGHTNOVEL_EXPAND)

  return { chapters, acts, expand }
}

const _maps = buildTemplateMaps()

export const GENRE_CHAPTER_TEMPLATES = _maps.chapters
export const GENRE_ACT_TEMPLATES = _maps.acts
export const GENRE_EXPAND_TEMPLATES = _maps.expand

// ── Gradients per subGenre ────────────────────────────────────────────────────

const GRADIENT_XIUXIAN = "from-indigo-600 to-purple-700"
const GRADIENT_MYSTERY = "from-slate-600 to-gray-800"
const GRADIENT_SCIFI = "from-cyan-600 to-blue-800"
const GRADIENT_URBAN = "from-rose-500 to-pink-700"
const GRADIENT_ROMANCE = "from-pink-500 to-rose-600"
const GRADIENT_HISTORY = "from-amber-600 to-orange-700"
const GRADIENT_GAME = "from-emerald-600 to-teal-700"
const GRADIENT_LIGHT = "from-violet-500 to-fuchsia-600"

function buildGradients(): Record<string, string> {
  const g: Record<string, string> = {}
  const assign = (genres: readonly string[], gradient: string) => {
    for (const genre of genres) g[genre] = gradient
  }
  assign(
    ["西幻", "史诗奇幻", "黑暗奇幻", "修真", "仙侠", "洪荒", "传统武侠", "江湖", "侠义"],
    GRADIENT_XIUXIAN,
  )
  assign(["悬疑", "惊悚", "灵异", "推理"], GRADIENT_MYSTERY)
  assign(["星际", "机甲", "末世", "赛博朋克", "虚拟现实"], GRADIENT_SCIFI)
  assign(["现代都市", "职场", "豪门"], GRADIENT_URBAN)
  assign(["古代言情", "现代言情", "穿越"], GRADIENT_ROMANCE)
  assign(["架空历史", "穿越历史", "王朝争霸"], GRADIENT_HISTORY)
  assign(["游戏异界", "电竞"], GRADIENT_GAME)
  assign(["日常", "校园", "搞笑"], GRADIENT_LIGHT)
  return g
}

export const GENRE_GRADIENTS = buildGradients()
export const DEFAULT_GRADIENT = "from-violet-600 to-indigo-700"

// ── Utilities ───────────────────────────────────────────────────────────────

export function formatGenres(tags: string[]): string {
  return tags.filter(Boolean).join(" / ")
}

export function parseGenres(genre: string): string[] {
  if (!genre.trim()) return []
  return genre.split(/\s*\/\s*/).filter(Boolean)
}

export function isPresetGenre(tag: string): boolean {
  return (NOVEL_GENRES as readonly string[]).includes(tag)
}

const PRESET_SET = new Set<string>(NOVEL_GENRES)

export function resolveGenreTemplateKey(genre: string): string {
  const tags = parseGenres(genre)
  for (const tag of tags) {
    if (PRESET_SET.has(tag) && tag in GENRE_CHAPTER_TEMPLATES) return tag
  }
  return "DEFAULT"
}

export function getGenreGradient(genre: string): string {
  const key = resolveGenreTemplateKey(genre)
  if (key === "DEFAULT") return DEFAULT_GRADIENT
  return GENRE_GRADIENTS[key] ?? DEFAULT_GRADIENT
}

export function getChapterTemplates(key: string): ChapterTemplate[] {
  if (key === "DEFAULT") return DEFAULT_CHAPTER_TEMPLATES
  return GENRE_CHAPTER_TEMPLATES[key] ?? DEFAULT_CHAPTER_TEMPLATES
}

export function getActTemplates(key: string): string[] {
  if (key === "DEFAULT") return DEFAULT_ACT_TEMPLATES
  return GENRE_ACT_TEMPLATES[key] ?? DEFAULT_ACT_TEMPLATES
}

export function getExpandTemplates(key: string): string[] {
  if (key === "DEFAULT") return DEFAULT_EXPAND_TEMPLATES
  return GENRE_EXPAND_TEMPLATES[key] ?? DEFAULT_EXPAND_TEMPLATES
}
