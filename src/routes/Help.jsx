import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, FileText, Download, Wifi, Database, Sparkles, ArrowRight } from 'lucide-react'

const SECTIONS = [
  {
    icon: Sparkles,
    title: 'Générer un manuel',
    content: `Pour créer un manuel, rendez-vous sur la page "Générateur". Remplissez le formulaire en indiquant le titre, le public cible, le niveau, le nombre de pages souhaité et les options de structure (exercices, corrections, annexes…).

Cliquez sur "Générer le manuel". L'application analyse votre demande, crée un plan pédagogique, puis génère le contenu chapitre par chapitre.

En mode démonstration (sans clé API), le contenu est simulé mais structuré et réaliste. Vous pouvez tester toutes les fonctionnalités.`,
  },
  {
    icon: FileText,
    title: 'Modifier le manuel',
    content: `Une fois généré, votre manuel est entièrement modifiable dans l'éditeur. Accédez-y depuis le tableau de bord ou depuis la page de résultat.

Vous pouvez modifier : le titre, le sous-titre, l'introduction, les prérequis, les titres et contenus de chaque chapitre, les sections, les résumés et la conclusion.

Vous pouvez ajouter ou supprimer des chapitres et des sections. Toute modification est sauvegardée localement.`,
  },
  {
    icon: Download,
    title: 'Exporter le manuel',
    content: `Trois formats d'export sont disponibles :

• Markdown (.md) : disponible sans connexion. Exportez votre manuel dans un fichier texte structuré, importable dans de nombreux outils.

• PDF : génère un document A4 avec page de garde, sommaire et mise en page propre. Recommandé pour l'impression ou le partage.

• DOCX : exporte un fichier Word modifiable, avec titres hiérarchisés, chapitres et exercices. Idéal pour personnaliser avec votre charte graphique.`,
  },
  {
    icon: Wifi,
    title: 'Mode hors ligne',
    content: `Après une première visite, Manuelia AI peut fonctionner sans connexion Internet grâce à la technologie PWA.

En mode hors ligne, vous pouvez : consulter vos manuels, les modifier manuellement, les exporter en Markdown et restaurer des versions précédentes.

Les fonctions IA (génération, correction) nécessitent Internet. Vos demandes hors ligne sont enregistrées et relancées automatiquement à la reconnexion.

Pour installer l'application sur votre appareil, cliquez sur "Installer" dans la barre d'adresse ou dans le menu de votre navigateur.`,
  },
  {
    icon: Database,
    title: 'Sauvegarde locale',
    content: `Vos manuels sont automatiquement sauvegardés dans votre navigateur (IndexedDB). Ils ne sont pas envoyés sur un serveur.

Chaque fois que vous sauvegardez, une nouvelle version est créée. Vous pouvez consulter l'historique et restaurer une version précédente depuis l'éditeur.

Important : si vous videz les données de votre navigateur, vos manuels seront supprimés. Exportez régulièrement vos manuels pour les conserver durablement.`,
  },
  {
    icon: BookOpen,
    title: 'Structure d\'un manuel',
    content: `Un manuel généré par Manuelia AI contient :

• Page de garde (titre, auteur, organisation, date)
• Sommaire avec numéros de pages
• Introduction pédagogique
• Prérequis
• Chapitres : introduction, sections, tableaux de rappel, exercices, corrections, résumé
• Projet final (optionnel)
• Conclusion
• Annexes (glossaire, grille d'auto-évaluation, ressources — optionnels)`,
  },
]

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation rapide</h1>
        <p className="text-gray-500">Guide de prise en main de Manuelia AI.</p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map(section => (
          <div key={section.title} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
                <section.icon size={17} className="text-brand" />
              </div>
              <h2 className="font-semibold text-gray-900">{section.title}</h2>
            </div>
            <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed pl-12">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/generateur" className="btn-primary">
          <Sparkles size={15} /> Créer un manuel
        </Link>
        <Link to="/faq" className="btn-secondary">
          Voir la FAQ <ArrowRight size={14} />
        </Link>
        <Link to="/contact" className="btn-ghost">
          Nous contacter
        </Link>
      </div>
    </div>
  )
}
