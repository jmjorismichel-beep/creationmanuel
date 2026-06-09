import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQ_ITEMS = [
  {
    q: 'Est-ce que Manuelia AI est gratuit ?',
    a: 'Oui, une version gratuite est disponible et permet de créer jusqu\'à 3 manuels de 20 pages avec export Markdown. Pour des manuels plus longs, l\'export PDF/DOCX et la génération IA complète, des offres payantes sont disponibles à partir de 9 €/mois.',
  },
  {
    q: 'Faut-il savoir coder pour utiliser Manuelia AI ?',
    a: 'Non, aucune compétence technique n\'est nécessaire. L\'interface est conçue pour être utilisée par n\'importe quel formateur, enseignant ou accompagnateur numérique, sans formation préalable.',
  },
  {
    q: 'Peut-on créer un manuel de 75 pages ?',
    a: 'Oui, c\'est précisément l\'objectif de Manuelia AI. La génération de manuels longs fonctionne par étapes : l\'application génère d\'abord un plan, puis les chapitres un par un, pour éviter les limitations des API. Cette approche garantit un contenu cohérent et structuré.',
  },
  {
    q: 'Peut-on exporter le manuel en PDF ?',
    a: 'Oui. L\'export PDF produit un document au format A4 avec page de garde, sommaire, chapitres numérotés et sauts de page. Cette fonctionnalité est disponible dans les plans Standard et Pro.',
  },
  {
    q: 'Peut-on exporter en DOCX (Word) ?',
    a: 'Oui, l\'export DOCX permet d\'obtenir un fichier Word modifiable, avec titres hiérarchisés, chapitres, exercices et corrections. Il est ensuite possible de le personnaliser avec votre propre charte graphique.',
  },
  {
    q: 'Est-ce que le site fonctionne hors ligne ?',
    a: 'Oui. Après une première visite, Manuelia AI fonctionne hors ligne grâce à la technologie PWA (Progressive Web App). Vous pouvez consulter, modifier et exporter vos manuels même sans connexion Internet.',
  },
  {
    q: 'Les fonctions IA fonctionnent-elles hors ligne ?',
    a: 'Non. La génération et la correction par IA nécessitent une connexion Internet pour communiquer avec l\'API. En mode hors ligne, vos demandes sont enregistrées dans une file d\'attente et relancées automatiquement dès que la connexion est rétablie.',
  },
  {
    q: 'Où sont sauvegardés mes manuels ?',
    a: 'Vos manuels sont sauvegardés localement dans votre navigateur (IndexedDB). Ils ne transitent pas par un serveur extérieur. Dans les offres payantes, une sauvegarde cloud est proposée en complément.',
  },
  {
    q: 'Peut-on corriger un manuel déjà généré ?',
    a: 'Oui. L\'assistant de révision permet de corriger les fautes, simplifier un passage, reformuler une section, ajouter des exercices ou adapter le ton. Une vue avant/après vous permet de valider ou refuser chaque modification.',
  },
  {
    q: 'Peut-on modifier seulement un chapitre sans tout régénérer ?',
    a: 'Oui. L\'architecture de Manuelia AI est conçue pour modifier une partie précise du manuel (chapitre, section, exercice) sans toucher au reste. Chaque élément a un identifiant unique et peut être édité, supprimé ou régénéré indépendamment.',
  },
]

export default function FaqAccordion({ items = FAQ_ITEMS }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {items.map((item, i) => (
        <div
          key={i}
          className={`border rounded-xl overflow-hidden transition-all duration-200 ${
            openIndex === i ? 'border-brand/30 shadow-sm' : 'border-gray-200'
          }`}
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900 pr-4">{item.q}</span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-gray-400 transition-transform duration-200 ${openIndex === i ? 'rotate-180 text-brand' : ''}`}
            />
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed animate-slide-up border-t border-gray-50">
              <div className="pt-3">{item.a}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
