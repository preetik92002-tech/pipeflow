const DEFAULT_LOCALE = 'en-US'

export function formatDateValue(value: string | Date | null | undefined, options: Intl.DateTimeFormatOptions = {}) {
  if (!value) return '—'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, { timeZone: 'UTC', ...options }).format(date)
}

export function formatShortDate(value: string | Date | null | undefined) {
  return formatDateValue(value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatLongDate(value: string | Date | null | undefined) {
  return formatDateValue(value, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(value: string | Date | null | undefined) {
  return formatDateValue(value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
