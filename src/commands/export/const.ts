import {
  setup,
  AllOption,
  HelpOption,
  SinceOption,
  TodayOption,
  FilterOption,
  FormatOption,
  SheetsOption,
  YesterdayOption,
  AllSheetsOption
} from '../../options'

export const CONFIG = {
  aliases: ['x'],
  command: 'export [sheets..]',
  describe: 'Export time sheet entries as CSV, JSON, or Markdown',
  builder: setup.bind(null, [
    SheetsOption,
    FormatOption,
    SinceOption,
    TodayOption,
    AllSheetsOption,
    AllOption,
    YesterdayOption,
    FilterOption,
    HelpOption
  ])
}
