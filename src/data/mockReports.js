// In-memory mock store so the frontend is fully demoable before the API exists.
// Swap calls in src/api/client.js to real fetch() once the backend is ready.

const STAGES = ['reported', 'review', 'escalated', 'resolved']
const ESCALATE_AFTER_MS = 1000 * 60 * 60 * 48 // 48 hours

let reports = [
  {
    id: 'RPT-10234',
    description: 'Broken streetlight near the community water pump, unsafe at night.',
    lat: 22.8258,
    lng: 88.4034,
    category: 'Public safety',
    status: 'review',
    mediaUrl: null,
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    region: 'North 24 Parganas'
  },
  {
    id: 'RPT-10221',
    description: 'Ration shop demanding extra payment beyond listed price.',
    lat: 22.5726,
    lng: 88.3639,
    category: 'Corruption',
    status: 'escalated',
    mediaUrl: null,
    createdAt: Date.now() - 1000 * 60 * 60 * 70,
    region: 'Kolkata'
  },
  {
    id: 'RPT-10198',
    description: 'Open drain overflow causing waterlogging outside the school gate.',
    lat: 22.9868,
    lng: 87.9312,
    category: 'Civic infrastructure',
    status: 'resolved',
    mediaUrl: null,
    createdAt: Date.now() - 1000 * 60 * 60 * 96,
    region: 'Hooghly'
  }
]

export function listReports() {
  return [...reports].sort((a, b) => b.createdAt - a.createdAt)
}

export function getReport(id) {
  return reports.find((r) => r.id === id) || null
}

export function createReport({ description, lat, lng, category, mediaUrl, region }) {
  const id = `RPT-${Math.floor(10000 + Math.random() * 89999)}`
  const report = {
    id,
    description,
    lat,
    lng,
    category,
    mediaUrl,
    region: region || 'Unspecified',
    status: 'reported',
    createdAt: Date.now()
  }
  reports = [report, ...reports]
  return report
}

export function updateStatus(id, status) {
  reports = reports.map((r) => (r.id === id ? { ...r, status } : r))
  return getReport(id)
}

// Simple time-based escalation check a dashboard can call on load.
export function autoEscalateStale() {
  const now = Date.now()
  reports = reports.map((r) => {
    if (r.status === 'reported' || r.status === 'review') {
      if (now - r.createdAt > ESCALATE_AFTER_MS) {
        return { ...r, status: 'escalated' }
      }
    }
    return r
  })
  return listReports()
}

export const STATUS_STAGES = STAGES
