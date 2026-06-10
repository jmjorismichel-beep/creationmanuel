// exportPdf.js — Export PDF du manuel via html2pdf.js
// CORRECTION : on passe un élément DOM réel, pas une string innerHTML

/**
 * Construit un nœud DOM complet pour l'export (pas de innerHTML escaping)
 */
function buildPdfElement(manual) {
  const doc = document.createElement('div')
  doc.style.cssText = 'font-family:Arial,sans-serif;font-size:11pt;line-height:1.7;color:#222;background:#fff;'

  const css = document.createElement('style')
  css.textContent = `
    .cover { min-height:260mm; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:60px 40px; border-bottom:3px solid #6C63FF; page-break-after:always; }
    .cover h1 { font-size:28pt; color:#1a1a2e; margin:0 0 14px; }
    .cover .subtitle { font-size:14pt; color:#6C63FF; margin:0 0 28px; }
    .cover .meta { font-size:10pt; color:#666; line-height:2.2; }
    .cover .badge { display:inline-block; background:#EEF2FF; color:#6C63FF; padding:3px 14px; border-radius:20px; font-size:10pt; margin:5px 4px; }
    .page-break { page-break-before:always; padding:16px 0; }
    h2.block-title { font-size:17pt; color:#1a1a2e; margin:0 0 18px; padding-bottom:7px; border-bottom:2px solid #EEF2FF; }
    h3.section-title { font-size:13pt; color:#4F46E5; margin:22px 0 9px; }
    h4.table-title { font-size:11pt; color:#333; margin:14px 0 7px; font-style:italic; }
    .chapter-intro { margin-bottom:15px; font-style:italic; color:#444; }
    .section-content { margin-bottom:14px; white-space:pre-wrap; }
    table.reminder { width:100%; border-collapse:collapse; margin:10px 0 22px; font-size:10pt; }
    table.reminder th { background:#6C63FF; color:#fff; padding:7px 11px; text-align:left; }
    table.reminder td { padding:6px 11px; border-bottom:1px solid #EEF2FF; }
    table.reminder tr:nth-child(even) td { background:#f8f7ff; }
    h3.ex-title { font-size:12pt; color:#059669; margin:22px 0 10px; }
    .exercise { background:#f8f7ff; border-left:3px solid #6C63FF; padding:10px 14px; margin-bottom:10px; border-radius:0 7px 7px 0; }
    .correction { background:#f0fdf4; border-left:3px solid #059669; padding:10px 14px; margin-bottom:10px; border-radius:0 7px 7px 0; }
    .hint { color:#6C63FF; font-size:10pt; margin-top:5px; }
    .expl { color:#059669; font-size:10pt; margin-top:5px; font-style:italic; }
    .ch-summary { background:#EEF2FF; padding:12px 16px; border-radius:7px; margin-top:22px; font-size:10pt; }
    .toc-list { list-style:none; padding:0; }
    .toc-list li { padding:5px 0; border-bottom:1px dotted #ddd; display:flex; gap:10px; }
    .toc-num { color:#6C63FF; font-weight:bold; min-width:26px; }
    .intro-block { margin:14px 0 22px; padding:14px; border-radius:7px; background:#f8f7ff; }
    .prereq-block { padding:12px 16px; border-radius:7px; background:#FFF7ED; margin-bottom:20px; font-size:10pt; }
    .final-block { background:#f8f7ff; padding:22px; border-radius:7px; }
    .page-num { text-align:center; font-size:8pt; color:#aaa; margin-top:10px; }
  `
  doc.appendChild(css)

  const ch = manual.chapters || []

  // ── Page de garde ──────────────────────────────────────────────────
  const cover = el('div', { className: 'cover' })
  cover.appendChild(el('h1', {}, manual.title || 'Manuel pédagogique'))
  if (manual.subtitle) cover.appendChild(el('p', { className: 'subtitle' }, manual.subtitle))
  const meta = el('div', { className: 'meta' })
  if (manual.targetAudience) meta.appendChild(el('p', {}, `Public : ${manual.targetAudience}`))
  if (manual.level)          meta.appendChild(el('span', { className: 'badge' }, manual.level))
  if (manual.domain)         meta.appendChild(el('span', { className: 'badge' }, manual.domain))
  meta.appendChild(el('p', { style: 'margin-top:18px;color:#aaa;font-size:9pt;' },
    `Créé avec Manuelia AI — ${new Date().toLocaleDateString('fr-FR')}`))
  cover.appendChild(meta)
  doc.appendChild(cover)

  // ── Sommaire ───────────────────────────────────────────────────────
  if (ch.length) {
    const toc = el('div', { className: 'page-break' })
    toc.appendChild(el('h2', { className: 'block-title' }, 'Sommaire'))
    const ul = el('ul', { className: 'toc-list' })
    ch.forEach((c, i) => {
      const li = el('li')
      li.appendChild(el('span', { className: 'toc-num' }, `${c.order || i + 1}.`))
      li.appendChild(document.createTextNode(c.title || ''))
      ul.appendChild(li)
    })
    if (manual.conclusion)   ul.appendChild(tocItem('—', 'Conclusion'))
    if (manual.finalProject) ul.appendChild(tocItem('—', 'Projet final'))
    if ((manual.appendices || []).length) ul.appendChild(tocItem('—', 'Annexes'))
    toc.appendChild(ul)
    doc.appendChild(toc)
  }

  // ── Introduction ───────────────────────────────────────────────────
  if (manual.introduction) {
    const intro = el('div', { className: 'page-break intro-block' })
    intro.appendChild(el('h2', { className: 'block-title' }, 'Introduction'))
    intro.appendChild(el('p', {}, manual.introduction))
    doc.appendChild(intro)
  }
  if (manual.prerequisites) {
    const pre = el('div', { className: 'prereq-block' })
    pre.appendChild(el('strong', {}, 'Prérequis : '))
    pre.appendChild(document.createTextNode(manual.prerequisites))
    doc.appendChild(pre)
  }

  // ── Chapitres ──────────────────────────────────────────────────────
  ch.forEach((chapter, i) => {
    const section = el('div', { className: 'page-break' })

    section.appendChild(el('h2', { className: 'block-title' },
      `Chapitre ${chapter.order || i + 1} — ${chapter.title || ''}`))

    if (chapter.introduction)
      section.appendChild(el('p', { className: 'chapter-intro' }, chapter.introduction))

    // Sections
    ;(chapter.sections || []).forEach(s => {
      section.appendChild(el('h3', { className: 'section-title' }, s.title || ''))
      section.appendChild(el('p', { className: 'section-content' }, s.content || ''))
    })

    // Tableaux récapitulatifs
    ;(chapter.reminderTables || []).forEach(t => {
      section.appendChild(el('h4', { className: 'table-title' }, t.title || 'Tableau récapitulatif'))
      const table = el('table', { className: 'reminder' })
      ;(t.rows || []).forEach((row, ri) => {
        const tr = el('tr')
        row.forEach(cell => {
          const td = el(ri === 0 ? 'th' : 'td', {}, String(cell))
          tr.appendChild(td)
        })
        table.appendChild(tr)
      })
      section.appendChild(table)
    })

    // Exercices
    if ((chapter.exercises || []).length) {
      section.appendChild(el('h3', { className: 'ex-title' }, 'Exercices'))
      chapter.exercises.forEach((ex, ei) => {
        const div = el('div', { className: 'exercise' })
        const q = typeof ex === 'string' ? ex : (ex.question || '')
        const hint = typeof ex === 'object' ? ex.hint : null
        const p = el('p')
        p.appendChild(el('strong', {}, `Exercice ${ei + 1} : `))
        p.appendChild(document.createTextNode(q))
        div.appendChild(p)
        if (hint) div.appendChild(el('p', { className: 'hint' }, `💡 Indice : ${hint}`))
        section.appendChild(div)
      })
    }

    // Corrections
    if ((chapter.corrections || []).length) {
      section.appendChild(el('h3', { className: 'ex-title' }, 'Corrections'))
      chapter.corrections.forEach((c, ci) => {
        const div = el('div', { className: 'correction' })
        const a = typeof c === 'string' ? c : (c.answer || '')
        const expl = typeof c === 'object' ? c.explanation : null
        const p = el('p')
        p.appendChild(el('strong', {}, `Réponse ${ci + 1} : `))
        p.appendChild(document.createTextNode(a))
        div.appendChild(p)
        if (expl) div.appendChild(el('p', { className: 'expl' }, expl))
        section.appendChild(div)
      })
    }

    // Résumé
    if (chapter.summary) {
      const sum = el('div', { className: 'ch-summary' })
      sum.appendChild(el('strong', {}, 'Résumé du chapitre : '))
      sum.appendChild(document.createTextNode(chapter.summary))
      section.appendChild(sum)
    }

    doc.appendChild(section)
  })

  // ── Conclusion ─────────────────────────────────────────────────────
  if (manual.conclusion) {
    const conc = el('div', { className: 'page-break' })
    conc.appendChild(el('h2', { className: 'block-title' }, 'Conclusion'))
    conc.appendChild(el('p', {}, manual.conclusion))
    doc.appendChild(conc)
  }

  // ── Projet final ───────────────────────────────────────────────────
  if (manual.finalProject) {
    const fp = el('div', { className: 'page-break final-block' })
    fp.appendChild(el('h2', { className: 'block-title' }, 'Projet final'))
    fp.appendChild(el('p', {}, manual.finalProject))
    doc.appendChild(fp)
  }

  // ── Annexes ────────────────────────────────────────────────────────
  if ((manual.appendices || []).length) {
    const ann = el('div', { className: 'page-break' })
    ann.appendChild(el('h2', { className: 'block-title' }, 'Annexes'))
    manual.appendices.forEach((a, i) => {
      const content = typeof a === 'string' ? a : (a.content || '')
      const title   = typeof a === 'object' ? a.title : null
      ann.appendChild(el('h3', { className: 'section-title' },
        `Annexe ${i + 1}${title ? ` — ${title}` : ''}`))
      ann.appendChild(el('p', {}, content))
    })
    doc.appendChild(ann)
  }

  return doc
}

// ── Helpers ──────────────────────────────────────────────────────────

function el(tag, attrs = {}, text = null) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') node.className = v
    else if (k === 'style') node.style.cssText = v
    else node.setAttribute(k, v)
  }
  if (text !== null) node.textContent = text
  return node
}

function tocItem(num, label) {
  const li = el('li')
  li.appendChild(el('span', { className: 'toc-num' }, num))
  li.appendChild(document.createTextNode(label))
  return li
}

// ── Export principal ─────────────────────────────────────────────────

export async function exportToPdf(manual) {
  const html2pdf = (await import('html2pdf.js')).default

  const element = buildPdfElement(manual)

  // Wrapper invisible dans le DOM (nécessaire pour html2pdf)
  element.style.position = 'fixed'
  element.style.left     = '-9999px'
  element.style.top      = '0'
  element.style.width    = '210mm'
  element.style.zIndex   = '-1'
  document.body.appendChild(element)

  const safeName = (manual.title || 'manuel')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // enlève les accents
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim().replace(/\s+/g, '_')
    .toLowerCase() || 'manuel'

  const opt = {
    margin:      [12, 10, 14, 10], // [top, right, bottom, left] en mm
    filename:    `${safeName}.pdf`,
    image:       { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, logging: false, allowTaint: true },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:   { mode: ['css', 'legacy'], before: '.page-break' },
  }

  try {
    await html2pdf().set(opt).from(element).save()
  } finally {
    if (document.body.contains(element)) {
      document.body.removeChild(element)
    }
  }
}
