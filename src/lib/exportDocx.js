// exportDocx.js — Export DOCX du manuel
// Utilise la bibliothèque 'docx' en lazy import

/**
 * Lance l'export DOCX du manuel
 */
export async function exportToDocx(manual) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } = await import('docx')
  const { saveAs } = await import('file-saver')

  const children = []

  // ──────────────────────────────────────────────
  // Page de garde
  // ──────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: manual.title || 'Manuel pédagogique', bold: true, size: 52, color: '1a1a2e' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 400 },
    }),
  )
  if (manual.subtitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: manual.subtitle, size: 32, color: '6C63FF' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    )
  }
  if (manual.targetAudience) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Public : ${manual.targetAudience}`, size: 24, color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    )
  }
  if (manual.level) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Niveau : ${manual.level}`, size: 24, color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    )
  }
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Créé avec Manuelia AI — ${new Date().toLocaleDateString('fr-FR')}`, size: 18, color: 'aaaaaa' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 0 },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  )

  // ──────────────────────────────────────────────
  // Sommaire textuel
  // ──────────────────────────────────────────────
  if (manual.chapters?.length) {
    children.push(
      new Paragraph({
        text: 'Sommaire',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 400 },
      }),
    )
    manual.chapters.forEach((ch, i) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${ch.order || i + 1}.  `, bold: true, color: '6C63FF' }),
            new TextRun({ text: ch.title || '' }),
          ],
          spacing: { after: 120 },
        }),
      )
    })
    if (manual.conclusion) {
      children.push(new Paragraph({ children: [new TextRun({ text: '—  Conclusion' })], spacing: { after: 120 } }))
    }
    if (manual.finalProject) {
      children.push(new Paragraph({ children: [new TextRun({ text: '—  Projet final' })], spacing: { after: 120 } }))
    }
    if (manual.appendices?.length) {
      children.push(new Paragraph({ children: [new TextRun({ text: '—  Annexes' })], spacing: { after: 120 } }))
    }
    children.push(new Paragraph({ children: [new PageBreak()] }))
  }

  // ──────────────────────────────────────────────
  // Introduction
  // ──────────────────────────────────────────────
  if (manual.introduction) {
    children.push(
      new Paragraph({ text: 'Introduction', heading: HeadingLevel.HEADING_1, spacing: { before: 0, after: 300 } }),
      new Paragraph({ children: [new TextRun({ text: manual.introduction })], spacing: { after: 400 } }),
    )
  }
  if (manual.prerequisites) {
    children.push(
      new Paragraph({ text: 'Prérequis', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
      new Paragraph({ children: [new TextRun({ text: manual.prerequisites })], spacing: { after: 400 } }),
    )
  }

  // ──────────────────────────────────────────────
  // Chapitres
  // ──────────────────────────────────────────────
  for (const [i, ch] of (manual.chapters || []).entries()) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        text: `Chapitre ${ch.order || i + 1} — ${ch.title || ''}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 400 },
      }),
    )

    if (ch.introduction) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: ch.introduction, italics: true })], spacing: { after: 400 } }),
      )
    }

    for (const s of ch.sections || []) {
      children.push(
        new Paragraph({ text: s.title || '', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }),
        new Paragraph({ children: [new TextRun({ text: s.content || '' })], spacing: { after: 300 } }),
      )
    }

    // Tableaux récapitulatifs
    for (const t of ch.reminderTables || []) {
      if (!t.rows?.length) continue
      children.push(
        new Paragraph({ text: t.title || 'Tableau récapitulatif', heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 160 } }),
      )
      const tableRows = t.rows.map((row, ri) =>
        new TableRow({
          children: row.map(cell =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(cell), bold: ri === 0 })] })],
              shading: ri === 0 ? { type: ShadingType.SOLID, color: '6C63FF', fill: '6C63FF' } : undefined,
            })
          ),
        })
      )
      children.push(
        new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
        new Paragraph({ text: '', spacing: { after: 300 } }),
      )
    }

    // Exercices
    if (ch.exercises?.length) {
      children.push(
        new Paragraph({ text: 'Exercices', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }),
      )
      ch.exercises.forEach((ex, ei) => {
        const q = typeof ex === 'string' ? ex : (ex.question || '')
        const hint = typeof ex === 'object' ? ex.hint : null
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Exercice ${ei + 1} : `, bold: true }), new TextRun({ text: q })],
            spacing: { after: 120 },
          }),
        )
        if (hint) {
          children.push(
            new Paragraph({ children: [new TextRun({ text: `💡 Indice : ${hint}`, color: '6C63FF' })], spacing: { after: 200 } }),
          )
        }
      })
    }

    // Corrections
    if (ch.corrections?.length) {
      children.push(
        new Paragraph({ text: 'Corrections', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }),
      )
      ch.corrections.forEach((c, ci) => {
        const a = typeof c === 'string' ? c : (c.answer || '')
        const expl = typeof c === 'object' ? c.explanation : null
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Réponse ${ci + 1} : `, bold: true }), new TextRun({ text: a })],
            spacing: { after: 120 },
          }),
        )
        if (expl) {
          children.push(
            new Paragraph({ children: [new TextRun({ text: expl, italics: true, color: '059669' })], spacing: { after: 200 } }),
          )
        }
      })
    }

    // Résumé
    if (ch.summary) {
      children.push(
        new Paragraph({ text: 'Résumé du chapitre', heading: HeadingLevel.HEADING_3, spacing: { before: 300, after: 160 } }),
        new Paragraph({ children: [new TextRun({ text: ch.summary, italics: true })], spacing: { after: 300 } }),
      )
    }
  }

  // ──────────────────────────────────────────────
  // Conclusion
  // ──────────────────────────────────────────────
  if (manual.conclusion) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ text: 'Conclusion', heading: HeadingLevel.HEADING_1, spacing: { before: 0, after: 300 } }),
      new Paragraph({ children: [new TextRun({ text: manual.conclusion })], spacing: { after: 400 } }),
    )
  }

  // ──────────────────────────────────────────────
  // Projet final
  // ──────────────────────────────────────────────
  if (manual.finalProject) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ text: 'Projet final', heading: HeadingLevel.HEADING_1, spacing: { before: 0, after: 300 } }),
      new Paragraph({ children: [new TextRun({ text: manual.finalProject })], spacing: { after: 400 } }),
    )
  }

  // ──────────────────────────────────────────────
  // Annexes
  // ──────────────────────────────────────────────
  if (manual.appendices?.length) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ text: 'Annexes', heading: HeadingLevel.HEADING_1, spacing: { before: 0, after: 300 } }),
    )
    manual.appendices.forEach((a, i) => {
      const content = typeof a === 'string' ? a : (a.content || '')
      const title   = typeof a === 'object' ? a.title : null
      children.push(
        new Paragraph({
          text: `Annexe ${i + 1}${title ? ` — ${title}` : ''}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 160 },
        }),
        new Paragraph({ children: [new TextRun({ text: content })], spacing: { after: 300 } }),
      )
    })
  }

  // ──────────────────────────────────────────────
  // Création du document
  // ──────────────────────────────────────────────
  const doc = new Document({
    creator: 'Manuelia AI',
    title:   manual.title || 'Manuel pédagogique',
    description: manual.subtitle || '',
    sections: [{
      properties: {},
      children,
    }],
  })

  const blob     = await Packer.toBlob(doc)
  const filename = `${(manual.title || 'manuel').replace(/[^a-z0-9]/gi, '_')}.docx`
  saveAs(blob, filename)
}
