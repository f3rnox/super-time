import _isUndefined from 'lodash/isUndefined'

import { type JSONTimeTrackerDB } from '../types'

/**
 * Creates the `notes` array on each sheet entry, which was added in version 3.
 */
const migrateJSONDBToVersionThree = (
  jsonDB: JSONTimeTrackerDB
): JSONTimeTrackerDB => {
  const {
    sheets: jsonSheets,
    version: jsonVersion,
    activeSheetName: jsonActiveSheetName
  } = jsonDB

  if (jsonVersion !== 2 && !_isUndefined(jsonVersion)) {
    throw new Error(
      `DB is version ${jsonVersion}, cannot migrate to version 3.`
    )
  }

  return {
    version: 3,
    activeSheetName: jsonActiveSheetName,
    sheets: jsonSheets.map(
      ({
        name: jsonName,
        entries: jsonEntries,
        activeEntryID: jsonActiveEntryID
      }) => ({
        name: jsonName,
        activeEntryID: jsonActiveEntryID,
        entries: jsonEntries.map(
          ({
            id: jsonId,
            start: jsonStart,
            end: jsonEnd,
            description: jsonDescription,
            tags: jsonTags
          }) => ({
            notes: [],
            tags: jsonTags,
            id: jsonId,
            end: jsonEnd,
            start: jsonStart,
            description: jsonDescription
          })
        )
      })
    )
  } as JSONTimeTrackerDB
}

export default migrateJSONDBToVersionThree
export { migrateJSONDBToVersionThree }
