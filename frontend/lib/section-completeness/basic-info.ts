import {
  calcSectionCompleteness,
  getSectionCompletenessDisplay,
  type SectionCompletenessConfig,
  type SectionCompletenessDisplay,
  type SectionCompletenessResult,
} from "@/lib/section-completeness"

export type BasicInfoFormData = {
  title: string
  synopsis: string
  targetWordCount: string | number
  genreTags: string[]
  perspectiveTags: string[]
  toneTags: string[]
  pacingTags: string[]
  romanceTags: string[]
  conflictTags: string[]
}

function hasPositiveTargetWordCount(value: string | number): boolean {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) && n > 0
}

export const BASIC_INFO_COMPLETENESS_CONFIG: SectionCompletenessConfig<BasicInfoFormData> =
  {
    label: "资料完整度",
    coreMax: 85,
    fields: [
      {
        id: "title",
        weight: 20,
        tier: "core",
        isFilled: (d) => d.title.trim().length > 0,
      },
      {
        id: "genre",
        weight: 10,
        tier: "core",
        isFilled: (d) => d.genreTags.length > 0,
      },
      {
        id: "synopsis",
        weight: 25,
        tier: "core",
        isFilled: (d) => d.synopsis.trim().length > 0,
      },
      {
        id: "targetWordCount",
        weight: 10,
        tier: "core",
        isFilled: (d) => hasPositiveTargetWordCount(d.targetWordCount),
      },
      {
        id: "perspective",
        weight: 8,
        tier: "core",
        isFilled: (d) => d.perspectiveTags.length > 0,
      },
      {
        id: "tone",
        weight: 7,
        tier: "core",
        isFilled: (d) => d.toneTags.length > 0,
      },
      {
        id: "pacing",
        weight: 5,
        tier: "core",
        isFilled: (d) => d.pacingTags.length > 0,
      },
      {
        id: "romance",
        weight: 8,
        tier: "optional",
        isFilled: (d) => d.romanceTags.length > 0,
      },
      {
        id: "conflict",
        weight: 7,
        tier: "optional",
        isFilled: (d) => d.conflictTags.length > 0,
      },
    ],
  }

export function calcBasicInfoCompleteness(
  data: BasicInfoFormData,
): SectionCompletenessResult {
  return calcSectionCompleteness(data, BASIC_INFO_COMPLETENESS_CONFIG)
}

export function getBasicInfoCompletenessDisplay(
  result: SectionCompletenessResult,
): SectionCompletenessDisplay {
  return getSectionCompletenessDisplay(
    result,
    BASIC_INFO_COMPLETENESS_CONFIG.coreMax,
  )
}
