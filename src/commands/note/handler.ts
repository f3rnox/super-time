import _isEmpty from 'lodash/isEmpty'

import log from '../../log'
import { clDate, clHighlight, clID, clText } from '../../color'
import { type NoteCommandArgs } from './types'

/**
 * Attaches a timestamped note to the currently running entry in the active sheet.
 */
const handler = async (args: NoteCommandArgs): Promise<void> => {
  const { yargs, db, help, note: noteArray } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  const text = noteArray.join(' ').trim()

  if (_isEmpty(text)) {
    throw new Error('Note text is required')
  }

  const activeSheetName = db.getActiveSheetName()

  if (activeSheetName === null) {
    throw new Error('No active sheet')
  }

  const sheet = db.getSheet(activeSheetName)
  const { activeEntryID, name } = sheet

  if (activeEntryID === null) {
    throw new Error(`Sheet ${name} has no active entry`)
  }

  const entry = db.getSheetEntry(name, activeEntryID)
  const timestamp = new Date()

  entry.notes.push({ timestamp, text })

  await db.save()

  const entryIDText: string = clID(String(entry.id))
  const timestampText: string = clDate(timestamp.toLocaleString())
  const noteText: string = clHighlight(text)

  log(
    `${clText('Added note to entry')} ${entryIDText} ${timestampText}: ${noteText}`
  )
}

export default handler
