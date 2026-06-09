import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import OnlineStatus from './components/OnlineStatus.jsx'

import Home from './routes/Home.jsx'
import Dashboard from './routes/Dashboard.jsx'
import Generator from './routes/Generator.jsx'
import Editor from './routes/Editor.jsx'
import Preview from './routes/Preview.jsx'
import Examples from './routes/Examples.jsx'
import Pricing from './routes/Pricing.jsx'
import FAQ from './routes/FAQ.jsx'
import Contact from './routes/Contact.jsx'
import Help from './routes/Help.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <OnlineStatus />
        <main className="flex-1">
          <Routes>
            <Route path="/"             element={<Home />} />
            <Route path="/tableau-bord" element={<Dashboard />} />
            <Route path="/generateur"   element={<Generator />} />
            <Route path="/editeur/:id"  element={<Editor />} />
            <Route path="/editeur"      element={<Editor />} />
            <Route path="/apercu/:id"   element={<Preview />} />
            <Route path="/exemples"     element={<Examples />} />
            <Route path="/tarifs"       element={<Pricing />} />
            <Route path="/faq"          element={<FAQ />} />
            <Route path="/contact"      element={<Contact />} />
            <Route path="/aide"         element={<Help />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
