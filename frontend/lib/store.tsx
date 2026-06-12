"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type {
  Novel,
  ModelConfig,
  Entry,
  PromptEntry,
  ActAIConfig,
  Chapter,
  Act,
} from "@/lib/types"
import {
  DEFAULT_OUTLINE_AI_CONFIG,
  DEFAULT_CONTENT_AI_CONFIG,
  resolvePromptActive,
} from "@/lib/types"
import { setStoreRef } from "@/lib/api/_store-ref"

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ── Seed data ──────────────────────────────────────────────────────────────

const seedNovels: Novel[] = [
  {
    id: "n1",
    title: "剑落星河",
    genre: "修真",
    synopsis:
      "少年林墨自边陲小镇崛起，手持残破古剑，踏上问鼎星河之巅的修行长路。一场跨越万载的阴谋，正随他的脚步缓缓揭开。",
    updatedAt: Date.now() - 1000 * 60 * 42,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    targetWordCount: 3000000,
    narrativePerspective: "第三人称有限",
    storyTone: "热血 / 史诗",
    plotPacing: "中等偏快",
    romanceLine: "单 CP 主线 / 慢热暧昧",
    conflictType: "成长蜕变 / 悬疑解谜 / 阵营对抗",
    outlineAIConfig: { ...DEFAULT_OUTLINE_AI_CONFIG, model: "m1" },
    contentAIConfig: { ...DEFAULT_CONTENT_AI_CONFIG, model: "m1" },
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
            outline: "古剑认主，灵脉觉醒，林墨感受到潜藏力量。",
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
    genre: "悬疑",
    synopsis:
      "在常年笼罩浓雾的港口城市，落魄侦探沈瑜接手一桩离奇失踪案。线索如雾中灯火，明灭不定，真相却比浓雾更令人窒息。",
    updatedAt: Date.now() - 1000 * 60 * 60 * 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    outlineAIConfig: { ...DEFAULT_OUTLINE_AI_CONFIG, model: "m1" },
    contentAIConfig: { ...DEFAULT_CONTENT_AI_CONFIG, model: "m1" },
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
    genre: "星际",
    synopsis:
      "人类最后的方舟星舰在深空中航行了三百年。当唯一的导航AI开始产生自我意识，船上幸存者们必须面对一个选择：信任，还是毁灭。",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    outlineAIConfig: { ...DEFAULT_OUTLINE_AI_CONFIG, model: "m1" },
    contentAIConfig: { ...DEFAULT_CONTENT_AI_CONFIG, model: "m1" },
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
    novelId: "n1",
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
    novelId: "n1",
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
    novelId: "n1",
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
    novelId: "n1",
  },
  {
    id: "e5",
    title: "沈瑜",
    category: "角色",
    content: "落魄侦探，曾是警局明星探员，因一桩冤案被迫离职。性格沉默寡言，观察力极强，有酗酒习惯。对真相有近乎偏执的执念。",
    keywords: ["沈瑜", "侦探", "主角"],
    regexPatterns: "沈瑜|沈探长",
    weight: 10,
    active: true,
    novelId: "n2",
  },
  {
    id: "e6",
    title: "雾都",
    category: "地名",
    content: "常年笼罩浓雾的港口城市，工业革命遗留下无处不在的烟囱与铁架。雾气是这座城市的保护色，也是罪恶滋生的温床。",
    keywords: ["雾都", "港口", "城市"],
    regexPatterns: "雾都|港口城市",
    weight: 8,
    active: true,
    novelId: "n2",
  },
]

const seedPromptEntries: PromptEntry[] = [
  {
    id: "pe-1",
    name: "段落长度控制",
    content: "每段正文控制在150-300字之间，避免长段堆砌",
    scope: "global",
    group: "format",
    weight: 8,
    active: true,
    isSystem: false,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: "pe-2",
    name: "避免重复用词",
    content: "同一段落内避免使用相同词语超过两次，注意用词多样性",
    scope: "global",
    group: "format",
    weight: 7,
    active: true,
    isSystem: false,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "pe-3",
    name: "文风提示词",
    content: "文笔细腻，善用环境描写烘托情绪，人物心理描写深刻，战斗场面节奏明快",
    scope: "novel",
    novelId: "n1",
    group: "style",
    weight: 9,
    active: true,
    isSystem: false,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "pe-4",
    name: "禁止提示词",
    content: "禁止使用网络流行语，避免现代词汇，不使用低俗描写",
    scope: "novel",
    novelId: "n1",
    group: "forbidden",
    weight: 9,
    active: true,
    isSystem: false,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
]

// ── Store type ─────────────────────────────────────────────────────────────

export type EffectivePromptEntry = PromptEntry & { effectiveActive: boolean }

/** Actions exposed by the store — used by lib/api/_store-ref.ts */
export type StoreActions = {
  novels: Novel[]
  models: ModelConfig[]
  entries: Entry[]
  promptEntries: PromptEntry[]

  // Raw setters (keep for backward compat but prefer specific actions)
  setNovels: React.Dispatch<React.SetStateAction<Novel[]>>
  setModels: React.Dispatch<React.SetStateAction<ModelConfig[]>>
  setEntries: React.Dispatch<React.SetStateAction<Entry[]>>
  setPromptEntries: React.Dispatch<React.SetStateAction<PromptEntry[]>>

  // Novel
  createNovel: (data: { title: string; genre: string; synopsis: string }) => string
  deleteNovel: (id: string) => void
  updateNovel: (id: string, updater: (n: Novel) => Novel) => void

  // Chapter
  addChapter: (novelId: string, data?: Partial<Chapter> & { title?: string }) => string
  deleteChapter: (novelId: string, chapterId: string) => void

  // Act
  addAct: (novelId: string, chapterId: string, data?: Partial<Act>) => string

  // Entry (世界观词条)
  addEntry: (data: Omit<Entry, "id">) => string
  updateEntry: (id: string, changes: Partial<Entry>) => void
  deleteEntry: (id: string) => void

  // PromptEntry
  addPromptEntry: (entry: Omit<PromptEntry, "id" | "createdAt">) => void
  updatePromptEntry: (id: string, changes: Partial<PromptEntry>) => void
  deletePromptEntry: (id: string) => void
  getPromptEntriesForNovel: (novelId: string) => PromptEntry[]
  getPromptEntriesForAct: (novelId: string, actConfig: ActAIConfig | null) => EffectivePromptEntry[]

  // Model
  addModel: (data: Omit<ModelConfig, "id">) => string
  updateModel: (id: string, changes: Partial<ModelConfig>) => void
  deleteModel: (id: string) => void
}

type Store = StoreActions

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [novels, setNovels] = useState<Novel[]>(seedNovels)
  const [models, setModels] = useState<ModelConfig[]>(seedModels)
  const [entries, setEntries] = useState<Entry[]>(seedEntries)
  const [promptEntries, setPromptEntries] = useState<PromptEntry[]>(seedPromptEntries)

  // ── Novel ──────────────────────────────────────────────────────────────

  const createNovel: Store["createNovel"] = (data) => {
    const id = uid()
    const novel: Novel = {
      id,
      title: data.title || "未命名小说",
      genre: data.genre || "其他",
      synopsis: data.synopsis,
      updatedAt: Date.now(),
      outlineAIConfig: { ...DEFAULT_OUTLINE_AI_CONFIG },
      contentAIConfig: { ...DEFAULT_CONTENT_AI_CONFIG },
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
    setPromptEntries((prev) =>
      prev.filter((e) => e.scope !== "novel" || e.novelId !== id),
    )
    setEntries((prev) => prev.filter((e) => e.novelId !== id))
  }

  const updateNovel: Store["updateNovel"] = (id, updater) => {
    setNovels((prev) =>
      prev.map((n) => (n.id === id ? { ...updater(n), updatedAt: Date.now() } : n)),
    )
  }

  // ── Chapter ────────────────────────────────────────────────────────────

  const addChapter: Store["addChapter"] = (novelId, data) => {
    const id = uid()
    updateNovel(novelId, (n) => ({
      ...n,
      chapters: [
        ...n.chapters,
        {
          id,
          title: data?.title ?? `第${n.chapters.length + 1}章`,
          outline: data?.outline ?? "",
          expanded: data?.expanded ?? true,
          acts: data?.acts ?? [{ id: uid(), outline: "", content: "" }],
        },
      ],
    }))
    return id
  }

  const deleteChapter: Store["deleteChapter"] = (novelId, chapterId) => {
    updateNovel(novelId, (n) => ({
      ...n,
      chapters: n.chapters.filter((c) => c.id !== chapterId),
    }))
  }

  // ── Act ────────────────────────────────────────────────────────────────

  const addAct: Store["addAct"] = (novelId, chapterId, data) => {
    const id = uid()
    updateNovel(novelId, (n) => ({
      ...n,
      chapters: n.chapters.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              acts: [
                ...c.acts,
                { id, outline: data?.outline ?? "", content: data?.content ?? "" },
              ],
            }
          : c,
      ),
    }))
    return id
  }

  // ── Entry (世界观词条) ──────────────────────────────────────────────────

  const addEntry: Store["addEntry"] = (data) => {
    const id = uid()
    setEntries((prev) => [...prev, { ...data, id }])
    return id
  }

  const updateEntry: Store["updateEntry"] = (id, changes) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)))
  }

  const deleteEntry: Store["deleteEntry"] = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  // ── PromptEntry ────────────────────────────────────────────────────────

  const addPromptEntry: Store["addPromptEntry"] = (entry) => {
    const full: PromptEntry = {
      ...entry,
      id: uid(),
      createdAt: new Date().toISOString(),
    }
    setPromptEntries((prev) => [full, ...prev])
  }

  const updatePromptEntry: Store["updatePromptEntry"] = (id, changes) => {
    setPromptEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    )
  }

  const deletePromptEntry: Store["deletePromptEntry"] = (id) => {
    const entry = promptEntries.find((e) => e.id === id)
    if (entry?.isSystem) return
    setPromptEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const getPromptEntriesForNovel: Store["getPromptEntriesForNovel"] = (novelId) => {
    return promptEntries
      .filter(
        (e) => e.scope === "global" || (e.scope === "novel" && e.novelId === novelId),
      )
      .sort((a, b) => b.weight - a.weight)
  }

  const getPromptEntriesForAct: Store["getPromptEntriesForAct"] = (novelId, actConfig) => {
    const overrides = actConfig?.promptOverrides ?? []
    return getPromptEntriesForNovel(novelId).map((entry) => ({
      ...entry,
      effectiveActive: resolvePromptActive(entry, overrides),
    }))
  }

  // ── Model ──────────────────────────────────────────────────────────────

  const addModel: Store["addModel"] = (data) => {
    const id = uid()
    setModels((prev) => [...prev, { ...data, id }])
    return id
  }

  const updateModel: Store["updateModel"] = (id, changes) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)))
  }

  const deleteModel: Store["deleteModel"] = (id) => {
    setModels((prev) => prev.filter((m) => m.id !== id))
  }

  // ── Register store ref for api/ layer ─────────────────────────────────

  const storeValue: Store = {
    novels,
    models,
    entries,
    promptEntries,
    setNovels,
    setModels,
    setEntries,
    setPromptEntries,
    createNovel,
    deleteNovel,
    updateNovel,
    addChapter,
    deleteChapter,
    addAct,
    addEntry,
    updateEntry,
    deleteEntry,
    addPromptEntry,
    updatePromptEntry,
    deletePromptEntry,
    getPromptEntriesForNovel,
    getPromptEntriesForAct,
    addModel,
    updateModel,
    deleteModel,
  }

  // Keep store ref in sync for api/ layer usage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setStoreRef(storeValue) })

  return (
    <StoreContext.Provider value={storeValue}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
