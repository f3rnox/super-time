import handler from './handler'
import { CONFIG } from './const'
import { type NoteCommandArgs } from './types'

export { type NoteCommandArgs, handler }
export default {
  ...CONFIG,
  handler
}
