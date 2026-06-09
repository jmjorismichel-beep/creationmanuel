import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

export default function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBanner, setShowBanner] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline  = () => { setIsOnline(true);  setShowBanner(true); if (wasOffline) setTimeout(() => setShowBanner(false), 3000) }
    const handleOffline = () => { setIsOnline(false); setShowBanner(true); setWasOffline(true) }

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  if (!showBanner) return null

  return (
    <div className={`flex items-center justify-center gap-2 py-2 text-sm font-medium transition-all ${
      isOnline
        ? 'bg-green-50 text-green-700 border-b border-green-100'
        : 'bg-amber-50 text-amber-700 border-b border-amber-100'
    }`}>
      {isOnline ? (
        <><Wifi size={14} /> Connexion rétablie. Les fonctions IA sont disponibles.</>
      ) : (
        <><WifiOff size={14} /> Mode hors ligne — Consultation et édition disponibles. Les fonctions IA nécessitent Internet.</>
      )}
    </div>
  )
}
