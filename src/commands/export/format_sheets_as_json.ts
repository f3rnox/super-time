import { type TimeSheet } from '../../types'

/**
 * Serializes the given sheets as a pretty-printed JSON string. Dates are
 * emitted as ISO-8601 strings so the output stays portable across parsers.
 * @param sheets - Sheets to serialize
 */
const formatSheetsAsJson = (sheets: TimeSheet[]): string =>
  JSON.stringify(
    sheets.map(({ name, activeEntryID, entries }) => ({
      name,
      activeEntryID,
      entries: entries.map(({ id, description, start, end, tags, notes }) => ({
        id,
        description,
        start: start.toISOString(),
        end: end === null ? null : end.toISOString(),
        tags,
        notes: notes.map(({ timestamp, text }) => ({
          timestamp: timestamp.toISOString(),
          text
        }))
      }))
    })),
    null,
    2
  )

export default formatSheetsAsJson
