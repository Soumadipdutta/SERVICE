import React, { useState } from 'react'
import { useLang } from '../i18n/LangContext'

const CATEGORIES = ['Public safety', 'Corruption', 'Civic infrastructure', 'Harassment', 'Other']

export default function ReportForm({ onSubmit, submitting }) {
  const { t } = useLang()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [coords, setCoords] = useState(null)
  const [locError, setLocError] = useState('')
  const [file, setFile] = useState(null)

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocError('Location is not supported on this device.')
      return
    }
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocError('Could not get your location. You can still submit without it.')
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      description,
      category,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      mediaUrl: file ? file.name : null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ink-100 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs text-ink-500 bg-ink-50 rounded-md px-3 py-2">
        <span aria-hidden="true">●</span>
        <span>{t('anonymousNote')}</span>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-ink-700 mb-1.5">
          {t('describeIssue')}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          placeholder="What happened, and where?"
          className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm focus:border-seal-500 outline-none resize-none"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-ink-700 mb-1.5">
          {t('categoryLabel')}
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button
          type="button"
          onClick={captureLocation}
          className="w-full border border-ink-200 hover:border-ink-400 rounded-md py-2.5 text-sm font-medium text-ink-700 transition-colors"
        >
          {coords ? `Location captured (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})` : t('captureLocation')}
        </button>
        {locError && <p className="text-xs text-status-escalated mt-1.5">{locError}</p>}
      </div>

      <div>
        <label htmlFor="evidence" className="block text-sm font-medium text-ink-700 mb-1.5">
          {t('attachEvidence')}
        </label>
        <input
          id="evidence"
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-ink-600"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !description}
        className="w-full bg-ink-800 hover:bg-ink-900 text-white font-medium rounded-md py-2.5 text-sm transition-colors disabled:opacity-60"
      >
        {submitting ? '...' : t('submitReport')}
      </button>
    </form>
  )
}
