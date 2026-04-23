import { type YArgsOptionDefinition } from '../types'

const FORMAT_OPTION: YArgsOptionDefinition = [
  'format',
  {
    alias: ['F'],
    choices: ['csv', 'json', 'md'],
    default: 'json',
    describe: 'Output format for the exported data',
    type: 'string'
  }
]

export default FORMAT_OPTION
