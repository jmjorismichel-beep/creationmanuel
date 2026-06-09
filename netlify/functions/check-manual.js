// netlify/functions/check-manual.js

const MODEL = 'claude-sonnet-4-20250514'

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) }

  // Ping de disponibilité
  let params
  try { params = JSON.parse(event.body || '{}') }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Corps invalide' }) } }

  if (params.ping) {
    const available = !!process.env.AI_API_KEY
    return { statusCode: 200, headers, body: JSON.stringify({ available }) }
  }

  const API_KEY = process.env.AI_API_KEY
  if (!API_KEY) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'Aucune clé API configurée (AI_API_KEY)' }) }
  }

  const { manual } = params
  if (!manual) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'manual est requis' }) }
  }

  const summary = {
    title:         manual.title,
    chaptersCount: manual.chapters?.length || 0,
    chapters:      manual.chapters?.map(c => ({
      title:         c.title,
      sectionsCount: c.sections?.length || 0,
      hasExercises:  !!c.exercises?.length,
      hasCorrections:!!c.corrections?.length,
    })),
    hasIntro:       !!manual.introduction,
    hasConclusion:  !!manual.conclusion,
    estimatedPages: manual.estimatedPages,
  }

  const prompt = `Tu es un expert en contrôle qualité de manuels pédagogiques.

Manuel à analyser :
${JSON.stringify(summary, null, 2)}

Analyse ce manuel et fournis un rapport qualité détaillé.

Réponds UNIQUEMENT avec ce JSON valide :
{
  "score": 85,
  "issues": ["Description du problème 1", "Description du problème 2"],
  "suggestions": ["Suggestion d'amélioration 1", "Suggestion 2"],
  "strengths": ["Point fort 1", "Point fort 2"],
  "summary": "Résumé en 2 phrases"
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
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `Erreur API ${res.status}`)
    }

    const data  = await res.json()
    const text  = data.content?.[0]?.text || ''
    const clean = text.replace(/```json\n?|\n?```/g, '').trim()
    const report = JSON.parse(clean)

    return { statusCode: 200, headers, body: JSON.stringify(report) }
  } catch (err) {
    console.error('check-manual error:', err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || 'Erreur vérification' }) }
  }
}
