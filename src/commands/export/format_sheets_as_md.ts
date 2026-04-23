import { type TimeSheet } from '../../types'

/**
 * Escapes pipes and backslashes so a cell value survives the markdown table
 * parser without breaking column alignment.
 * @param value - Raw cell value
 */
const escapeCell = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\n/g, ' ')

/**
 * Serializes sheets as Markdown: one `##` section per sheet with a table of
 * entries. Active entries render an empty `End` column. The `Tags` column is
 * a space-joined list and notes are rendered after each table as bullet items
 * when present.
 * @param sheets - Sheets to serialize
 */
const formatSheetsAsMd = (sheets: TimeSheet[]): string => {
  const sections: string[] = []

  sheets.forEach(({ name: sheetName, entries }) => {
    const lines: string[] = [
      `## ${sheetName}`,
      '',
      '| ID | Description | Start | End | Duration (ms) | Tags |',
      '| --- | --- | --- | --- | --- | --- |'
    ]

    entries.forEach(({ id, description, start, end, tags }) => {
      const durationMs = end === null ? Date.now() - +start : +end - +start

      lines.push(
        [
          String(id),
          escapeCell(description),
          start.toISOString(),
          end === null ? '' : end.toISOString(),
          String(durationMs),
          escapeCell(tags.join(' '))
        ]
          .map((cell) => ` ${cell} `)
          .join('|')
          .replace(/^/, '|')
          .replace(/$/, '|')
      )
    })

    const notesBlocks: string[] = []

    entries.forEach(({ id, notes }) => {
      if (notes.length === 0) {
        return
      }

      notesBlocks.push(`### Notes for entry ${id}`)
      notes.forEach(({ timestamp, text }) => {
        notesBlocks.push(`- ${timestamp.toISOString()} — ${text}`)
      })
    })

    if (notesBlocks.length > 0) {
      lines.push('')
      lines.push(...notesBlocks)
    }

    sections.push(lines.join('\n'))
  })

  return sections.join('\n\n')
}

export default formatSheetsAsMd
