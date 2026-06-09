import React from 'react'
import FaqAccordion from '../components/FaqAccordion.jsx'
import { Link } from 'react-router-dom'

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Questions fréquentes</h1>
        <p className="text-gray-500">Tout ce que vous devez savoir sur Manuelia AI.</p>
      </div>

      <FaqAccordion />

      <div className="mt-12 bg-violet-50 rounded-2xl p-6 text-center">
        <p className="text-gray-700 font-medium mb-2">Vous n'avez pas trouvé votre réponse ?</p>
        <p className="text-gray-500 text-sm mb-4">Contactez-nous, nous répondons rapidement.</p>
        <Link to="/contact" className="btn-primary text-sm">Nous contacter</Link>
      </div>
    </div>
  )
}
