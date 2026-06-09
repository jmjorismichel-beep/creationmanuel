// revisionPrompts.js — Prompts internes pour les opérations IA

/**
 * Prompt : générer un plan pédagogique structuré
 */
export function buildPlanPrompt({ title, audience, level, domain, tone, goals, chaptersCount, pagesCount }) {
  return `Tu es un expert en ingénierie pédagogique. Tu dois créer un plan détaillé pour un manuel pédagogique.

Paramètres :
- Titre : ${title}
- Public cible : ${audience}
- Niveau : ${level}
- Domaine : ${domain}
- Ton : ${tone}
- Objectifs : ${goals}
- Nombre de chapitres souhaité : ${chaptersCount}
- Nombre de pages souhaité : ${pagesCount}

Génère un plan structuré en JSON valide avec ce format :
{
  "title": "...",
  "subtitle": "...",
  "introduction": "...",
  "chapters": [
    {
      "order": 1,
      "title": "...",
      "description": "...",
      "sections": ["...", "...", "..."],
      "estimatedPages": 5
    }
  ]
}

Réponds uniquement avec le JSON, sans texte autour.`
}

/**
 * Prompt : générer un chapitre complet
 */
export function buildChapterPrompt({ chapterTitle, chapterOrder, manualTitle, audience, level, tone, previousChapters }) {
  return `Tu es un expert en ingénierie pédagogique et rédaction de manuels.

Contexte du manuel :
- Titre : ${manualTitle}
- Public : ${audience}
- Niveau : ${level}
- Ton : ${tone}
${previousChapters?.length ? `- Chapitres précédents : ${previousChapters.map(c => c.title).join(', ')}` : ''}

Tu dois rédiger le chapitre ${chapterOrder} : "${chapterTitle}".

Génère un chapitre complet en JSON valide :
{
  "title": "...",
  "introduction": "...",
  "sections": [
    { "title": "...", "content": "...", "type": "text", "order": 1 }
  ],
  "reminderTables": [
    { "title": "...", "rows": [["Colonne 1", "Colonne 2"], ["val", "val"]] }
  ],
  "exercises": [
    { "id": "ex1", "question": "...", "hint": "..." }
  ],
  "corrections": [
    { "exerciseId": "ex1", "answer": "..." }
  ],
  "summary": "..."
}

Chaque section doit avoir au moins 200 mots. Les exercices doivent être pratiques et adaptés au niveau.
Réponds uniquement avec le JSON, sans texte autour.`
}

/**
 * Prompt : corriger les fautes d'orthographe et de grammaire
 */
export function buildCorrectPrompt({ text, manualTitle }) {
  return `Tu es un correcteur orthographique et grammatical expert en français.

Manuel : "${manualTitle}"

Texte à corriger :
"""
${text}
"""

Corrige toutes les fautes d'orthographe, de grammaire, de conjugaison et de typographie.
Conserve exactement le sens, le style et la structure du texte original.
Réponds uniquement avec le texte corrigé, sans commentaires.`
}

/**
 * Prompt : reformuler un passage
 */
export function buildRephrasePrompt({ text, manualTitle, tone }) {
  return `Tu es un rédacteur expert en français.

Manuel : "${manualTitle}"
Ton souhaité : ${tone || 'pédagogique'}

Texte à reformuler :
"""
${text}
"""

Reformule ce texte en conservant le sens exact, mais avec une formulation plus fluide et naturelle.
Réponds uniquement avec le texte reformulé, sans commentaires.`
}

/**
 * Prompt : simplifier un chapitre pour débutant
 */
export function buildSimplifyPrompt({ text, manualTitle, targetLevel }) {
  return `Tu es un expert en adaptation pédagogique pour débutants.

Manuel : "${manualTitle}"
Niveau cible : ${targetLevel || 'débutant absolu'}

Texte à simplifier :
"""
${text}
"""

Simplifie ce texte pour le rendre accessible à un public débutant :
- Utilise des mots simples et courants
- Évite le jargon technique sans explication
- Ajoute des exemples concrets si nécessaire
- Décompose les phrases longues
- Garde un ton bienveillant et encourageant

Réponds uniquement avec le texte simplifié, sans commentaires.`
}

/**
 * Prompt : développer une section
 */
export function buildDevelopPrompt({ text, manualTitle, targetWords }) {
  return `Tu es un expert en rédaction pédagogique.

Manuel : "${manualTitle}"
Longueur cible : environ ${targetWords || 500} mots

Texte à développer :
"""
${text}
"""

Développe et enrichis ce texte en :
- Ajoutant des explications détaillées
- Incluant des exemples pratiques
- Ajoutant des conseils ou astuces
- Approfondissant les concepts abordés

Conserve la structure et le style original.
Réponds uniquement avec le texte développé, sans commentaires.`
}

/**
 * Prompt : adapter pour un public professionnel
 */
export function buildProfessionalPrompt({ text, manualTitle }) {
  return `Tu es un expert en rédaction professionnelle.

Manuel : "${manualTitle}"

Texte à rendre plus professionnel :
"""
${text}
"""

Réécris ce texte avec :
- Un vocabulaire professionnel et précis
- Une structure claire et rigoureuse
- Un ton formel mais accessible
- Des formulations soignées

Réponds uniquement avec le texte, sans commentaires.`
}

/**
 * Prompt : ajouter des exercices
 */
export function buildExercisesPrompt({ text, chapterTitle, level, count }) {
  return `Tu es un expert en conception d'exercices pédagogiques.

Chapitre : "${chapterTitle}"
Niveau : ${level}
Nombre d'exercices à créer : ${count || 3}

Contenu du chapitre :
"""
${text}
"""

Crée ${count || 3} exercices pratiques et leurs corrections en JSON :
{
  "exercises": [
    {
      "id": "ex1",
      "question": "...",
      "hint": "...",
      "type": "pratique"
    }
  ],
  "corrections": [
    {
      "exerciseId": "ex1",
      "answer": "...",
      "explanation": "..."
    }
  ]
}

Les exercices doivent être progressifs, concrets et adaptés au niveau.
Réponds uniquement avec le JSON, sans texte autour.`
}

/**
 * Prompt : vérifier la cohérence du manuel
 */
export function buildCheckPrompt({ manual }) {
  const summary = {
    title: manual.title,
    chaptersCount: manual.chapters?.length,
    chapters: manual.chapters?.map(c => ({ title: c.title, sectionsCount: c.sections?.length })),
    estimatedPages: manual.estimatedPages,
  }

  return `Tu es un expert en contrôle qualité de manuels pédagogiques.

Manuel à vérifier :
${JSON.stringify(summary, null, 2)}

Analyse ce manuel et identifie :
1. Les incohérences de structure
2. Les chapitres trop courts ou trop longs
3. Les titres peu clairs
4. Les parties manquantes importantes

Réponds en JSON :
{
  "score": 85,
  "issues": ["...", "..."],
  "suggestions": ["...", "..."],
  "strengths": ["...", "..."]
}

Réponds uniquement avec le JSON, sans texte autour.`
}

/**
 * Prompt : harmoniser le style global
 */
export function buildHarmonizePrompt({ text, manualTitle, tone }) {
  return `Tu es un expert en harmonisation de style rédactionnel.

Manuel : "${manualTitle}"
Ton cible : ${tone || 'pédagogique et accessible'}

Texte à harmoniser :
"""
${text}
"""

Réécris ce texte pour qu'il ait un style cohérent et uniforme :
- Uniformise le ton sur tout le texte
- Harmonise la longueur des phrases
- Garde une terminologie constante
- Assure une bonne fluidité de lecture

Réponds uniquement avec le texte harmonisé, sans commentaires.`
}
