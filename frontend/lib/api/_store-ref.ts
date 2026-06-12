/**
 * Internal helper — provides a way for api/ modules to access the store's
 * setState functions without circular-importing the whole store.
 *
 * Usage: In StoreProvider, call `setStoreRef(actions)` once on mount.
 * All api/ functions then call `getStoreRef()` to reach store actions.
 *
 * This is a deliberate seam: when we migrate to a real backend, each api/
 * module replaces its body with `fetch(...)` calls and this file is deleted.
 */

import type { StoreActions } from "@/lib/store"

let _ref: StoreActions | null = null

export function setStoreRef(actions: StoreActions) {
  _ref = actions
}

export function getStoreRef(): StoreActions {
  if (!_ref) throw new Error("Store not initialised — wrap your app in <StoreProvider>")
  return _ref
}
