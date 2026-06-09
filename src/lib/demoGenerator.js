/**
 * demoGenerator.js
 * Génère un faux manuel structuré et réaliste en mode démonstration.
 * Fonctionne entièrement sans API IA.
 */

import {
  createEmptyManual,
  createEmptyChapter,
  createEmptySection,
  createEmptyExercise,
} from './manualSchema.js'

// Simule un délai asynchrone
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Génère un plan pédagogique fictif selon les paramètres du formulaire.
 */
export async function generateDemoPlan(formData, onProgress) {
  onProgress?.({ step: 1, label: 'Analyse du prompt…', percent: 10 })
  await delay(800)

  onProgress?.({ step: 2, label: 'Création du plan…', percent: 30 })
  await delay(1000)

  const numChapters = Math.min(parseInt(formData.numChapters) || 5, 12)
  const chapters = generateChapterTitles(formData.title || formData.subject, numChapters, formData.domain)

  onProgress?.({ step: 3, label: 'Plan prêt.', percent: 60 })
  await delay(500)

  return {
    title: formData.title || 'Manuel sans titre',
    subtitle: `Manuel de formation — ${formData.targetAudience || 'Apprenant'}`,
    introduction: buildIntroduction(formData),
    chapters,
  }
}

/**
 * Génère le manuel complet en mode démo.
 */
export async function generateDemoManual(formData, plan, onProgress) {
  const numPages = Math.min(parseInt(formData.numPages) || 20, 75)
  const numChapters = plan.chapters.length

  const manual = createEmptyManual({
    title: plan.title,
    subtitle: plan.subtitle,
    targetAudience: formData.targetAudience || 'Apprenant',
    level: formData.level || 'Débutant',
    domain: formData.domain || 'Numérique',
    tone: formData.tone || 'simple',
    estimatedPages: numPages,
    estimatedWords: numPages * 400,
    options: buildOptions(formData),
  })

  // Page de garde
  if (formData.coverPage !== false) {
    manual.coverPage = {
      title: plan.title,
      subtitle: plan.subtitle,
      author: formData.author || 'Formateur',
      organization: formData.organization || 'Centre de formation',
      date: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }),
      version: '1.0',
    }
  }

  manual.introduction = plan.introduction
  manual.prerequisites = buildPrerequisites(formData)

  onProgress?.({ step: 4, label: 'Génération des chapitres…', percent: 40 })
  await delay(600)

  // Chapitres
  for (let i = 0; i < numChapters; i++) {
    const chapterTitle = plan.chapters[i]
    const chapter = createEmptyChapter(i + 1)
    chapter.title = chapterTitle
    chapter.introduction = buildChapterIntro(chapterTitle, formData)
    chapter.sections = buildSections(chapterTitle, formData, i)
    chapter.summary = buildChapterSummary(chapterTitle, i + 1, numChapters)

    if (formData.reminderTables !== false) {
      chapter.reminderTables = buildReminderTables(chapterTitle, i)
    }

    if (formData.exercises !== false) {
      chapter.exercises = buildExercises(chapterTitle, i + 1, formData)
    }

    if (formData.corrections !== false) {
      chapter.corrections = buildCorrections(chapter.exercises)
    }

    manual.chapters.push(chapter)

    onProgress?.({
      step: 4,
      label: `Chapitre ${i + 1}/${numChapters} généré…`,
      percent: 40 + Math.round((i + 1) / numChapters * 30),
    })
    await delay(200)
  }

  onProgress?.({ step: 5, label: 'Génération des exercices…', percent: 72 })
  await delay(500)

  onProgress?.({ step: 6, label: 'Génération des corrections…', percent: 80 })
  await delay(400)

  // Projet final
  if (formData.finalProject) {
    manual.finalProject = buildFinalProject(plan.title, formData)
  }

  // Annexes
  if (formData.appendices) {
    manual.appendices = buildAppendices(formData)
  }

  manual.conclusion = buildConclusion(plan.title, formData)

  // Sommaire
  manual.tableOfContents = buildTableOfContents(manual)

  onProgress?.({ step: 7, label: 'Assemblage du manuel…', percent: 88 })
  await delay(400)

  onProgress?.({ step: 8, label: 'Sauvegarde…', percent: 94 })
  await delay(300)

  onProgress?.({ step: 9, label: 'Manuel prêt !', percent: 100 })
  await delay(200)

  return manual
}

// ─── Helpers internes ────────────────────────────────────────────────────────

function buildOptions(formData) {
  return {
    coverPage: formData.coverPage !== false,
    tableOfContents: formData.tableOfContents !== false,
    pedagogicalGoals: formData.pedagogicalGoals !== false,
    prerequisites: formData.prerequisites !== false,
    reminderTables: formData.reminderTables !== false,
    exercises: formData.exercises !== false,
    corrections: formData.corrections !== false,
    selfEvalGrid: !!formData.selfEvalGrid,
    finalProject: !!formData.finalProject,
    appendices: !!formData.appendices,
  }
}

function generateChapterTitles(subject, count, domain) {
  const base = subject || 'Informatique'

  const templatesParDomain = {
    Bureautique: [
      'Introduction à l\'environnement de travail',
      'Prise en main de l\'interface',
      'Gestion des fichiers et dossiers',
      'Créer et mettre en forme un document',
      'Tableaux et listes',
      'Formules et calculs de base',
      'Mise en page et impression',
      'Raccourcis clavier essentiels',
      'Gestion des données',
      'Partage et collaboration',
      'Astuces et bonnes pratiques',
      'Bilan et révisions',
    ],
    Numérique: [
      'Découverte de l\'environnement numérique',
      'Naviguer sur Internet en sécurité',
      'Gestion des fichiers et dossiers',
      'La messagerie électronique',
      'Les réseaux sociaux et leur usage',
      'Les services en ligne essentiels',
      'Protection des données personnelles',
      'Outils collaboratifs en ligne',
      'Démarches administratives numériques',
      'Médias numériques et vérification des sources',
      'Bonnes pratiques numériques',
      'Bilan de compétences numériques',
    ],
    default: [
      `Introduction — ${base}`,
      'Les fondamentaux',
      'Concepts essentiels',
      'Mise en pratique',
      'Approfondissement',
      'Exercices guidés',
      'Techniques avancées',
      'Cas pratiques',
      'Révisions et consolidation',
      'Évaluation des acquis',
      'Pour aller plus loin',
      'Bilan final',
    ],
  }

  const templates = templatesParDomain[domain] || templatesParDomain.default
  return templates.slice(0, count)
}

function buildIntroduction(formData) {
  const audience = formData.targetAudience || 'les apprenants'
  const subject = formData.title || 'ce domaine'
  const tone = formData.tone || 'simple'

  const intros = {
    simple: `Ce manuel a été conçu pour vous accompagner pas à pas dans votre apprentissage de ${subject}. Il s'adresse à ${audience} et ne nécessite aucune connaissance préalable. Chaque chapitre est progressif et comporte des exercices pratiques pour vous permettre de consolider vos acquis.\n\nPrenez le temps de lire chaque section attentivement, de réaliser les exercices proposés et de vérifier vos réponses avec les corrections fournies. N'hésitez pas à revenir en arrière si une notion vous semble difficile.`,
    professionnel: `Le présent manuel de formation constitue un support pédagogique complet destiné à ${audience}. Il aborde de manière structurée et progressive l'ensemble des compétences relatives à ${subject}, en s'appuyant sur une approche pédagogique éprouvée.\n\nLes objectifs d'apprentissage sont clairement définis en début de chaque module. Des exercices d'application permettent la mise en pratique immédiate des concepts présentés.`,
    detaille: `Bienvenue dans ce manuel complet dédié à ${subject}. Ce document a été élaboré avec le plus grand soin pour offrir à ${audience} un parcours d'apprentissage exhaustif, structuré et accessible.\n\nVous trouverez dans ce manuel :\n- Des explications claires et détaillées pour chaque notion\n- Des exemples concrets issus de situations réelles\n- Des exercices progressifs avec corrections détaillées\n- Des tableaux de rappel pour mémoriser les points essentiels\n- Des conseils pratiques pour progresser efficacement`,
  }

  return intros[tone] || intros.simple
}

function buildPrerequisites(formData) {
  const level = formData.level || 'Débutant'
  if (level.includes('A1') || level.includes('Grand débutant') || level.includes('Débutant')) {
    return `**Aucun prérequis technique n'est nécessaire** pour suivre ce manuel.\n\nIl est cependant recommandé :\n- De disposer d'un ordinateur ou d'une tablette fonctionnel\n- D'avoir accès à Internet pour les exercices en ligne\n- De prévoir un moment calme pour vous concentrer\n- D'avoir de quoi prendre des notes`
  }
  return `Pour suivre ce manuel dans de bonnes conditions, vous devez :\n- Avoir une connaissance de base de l'environnement informatique\n- Savoir utiliser une souris et un clavier\n- Connaître les principales fonctions d'un navigateur web\n- Avoir suivi une formation de niveau ${level} ou équivalent`
}

function buildChapterIntro(title, formData) {
  return `Dans ce chapitre, nous allons explorer **${title}**. À l'issue de cette section, vous serez capable d'utiliser les outils présentés de façon autonome et de les appliquer dans votre contexte de travail.\n\nNous procéderons par étapes progressives, en commençant par les notions fondamentales avant d'aborder des cas pratiques.`
}

function buildSections(chapterTitle, formData, chapterIndex) {
  const sections = []
  const numSections = 3 + (chapterIndex % 2)

  const sectionTypes = ['explanation', 'example', 'step-by-step', 'note']

  for (let i = 0; i < numSections; i++) {
    const section = createEmptySection(i + 1)
    section.title = generateSectionTitle(chapterTitle, i)
    section.type = sectionTypes[i % sectionTypes.length]
    section.content = generateSectionContent(section.title, section.type, formData.tone)
    sections.push(section)
  }

  return sections
}

function generateSectionTitle(chapterTitle, index) {
  const prefixes = [
    'Comprendre ',
    'Utiliser ',
    'Pratiquer ',
    'Les étapes pour ',
    'Approfondir ',
    'Appliquer ',
  ]
  const bases = [
    'les éléments essentiels',
    'les fonctionnalités de base',
    'les outils disponibles',
    'la mise en pratique',
    'les bonnes pratiques',
    'les cas concrets',
  ]
  return (prefixes[index] || '') + bases[index % bases.length]
}

function generateSectionContent(title, type, tone) {
  const contents = {
    explanation: `**${title}**\n\nCette section présente les concepts fondamentaux que vous devez maîtriser. Lisez attentivement chaque point avant de passer à la pratique.\n\nLes éléments clés à retenir sont :\n- Premier point essentiel à comprendre et à mémoriser\n- Deuxième notion importante pour la suite du cours\n- Troisième élément qui sera réutilisé dans les exercices\n\nPrenez le temps d'assimiler ces notions avant de continuer.`,
    example: `**Exemple concret**\n\n*Situation :* Imaginez que vous souhaitez réaliser une tâche courante dans votre travail quotidien.\n\n*Voici comment procéder :*\n\n1. Commencez par ouvrir l'outil ou le document concerné\n2. Localisez la fonctionnalité dans le menu ou la barre d'outils\n3. Suivez les instructions à l'écran étape par étape\n4. Vérifiez le résultat obtenu\n\n*Résultat attendu :* La tâche est accomplie correctement et vous avez acquis une nouvelle compétence pratique.`,
    'step-by-step': `**Procédure pas à pas**\n\nSuivez ces étapes dans l'ordre pour réaliser l'opération correctement.\n\n**Étape 1** — Préparer l'environnement\nAvant de commencer, assurez-vous que tout est prêt : l'outil est ouvert, votre document est accessible.\n\n**Étape 2** — Effectuer l'action principale\nCliquez sur l'élément concerné ou saisissez les informations demandées.\n\n**Étape 3** — Vérifier le résultat\nContrôlez que l'opération s'est déroulée correctement.\n\n**Étape 4** — Sauvegarder si nécessaire\nN'oubliez pas d'enregistrer votre travail régulièrement.`,
    note: `> **À retenir**\n>\n> Ce point est particulièrement important pour la suite du manuel. Gardez-le en mémoire, car il sera réutilisé dans les prochains chapitres et exercices.\n\n**Conseil pratique :** Prenez l'habitude de noter les raccourcis et commandes essentiels sur une fiche de révision. Cela vous permettra de progresser plus rapidement et de retrouver facilement les informations clés.`,
  }
  return contents[type] || contents.explanation
}

function buildReminderTables(chapterTitle, index) {
  return [
    {
      id: crypto.randomUUID(),
      title: `Tableau récapitulatif — ${chapterTitle}`,
      headers: ['Notion', 'Définition', 'Utilisation'],
      rows: [
        ['Terme 1', 'Définition claire du premier terme important', 'Utilisé pour les opérations de base'],
        ['Terme 2', 'Explication du deuxième concept clé', 'Appliqué dans les exercices pratiques'],
        ['Terme 3', 'Description du troisième élément à mémoriser', 'Indispensable pour la suite du cours'],
        ['Raccourci', 'Ctrl + S', 'Sauvegarder rapidement le travail en cours'],
      ],
    },
  ]
}

function buildExercises(chapterTitle, chapterNum, formData) {
  const exercises = []
  const count = 2 + (chapterNum % 2)

  for (let i = 1; i <= count; i++) {
    const ex = createEmptyExercise(i)
    ex.title = `Exercice ${chapterNum}.${i} — Mise en pratique`
    ex.instructions = `Réalisez cet exercice pour vérifier votre compréhension du chapitre "${chapterTitle}".`
    ex.content = generateExerciseContent(i, chapterTitle)
    exercises.push(ex)
  }

  return exercises
}

function generateExerciseContent(num, chapterTitle) {
  const exercises = [
    `**Exercice de compréhension**\n\nRépondez aux questions suivantes sans consulter le cours :\n\n1. Quelle est la définition du premier concept étudié dans ce chapitre ?\n2. Citez trois étapes importantes de la procédure vue en cours.\n3. Dans quelle situation utiliseriez-vous cette fonctionnalité ?\n4. Quelle est la différence entre les deux méthodes présentées ?`,
    `**Exercice pratique**\n\nRéalisez les opérations suivantes sur votre poste de travail :\n\n1. Ouvrez l'outil ou l'application concerné\n2. Créez un nouveau document ou fichier de test\n3. Appliquez les techniques vues dans ce chapitre\n4. Enregistrez votre travail dans un dossier dédié\n5. Vérifiez que le résultat correspond aux attentes\n\n*Durée estimée : 15 à 20 minutes*`,
    `**Exercice de synthèse**\n\nÀ partir des connaissances acquises dans ce chapitre, réalisez la mise en situation suivante :\n\n*Contexte :* Vous êtes en situation professionnelle et devez accomplir une tâche courante.\n\nRéalisez les étapes nécessaires en vous appuyant sur les techniques apprises. Notez les difficultés rencontrées et les solutions trouvées.`,
  ]
  return exercises[(num - 1) % exercises.length]
}

function buildCorrections(exercises) {
  return exercises.map(ex => ({
    exerciseId: ex.id,
    title: `Correction — ${ex.title}`,
    content: `**Correction détaillée**\n\n*Pour la question 1 :*\nLa réponse attendue porte sur les concepts fondamentaux vus en début de chapitre. L'essentiel est de retenir la définition précise et les cas d'usage principaux.\n\n*Pour la question 2 :*\nLes trois étapes importantes sont : (1) la préparation de l'environnement, (2) la réalisation de l'opération principale, (3) la vérification et la sauvegarde du résultat.\n\n*Pour les exercices pratiques :*\nLe résultat attendu est un document ou fichier correctement créé et enregistré, démontrant la maîtrise des techniques enseignées dans ce chapitre.\n\n*Points de vigilance :*\n- Vérifier systématiquement le résultat obtenu\n- Sauvegarder le travail à chaque étape importante\n- Respecter les conventions de nommage des fichiers`,
  }))
}

function buildChapterSummary(title, num, total) {
  return `**Résumé du chapitre ${num}**\n\nDans ce chapitre, nous avons étudié **${title}**. Les points essentiels à retenir sont :\n\n✅ Les concepts fondamentaux et leur définition\n✅ Les étapes de mise en œuvre pratique\n✅ Les bonnes pratiques à adopter\n✅ Les erreurs courantes à éviter\n\n${num < total ? `Le prochain chapitre abordera la suite logique de ces apprentissages, en approfondissant les notions acquises et en les mettant en application dans des contextes plus complexes.` : `Ce chapitre conclut la progression du manuel. Vous êtes maintenant prêt(e) à mettre en pratique l'ensemble des compétences acquises.`}`
}

function buildFinalProject(title, formData) {
  return {
    id: crypto.randomUUID(),
    title: 'Projet final — Mise en situation professionnelle',
    description: `Ce projet final vous permettra de démontrer l'ensemble des compétences acquises tout au long de ce manuel sur **${title}**.\n\n**Objectif :** Réaliser une production complète en mobilisant toutes les notions étudiées.`,
    instructions: `**Consigne du projet final**\n\nÀ partir du contexte professionnel suivant, réalisez la production demandée en autonomie.\n\n*Contexte :* Vous occupez un poste dans une structure et devez produire un document ou réaliser une tâche complexe en lien avec votre formation.\n\n**Étapes à suivre :**\n\n1. Analysez le contexte et identifiez les compétences à mobiliser\n2. Planifiez votre travail étape par étape\n3. Réalisez la production en appliquant les techniques apprises\n4. Vérifiez la qualité de votre travail\n5. Présentez votre production en expliquant vos choix\n\n*Durée estimée : 1 à 2 heures*`,
    evaluationCriteria: [
      'Respect des consignes et de la mise en forme',
      'Qualité technique de la production',
      'Organisation et structuration du travail',
      'Autonomie dans la réalisation',
      'Capacité à expliquer ses choix',
    ],
  }
}

function buildAppendices(formData) {
  return [
    {
      id: crypto.randomUUID(),
      title: 'Glossaire',
      content: `**Glossaire des termes essentiels**\n\n**Terme 1** : Définition complète et claire du premier terme important utilisé dans ce manuel.\n\n**Terme 2** : Explication détaillée du deuxième concept clé pour bien comprendre le cours.\n\n**Terme 3** : Description précise du troisième élément du vocabulaire spécialisé.\n\n**Terme 4** : Définition du quatrième terme avec exemple d'utilisation concret.\n\n**Terme 5** : Explication simple et accessible du cinquième concept important.`,
    },
    {
      id: crypto.randomUUID(),
      title: 'Grille d\'auto-évaluation',
      content: `**Grille d'auto-évaluation des compétences**\n\nUtilisez cette grille pour évaluer votre niveau de maîtrise à l'issue de la formation.\n\n| Compétence | Non acquis | En cours | Acquis |\n|------------|-----------|----------|--------|\n| Comprendre les bases | ☐ | ☐ | ☐ |\n| Réaliser les opérations de base | ☐ | ☐ | ☐ |\n| Appliquer les techniques avancées | ☐ | ☐ | ☐ |\n| Travailler en autonomie | ☐ | ☐ | ☐ |\n| Résoudre les problèmes courants | ☐ | ☐ | ☐ |`,
    },
    {
      id: crypto.randomUUID(),
      title: 'Ressources complémentaires',
      content: `**Pour aller plus loin**\n\nVoici une sélection de ressources pour approfondir vos connaissances :\n\n**En ligne :**\n- Les tutoriels officiels du logiciel ou de l'outil\n- Les forums d'entraide et communautés de pratique\n- Les vidéos pédagogiques sur les plateformes de formation\n\n**Formations complémentaires :**\n- Modules de perfectionnement proposés par votre organisme\n- Certifications professionnelles reconnues dans votre domaine\n- Ateliers pratiques et groupes de co-apprentissage`,
    },
  ]
}

function buildConclusion(title, formData) {
  const audience = formData.targetAudience || 'vous'
  return `**Félicitations !**\n\nVous êtes arrivé(e) au terme de ce manuel consacré à **${title}**.\n\nTout au long de ce parcours, vous avez acquis des compétences solides et pratiques. Vous êtes maintenant capable de :\n\n- Comprendre et utiliser les concepts fondamentaux\n- Réaliser des opérations courantes en autonomie\n- Résoudre les problèmes les plus fréquents\n- Progresser par vous-même grâce aux ressources apprises\n\n**La pratique régulière** est la clé de la progression. N'hésitez pas à revenir sur les chapitres qui vous ont semblé difficiles, à refaire les exercices, et à mettre en pratique quotidiennement ce que vous avez appris.\n\nBonne continuation dans votre parcours d'apprentissage !`
}

function buildTableOfContents(manual) {
  const toc = []
  let page = 1

  if (manual.options?.coverPage) { toc.push({ title: 'Page de garde', page: page++ }); page++ }
  if (manual.introduction) { toc.push({ title: 'Introduction', page: page }); page += 2 }
  if (manual.prerequisites) { toc.push({ title: 'Prérequis', page: page++ }) }

  manual.chapters.forEach((ch, i) => {
    toc.push({ title: ch.title, page, level: 1 })
    page += 3 + ch.sections.length * 2
    if (ch.exercises?.length) page += ch.exercises.length
  })

  if (manual.finalProject) { toc.push({ title: 'Projet final', page: page }); page += 3 }
  if (manual.conclusion) { toc.push({ title: 'Conclusion', page: page }); page += 2 }
  if (manual.appendices?.length) {
    manual.appendices.forEach(a => { toc.push({ title: a.title, page: page, level: 2 }); page += 2 })
  }

  return toc
}
