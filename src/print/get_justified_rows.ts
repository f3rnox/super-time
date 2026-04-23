import stripANSI from 'strip-ansi'

type ColumnWidths = Record<number, number>

const DEFAULT_PADDING = 1

/**
 * Returns each input row formatted into a single string with columns right
 * padded to the widest cell per column so that values align vertically across
 * rows.
 */
const getJustifiedRows = (
  rows: string[][],
  padding: number = DEFAULT_PADDING
): string[] => {
  const columnWidths: ColumnWidths = {}

  rows.forEach((columns: string[]): void => {
    columns.forEach((value: string, i: number): void => {
      const currentWidth = columnWidths[i] ?? padding

      columnWidths[i] = Math.max(
        currentWidth,
        stripANSI(value).length + padding
      )
    })
  })

  return rows.map((columns: string[]): string =>
    columns
      .map((value: string, i: number): string => {
        const width = columnWidths[i]
        const valueWidth = stripANSI(value).length
        const charsToPad = Math.max(0, width - valueWidth)

        let result = value

        for (let j = 0; j < charsToPad; j += 1) {
          result += ' '
        }

        return result
      })
      .join(' ')
  )
}

export default getJustifiedRows
