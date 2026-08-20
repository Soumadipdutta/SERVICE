import React from 'react'
import { useLang } from '../i18n/LangContext'

const STAGE_ORDER = ['reported', 'review', 'escalated', 'resolved']

const STAGE_COLOR = {
  reported: 'bg-status-reported',
  review: 'bg-status-review',
  escalated: 'bg-status-escalated',
  resolved: 'bg-status-resolved'
}

export default function StatusTrack({ status, compact = false }) {
  const { t } = useLang()
  const labelKey = {
    reported: 'statusReported',
    review: 'statusReview',
    escalated: 'statusEscalated',
    resolved: 'statusResolved'
  }
  const currentIndex = STAGE_ORDER.indexOf(status)

  return (
    <div className="flex items-center w-full" role="img" aria-label={`Status: ${t(labelKey[status])}`}>
      {STAGE_ORDER.map((stage, i) => {
        const reached = i <= currentIndex
        const isLast = i === STAGE_ORDER.length - 1
        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full border-2 ${compact ? 'w-2.5 h-2.5' : 'w-4 h-4'} ${
                  reached ? `${STAGE_COLOR[stage]} border-transparent` : 'bg-transparent border-ink-200'
                }`}
              />
              {!compact && (
                <span
                  className={`mt-1.5 text-[11px] whitespace-nowrap ${
                    reached ? 'text-ink-800 font-medium' : 'text-ink-300'
                  }`}
                >
                  {t(labelKey[stage])}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-1 ${i < currentIndex ? STAGE_COLOR[STAGE_ORDER[i + 1]] : 'bg-ink-100'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
