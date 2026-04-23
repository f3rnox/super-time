import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type ListCommandArgs, handler } from '../../commands/list'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): ListCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:list:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('does not mutate entry start date when listing with default since date', () => {
    if (db.db === null) {
      throw new Error('Test DB is null')
    }

    const startDate = new Date(2026, 3, 23, 9, 2, 20, 334)
    const endDate = new Date(2026, 3, 23, 10, 2, 23, 701)
    const entry = DB.genSheetEntry(0, 'test entry', startDate, endDate)
    const sheet = DB.genSheet('main', [entry], null)

    db.db.sheets = [sheet]
    db.db.activeSheetName = sheet.name

    const initialStartDate = +entry.start

    expect(() => handler(getArgs())).not.toThrow()
    expect(+entry.start).toBe(initialStartDate)
  }, 10000)

  it('renders entries whose notes are unsorted without mutating note order', () => {
    if (db.db === null) {
      throw new Error('Test DB is null')
    }

    const startDate = new Date(2026, 3, 23, 9, 0, 0, 0)
    const endDate = new Date(2026, 3, 23, 10, 0, 0, 0)
    const entry = DB.genSheetEntry(0, 'entry with notes', startDate, endDate)

    entry.notes = [
      { timestamp: new Date(2026, 3, 23, 9, 30, 0, 0), text: 'second note' },
      { timestamp: new Date(2026, 3, 23, 9, 10, 0, 0), text: 'first note' },
      { timestamp: new Date(2026, 3, 23, 9, 45, 0, 0), text: 'third note' }
    ]

    const originalOrder = entry.notes.map(({ text }) => text)
    const sheet = DB.genSheet('main', [entry], null)

    db.db.sheets = [sheet]
    db.db.activeSheetName = sheet.name

    expect(() => handler(getArgs())).not.toThrow()
    expect(entry.notes.map(({ text }) => text)).toEqual(originalOrder)
  }, 10000)
})
