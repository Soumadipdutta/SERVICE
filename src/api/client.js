// Central API surface. Every page imports from here, never from mock data directly.
// When the Express backend is ready, replace each function body with a fetch()
// call to '/api/...' — component code does not need to change.

import { mockSchemes, matchSchemes as mockMatch } from '../data/mockSchemes'
import {
  listReports as mockList,
  getReport as mockGet,
  createReport as mockCreate,
  updateStatus as mockUpdateStatus,
  autoEscalateStale as mockAutoEscalate
} from '../data/mockReports'

const USE_MOCK = true // flip to false when backend is ready

export async function fetchSchemes() {
  if (USE_MOCK) return Promise.resolve(mockSchemes)
  const res = await fetch('/api/schemes')
  return res.json()
}

export async function checkEligibility(profile) {
  if (USE_MOCK) return Promise.resolve(mockMatch(profile))
  const res = await fetch('/api/schemes/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  })
  return res.json()
}

export async function fetchReports() {
  if (USE_MOCK) return Promise.resolve(mockAutoEscalate())
  const res = await fetch('/api/reports')
  return res.json()
}

export async function fetchReport(id) {
  if (USE_MOCK) return Promise.resolve(mockGet(id))
  const res = await fetch(`/api/reports/${id}`)
  if (!res.ok) return null
  return res.json()
}

export async function submitReport(payload) {
  if (USE_MOCK) return Promise.resolve(mockCreate(payload))
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return res.json()
}

export async function setReportStatus(id, status) {
  if (USE_MOCK) return Promise.resolve(mockUpdateStatus(id, status))
  const res = await fetch(`/api/reports/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  return res.json()
}
