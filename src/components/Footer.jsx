import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Github, Mail, Heart } from 'lucide-react'

const LINKS = {
  Produit: [
    { href: '/generateur',   label: 'Créer un manuel' },
    { href: '/tableau-bord', label: 'Tableau de bord' },
    { href: '/exemples',     label: 'Exemples' },
    { href: '/tarifs',       label: 'Tarifs' },
  ],
  Ressources: [
    { href: '/aide',    label: 'Documentation' },
    { href: '/faq',     label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800">
          {/* Marque */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-brand to-violet-500 rounded-lg flex items-center justify-center">
                <BookOpen size={13} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-white">
                Manuelia <span className="text-brand">AI</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Générez des manuels pédagogiques complets à partir d'un simple prompt. Pour les formateurs, enseignants et organismes de formation.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="mailto:contact@manuelia.ai" className="text-gray-500 hover:text-white transition-colors" aria-label="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Liens */}
          {Object.entries(LINKS).map(([cat, links]) => (
            <div key={cat}>
              <h3 className="text-white font-semibold text-sm mb-3">{cat}</h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Mode démo */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Mode démo</h3>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-900/40 border border-green-700/30 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft"></span>
              <span className="text-green-400 text-xs font-medium">Démo active — sans clé API</span>
            </div>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Toutes les fonctionnalités sont disponibles en mode simulation.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} Manuelia AI — Application de démonstration</span>
          <span className="flex items-center gap-1">
            Fait avec <Heart size={12} className="text-red-500 fill-red-500" /> pour les formateurs
          </span>
        </div>
      </div>
    </footer>
  )
}
