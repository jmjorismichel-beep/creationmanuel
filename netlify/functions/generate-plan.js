// netlify/functions/generate-plan.js
// La clé API est UNIQUEMENT dans les variables d'environnement Netlify
// Elle n'est jamais exposée dans le code front-end

const MODEL = 'claude-sonnet-4-20250514'

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) }
  }

  const API_KEY = process.env.AI_API_KEY
  if (!API_KEY) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'Mode démo : aucune clé API configurée. Ajoutez AI_API_KEY dans les variables Netlify.' }),
    }
  }

  let params
  try {
    params = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Corps de requête invalide' }) }
  }

  const { title, audience, level, domain, tone, goals, chaptersCount, pagesCount } = params

  const prompt = `Tu es un expert en ingénierie pédagogique. Génère un plan détaillé pour ce manuel.

Titre : ${title || 'Manuel pédagogique'}
Public : ${audience || 'Adultes'}
Niveau : ${level || 'Débutant'}
Domaine : ${domain || 'Général'}
Ton : ${tone || 'Pédagogique'}
Objectifs : ${goals || 'Maîtriser les bases'}
Chapitres : ${chaptersCount || 5}
Pages : ${pagesCount || 30}

Réponds UNIQUEMENT avec ce JSON valide, sans texte autour :
{
  "title": "...",
  "subtitle": "...",
  "introduction": "Paragraphe d'introduction du manuel (150 mots min)",
  "chapters": [
    {
      "order": 1,
      "title": "Titre du chapitre",
      "description": "Résumé du contenu de ce chapitre",
      "sections": ["Titre section 1", "Titre section 2", "Titre section 3"],
      "estimatedPages": 5
    }
  ]
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
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `Erreur API ${res.status}`)
    }

    const data = await res.json()
    const text = data.content?.[0]?.text || ''

    let plan
    try {
      const clean = text.replace(/```json\n?|\n?```/g, '').trim()
      plan = JSON.parse(clean)
    } catch {
      throw new Error('La réponse IA n\'est pas un JSON valide')
    }

    return { statusCode: 200, headers, body: JSON.stringify({ plan }) }
  } catch (err) {
    console.error('generate-plan error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Erreur lors de la génération du plan' }),
    }
  }
}
