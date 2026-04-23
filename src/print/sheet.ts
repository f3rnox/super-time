import log from '../log'
import {
  getJustifiedRows,
  getSheetEntryColumns,
  printSheetEntryNotes,
  printSheetHeader
} from '../print'
import { type TimeSheet, type TimeSheetEntry } from '../types'

/**
 * Prints a time sheet's header followed by each of its entries with aligned
 * columns and any notes associated with each entry rendered below it.
 */
const printSheet = (
  sheet: TimeSheet,
  isActive?: boolean,
  printDateAgo?: boolean,
  humanize?: boolean,
  concise?: boolean
): void => {
  const { activeEntryID, entries } = sheet

  printSheetHeader(sheet, isActive)

  const sheetEntryRows = entries.map((entry: TimeSheetEntry): string[] =>
    getSheetEntryColumns(
      entry,
      entry.id === activeEntryID,
      '',
      printDateAgo,
      humanize,
      concise
    )
  )

  const justifiedRows = getJustifiedRows(sheetEntryRows)

  entries.forEach((entry: TimeSheetEntry, i: number): void => {
    log(justifiedRows[i])
    printSheetEntryNotes(entry)
  })
}

export default printSheet
