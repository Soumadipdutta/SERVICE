import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchReport } from '../api/client'
import StatusTrack from '../components/StatusTrack'
import { useLang } from '../i18n/LangContext'

export default function Track() {
  const { t } = useLang()
  const [searchParams] = useSearchParams()
  const [id, setId] = useState(searchParams.get('id') || '')
  const [report, setReport] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  async function lookup(trackingId) {
    if (!trackingId) return
    setLoading(true)
    setNotFound(false)
    const r = await fetchReport(trackingId.trim())
    setReport(r)
    setNotFound(!r)
    setLoading(false)
  }

  useEffect(() => {
    if (searchParams.get('id')) lookup(searchParams.get('id'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    lookup(id)
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-xl font-semibold text-ink-900 mb-4">{t('trackReport')}</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="RPT-10234"
          aria-label={t('trackingIdLabel')}
          className="flex-1 border border-ink-200 rounded-md px-3 py-2 text-sm font-mono focus:border-seal-500 outline-none"
        />
        <button
          type="submit"
          className="bg-ink-800 hover:bg-ink-900 text-white text-sm font-medium rounded-md px-4"
          disabled={loading}
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {notFound && <p className="text-sm text-status-escalated">No report found with that ID.</p>}

      {report && (
        <div className="bg-white border border-ink-100 rounded-xl p-5 space-y-5">
          <div>
            <p className="font-mono text-sm text-ink-500">{report.id}</p>
            <p className="text-ink-800 mt-1">{report.description}</p>
          </div>
          <StatusTrack status={report.status} />
          <div className="flex justify-between text-xs text-ink-400 pt-2 border-t border-ink-50">
            <span>{report.category}</span>
            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
