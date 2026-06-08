import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { performanceData } from '../../data/mockData.js'

export default function TrendChart({ data = performanceData }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="atsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="interviewFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.22)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 12 }} domain={[40, 100]} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid rgba(148,163,184,.25)', boxShadow: '0 12px 40px rgba(15,23,42,.15)' }} />
          <Area type="monotone" dataKey="ats" stroke="#7C3AED" strokeWidth={3} fill="url(#atsFill)" name="ATS score" />
          <Area type="monotone" dataKey="interview" stroke="#4F46E5" strokeWidth={3} fill="url(#interviewFill)" name="Interview score" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
