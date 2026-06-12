/**
 * @api-module /models
 *
 * Currently: operates on in-memory Context store.
 * Future migration: replace each function body with fetch('/api/models', ...).
 */

import type { ModelConfig } from "@/lib/types"
import { getStoreRef } from "@/lib/api/_store-ref"

export async function listModels(): Promise<ModelConfig[]> {
  return Promise.resolve(getStoreRef().models)
}

export async function addModel(data: Omit<ModelConfig, "id">): Promise<ModelConfig> {
  const id = getStoreRef().addModel(data)
  const model = getStoreRef().models.find((m) => m.id === id)
  if (!model) throw new Error("Failed to create model")
  return Promise.resolve(model)
}

export async function updateModel(id: string, patch: Partial<ModelConfig>): Promise<ModelConfig> {
  getStoreRef().updateModel(id, patch)
  const model = getStoreRef().models.find((m) => m.id === id)
  if (!model) throw new Error(`Model ${id} not found`)
  return Promise.resolve(model)
}

export async function deleteModel(id: string): Promise<void> {
  getStoreRef().deleteModel(id)
  return Promise.resolve()
}
