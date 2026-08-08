import React, { useEffect, useState } from 'react'
import ReportsTable from '../components/ReportsTable'
import RegionChart from '../components/RegionChart'
import { fetchReports, setReportStatus } from '../api/client'
import { useLang } from '../i18n/LangContext'

// Hackathon-only gate. Replace with real auth before any real deployment.
const DEMO_PASSWORD = 'municipal2026'

export default function Admin() {
  const { t } = useLang()
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const [reports, setReports] = useState([])

  useEffect(() => {
    if (authed) refresh()
  }, [authed])

  async function refresh() {
    const data = await fetchReports()
    setReports(data)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (pwd === DEMO_PASSWORD) {
      setAuthed(true)
      setError('')
    } else {
      setError('Incorrect password.')
    }
  }

  async function handleStatusChange(id, status) {
    await setReportStatus(id, status)
    refresh()
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-20">
        <h1 className="font-display text-xl font-semibold text-ink-900 mb-1">{t('adminLogin')}</h1>
        <p className="text-sm text-ink-500 mb-6">For local authority staff managing civic reports.</p>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Password"
            className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm focus:border-seal-500 outline-none"
          />
          {error && <p className="text-xs text-status-escalated">{error}</p>}
          <button
            type="submit"
            className="w-full bg-ink-800 hover:bg-ink-900 text-white text-sm font-medium rounded-md py-2.5"
          >
            Sign in
          </button>
          <p className="text-xs text-ink-400 pt-1">Demo password: {DEMO_PASSWORD}</p>
        </form>
      </div>
    )
  }

  const escalatedCount = reports.filter((r) => r.status === 'escalated').length
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink-900">Authority dashboard</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-ink-500">
            Total <span className="font-semibold text-ink-900">{reports.length}</span>
          </span>
          <span className="text-status-escalated">
            Escalated <span className="font-semibold">{escalatedCount}</span>
          </span>
          <span className="text-status-resolved">
            Resolved <span className="font-semibold">{resolvedCount}</span>
          </span>
        </div>
      </div>

      <RegionChart reports={reports} />
      <ReportsTable reports={reports} onStatusChange={handleStatusChange} />
    </div>
  )
}
