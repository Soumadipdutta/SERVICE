import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function RegionChart({ reports }) {
  const data = useMemo(() => {
    const byRegion = {}
    reports.forEach((r) => {
      byRegion[r.region] = byRegion[r.region] || { region: r.region, total: 0, resolved: 0 }
      byRegion[r.region].total += 1
      if (r.status === 'resolved') byRegion[r.region].resolved += 1
    })
    return Object.values(byRegion)
  }, [reports])

  return (
    <div className="bg-white border border-ink-100 rounded-xl p-5">
      <h3 className="font-display font-semibold text-ink-900 mb-4">Reports by region</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dfe6ee" vertical={false} />
            <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#5c7ea1' }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: '#5c7ea1' }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dfe6ee' }} />
            <Bar dataKey="total" fill="#b9c8da" radius={[4, 4, 0, 0]} name="Total reports" />
            <Bar dataKey="resolved" fill="#3f8f5f" radius={[4, 4, 0, 0]} name="Resolved" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
