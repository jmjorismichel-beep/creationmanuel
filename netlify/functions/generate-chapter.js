// netlify/functions/generate-chapter.js

const MODEL = 'claude-sonnet-4-20250514'

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) }

  const API_KEY = process.env.AI_API_KEY
  if (!API_KEY) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'Aucune clé API configurée (AI_API_KEY)' }) }
  }

  let params
  try { params = JSON.parse(event.body || '{}') }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Corps invalide' }) } }

  const { chapterTitle, chapterOrder, manualTitle, audience, level, tone, previousChapters } = params

  const prevContext = previousChapters?.length
    ? `\nChapitres déjà rédigés : ${previousChapters.map(c => c.title).join(', ')}`
    : ''

  const prompt = `Tu es un expert en rédaction de manuels pédagogiques.

Manuel : "${manualTitle}"
Public : ${audience || 'Adultes débutants'}
Niveau : ${level || 'Débutant'}
Ton : ${tone || 'Pédagogique et accessible'}
${prevContext}

Rédige le chapitre ${chapterOrder} : "${chapterTitle}"
Chaque section doit avoir au moins 200 mots. Le contenu doit être pratique, clair et progressif.

Réponds UNIQUEMENT avec ce JSON valide :
{
  "title": "${chapterTitle}",
  "introduction": "Introduction du chapitre (100 mots min)",
  "sections": [
    { "title": "Titre de la section", "content": "Contenu détaillé (200+ mots)", "type": "text", "order": 1 }
  ],
  "reminderTables": [
    { "title": "Titre du tableau", "rows": [["Colonne 1", "Colonne 2"], ["valeur", "valeur"]] }
  ],
  "exercises": [
    { "id": "ex1", "question": "Énoncé de l'exercice pratique", "hint": "Indice optionnel" }
  ],
  "corrections": [
    { "exerciseId": "ex1", "answer": "Réponse détaillée", "explanation": "Explication pédagogique" }
  ],
  "summary": "Résumé du chapitre en 2-3 phrases"
}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `Erreur API ${res.status}`)
    }

    const data   = await res.json()
    const text   = data.content?.[0]?.text || ''
    const clean  = text.replace(/```json\n?|\n?```/g, '').trim()
    const chapter = JSON.parse(clean)

    return { statusCode: 200, headers, body: JSON.stringify({ chapter }) }
  } catch (err) {
    console.error('generate-chapter error:', err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || 'Erreur génération chapitre' }) }
  }
}
