import { type Argv } from 'yargs'
import _cloneDeep from 'lodash/cloneDeep'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type NoteCommandArgs, handler } from '../../commands/note'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): NoteCommandArgs => ({
  db,
  note: [],
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:note:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error if the note text is empty', async () => {
    const p = handler(getArgs({ note: [] }))

    await expect(p).rejects.toThrow('Note text is required')
  }, 10000)

  it('throws an error if no sheet is active', async () => {
    if (db.db !== null) {
      db.db.activeSheetName = null
    }

    const p = handler(getArgs({ note: ['hello'] }))

    await expect(p).rejects.toThrow('No active sheet')
  }, 10000)

  it('throws an error if the active sheet has no active entry', async () => {
    const sheet = DB.genSheet('test-sheet')
    const testDB = _cloneDeep(db)

    if (testDB.db === null) {
      throw new Error('Test DB is null')
    }

    testDB.db.sheets.push(sheet)
    testDB.db.activeSheetName = sheet.name

    const p = handler(getArgs({ db: testDB, note: ['hello'] }))

    await expect(p).rejects.toThrow(`Sheet ${sheet.name} has no active entry`)
  }, 10000)

  it('appends a timestamped note to the active entry on the active sheet', async () => {
    const entry = DB.genSheetEntry(0, 'test-description', new Date())
    const sheet = DB.genSheet('test-sheet', [entry], entry.id)
    const testDB = _cloneDeep(db)

    if (testDB.db === null) {
      throw new Error('Test DB is null')
    }

    testDB.db.sheets.push(sheet)
    testDB.db.activeSheetName = sheet.name

    const beforeFirst = Date.now()

    await expect(
      handler(getArgs({ db: testDB, note: ['first', 'note'] }))
    ).resolves.toBeUndefined()

    const afterFirst = Date.now()
    const [updatedEntry] = sheet.entries

    expect(updatedEntry.notes).toHaveLength(1)
    expect(updatedEntry.notes[0].text).toBe('first note')
    expect(updatedEntry.notes[0].timestamp).toBeInstanceOf(Date)
    expect(+updatedEntry.notes[0].timestamp).toBeGreaterThanOrEqual(beforeFirst)
    expect(+updatedEntry.notes[0].timestamp).toBeLessThanOrEqual(afterFirst)

    await expect(
      handler(getArgs({ db: testDB, note: ['second', 'note'] }))
    ).resolves.toBeUndefined()

    expect(updatedEntry.notes).toHaveLength(2)
    expect(updatedEntry.notes[1].text).toBe('second note')
    expect(updatedEntry.notes[1].timestamp).toBeInstanceOf(Date)
  }, 10000)
})
