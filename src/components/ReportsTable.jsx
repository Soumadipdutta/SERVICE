import React, { useMemo, useState } from 'react'
import StatusBadge from './StatusBadge'

const STATUS_OPTIONS = ['reported', 'review', 'escalated', 'resolved']

export default function ReportsTable({ reports, onStatusChange }) {
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(
    () => (filter === 'all' ? reports : reports.filter((r) => r.status === filter)),
    [reports, filter]
  )

  return (
    <div className="bg-white border border-ink-100 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-ink-50 overflow-x-auto">
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              filter === s ? 'bg-ink-800 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-400 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 font-medium">Reported</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Update</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-ink-50">
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{r.id}</td>
                <td className="px-4 py-3 max-w-xs truncate text-ink-800">{r.description}</td>
                <td className="px-4 py-3 text-ink-600">{r.region}</td>
                <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => onStatusChange(r.id, e.target.value)}
                    className="text-xs border border-ink-200 rounded-md px-2 py-1 bg-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-400 text-sm">
                  No reports in this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
