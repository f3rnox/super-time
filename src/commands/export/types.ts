import { type Argv } from 'yargs'

import DB from '../../db'

export type ExportFormat = 'csv' | 'json' | 'md'

export interface ExportCommandArgs {
  db: DB
  yargs: Argv
  all?: boolean
  help?: boolean
  since?: string
  filter?: string
  today?: boolean
  format?: ExportFormat
  sheets?: string[]
  allSheets?: boolean
  yesterday?: boolean
}
