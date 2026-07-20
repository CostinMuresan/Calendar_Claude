import { useEffect, useMemo, useState, useCallback } from 'react'
import { addMonths, subMonths, format } from 'date-fns'
import { supabase } from '../../supabaseClient'
import { buildMonthGrid, formatMonthTitle, WEEKDAY_LABELS, toISODate, coursesForDay } from '../../utils/dateHelpers'
import { getDurationStyle, DURATION_LEGEND } from '../../utils/colors'
import CourseModal from './CourseModal'

const MAX_VISIBLE_PER_DAY = 3

export default function MonthView() {
  const [monthDate, setMonthDate] = useState(new Date())
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState(null) // { initialDate } | { course } | null
  const [hoverInfo, setHoverInfo] = useState(null) // { course, top, left } | null
  const [dayDetail, setDayDetail] = useState(null) // Date | null - ziua pentru care aratam lista completa

  const grid = useMemo(() => buildMonthGrid(monthDate), [monthDate])
  const numWeeks = grid.length / 7

  function showHoverDetails(e, course) {
    const rect = e.currentTarget.getBoundingClientRect()
    const popoverWidth = 250
    let left = rect.left
    if (left + popoverWidth > window.innerWidth - 10) {
      left = window.innerWidth - popoverWidth - 10
    }
    let top = rect.bottom + 6
    if (top + 180 > window.innerHeight) {
      top = rect.top - 6 - 180
    }
    setHoverInfo({ course, top, left })
  }

  const loadCourses = useCallback(async () => {
    setLoading(true)
    const rangeStart = toISODate(grid[0]?.date || monthDate)
    const rangeEnd = toISODate(grid[grid.length - 1]?.date || monthDate)
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .lte('start_date', rangeEnd)
      .gte('end_date', rangeStart)
      .order('start_time', { ascending: true })
    if (!error) setCourses(data || [])
    setLoading(false)
  }, [grid, monthDate])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  return (
    <div className="calendar-page">
      <div className="calendar-toolbar">
        <button onClick={() => setMonthDate((d) => subMonths(d, 1))}>← Luna anterioara</button>
        <h2>{formatMonthTitle(monthDate)}</h2>
        <button onClick={() => setMonthDate((d) => addMonths(d, 1))}>Luna urmatoare →</button>
        <button className="secondary-btn" onClick={() => setMonthDate(new Date())}>Azi</button>
      </div>

      <div className="legend">
        {DURATION_LEGEND.map((l) => (
          <span key={l.label} className="legend-item">
            <span className="legend-swatch" style={{ background: l.bg, borderColor: l.border }} />
            {l.label}
          </span>
        ))}
      </div>

      {loading && <div className="loading-bar">Se incarca cursurile...</div>}

      <div className="month-grid" style={{ gridTemplateRows: `auto repeat(${numWeeks}, minmax(90px, 1fr))` }}>
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="weekday-header">{d}</div>
        ))}

        {grid.map(({ date, inCurrentMonth, isToday }) => {
          const dayCourses = coursesForDay(courses, date)
          const visibleCourses = dayCourses.slice(0, MAX_VISIBLE_PER_DAY)
          const hiddenCount = dayCourses.length - visibleCourses.length
          return (
            <div
              key={date.toISOString()}
              className={`day-cell ${inCurrentMonth ? '' : 'day-outside'} ${isToday ? 'day-today' : ''}`}
              onClick={(e) => {
                // click pe zona libera a zilei => deschide adaugare curs cu data precompletata
                if (e.target === e.currentTarget || e.target.classList.contains('day-number')) {
                  setModalState({ initialDate: date })
                }
              }}
            >
              <div className="day-number">{format(date, 'd')}</div>
              <div className="day-courses">
                {visibleCourses.map((c) => {
                  const style = getDurationStyle(c.start_date, c.end_date)
                  return (
                    <div
                      key={c.id}
                      className="course-chip"
                      style={{ background: style.bg, borderLeft: `4px solid ${style.border}`, color: style.text }}
                      onMouseEnter={(e) => showHoverDetails(e, c)}
                      onMouseLeave={() => setHoverInfo(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        setModalState({ course: c })
                      }}
                    >
                      <span className="course-chip-time">{c.start_time?.slice(0, 5) || ''}</span>
                      <span className="course-chip-name">{c.name}</span>
                    </div>
                  )
                })}
                {hiddenCount > 0 && (
                  <div
                    className="more-courses-link"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDayDetail(date)
                    }}
                  >
                    +{hiddenCount} mai multe
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {hoverInfo && (
        <div className="course-hover-popover" style={{ top: hoverInfo.top, left: hoverInfo.left }}>
          <div className="popover-title">{hoverInfo.course.name}</div>
          <div className="popover-row">
            <strong>Perioada:</strong> {hoverInfo.course.start_date} → {hoverInfo.course.end_date}
          </div>
          {hoverInfo.course.start_time && (
            <div className="popover-row">
              <strong>Interval:</strong> {hoverInfo.course.start_time.slice(0, 5)}-{hoverInfo.course.end_time?.slice(0, 5)}
            </div>
          )}
          {hoverInfo.course.trainer && (
            <div className="popover-row"><strong>Trainer:</strong> {hoverInfo.course.trainer}</div>
          )}
          {hoverInfo.course.room && (
            <div className="popover-row"><strong>Sala:</strong> {hoverInfo.course.room}</div>
          )}
          {(hoverInfo.course.participants_group || hoverInfo.course.participants_count) && (
            <div className="popover-row">
              <strong>Participanti:</strong> {hoverInfo.course.participants_group || ''}
              {hoverInfo.course.participants_count ? ` (${hoverInfo.course.participants_count})` : ''}
            </div>
          )}
          {hoverInfo.course.course_type && (
            <div className="popover-row"><strong>Tip:</strong> {hoverInfo.course.course_type}</div>
          )}
          {hoverInfo.course.responsible && (
            <div className="popover-row"><strong>Responsabil:</strong> {hoverInfo.course.responsible}</div>
          )}
        </div>
      )}

      {dayDetail && (
        <div className="modal-backdrop" onClick={() => setDayDetail(null)}>
          <div className="modal-card day-detail-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cursuri – {format(dayDetail, 'dd/MM/yyyy')}</h2>
              <button className="icon-btn" onClick={() => setDayDetail(null)}>✕</button>
            </div>
            <div className="day-detail-list">
              {coursesForDay(courses, dayDetail).map((c) => {
                const style = getDurationStyle(c.start_date, c.end_date)
                return (
                  <div
                    key={c.id}
                    className="day-detail-item"
                    style={{ borderLeft: `4px solid ${style.border}` }}
                    onClick={() => {
                      setDayDetail(null)
                      setModalState({ course: c })
                    }}
                  >
                    <div className="day-detail-item-title">
                      <strong>{c.start_time?.slice(0, 5) || ''}</strong> {c.name}
                    </div>
                    <div className="day-detail-item-sub">
                      {c.trainer || '—'} · {c.room || '—'}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="modal-actions">
              <div className="spacer" />
              <button
                className="secondary-btn"
                onClick={() => {
                  const clickedDate = dayDetail
                  setDayDetail(null)
                  setModalState({ initialDate: clickedDate })
                }}
              >
                + Adauga curs in aceasta zi
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState && (
        <CourseModal
          initialDate={modalState.initialDate}
          course={modalState.course}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null)
            loadCourses()
          }}
        />
      )}
    </div>
  )
}
