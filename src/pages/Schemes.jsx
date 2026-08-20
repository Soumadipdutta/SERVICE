import React, { useState } from 'react'
import EligibilityForm from '../components/EligibilityForm'
import SchemeCard from '../components/SchemeCard'
import { checkEligibility } from '../api/client'
import { useLang } from '../i18n/LangContext'

export default function Schemes() {
  const { t } = useLang()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(profile) {
    setLoading(true)
    const matches = await checkEligibility(profile)
    setResults(matches)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-[320px_1fr] gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900 mb-4">{t('findSchemes')}</h1>
        <EligibilityForm onSubmit={handleSubmit} loading={loading} />
      </div>

      <div>
        {results === null && (
          <div className="h-full flex items-center justify-center text-sm text-ink-400 border border-dashed border-ink-200 rounded-xl p-10">
            Fill in your details to see matching schemes.
          </div>
        )}
        {results !== null && (
          <>
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">{t('resultsHeading')}</h2>
            {results.length === 0 ? (
              <p className="text-sm text-ink-500">{t('noResults')}</p>
            ) : (
              <div className="space-y-3">
                {results.map((s) => (
                  <SchemeCard key={s.id} scheme={s} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
