import DB from '../../db'
import { getPastDay } from '../../dates'
import { isEntryInDay } from '../../utils'

describe('utils:is_entry_in_day', () => {
  it('returns true if the entry overlaps with the day', () => {
    const date = getPastDay(4)
    const entryStart = getPastDay(7)
    const entryEnd = getPastDay(2)
    const entry = DB.genSheetEntry(0, 'test-a', entryStart, entryEnd)

    expect(isEntryInDay(date, entry)).toBe(true)
  })

  it('returns false for active entries that start after the day', () => {
    const date = getPastDay(1)
    const todayStart = new Date()
    const entry = DB.genSheetEntry(0, 'today-active-entry', todayStart, null)

    expect(isEntryInDay(date, entry)).toBe(false)
  })
})
