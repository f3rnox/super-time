import { type TimeSheet } from '../types'

export interface AddActiveSheetEntryArgs {
  sheet: TimeSheet | string
  input?: string
  description?: string
  startDate?: Date
  tags?: string[]
}
