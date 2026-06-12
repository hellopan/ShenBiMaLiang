/**
 * @api-module /acts/:actId/config
 *
 * Currently: ActAIConfig lives only in editor page local state (useState).
 * This module exists as a seam — currently it's a no-op pass-through,
 * but it documents the shape of the future API endpoint.
 *
 * Future migration:
 *   getActConfig  → GET  /api/acts/:actId/config
 *   saveActConfig → PUT  /api/acts/:actId/config
 *
 * @api-config  ActAIConfig is stored as a JSON column on the Act row, not a separate table.
 */

import type { ActAIConfig } from "@/lib/types"

/**
 * Retrieve act config from in-memory record.
 * In the real backend this will be a GET request returning the stored JSON config.
 */
export async function getActConfig(
  actId: string,
  configs: Record<string, ActAIConfig>,
): Promise<ActAIConfig | null> {
  return Promise.resolve(configs[actId] ?? null)
}

/**
 * Persist act config change.
 * Currently calls the provided setter; in the real backend this will be a PUT request.
 */
export async function saveActConfig(
  actId: string,
  patch: Partial<ActAIConfig>,
  setter: (fn: (prev: Record<string, ActAIConfig>) => Record<string, ActAIConfig>) => void,
): Promise<void> {
  setter((prev) => ({
    ...prev,
    [actId]: { ...prev[actId], ...patch },
  }))
  return Promise.resolve()
}
