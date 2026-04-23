import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type BreakdownCommandArgs, handler } from '../../commands/breakdown'

const db = getTestDB()

const getArgs = (
  overrides?: Record<string, unknown>
): BreakdownCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:breakdown:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error when no entries match the selected period', () => {
    const oldStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const oldEndDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'old-entry', oldStartDate, oldEndDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)

    expect(() => handler(getArgs({ since: tomorrow.toISOString() }))).toThrow(
      'No results found'
    )
  })

  it('prints breakdowns by day, weekday and hour for matching entries', () => {
    const startDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const endDate = new Date(Date.now() - 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'active-entry', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).not.toThrow()
  })
})
