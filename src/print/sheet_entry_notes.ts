import _isEmpty from 'lodash/isEmpty'

import log from '../log'
import { clDate, clHighlight, clText } from '../color'
import { type TimeSheetEntry, type TimeSheetEntryNote } from '../types'

const NOTE_INDENT = '      '

/**
 * Logs the notes attached to a sheet entry sorted ascending by timestamp,
 * indented below the associated entry row. Returns without logging when the
 * entry has no notes.
 */
const printSheetEntryNotes = (entry: TimeSheetEntry): void => {
  const { notes } = entry

  if (_isEmpty(notes)) {
    return
  }

  const sortedNotes = [...notes].sort(
    (
      { timestamp: a }: TimeSheetEntryNote,
      { timestamp: b }: TimeSheetEntryNote
    ): number => +a - +b
  )

  sortedNotes.forEach((note: TimeSheetEntryNote): void => {
    const { timestamp, text } = note
    const timestampUI = clDate(new Date(timestamp).toLocaleString())

    log(`${NOTE_INDENT}${clText('-')} ${timestampUI}: ${clHighlight(text)}`)
  })
}

export default printSheetEntryNotes
