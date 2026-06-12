export type CompletenessTier = "core" | "optional"

export type CompletenessField<T> = {
  id: string
  weight: number
  tier: CompletenessTier
  isFilled: (data: T) => boolean
}

export type SectionCompletenessConfig<T> = {
  label: string
  coreMax: number
  fields: CompletenessField<T>[]
}

export type SectionCompletenessResult = {
  score: number
  coreScore: number
  optionalScore: number
  coreComplete: boolean
  fullyComplete: boolean
}

export type SectionCompletenessDisplay = {
  barWidth: number
  label: string
  barClassName: string
}

export type SectionCompletenessDisplayLabels = {
  inProgress?: (score: number) => string
  coreComplete?: string
  fullyComplete?: string
}

export function calcSectionCompleteness<T>(
  data: T,
  config: SectionCompletenessConfig<T>,
): SectionCompletenessResult {
  let coreScore = 0
  let optionalScore = 0

  for (const field of config.fields) {
    if (!field.isFilled(data)) continue
    if (field.tier === "core") coreScore += field.weight
    else optionalScore += field.weight
  }

  const score = coreScore + optionalScore

  return {
    score,
    coreScore,
    optionalScore,
    coreComplete: coreScore >= config.coreMax,
    fullyComplete: score >= 100,
  }
}

export function getSectionCompletenessDisplay(
  result: SectionCompletenessResult,
  coreMax: number,
  labels?: SectionCompletenessDisplayLabels,
): SectionCompletenessDisplay {
  const { score, coreComplete, fullyComplete } = result

  if (fullyComplete) {
    return {
      barWidth: 100,
      label: labels?.fullyComplete ?? "✨ 资料完整",
      barClassName: "bg-amber-400",
    }
  }

  if (coreComplete) {
    return {
      barWidth: 100,
      label: labels?.coreComplete ?? "100%",
      barClassName: "bg-emerald-500",
    }
  }

  const rounded = Math.round(score)
  return {
    barWidth: rounded,
    label: labels?.inProgress?.(rounded) ?? `${rounded}%`,
    barClassName: "bg-primary",
  }
}
