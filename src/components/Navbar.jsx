import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import { LANGS } from '../i18n/strings'

export default function Navbar() {
  const { t, lang, setLang } = useLang()

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-ink-900' : 'text-ink-400 hover:text-ink-700'}`

  return (
    <header className="border-b border-ink-100 bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center text-seal-300 font-display font-semibold text-sm">
            S
          </span>
          <span className="font-display font-semibold text-lg text-ink-900">{t('appName')}</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <NavLink to="/schemes" className={linkClass}>
            {t('findSchemes')}
          </NavLink>
          <NavLink to="/report" className={linkClass}>
            {t('reportIssue')}
          </NavLink>
          <NavLink to="/track" className={linkClass}>
            {t('trackReport')}
          </NavLink>
          <NavLink to="/admin" className={linkClass}>
            {t('adminLogin')}
          </NavLink>
        </nav>

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          aria-label="Select language"
          className="text-sm border border-ink-200 rounded-md px-2 py-1.5 bg-white text-ink-700"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <nav className="sm:hidden flex items-center justify-around border-t border-ink-100 py-2">
        <NavLink to="/schemes" className={linkClass}>
          {t('findSchemes')}
        </NavLink>
        <NavLink to="/report" className={linkClass}>
          {t('reportIssue')}
        </NavLink>
        <NavLink to="/track" className={linkClass}>
          {t('trackReport')}
        </NavLink>
      </nav>
    </header>
  )
}
