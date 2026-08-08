import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'

export default function Home() {
  const { t } = useLang()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <span className="inline-block text-xs font-medium tracking-wide uppercase text-seal-600 bg-seal-100 rounded-full px-3 py-1 mb-5">
        Community welfare & civic reporting
      </span>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 leading-tight">
        {t('tagline')}
      </h1>
      <div className="mt-10 grid sm:grid-cols-2 gap-4 text-left">
        <Link
          to="/schemes"
          className="border border-ink-100 bg-white rounded-xl p-6 hover:border-seal-500 transition-colors"
        >
          <h2 className="font-display font-semibold text-lg text-ink-900">{t('findSchemes')}</h2>
          <p className="text-sm text-ink-500 mt-2">
            Answer a few questions about your income, location and occupation to see the government schemes you
            qualify for, with step-by-step application guidance.
          </p>
        </Link>
        <Link
          to="/report"
          className="border border-ink-100 bg-white rounded-xl p-6 hover:border-seal-500 transition-colors"
        >
          <h2 className="font-display font-semibold text-lg text-ink-900">{t('reportIssue')}</h2>
          <p className="text-sm text-ink-500 mt-2">
            Report a safety or civic issue anonymously with location and evidence, then track it through to
            resolution.
          </p>
        </Link>
      </div>
      <p className="mt-8 text-sm text-ink-400">
        Already reported something?{' '}
        <Link to="/track" className="text-seal-600 font-medium hover:underline">
          {t('trackReport')}
        </Link>
      </p>
    </div>
  )
}
