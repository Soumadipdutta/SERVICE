import React from 'react'
import { useLang } from '../i18n/LangContext'

const STYLES = {
  reported: 'bg-ink-100 text-ink-700',
  review: 'bg-seal-100 text-seal-700',
  escalated: 'bg-status-escalated/10 text-status-escalated',
  resolved: 'bg-status-resolved/10 text-status-resolved'
}

const LABEL_KEY = {
  reported: 'statusReported',
  review: 'statusReview',
  escalated: 'statusEscalated',
  resolved: 'statusResolved'
}

export default function StatusBadge({ status }) {
  const { t } = useLang()
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[status]}`}>
      {t(LABEL_KEY[status])}
    </span>
  )
}
