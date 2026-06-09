import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, BookOpen, FileText, Users, Award, Zap, DownloadCloud,
  ArrowRight, Edit3, CheckCircle, Globe, Wifi
} from 'lucide-react'
import PricingCards from '../components/PricingCards.jsx'
import FaqAccordion from '../components/FaqAccordion.jsx'

const FEATURES = [
  { icon: Sparkles,     title: 'Génération par prompt',        desc: 'Décrivez votre manuel en une phrase. L\'IA s\'occupe du reste : plan, chapitres, exercices, corrections.' },
  { icon: Edit3,        title: 'Éditeur intégré',              desc: 'Modifiez chaque section, ajoutez des chapitres, réécrivez un passage — sans tout régénérer.' },
  { icon: DownloadCloud,title: 'Export PDF, DOCX, Markdown',   desc: 'Exportez votre manuel dans le format de votre choix, prêt à imprimer ou partager.' },
  { icon: Wifi,         title: 'Fonctionne hors ligne',        desc: 'Consultez et modifiez vos manuels même sans Internet grâce au mode PWA.' },
  { icon: Award,        title: 'Niveaux A1 à C2',              desc: 'Adaptez automatiquement le contenu au niveau de votre public, du grand débutant au maître.' },
  { icon: Globe,        title: 'Tous les domaines',            desc: 'Numérique, bureautique, FLE, maths, industrie, administratif — et plus encore.' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Décrivez votre manuel',  desc: 'Renseignez le sujet, le public, le niveau, le nombre de pages et les options souhaitées.' },
  { step: '2', title: 'Validez le plan',        desc: 'L\'application génère un plan structuré. Modifiez-le avant de lancer la génération complète.' },
  { step: '3', title: 'Générez chapitre par chapitre', desc: 'Le contenu est produit progressivement pour garantir qualité et cohérence, même sur 75 pages.' },
  { step: '4', title: 'Éditez et exportez',    desc: 'Affinez le contenu avec l\'assistant IA, puis exportez en PDF, DOCX ou Markdown.' },
]

const FOR_WHO = [
  { icon: Users,    title: 'Formateurs',            desc: 'Créez rapidement des supports adaptés à chaque groupe, sans passer des heures sur Word.' },
  { icon: BookOpen, title: 'Enseignants',            desc: 'Générez des manuels de cours structurés avec exercices et corrections en quelques minutes.' },
  { icon: FileText, title: 'Organismes de formation', desc: 'Produisez des référentiels et guides d\'apprentissage professionnels pour vos stagiaires.' },
  { icon: Award,    title: 'Accompagnateurs numériques', desc: 'Créez des supports accessibles pour vos publics en difficulté avec le numérique.' },
]

const EXAMPLES = [
  { title: 'Excel 2021 pour débutants',        domain: 'Bureautique',  level: 'A1', pages: 50, color: 'green' },
  { title: 'Français B1 → B2',                 domain: 'FLE',          level: 'B1', pages: 60, color: 'blue' },
  { title: 'Conversion d\'unités — Industrie', domain: 'Industrie',    level: 'Intermédiaire', pages: 35, color: 'orange' },
]

// Simulation de frappe pour le hero
const DEMO_PROMPT = 'Créer un manuel de 40 pages pour des stagiaires débutants en numérique, avec exercices et corrections…'

export default function Home() {
  const [typedText, setTypedText] = useState('')
  const [isTyping,  setIsTyping]  = useState(true)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= DEMO_PROMPT.length) {
        setTypedText(DEMO_PROMPT.slice(0, i))
        i++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 35)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero-gradient pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-brand/20 rounded-full text-sm font-medium text-brand shadow-sm mb-8">
            <Sparkles size={13} />
            Mode démonstration gratuit — sans clé API
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
            Créez des manuels pédagogiques{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-violet-500">
              complets
            </span>{' '}
            à partir d'un simple prompt
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Manuelia AI aide les formateurs à générer, modifier et exporter des supports de formation structurés,{' '}
            <strong className="text-gray-700">jusqu'à 75 pages</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <Link to="/generateur" className="btn-primary text-base px-7 py-3">
              <Sparkles size={17} /> Créer un manuel
            </Link>
            <Link to="/exemples" className="btn-secondary text-base px-7 py-3">
              Voir des exemples <ArrowRight size={16} />
            </Link>
          </div>

          {/* Fausse interface de génération */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="w-3 h-3 rounded-full bg-red-300"></div>
              <div className="w-3 h-3 rounded-full bg-amber-300"></div>
              <div className="w-3 h-3 rounded-full bg-green-300"></div>
              <span className="ml-2 text-xs text-gray-400 font-medium">Manuelia AI — Générateur</span>
            </div>
            <div className="p-5">
              <label className="block text-xs font-medium text-gray-500 mb-2">Décrivez votre manuel…</label>
              <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 min-h-[52px] text-left font-mono">
                {typedText}
                {isTyping && <span className="cursor-blink text-brand">|</span>}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  {['Niveau A1', 'Bureautique', '40 pages'].map(tag => (
                    <span key={tag} className="badge badge-violet text-xs">{tag}</span>
                  ))}
                </div>
                <div className={`flex items-center gap-2 text-xs font-medium transition-all duration-500 ${isTyping ? 'opacity-0' : 'opacity-100 text-brand'}`}>
                  <span className="w-2 h-2 bg-brand rounded-full animate-pulse-soft"></span>
                  Manuel prêt à générer
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <Link to="/generateur" className="btn-primary w-full justify-center">
                <Sparkles size={15} /> Générer ce manuel
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ───────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Tout ce dont vous avez besoin</h2>
            <p className="section-subtitle">De la génération à l'export, en passant par l'édition et la correction.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="card group hover:border-brand/30">
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white transition-colors">
                  <f.icon size={18} className="text-brand group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-subtitle">En quatre étapes simples, de la consigne au manuel final.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-brand/20 to-transparent -translate-x-2 z-0"></div>
                )}
                <div className="card relative z-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-brand text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exemples ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Exemples de manuels</h2>
            <p className="section-subtitle">Des manuels complets générés en quelques minutes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {EXAMPLES.map(ex => (
              <div key={ex.title} className="card hover:border-brand/30 group cursor-pointer">
                <div className={`w-full h-32 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${
                  ex.color === 'green'  ? 'from-green-100 to-emerald-100'  :
                  ex.color === 'blue'   ? 'from-blue-100 to-indigo-100'    :
                                          'from-orange-100 to-amber-100'
                }`}>
                  <BookOpen size={36} className={`opacity-40 ${
                    ex.color === 'green'  ? 'text-green-600'  :
                    ex.color === 'blue'   ? 'text-blue-600'   :
                                            'text-orange-600'
                  }`} />
                </div>
                <span className={`badge mb-2 ${
                  ex.color === 'green'  ? 'bg-green-100 text-green-700'   :
                  ex.color === 'blue'   ? 'bg-blue-100 text-blue-700'     :
                                          'bg-orange-100 text-orange-700'
                }`}>{ex.domain}</span>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-brand transition-colors">{ex.title}</h3>
                <p className="text-xs text-gray-400">Niveau {ex.level} — {ex.pages} pages</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/exemples" className="btn-secondary">
              Voir tous les exemples <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pour qui ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Pour qui ?</h2>
            <p className="section-subtitle">Manuelia AI est pensé pour tous ceux qui créent des supports pédagogiques.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FOR_WHO.map(item => (
              <div key={item.title} className="card flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-brand" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tarifs ───────────────────────────────────────────────────────── */}
      <section id="tarifs" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Tarifs simples et transparents</h2>
            <p className="section-subtitle">Commencez gratuitement. Passez au Pro quand vous en avez besoin.</p>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Questions fréquentes</h2>
          </div>
          <FaqAccordion />
          <div className="text-center mt-8">
            <Link to="/faq" className="btn-secondary text-sm">
              Voir toutes les questions <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-brand to-violet-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à créer votre premier manuel ?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Commencez maintenant, sans inscription, sans clé API.
          </p>
          <Link to="/generateur" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg text-lg">
            <Sparkles size={20} /> Créer un manuel gratuitement
          </Link>
        </div>
      </section>
    </div>
  )
}
