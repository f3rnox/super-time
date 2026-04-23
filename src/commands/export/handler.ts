import _isEmpty from 'lodash/isEmpty'

import { type ExportCommandArgs, type ExportFormat } from './types'
import getListFilteredSheets from '../list/get_list_filtered_sheets'
import getListSheetsToList from '../list/get_list_sheets_to_list'
import getListSinceDate from '../list/get_list_since_date'
import formatSheets from './format_sheets'

const SUPPORTED_FORMATS: readonly ExportFormat[] = ['csv', 'json', 'md']

/**
 * Exports filtered sheet entries to stdout in the requested format. Reuses
 * the list command's sheet/since/filter resolution so the selection semantics
 * stay consistent between viewing and exporting.
 */
const handler = (args: ExportCommandArgs): string => {
  const { all, db, help, since, today, yargs, filter, format, yesterday } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  const resolvedFormat: ExportFormat = format ?? 'json'

  if (!SUPPORTED_FORMATS.includes(resolvedFormat)) {
    throw new Error(
      `Unsupported export format: ${resolvedFormat}. Use csv, json, or md.`
    )
  }

  if (!_isEmpty(since) && (today || yesterday || all)) {
    throw new Error(
      'Cannot use --since, --today, --yesterday, or --all together'
    )
  }

  const dbSheets = db.getAllSheets()
  const sheetsToList = getListSheetsToList(args, dbSheets)

  if (_isEmpty(sheetsToList)) {
    throw new Error('No relevant sheets found')
  }

  const sinceDate = getListSinceDate(sheetsToList, args)
  const filteredSheets = getListFilteredSheets(sheetsToList, sinceDate, filter)

  if (_isEmpty(filteredSheets)) {
    throw new Error('No entries match the given filters')
  }

  const output = formatSheets(filteredSheets, resolvedFormat)

  process.stdout.write(`${output}\n`)

  return output
}

export default handler
