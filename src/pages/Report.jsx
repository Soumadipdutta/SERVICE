import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ReportForm from '../components/ReportForm'
import { submitReport } from '../api/client'
import { useLang } from '../i18n/LangContext'

export default function Report() {
  const { t } = useLang()
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState(null)

  async function handleSubmit(payload) {
    setSubmitting(true)
    const report = await submitReport(payload)
    setCreated(report)
    setSubmitting(false)
  }

  if (created) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-status-resolved/10 text-status-resolved flex items-center justify-center mx-auto mb-4 text-xl">
          ✓
        </div>
        <p className="text-sm text-ink-600">{t('reportSubmitted')}</p>
        <p className="font-mono text-2xl font-semibold text-ink-900 mt-2">{created.id}</p>
        <Link
          to={`/track?id=${created.id}`}
          className="inline-block mt-6 text-sm font-medium text-white bg-ink-800 hover:bg-ink-900 rounded-md px-5 py-2.5"
        >
          {t('trackReport')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-xl font-semibold text-ink-900 mb-4">{t('reportIssue')}</h1>
      <ReportForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  )
}
