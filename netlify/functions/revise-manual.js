// netlify/functions/revise-manual.js

const MODEL = 'claude-sonnet-4-20250514'

const SYSTEM_PROMPTS = {
  correct:      'Tu es un correcteur orthographique expert. Corrige toutes les fautes sans changer le sens ni le style.',
  simplify:     'Tu es un expert en vulgarisation. Simplifie le texte pour un public débutant, avec des mots simples et des exemples concrets.',
  develop:      'Tu es un rédacteur expert. Développe et enrichis le texte avec des explications, exemples et détails supplémentaires.',
  rephrase:     'Tu es un rédacteur expert. Reformule le texte de façon plus fluide et naturelle, en conservant le sens exact.',
  professional: 'Tu es un expert en rédaction professionnelle. Rends ce texte plus professionnel, précis et structuré.',
  beginner:     'Tu es un expert en pédagogie pour débutants. Adapte le texte pour une personne sans connaissance préalable du sujet.',
  exercises:    'Tu es un expert en conception pédagogique. Enrichis ce contenu en ajoutant des exercices pratiques et leurs corrections.',
  check:        'Tu es un expert en qualité pédagogique. Analyse ce texte et identifie les problèmes, incohérences et améliorations possibles.',
  custom:       'Tu es un assistant pédagogique expert. Applique la consigne demandée sur le texte fourni.',
}

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

  const { text, instruction, scope, manualTitle, revisionType } = params

  if (!text || !instruction) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'text et instruction sont requis' }) }
  }

  const system = SYSTEM_PROMPTS[revisionType] || SYSTEM_PROMPTS.custom

  const userPrompt = revisionType === 'custom'
    ? `Manuel : "${manualTitle}"\nConsigne : ${instruction}\n\nTexte :\n"""\n${text}\n"""\n\nApplique la consigne et réponds uniquement avec le texte modifié.`
    : `Manuel : "${manualTitle}"\n\nTexte à modifier :\n"""\n${text}\n"""\n\nRéponds uniquement avec le texte modifié, sans commentaire.`

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
        system,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `Erreur API ${res.status}`)
    }

    const data    = await res.json()
    const revised = data.content?.[0]?.text || text

    return { statusCode: 200, headers, body: JSON.stringify({ revised }) }
  } catch (err) {
    console.error('revise-manual error:', err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || 'Erreur révision' }) }
  }
}
