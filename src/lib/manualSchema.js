/**
 * manualSchema.js
 * Structure de données centrale pour un manuel pédagogique Manuelia AI
 */

export function createEmptyManual(overrides = {}) {
  const now = new Date().toISOString()
  return {
    manualId: crypto.randomUUID(),
    title: '',
    subtitle: '',
    targetAudience: '',
    level: 'débutant',
    goals: [],
    estimatedPages: 10,
    estimatedWords: 4000,
    domain: 'numérique',
    writingStyle: 'pédagogique',
    tone: 'simple',
    createdAt: now,
    updatedAt: now,
    status: 'brouillon', // brouillon | en-cours | terminé

    // Options de structure
    options: {
      coverPage: true,
      tableOfContents: true,
      pedagogicalGoals: true,
      prerequisites: true,
      reminderTables: true,
      exercises: true,
      corrections: true,
      selfEvalGrid: false,
      finalProject: false,
      appendices: false,
    },

    // Contenu
    coverPage: {
      title: '',
      subtitle: '',
      author: '',
      organization: '',
      date: '',
      version: '1.0',
    },

    introduction: '',
    prerequisites: '',
    tableOfContents: [],

    chapters: [],
    finalProject: null,
    appendices: [],
    conclusion: '',

    // Historique des versions
    versionHistory: [],

    ...overrides,
  }
}

export function createEmptyChapter(index = 1) {
  return {
    id: crypto.randomUUID(),
    order: index,
    title: `Chapitre ${index}`,
    introduction: '',
    sections: [],
    reminderTables: [],
    exercises: [],
    corrections: [],
    summary: '',
  }
}

export function createEmptySection(order = 1) {
  return {
    id: crypto.randomUUID(),
    order,
    title: '',
    content: '',
    type: 'text', // text | list | table | example | note | warning
  }
}

export function createEmptyExercise(order = 1) {
  return {
    id: crypto.randomUUID(),
    order,
    title: `Exercice ${order}`,
    instructions: '',
    content: '',
    correction: '',
  }
}

export function createVersionSnapshot(manual, description = 'Modification') {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    description,
    snapshot: JSON.parse(JSON.stringify(manual)),
  }
}

export const LEVELS = [
  'A1 — Grand débutant',
  'A2 — Débutant',
  'B1 — Intermédiaire',
  'B2 — Intermédiaire avancé',
  'C1 — Avancé',
  'C2 — Maîtrise',
  'Débutant (non scolaire)',
  'Intermédiaire (non scolaire)',
  'Avancé (non scolaire)',
]

export const DOMAINS = [
  'Numérique',
  'Bureautique',
  'Français langue étrangère',
  'Mathématiques',
  'Industrie',
  'Administratif',
  'Anglais',
  'Santé',
  'Commerce',
  'Autre',
]

export const TONES = [
  { value: 'simple', label: 'Simple et accessible' },
  { value: 'pedagogique', label: 'Pédagogique et bienveillant' },
  { value: 'professionnel', label: 'Professionnel et direct' },
  { value: 'detaille', label: 'Très détaillé, pas à pas' },
  { value: 'formel', label: 'Formel et académique' },
]

export const MANUAL_TYPES = [
  'Manuel de formation',
  'Guide pratique',
  'Livret d\'exercices',
  'Support de cours',
  'Guide d\'apprentissage autonome',
  'Référentiel de compétences',
  'Guide de l\'apprenant',
]
