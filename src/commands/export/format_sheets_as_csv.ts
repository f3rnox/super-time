import { type TimeSheet } from '../../types'

const CSV_COLUMNS: readonly string[] = [
  'sheet',
  'id',
  'description',
  'start',
  'end',
  'duration_ms',
  'tags',
  'notes'
] as const

/**
 * Escapes a single CSV field per RFC 4180: wraps in double quotes when the
 * value contains a comma, quote, or newline, and doubles embedded quotes.
 * @param value - Raw cell value
 */
const escapeField = (value: string): string => {
  const needsQuoting = /[",\r\n]/.test(value)

  if (!needsQuoting) {
    return value
  }

  return `"${value.replace(/"/g, '""')}"`
}

/**
 * Serializes sheets as CSV, one row per entry. The first row is a header. The
 * `tags` column is a space-joined list and `notes` are `timestamp|text`
 * segments separated by ` || `. Active entries have an empty `end` column.
 * @param sheets - Sheets to serialize
 */
const formatSheetsAsCsv = (sheets: TimeSheet[]): string => {
  const rows: string[] = [CSV_COLUMNS.join(',')]

  sheets.forEach(({ name: sheetName, entries }) => {
    entries.forEach(({ id, description, start, end, tags, notes }) => {
      const durationMs = end === null ? Date.now() - +start : +end - +start
      const notesText = notes
        .map(({ timestamp, text }) => `${timestamp.toISOString()}|${text}`)
        .join(' || ')
      const row = [
        sheetName,
        String(id),
        description,
        start.toISOString(),
        end === null ? '' : end.toISOString(),
        String(durationMs),
        tags.join(' '),
        notesText
      ]
        .map(escapeField)
        .join(',')

      rows.push(row)
    })
  })

  return rows.join('\n')
}

export default formatSheetsAsCsv
