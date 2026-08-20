import React, { useState } from 'react'
import { useLang } from '../i18n/LangContext'

const OCCUPATIONS = ['all', 'farmer', 'daily-wage', 'self-employed', 'unemployed', 'student', 'other']
const CATEGORIES = ['all', 'women', 'senior-citizen', 'disability', 'sc-st-obc']

export default function EligibilityForm({ onSubmit, loading }) {
  const { t } = useLang()
  const [form, setForm] = useState({ income: '', location: '', occupation: 'all', category: 'all' })

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ink-100 rounded-xl p-5 space-y-4">
      <div>
        <label htmlFor="income" className="block text-sm font-medium text-ink-700 mb-1.5">
          {t('incomeLabel')}
        </label>
        <input
          id="income"
          name="income"
          type="number"
          min="0"
          inputMode="numeric"
          value={form.income}
          onChange={handleChange}
          placeholder="e.g. 8000"
          className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm focus:border-seal-500 outline-none"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-ink-700 mb-1.5">
          {t('locationLabel')}
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g. Bhatpara, West Bengal"
          className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm focus:border-seal-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="occupation" className="block text-sm font-medium text-ink-700 mb-1.5">
            {t('occupationLabel')}
          </label>
          <select
            id="occupation"
            name="occupation"
            value={form.occupation}
            onChange={handleChange}
            className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm bg-white"
          >
            {OCCUPATIONS.map((o) => (
              <option key={o} value={o}>
                {o.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ink-700 mb-1.5">
            {t('categoryLabel')}
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-seal-500 hover:bg-seal-600 text-ink-900 font-medium rounded-md py-2.5 text-sm transition-colors disabled:opacity-60"
      >
        {loading ? '...' : t('checkEligibility')}
      </button>
    </form>
  )
}
