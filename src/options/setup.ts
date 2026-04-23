import PI from 'p-iteration'
import { type Argv } from 'yargs'
import _isFunction from 'lodash/isFunction'

import DB from '../db'
import {
  type YArgsOptionDefinition,
  type YArgsDynamicOptionDefinition
} from '../types'

const setupOptions = async (
  options: (YArgsDynamicOptionDefinition | YArgsOptionDefinition)[],
  yargs: Argv
): Promise<void> => {
  await PI.forEach(
    options,
    async (option: YArgsDynamicOptionDefinition | YArgsOptionDefinition) => {
      if (_isFunction(option)) {
        const db = new DB()
        await db.load()
        const finalOption = await option({
          db
        })

        yargs.option(...(finalOption as YArgsOptionDefinition))
      } else {
        yargs.option(...option)
      }
    }
  )
}

export default setupOptions
