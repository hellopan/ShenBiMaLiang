/**
 * Unified re-export of all API modules.
 *
 * Components should import from here, not from individual module files,
 * so that path changes during backend migration are contained to this file.
 */

export * as novelsApi from "@/lib/api/novels"
export * as chaptersApi from "@/lib/api/chapters"
export * as entriesApi from "@/lib/api/entries"
export * as promptEntriesApi from "@/lib/api/prompt-entries"
export * as modelsApi from "@/lib/api/models"
export * as actConfigApi from "@/lib/api/act-config"
export * as aiApi from "@/lib/api/ai"
