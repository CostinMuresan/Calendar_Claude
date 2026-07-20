import { useEffect, useState } from 'react'
import { parse, isValid, format } from 'date-fns'

// Camp de data cu afisare fixa in format romanesc zz/ll/aaaa, indiferent de
// limba/regiunea setata in browser-ul utilizatorului. Valoarea transmisa prin
// props/onChange ramane in format ISO (yyyy-MM-dd), pentru compatibilitate cu
// baza de date si cu restul aplicatiei.
//
// Pe langa tastarea directa a cifrelor, are si o iconita de calendar care
// deschide selectorul vizual nativ al browser-ului (suprapus, invizibil,
// peste iconita) - alegerea din calendar completeaza automat campul text,
// deja formatat zz/ll/aaaa.
export default function DateInputRO({ value, onChange, required, disabled }) {
  const [text, setText] = useState('')

  useEffect(() => {
    if (value) {
      const parsedFromIso = parse(value, 'yyyy-MM-dd', new Date())
      if (isValid(parsedFromIso)) {
        setText(format(parsedFromIso, 'dd/MM/yyyy'))
        return
      }
    }
    setText('')
  }, [value])

  function handleChange(e) {
    const digitsOnly = e.target.value.replace(/[^\d]/g, '').slice(0, 8)

    let formatted = digitsOnly
    if (digitsOnly.length > 4) {
      formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`
    } else if (digitsOnly.length > 2) {
      formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
    }
    setText(formatted)

    if (digitsOnly.length === 8) {
      const parsed = parse(formatted, 'dd/MM/yyyy', new Date())
      if (isValid(parsed)) {
        onChange(format(parsed, 'yyyy-MM-dd'))
      }
    } else if (digitsOnly.length === 0) {
      onChange('')
    }
  }

  function handlePickerChange(e) {
    const iso = e.target.value // input nativ type=date da direct format yyyy-MM-dd
    if (!iso) return
    onChange(iso)
  }

  return (
    <div className="date-input-ro-wrapper">
      <input
        type="text"
        inputMode="numeric"
        placeholder="zz/ll/aaaa"
        value={text}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        maxLength={10}
      />
      <span className="date-input-ro-icon" aria-hidden="true">📅</span>
      {!disabled && (
        <input
          type="date"
          className="date-input-ro-native"
          value={value || ''}
          onChange={handlePickerChange}
          tabIndex={-1}
          aria-label="Deschide calendar"
        />
      )}
    </div>
  )
}
