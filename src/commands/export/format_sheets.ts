import { type TimeSheet } from '../../types'
import { type ExportFormat } from './types'
import formatSheetsAsCsv from './format_sheets_as_csv'
import formatSheetsAsJson from './format_sheets_as_json'
import formatSheetsAsMd from './format_sheets_as_md'

/**
 * Dispatches to the formatter matching the requested export format.
 * @param sheets - Sheets to serialize
 * @param format - Target format
 */
const formatSheets = (sheets: TimeSheet[], format: ExportFormat): string => {
  if (format === 'csv') {
    return formatSheetsAsCsv(sheets)
  }
  if (format === 'md') {
    return formatSheetsAsMd(sheets)
  }
  return formatSheetsAsJson(sheets)
}

export default formatSheets
