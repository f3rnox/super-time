import log from '../log'
import getJustifiedRows from './get_justified_rows'

const DEFAULT_PADDING = 1

/**
 * Logs each input row as a single string with columns right padded to the
 * widest cell per column so that values align vertically across rows.
 */
const printJustifiedContent = (
  rows: string[][],
  padding: number = DEFAULT_PADDING
): void => {
  const lines = getJustifiedRows(rows, padding)

  lines.forEach((line: string): void => {
    log(line)
  })
}

export default printJustifiedContent
