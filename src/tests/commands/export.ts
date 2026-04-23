import { type Argv } from 'yargs'
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance
} from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type ExportCommandArgs, handler } from '../../commands/export'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): ExportCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

interface SeedSheetOptions {
  active?: boolean
  endDate?: Date | null
  tags?: string[]
  notes?: { timestamp: Date; text: string }[]
}

const seedSheet = (
  sheetName: string,
  description: string,
  startDate: Date,
  options: SeedSheetOptions = {}
): void => {
  if (db.db === null) {
    throw new Error('Test DB is null')
  }

  const { endDate, tags, notes, active } = options
  const entry = DB.genSheetEntry(
    0,
    description,
    startDate,
    endDate === undefined ? new Date(+startDate + 60 * 60 * 1000) : endDate,
    tags,
    notes
  )
  const sheet = DB.genSheet(
    sheetName,
    [entry],
    active === true ? entry.id : null
  )

  db.db.sheets = [sheet]
  db.db.activeSheetName = sheet.name
}

describe('commands:export:handler', () => {
  let stdoutSpy: MockInstance<typeof process.stdout.write>

  beforeEach(async () => {
    await db.load()
    stdoutSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((): boolean => true)
  })

  afterEach(async () => {
    stdoutSpy.mockRestore()
    await db.delete()
  })

  it('defaults to json output containing the entries', () => {
    const start = new Date(2026, 3, 23, 9, 0, 0, 0)
    const end = new Date(2026, 3, 23, 10, 0, 0, 0)

    seedSheet('main', 'write docs', start, {
      endDate: end,
      tags: ['@docs']
    })

    const output = handler(getArgs())
    const parsed = JSON.parse(output) as {
      name: string
      entries: {
        description: string
        start: string
        end: string | null
        tags: string[]
      }[]
    }[]

    expect(parsed).toHaveLength(1)
    expect(parsed[0].name).toBe('main')
    expect(parsed[0].entries).toHaveLength(1)
    expect(parsed[0].entries[0].description).toBe('write docs')
    expect(parsed[0].entries[0].start).toBe(start.toISOString())
    expect(parsed[0].entries[0].end).toBe(end.toISOString())
    expect(parsed[0].entries[0].tags).toEqual(['@docs'])
    expect(stdoutSpy).toHaveBeenCalledOnce()
    expect(stdoutSpy.mock.calls[0][0]).toBe(`${output}\n`)
  }, 10000)

  it('renders csv with a header row and one entry row per entry', () => {
    const start = new Date(2026, 3, 23, 9, 0, 0, 0)
    const end = new Date(2026, 3, 23, 10, 0, 0, 0)

    seedSheet('main', 'fix, bug "prod"', start, {
      endDate: end,
      tags: ['@bug', '@prod']
    })

    const output = handler(getArgs({ format: 'csv' }))
    const lines = output.split('\n')

    expect(lines[0]).toBe(
      'sheet,id,description,start,end,duration_ms,tags,notes'
    )
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('main')
    expect(lines[1]).toContain('"fix, bug ""prod"""')
    expect(lines[1]).toContain(start.toISOString())
    expect(lines[1]).toContain(end.toISOString())
    expect(lines[1]).toContain('3600000')
    expect(lines[1]).toContain('@bug @prod')
  }, 10000)

  it('renders markdown with a section per sheet and a table of entries', () => {
    const start = new Date(2026, 3, 23, 9, 0, 0, 0)
    const end = new Date(2026, 3, 23, 10, 0, 0, 0)

    seedSheet('main', 'ship | feature', start, {
      endDate: end,
      tags: ['@ship'],
      notes: [{ timestamp: new Date(2026, 3, 23, 9, 30, 0, 0), text: 'mid' }]
    })

    const output = handler(getArgs({ format: 'md' }))

    expect(output.startsWith('## main')).toBe(true)
    expect(output).toContain(
      '| ID | Description | Start | End | Duration (ms) | Tags |'
    )
    expect(output).toContain('| --- | --- | --- | --- | --- | --- |')
    expect(output).toContain('ship \\| feature')
    expect(output).toContain(start.toISOString())
    expect(output).toContain(end.toISOString())
    expect(output).toContain('### Notes for entry 0')
    expect(output).toContain('- 2026-04-23T')
  }, 10000)

  it('treats active (end=null) entries as open with empty end cells', () => {
    const start = new Date(Date.now() - 60 * 60 * 1000)

    seedSheet('main', 'working', start, { endDate: null, active: true })

    const csv = handler(getArgs({ format: 'csv' }))
    const [, row] = csv.split('\n')
    const cells = row.split(',')

    expect(cells[4]).toBe('')

    const json = handler(getArgs({ format: 'json' }))
    const parsed = JSON.parse(json) as {
      entries: { end: string | null }[]
    }[]

    expect(parsed[0].entries[0].end).toBeNull()
  }, 10000)

  it('filters entries by --filter substring (case-insensitive)', () => {
    if (db.db === null) {
      throw new Error('Test DB is null')
    }

    const start = new Date(2026, 3, 23, 9, 0, 0, 0)
    const end = new Date(2026, 3, 23, 10, 0, 0, 0)
    const keep = DB.genSheetEntry(0, 'Write DOCS', start, end)
    const drop = DB.genSheetEntry(1, 'fix bug', start, end)
    const sheet = DB.genSheet('main', [keep, drop], null)

    db.db.sheets = [sheet]
    db.db.activeSheetName = sheet.name

    const output = handler(getArgs({ format: 'json', filter: 'docs' }))
    const parsed = JSON.parse(output) as {
      entries: { description: string }[]
    }[]

    expect(parsed[0].entries).toHaveLength(1)
    expect(parsed[0].entries[0].description).toBe('Write DOCS')
  }, 10000)

  it('throws when no sheets exist to export from', () => {
    if (db.db !== null) {
      db.db.sheets = []
      db.db.activeSheetName = null
    }

    expect(() => handler(getArgs())).toThrow('No relevant sheets found')
  }, 10000)

  it('throws when no entries match the given filters', () => {
    const start = new Date(2026, 3, 23, 9, 0, 0, 0)
    const end = new Date(2026, 3, 23, 10, 0, 0, 0)

    seedSheet('main', 'write docs', start, { endDate: end })

    expect(() =>
      handler(getArgs({ filter: 'does-not-match-anything' }))
    ).toThrow('No entries match the given filters')
  }, 10000)

  it('throws when --since is combined with --today', () => {
    const start = new Date(2026, 3, 23, 9, 0, 0, 0)
    const end = new Date(2026, 3, 23, 10, 0, 0, 0)

    seedSheet('main', 'write docs', start, { endDate: end })

    expect(() =>
      handler(getArgs({ since: '1 hour ago', today: true }))
    ).toThrow('Cannot use --since, --today, --yesterday, or --all together')
  }, 10000)

  it('rejects unsupported export formats', () => {
    const start = new Date(2026, 3, 23, 9, 0, 0, 0)
    const end = new Date(2026, 3, 23, 10, 0, 0, 0)

    seedSheet('main', 'write docs', start, { endDate: end })

    expect(() =>
      handler(
        getArgs({
          format: 'xml' as unknown as ExportCommandArgs['format']
        })
      )
    ).toThrow('Unsupported export format')
  }, 10000)
})
