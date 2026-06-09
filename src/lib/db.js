/**
 * db.js — Base de données locale avec Dexie.js (IndexedDB)
 */
import Dexie from 'dexie'

export const db = new Dexie('ManueliaDB')

db.version(1).stores({
  manuals: 'manualId, title, status, createdAt, updatedAt',
  versions: 'id, manualId, date',
  offlineQueue: 'id, manualId, createdAt, status',
  preferences: 'key',
})

// ─── Manuels ─────────────────────────────────────────────────────────────────

export async function saveManual(manual) {
  manual.updatedAt = new Date().toISOString()
  await db.manuals.put(manual)
  return manual
}

export async function getManual(manualId) {
  return db.manuals.get(manualId)
}

export async function getAllManuals() {
  return db.manuals.orderBy('updatedAt').reverse().toArray()
}

export async function deleteManual(manualId) {
  await db.manuals.delete(manualId)
  await db.versions.where('manualId').equals(manualId).delete()
}

export async function duplicateManual(manualId) {
  const manual = await getManual(manualId)
  if (!manual) return null
  const copy = {
    ...JSON.parse(JSON.stringify(manual)),
    manualId: crypto.randomUUID(),
    title: `${manual.title} (copie)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versionHistory: [],
  }
  await saveManual(copy)
  return copy
}

// ─── Versions ─────────────────────────────────────────────────────────────────

export async function saveVersion(manualId, description, snapshot) {
  const version = {
    id: crypto.randomUUID(),
    manualId,
    date: new Date().toISOString(),
    description,
    snapshot: JSON.parse(JSON.stringify(snapshot)),
  }
  await db.versions.put(version)
  return version
}

export async function getVersions(manualId) {
  return db.versions
    .where('manualId')
    .equals(manualId)
    .reverse()
    .sortBy('date')
}

export async function restoreVersion(versionId) {
  const version = await db.versions.get(versionId)
  if (!version) return null
  const restored = {
    ...version.snapshot,
    updatedAt: new Date().toISOString(),
  }
  await saveManual(restored)
  return restored
}

// ─── File hors ligne ─────────────────────────────────────────────────────────

export async function addToOfflineQueue(manualId, actionType, payload) {
  const item = {
    id: crypto.randomUUID(),
    manualId,
    actionType,
    payload,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }
  await db.offlineQueue.put(item)
  return item
}

export async function getPendingQueue() {
  return db.offlineQueue.where('status').equals('pending').toArray()
}

export async function removeFromQueue(id) {
  await db.offlineQueue.delete(id)
}

export async function markQueueItemDone(id) {
  await db.offlineQueue.update(id, { status: 'done' })
}

// ─── Préférences ─────────────────────────────────────────────────────────────

export async function getPreference(key, defaultValue = null) {
  const item = await db.preferences.get(key)
  return item ? item.value : defaultValue
}

export async function setPreference(key, value) {
  await db.preferences.put({ key, value })
}
