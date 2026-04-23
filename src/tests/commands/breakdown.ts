import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import DB from '../../db'
import { printJustifiedContent } from '../../print'
import getTestDB from '../get_test_db'
import { type BreakdownCommandArgs, handler } from '../../commands/breakdown'

vi.mock('../../log', () => ({
  default: vi.fn()
}))

vi.mock('../../print', () => ({
  printJustifiedContent: vi.fn()
}))

const db = getTestDB()
const yargsStub = { showHelp: vi.fn() } as unknown as Argv

const getArgs = (overrides?: Record<string, unknown>): BreakdownCommandArgs => {
  if (overrides === undefined) {
    return {
      db,
      yargs: yargsStub
    }
  }

  return {
    db,
    yargs: yargsStub,
    ...overrides
  }
}

describe('commands:breakdown:handler', () => {
  beforeEach(async () => {
    await db.load()
    vi.clearAllMocks()
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

  it('handles very long entries without timing out', () => {
    const now = Date.now()
    const startDate = new Date(now - 5 * 365 * 24 * 60 * 60 * 1000)
    const endDate = new Date(now - 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'very-long-entry', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    const startMs = Date.now()

    expect(() => handler(getArgs())).not.toThrow()
    expect(Date.now() - startMs).toBeLessThan(2000)
  })

  it('does not print zero-duration rows for malformed open-ended entries', () => {
    const startDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const entry = DB.genSheetEntry(
      0,
      'open-entry-with-undefined-end',
      startDate,
      null
    )
    const sheet = DB.genSheet('test-sheet', [entry])
    ;(sheet.entries[0] as unknown as { end: Date | null | undefined }).end =
      undefined

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    const printMock = vi.mocked(printJustifiedContent)

    expect(() => handler(getArgs())).not.toThrow()
    expect(printMock).toHaveBeenCalled()
    expect(printMock.mock.calls[0][0].some((row) => row.includes('0:00'))).toBe(
      false
    )
  })
})
