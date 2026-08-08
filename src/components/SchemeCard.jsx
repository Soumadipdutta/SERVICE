import React, { useState } from 'react'
import { useLang } from '../i18n/LangContext'

export default function SchemeCard({ scheme }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-ink-100 rounded-xl bg-white overflow-hidden">
      <button
        className="w-full text-left p-5 flex items-start justify-between gap-4"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div>
          <h3 className="font-display font-semibold text-ink-900">{scheme.name}</h3>
          <p className="text-sm text-ink-500 mt-1">{scheme.summary}</p>
        </div>
        <span className="text-ink-400 text-xl leading-none mt-1">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-ink-50 pt-4 space-y-4">
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-ink-400 mb-2">{t('docsNeeded')}</h4>
            <ul className="text-sm text-ink-700 space-y-1 list-disc list-inside">
              {scheme.documents.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-ink-400 mb-2">{t('applySteps')}</h4>
            <ol className="text-sm text-ink-700 space-y-1.5">
              {scheme.steps.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-seal-600 font-medium">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <a
            href={scheme.applyLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm font-medium text-white bg-ink-800 hover:bg-ink-900 rounded-md px-4 py-2 transition-colors"
          >
            Go to official portal
          </a>
        </div>
      )}
    </div>
  )
}
