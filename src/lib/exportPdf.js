// exportPdf.js — Export PDF du manuel
// Utilise html2pdf.js chargé en lazy import

/**
 * Construit le HTML propre pour l'export PDF
 */
function buildPdfHtml(manual) {
  const {
    title, subtitle, targetAudience, level, introduction,
    prerequisites, chapters, conclusion, finalProject, appendices,
    coverPage, tableOfContents,
  } = manual

  const chapterHtml = (chapters || []).map((ch, i) => `
    <div class="page-break">
      <h2 class="chapter-title">Chapitre ${ch.order || i + 1} — ${escHtml(ch.title || '')}</h2>

      ${ch.introduction ? `<p class="chapter-intro">${escHtml(ch.introduction)}</p>` : ''}

      ${(ch.sections || []).map(s => `
        <h3 class="section-title">${escHtml(s.title || '')}</h3>
        <div class="section-content">${formatContent(s.content || '')}</div>
      `).join('')}

      ${ch.reminderTables?.length ? ch.reminderTables.map(t => `
        <h4 class="table-title">${escHtml(t.title || 'Tableau récapitulatif')}</h4>
        <table class="reminder-table">
          ${(t.rows || []).map((row, ri) => `
            <tr class="${ri === 0 ? 'header-row' : ''}">
              ${row.map(cell => ri === 0 ? `<th>${escHtml(cell)}</th>` : `<td>${escHtml(cell)}</td>`).join('')}
            </tr>
          `).join('')}
        </table>
      `).join('') : ''}

      ${ch.exercises?.length ? `
        <h3 class="exercises-title">Exercices</h3>
        ${ch.exercises.map((ex, ei) => `
          <div class="exercise">
            <p><strong>Exercice ${ei + 1} :</strong> ${escHtml(typeof ex === 'string' ? ex : (ex.question || ''))}</p>
            ${ex.hint ? `<p class="hint">💡 Indice : ${escHtml(ex.hint)}</p>` : ''}
          </div>
        `).join('')}
      ` : ''}

      ${ch.corrections?.length ? `
        <h3 class="corrections-title">Corrections</h3>
        ${ch.corrections.map((c, ci) => `
          <div class="correction">
            <p><strong>Réponse ${ci + 1} :</strong> ${escHtml(typeof c === 'string' ? c : (c.answer || ''))}</p>
            ${c.explanation ? `<p class="explanation">${escHtml(c.explanation)}</p>` : ''}
          </div>
        `).join('')}
      ` : ''}

      ${ch.summary ? `
        <div class="chapter-summary">
          <strong>Résumé du chapitre :</strong>
          <p>${escHtml(ch.summary)}</p>
        </div>
      ` : ''}
    </div>
  `).join('')

  const tocHtml = tableOfContents !== false && chapters?.length ? `
    <div class="page-break">
      <h2 class="toc-title">Sommaire</h2>
      <ul class="toc-list">
        ${(chapters || []).map((ch, i) => `
          <li><span class="toc-num">${ch.order || i + 1}.</span> ${escHtml(ch.title || '')}</li>
        `).join('')}
        ${conclusion ? '<li><span class="toc-num">—</span> Conclusion</li>' : ''}
        ${finalProject ? '<li><span class="toc-num">—</span> Projet final</li>' : ''}
        ${appendices?.length ? '<li><span class="toc-num">—</span> Annexes</li>' : ''}
      </ul>
    </div>
  ` : ''

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.7;
          color: #222;
          background: #fff;
        }
        .cover {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 60px 40px;
          border-bottom: 3px solid #6C63FF;
        }
        .cover h1 { font-size: 28pt; color: #1a1a2e; margin-bottom: 16px; }
        .cover .subtitle { font-size: 14pt; color: #6C63FF; margin-bottom: 32px; }
        .cover .meta { font-size: 10pt; color: #666; line-height: 2; }
        .cover .badge {
          display: inline-block;
          background: #EEF2FF;
          color: #6C63FF;
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 10pt;
          margin: 8px 4px;
        }
        .page-break { page-break-before: always; padding: 20px 0; }
        .toc-title, .chapter-title { font-size: 18pt; color: #1a1a2e; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid #EEF2FF; }
        .section-title { font-size: 13pt; color: #4F46E5; margin: 24px 0 10px; }
        .table-title { font-size: 11pt; color: #333; margin: 16px 0 8px; font-style: italic; }
        .section-content, .chapter-intro { margin-bottom: 16px; white-space: pre-wrap; }
        .reminder-table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; font-size: 10pt; }
        .reminder-table th { background: #6C63FF; color: white; padding: 8px 12px; text-align: left; }
        .reminder-table td { padding: 7px 12px; border-bottom: 1px solid #EEF2FF; }
        .reminder-table tr:nth-child(even) td { background: #f8f7ff; }
        .exercises-title, .corrections-title { font-size: 13pt; color: #059669; margin: 24px 0 12px; }
        .exercise, .correction { background: #f8f7ff; border-left: 3px solid #6C63FF; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0; }
        .correction { border-left-color: #059669; background: #f0fdf4; }
        .hint { color: #6C63FF; font-size: 10pt; margin-top: 6px; }
        .explanation { color: #059669; font-size: 10pt; margin-top: 6px; }
        .chapter-summary { background: #EEF2FF; padding: 14px 18px; border-radius: 8px; margin-top: 24px; font-size: 10pt; }
        .intro-block, .prereq-block { margin: 16px 0 24px; padding: 16px; border-radius: 8px; background: #f8f7ff; }
        .toc-list { list-style: none; padding: 0; }
        .toc-list li { padding: 6px 0; border-bottom: 1px dotted #ddd; display: flex; align-items: baseline; gap: 12px; }
        .toc-num { color: #6C63FF; font-weight: bold; min-width: 28px; }
        .conclusion-block { page-break-before: always; }
        .final-project { page-break-before: always; background: #f8f7ff; padding: 24px; border-radius: 8px; }
        h2.conclusion-h2 { font-size: 18pt; color: #1a1a2e; margin-bottom: 16px; }
        .page-num { text-align: right; font-size: 9pt; color: #aaa; margin-top: 12px; }
      </style>
    </head>
    <body>

      <!-- Page de garde -->
      <div class="cover">
        <h1>${escHtml(title || 'Manuel pédagogique')}</h1>
        ${subtitle ? `<p class="subtitle">${escHtml(subtitle)}</p>` : ''}
        <div class="meta">
          ${targetAudience ? `<p>Public : ${escHtml(targetAudience)}</p>` : ''}
          ${level ? `<span class="badge">${escHtml(level)}</span>` : ''}
          ${manual.domain ? `<span class="badge">${escHtml(manual.domain)}</span>` : ''}
          <p style="margin-top:20px; color:#aaa; font-size:9pt;">
            Créé avec Manuelia AI — ${new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <!-- Sommaire -->
      ${tocHtml}

      <!-- Introduction -->
      ${introduction ? `
        <div class="page-break intro-block">
          <h2 class="chapter-title">Introduction</h2>
          <p>${escHtml(introduction)}</p>
        </div>
      ` : ''}

      <!-- Prérequis -->
      ${prerequisites ? `
        <div class="prereq-block">
          <strong>Prérequis :</strong>
          <p>${escHtml(prerequisites)}</p>
        </div>
      ` : ''}

      <!-- Chapitres -->
      ${chapterHtml}

      <!-- Conclusion -->
      ${conclusion ? `
        <div class="conclusion-block">
          <h2 class="conclusion-h2">Conclusion</h2>
          <p>${escHtml(conclusion)}</p>
        </div>
      ` : ''}

      <!-- Projet final -->
      ${finalProject ? `
        <div class="final-project">
          <h2 class="conclusion-h2">Projet final</h2>
          <p>${escHtml(finalProject)}</p>
        </div>
      ` : ''}

      <!-- Annexes -->
      ${appendices?.length ? `
        <div class="page-break">
          <h2 class="chapter-title">Annexes</h2>
          ${appendices.map((a, i) => `
            <div style="margin-bottom:24px">
              <h3 class="section-title">Annexe ${i + 1}${a.title ? ` — ${escHtml(a.title)}` : ''}</h3>
              <p>${escHtml(typeof a === 'string' ? a : (a.content || ''))}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

    </body>
    </html>
  `
}

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatContent(text = '') {
  return escHtml(text).replace(/\n/g, '<br>')
}

/**
 * Lance l'export PDF du manuel
 * Utilise html2pdf.js en lazy import
 */
export async function exportToPdf(manual) {
  const html2pdf = (await import('html2pdf.js')).default

  const html    = buildPdfHtml(manual)
  const element = document.createElement('div')
  element.innerHTML = html
  document.body.appendChild(element)

  const opt = {
    margin:       [10, 10, 12, 10],
    filename:     `${(manual.title || 'manuel').replace(/[^a-z0-9]/gi, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 0.95 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
  }

  try {
    await html2pdf().set(opt).from(element).save()
  } finally {
    document.body.removeChild(element)
  }
}
