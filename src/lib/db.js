/**
 * db.js — Base de données locale avec Dexie.js (IndexedDB)
 * v2 : ajout de la table exerciseLibrary
 */
import Dexie from 'dexie'

export const db = new Dexie('ManueliaDB')

db.version(1).stores({
  manuals:         'manualId, title, status, createdAt, updatedAt',
  versions:        'id, manualId, date',
  offlineQueue:    'id, manualId, createdAt, status',
  preferences:     'key',
})

// Migration v2 : ajout bibliothèque d'exercices
db.version(2).stores({
  manuals:         'manualId, title, status, createdAt, updatedAt, domain, level',
  versions:        'id, manualId, date',
  offlineQueue:    'id, manualId, createdAt, status',
  preferences:     'key',
  exerciseLibrary: 'id, domain, level, type, createdAt, manualId',
})

// ─── Manuels ──────────────────────────────────────────────────────────────────

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
    manualId:  crypto.randomUUID(),
    title:     `${manual.title} (copie)`,
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
    id:          crypto.randomUUID(),
    manualId,
    date:        new Date().toISOString(),
    createdAt:   new Date().toISOString(),
    description,
    data:        JSON.parse(JSON.stringify(snapshot)),
    snapshot:    JSON.parse(JSON.stringify(snapshot)), // compat
  }
  await db.versions.put(version)
  return version
}

export async function getVersions(manualId) {
  return db.versions.where('manualId').equals(manualId).reverse().sortBy('date')
}

export async function restoreVersion(versionId) {
  const version = await db.versions.get(versionId)
  if (!version) return null
  const restored = {
    ...(version.data || version.snapshot),
    updatedAt: new Date().toISOString(),
  }
  await saveManual(restored)
  return restored
}

// ─── File hors ligne ──────────────────────────────────────────────────────────

export async function addToOfflineQueue(payload) {
  const item = {
    id:        crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status:    'pending',
    ...payload,
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

// ─── Préférences ──────────────────────────────────────────────────────────────

export async function getPreference(key, defaultValue = null) {
  const item = await db.preferences.get(key)
  return item ? item.value : defaultValue
}

export async function setPreference(key, value) {
  await db.preferences.put({ key, value })
}

// ─── Bibliothèque d'exercices ─────────────────────────────────────────────────

export async function saveExercise(exercise) {
  const item = {
    id:        exercise.id || crypto.randomUUID(),
    createdAt: exercise.createdAt || new Date().toISOString(),
    ...exercise,
  }
  await db.exerciseLibrary.put(item)
  return item
}

export async function getAllExercises({ domain, level, type, search } = {}) {
  let query = db.exerciseLibrary.orderBy('createdAt').reverse()
  const results = await query.toArray()

  return results.filter(ex => {
    if (domain && ex.domain && ex.domain !== domain) return false
    if (level  && ex.level  && ex.level  !== level)  return false
    if (type   && ex.type   && ex.type   !== type)   return false
    if (search) {
      const q = search.toLowerCase()
      const haystack = `${ex.question} ${ex.tags?.join(' ')} ${ex.domain} ${ex.level}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export async function deleteExercise(id) {
  await db.exerciseLibrary.delete(id)
}

export async function importExercisesFromManual(manual) {
  const added = []
  for (const ch of manual.chapters || []) {
    for (const ex of ch.exercises || []) {
      const q = typeof ex === 'string' ? ex : (ex.question || '')
      if (!q.trim()) continue
      const correction = ch.corrections?.find(c =>
        typeof c === 'object' ? c.exerciseId === ex.id : false
      )
      const saved = await saveExercise({
        id:         crypto.randomUUID(),
        question:   q,
        hint:       typeof ex === 'object' ? (ex.hint || '') : '',
        answer:     typeof correction === 'object' ? (correction.answer || '') : (typeof correction === 'string' ? correction : ''),
        explanation:typeof correction === 'object' ? (correction.explanation || '') : '',
        domain:     manual.domain || '',
        level:      manual.level  || '',
        type:       typeof ex === 'object' ? (ex.type || 'pratique') : 'pratique',
        tags:       [manual.domain, manual.level, ch.title].filter(Boolean),
        manualId:   manual.manualId,
        manualTitle:manual.title,
        chapterTitle: ch.title,
        createdAt:  new Date().toISOString(),
      })
      added.push(saved)
    }
  }
  return added
}
