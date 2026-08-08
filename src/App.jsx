import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { LangProvider } from './i18n/LangContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Schemes from './pages/Schemes'
import Report from './pages/Report'
import Track from './pages/Track'
import Admin from './pages/Admin'

export default function App() {
  return (
    <LangProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/report" element={<Report />} />
            <Route path="/track" element={<Track />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </LangProvider>
  )
}
