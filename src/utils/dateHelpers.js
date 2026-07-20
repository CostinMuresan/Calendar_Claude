import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parseISO,
  isWithinInterval,
} from 'date-fns'
import { ro } from 'date-fns/locale'

// Grid saptamana Luni -> Duminica pentru luna data
export function buildMonthGrid(monthDate) {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    inCurrentMonth: isSameMonth(date, monthDate),
    isToday: isToday(date),
  }))
}

export function formatMonthTitle(date) {
  const label = format(date, 'LLLL yyyy', { locale: ro })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export const WEEKDAY_LABELS = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata', 'Duminica']

export function toISODate(date) {
  return format(date, 'yyyy-MM-dd')
}

// cursurile care ating ziua respectiva (start_date <= zi <= end_date), sortate dupa ora de start
export function coursesForDay(courses, date) {
  const iso = toISODate(date)
  return courses
    .filter((c) => c.start_date <= iso && c.end_date >= iso)
    .sort((a, b) => {
      const ta = a.start_time || '00:00'
      const tb = b.start_time || '00:00'
      return ta.localeCompare(tb)
    })
}

export function isDateWithin(date, startISO, endISO) {
  return isWithinInterval(date, { start: parseISO(startISO), end: parseISO(endISO) })
}
