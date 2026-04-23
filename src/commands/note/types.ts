import { type Argv } from 'yargs'

import DB from '../../db'

export interface NoteCommandArgs {
  db: DB
  yargs: Argv
  help?: boolean
  note: string[]
}
