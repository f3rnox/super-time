import { type TimeSheetEntry } from '../types'
import { getEndOfDay, getStartOfDay } from '../dates'

/**
 * Returns whether an entry overlaps with any time in a given day.
 */
const isEntryInDay = (date: Date, entry: TimeSheetEntry): boolean => {
  const { end, start } = entry
  const startOfDay = getStartOfDay(date)
  const endOfDay = getEndOfDay(date)
  const effectiveEnd = end ?? new Date()

  return +start <= +endOfDay && +effectiveEnd >= +startOfDay
}

export default isEntryInDay
