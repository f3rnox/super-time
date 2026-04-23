import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type WeekCommandArgs, handler } from '../../commands/week'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): WeekCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:week:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('prints report for last week data grouped by sheets', () => {
    const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const endDate = new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000
    )
    const entry = DB.genSheetEntry(0, 'week-entry', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).not.toThrow()
  })

  it('prints aggregated total report when --total is used', () => {
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'week-entry', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ total: true }))).not.toThrow()
  })
})
