import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, LayoutDashboard, Menu, X, ChevronDown, Sparkles } from 'lucide-react'

const NAV_LINKS = [
  { href: '/tableau-bord', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/generateur',   label: 'Créer un manuel' },
  { href: '/exemples',     label: 'Exemples' },
  {
    label: 'Plus',
    children: [
      { href: '/tarifs',  label: 'Tarifs' },
      { href: '/faq',     label: 'FAQ' },
      { href: '/aide',    label: 'Documentation' },
      { href: '/contact', label: 'Contact' },
    ],
  },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const [dropOpen, setDropOpen]     = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setDropOpen(false)
  }, [location.pathname])

  const isActive = (href) => location.pathname === href

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-brand to-violet-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <BookOpen size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Manuelia <span className="text-brand">AI</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key="more" className="relative">
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    className={`btn-ghost text-sm ${dropOpen ? 'text-brand bg-brand-light' : ''}`}
                  >
                    {link.label} <ChevronDown size={14} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1 animate-fade-in">
                      {link.children.map(child => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={`block px-4 py-2 text-sm hover:bg-gray-50 hover:text-brand transition-colors ${
                            isActive(child.href) ? 'text-brand font-medium' : 'text-gray-700'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`btn-ghost text-sm ${isActive(link.href) ? 'text-brand bg-brand-light font-medium' : ''}`}
                >
                  {link.icon && <link.icon size={15} />}
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/generateur" className="btn-primary text-sm py-2">
              <Sparkles size={14} />
              Créer un manuel
            </Link>
          </div>

          {/* Burger mobile */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-up">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key="more">
                  {link.children.map(child => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={`block py-2.5 px-3 text-sm rounded-lg ${
                        isActive(child.href) ? 'bg-brand-light text-brand font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 py-2.5 px-3 text-sm rounded-lg ${
                    isActive(link.href) ? 'bg-brand-light text-brand font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.icon && <link.icon size={15} />}
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-2 border-t border-gray-100">
              <Link to="/generateur" className="btn-primary w-full justify-center text-sm">
                <Sparkles size={14} /> Créer un manuel
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
