import React, { useState } from 'react'
import { Download, FileText, FileCode, Loader2, Copy, Check } from 'lucide-react'
// import { downloadMarkdown } from '../lib/exportMarkdown.js'

export default function ExportButtons({ manual, compact = false }) {
  const [loadingPdf,  setLoadingPdf]  = useState(false)
  const [loadingDocx, setLoadingDocx] = useState(false)
  const [copied, setCopied]           = useState(false)

  const handleMarkdown = async () => {
    const { downloadMarkdown } = await import('../lib/exportMarkdown.js')
    downloadMarkdown(manual)
  }

  const handlePdf = async () => {
    setLoadingPdf(true)
    try {
      const { exportToPdf } = await import('../lib/exportPdf.js')
      await exportToPdf(manual)
    } catch (err) {
      alert('Erreur lors de l\'export PDF. Vérifiez que la bibliothèque est bien chargée.')
      console.error(err)
    } finally {
      setLoadingPdf(false)
    }
  }

  const handleDocx = async () => {
    setLoadingDocx(true)
    try {
      const { exportToDocx } = await import('../lib/exportDocx.js')
      await exportToDocx(manual)
    } catch (err) {
      alert('Erreur lors de l\'export DOCX.')
      console.error(err)
    } finally {
      setLoadingDocx(false)
    }
  }

  const handleCopy = async () => {
    const { manualToMarkdown } = await import('../lib/exportMarkdown.js')
    const md = manualToMarkdown(manual)
    await navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleMarkdown} className="btn-ghost text-xs py-1" title="Markdown">
          <FileCode size={13} /> MD
        </button>
        <button onClick={handlePdf} disabled={loadingPdf} className="btn-ghost text-xs py-1" title="PDF">
          {loadingPdf ? <Loader2 size={13} className="animate-spin" /> : <><FileText size={13} /> PDF</>}
        </button>
        <button onClick={handleDocx} disabled={loadingDocx} className="btn-ghost text-xs py-1" title="DOCX">
          {loadingDocx ? <Loader2 size={13} className="animate-spin" /> : <><Download size={13} /> DOCX</>}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Markdown */}
      <button
        onClick={handleMarkdown}
        className="btn-ghost text-sm flex items-center gap-1.5"
        title="Télécharger en Markdown (.md)"
      >
        <FileCode size={15} />
        <span className="hidden sm:inline">Markdown</span>
      </button>

      {/* PDF */}
      <button
        onClick={handlePdf}
        disabled={loadingPdf}
        className="btn-ghost text-sm flex items-center gap-1.5"
        title="Télécharger en PDF"
      >
        {loadingPdf
          ? <Loader2 size={15} className="animate-spin" />
          : <FileText size={15} />
        }
        <span className="hidden sm:inline">{loadingPdf ? 'Export…' : 'PDF'}</span>
      </button>

      {/* DOCX */}
      <button
        onClick={handleDocx}
        disabled={loadingDocx}
        className="btn-ghost text-sm flex items-center gap-1.5"
        title="Télécharger en DOCX (Word)"
      >
        {loadingDocx
          ? <Loader2 size={15} className="animate-spin" />
          : <Download size={15} />
        }
        <span className="hidden sm:inline">{loadingDocx ? 'Export…' : 'DOCX'}</span>
      </button>

      {/* Copier */}
      <button
        onClick={handleCopy}
        className="btn-ghost text-sm flex items-center gap-1.5"
        title="Copier le contenu en Markdown"
      >
        {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
        <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
      </button>
    </div>
  )
}
