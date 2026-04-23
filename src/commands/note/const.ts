import { HelpOption, setup } from '../../options'

export const CONFIG = {
  aliases: ['n'],
  command: 'note [note..]',
  describe: 'Attach a note to the currently running sheet entry',
  builder: setup.bind(null, [HelpOption])
}
