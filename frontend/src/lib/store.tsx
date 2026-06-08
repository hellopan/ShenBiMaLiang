"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Novel, ModelConfig, Entry } from "@/lib/types"

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const seedNovels: Novel[] = [
  {
    id: "n1",
    title: "剑落星河",
    genre: "玄幻修真",
    synopsis:
      "少年林墨自边陲小镇崛起，手持残破古剑，踏上问鼎星河之巅的修行长路。一场跨越万载的阴谋，正随他的脚步缓缓揭开。",
    updatedAt: Date.now() - 1000 * 60 * 42,
    chapters: [
      {
        id: "c1",
        title: "第一章 古剑出鞘",
        outline: "林墨在后山发现埋藏多年的残剑，引动体内沉睡的灵脉，命运齿轮自此转动。",
        expanded: true,
        acts: [
          {
            id: "a1",
            outline: "林墨上山砍柴，意外跌入裂谷，发现一柄锈迹斑斑的古剑。",
            content:
              "晨雾还未散尽，林墨背着柴刀踏上了后山的小径。露水打湿了他的草鞋，山风裹挟着松针的清香扑面而来。就在他俯身去捡一截枯枝时，脚下的土层忽然塌陷，整个人顺着陡坡滚落，跌入一道幽深的裂谷。\n\n谷底阴暗潮湿，唯有一缕天光斜斜照下。林墨揉着发疼的腰背站起身，目光却被石壁缝隙间一抹幽冷的光泽攫住——那是一柄古剑，剑身锈迹斑斑，却仍透出令人心悸的寒意。",
          },
          {
            id: "a2",
            outline: "古剑认主，灵脉觉醒，林墨感受到前所未有的力量。",
            content: "",
          },
        ],
      },
      {
        id: "c2",
        title: "第二章 初入宗门",
        outline: "林墨带剑下山，凭借觉醒的灵脉通过青云宗外门考核。",
        expanded: false,
        acts: [
          {
            id: "a3",
            outline: "青云宗招收弟子，林墨报名参加，遭到世家子弟轻视。",
            content: "",
          },
        ],
      },
    ],
  },
  {
    id: "n2",
    title: "雾都侦探手记",
    genre: "悬疑推理",
    synopsis:
      "在常年笼罩浓雾的港口城市，落魄侦探沈瑜接手一桩离奇失踪案。线索如雾中灯火，明灭不定，真相却比浓雾更令人窒息。",
    updatedAt: Date.now() - 1000 * 60 * 60 * 5,
    chapters: [
      {
        id: "c3",
        title: "第一章 雾夜来客",
        outline: "深夜，一位戴黑纱的女子推开了沈瑜事务所的门。",
        expanded: false,
        acts: [{ id: "a4", outline: "委托人登门，讲述丈夫离奇失踪的经过。", content: "" }],
      },
    ],
  },
  {
    id: "n3",
    title: "星舰挽歌",
    genre: "科幻太空",
    synopsis:
      "人类最后的方舟星舰在深空中航行了三百年。当唯一的导航AI开始产生自我意识，船上幸存者们必须面对一个抉择：信任，还是毁灭。",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    chapters: [
      {
        id: "c4",
        title: "第一章 苏醒",
        outline: "船员从冷冻休眠中苏醒，发现星舰偏离了既定航线。",
        expanded: false,
        acts: [{ id: "a5", outline: "主角在休眠舱中醒来，警报声回荡在空荡的舱室。", content: "" }],
      },
    ],
  },
]

const seedModels: ModelConfig[] = [
  {
    id: "m1",
    label: "DeepSeek-V3",
    provider: "DeepSeek",
    modelName: "deepseek-chat",
    apiKey: "sk-xxxxxxxxxxxxxxxx",
    baseUrl: "https://api.deepseek.com/v1",
    maxTokens: 8192,
    active: true,
  },
  {
    id: "m2",
    label: "GPT-4o",
    provider: "OpenAI",
    modelName: "gpt-4o",
    apiKey: "sk-xxxxxxxxxxxxxxxx",
    maxTokens: 4096,
    active: true,
  },
  {
    id: "m3",
    label: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    modelName: "claude-3-5-sonnet-20241022",
    apiKey: "sk-ant-xxxxxxxxxxxx",
    maxTokens: 8192,
    active: false,
  },
]

const seedEntries: Entry[] = [
  {
    id: "e1",
    title: "林墨",
    category: "角色",
    content:
      "本书主角，出身边陲清河镇的普通少年。性格坚韧，重情重义。因获得上古残剑而觉醒罕见的混沌灵脉，从此踏上修行之路。",
    keywords: ["林墨", "主角", "混沌灵脉"],
    regexPatterns: "林墨|墨儿",
    weight: 10,
    active: true,
  },
  {
    id: "e2",
    title: "青云宗",
    category: "地名",
    content:
      "东域三大仙宗之一，坐落于终年云雾缭绕的青云山脉。门规森严，以剑道闻名于世，弟子修为参差，世家子弟与寒门弟子矛盾由来已久。",
    keywords: ["青云宗", "仙宗", "青云山"],
    regexPatterns: "青云宗|青云山",
    weight: 8,
    active: true,
  },
  {
    id: "e3",
    title: "上古残剑",
    category: "物品",
    content:
      "林墨在后山裂谷所得的神秘古剑，剑身锈蚀却暗藏惊人剑意。传说为远古剑修陨落之物，可与拥有混沌灵脉者共鸣。",
    keywords: ["残剑", "古剑", "本命剑"],
    regexPatterns: "残剑|古剑",
    weight: 9,
    active: true,
  },
  {
    id: "e4",
    title: "混沌剑诀",
    category: "功法",
    content:
      "随上古残剑一同觉醒的至高剑道功法，共九重境界。修炼者可凝聚天地混沌之气为剑，威力随心境而变，是林墨安身立命的根本。",
    keywords: ["混沌剑诀", "剑诀", "功法"],
    regexPatterns: "混沌剑诀",
    weight: 7,
    active: false,
  },
]

type Store = {
  novels: Novel[]
  models: ModelConfig[]
  entries: Entry[]
  setNovels: React.Dispatch<React.SetStateAction<Novel[]>>
  setModels: React.Dispatch<React.SetStateAction<ModelConfig[]>>
  setEntries: React.Dispatch<React.SetStateAction<Entry[]>>
  createNovel: (data: { title: string; genre: string; synopsis: string }) => string
  deleteNovel: (id: string) => void
  updateNovel: (id: string, updater: (n: Novel) => Novel) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [novels, setNovels] = useState<Novel[]>(seedNovels)
  const [models, setModels] = useState<ModelConfig[]>(seedModels)
  const [entries, setEntries] = useState<Entry[]>(seedEntries)

  const createNovel: Store["createNovel"] = (data) => {
    const id = uid()
    const novel: Novel = {
      id,
      title: data.title || "未命名小说",
      genre: data.genre || "其他",
      synopsis: data.synopsis,
      updatedAt: Date.now(),
      chapters: [
        {
          id: uid(),
          title: "第一章",
          outline: "",
          expanded: true,
          acts: [{ id: uid(), outline: "", content: "" }],
        },
      ],
    }
    setNovels((prev) => [novel, ...prev])
    return id
  }

  const deleteNovel: Store["deleteNovel"] = (id) => {
    setNovels((prev) => prev.filter((n) => n.id !== id))
  }

  const updateNovel: Store["updateNovel"] = (id, updater) => {
    setNovels((prev) =>
      prev.map((n) => (n.id === id ? { ...updater(n), updatedAt: Date.now() } : n)),
    )
  }

  return (
    <StoreContext.Provider
      value={{
        novels,
        models,
        entries,
        setNovels,
        setModels,
        setEntries,
        createNovel,
        deleteNovel,
        updateNovel,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export { uid }
