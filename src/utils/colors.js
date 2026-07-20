import { differenceInCalendarDays, parseISO } from 'date-fns'

// Scala de culori in functie de durata cursului, gandita pentru contrast maxim
// intre categorii (nu un gradient de nuante apropiate, greu de distins):
// 1 zi -> albastru | 2-3 zile -> verde | 4-7 zile -> portocaliu | >7 zile -> rosu
const SCALE = [
  { max: 1, bg: '#d9e6ff', border: '#2f6fed', text: '#1a3f91', label: '1 zi' },
  { max: 3, bg: '#d3f2df', border: '#1f9d55', text: '#146c3a', label: '2-3 zile' },
  { max: 7, bg: '#ffe3bd', border: '#f2900c', text: '#a35c00', label: '4-7 zile' },
  { max: Infinity, bg: '#ffd6da', border: '#e0293f', text: '#a30f22', label: '> 1 saptamana' },
]

export function courseDurationDays(startDate, endDate) {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
  return differenceInCalendarDays(end, start) + 1
}

export function getDurationStyle(startDate, endDate) {
  const days = courseDurationDays(startDate, endDate)
  return SCALE.find((s) => days <= s.max)
}

export const DURATION_LEGEND = SCALE.map((s) => ({
  label: s.label,
  bg: s.bg,
  border: s.border,
}))
