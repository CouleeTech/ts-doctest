import commander = require('commander')

import { Dedent } from './Cli/cliTools'
import { run, ILogger } from './Cli/cliRunner'

const VERSION = '0.1.0'

interface IArgv {
  doctestConfig?: string
  jestConfig?: string
  help?: boolean
  format?: string
  version?: boolean
}

interface IOption {
  short?: string
  name: keyof IArgv
  type: 'string' | 'boolean' | 'array'
  describe: string // Short, used for usage message
  description: string // Long, used for `--help`
}

const options: IOption[] = [
  {
    short: 'dc',
    name: 'doctestConfig',
    type: 'string',
    describe: 'doctest configuration file',
    description: Dedent`
          The location of the configuration file that doctest will use.`
  },
  {
    short: 'jc',
    name: 'jestConfig',
    type: 'string',
    describe: 'jest configuration file',
    description: Dedent`
          The location of the configuration file that jest will use.`
  },
  {
    short: 't',
    name: 'format',
    type: 'string',
    describe: 'output format (ail, openapi, rst, md)',
    description: Dedent`
          The output format.`
  }
]

const builtinOptions: IOption[] = [
  {
    short: 'v',
    name: 'version',
    type: 'boolean',
    describe: 'current version',
    description: 'The current version of ts-doctest.'
  },
  {
    short: 'h',
    name: 'help',
    type: 'boolean',
    describe: 'display detailed help',
    description: 'Prints this help message.'
  }
]

commander.version(VERSION, '-v, --version')

for (const option of options) {
  const commanderStr = OptionUsageTag(option) + OptionParam(option)
  if (option.type === 'array') {
    commander.option(commanderStr, option.describe, Collect, [])
  } else {
    commander.option(commanderStr, option.describe)
  }
}

commander.on('--help', () => {
  const indent = '\n        '
  const optionDetails = options
    .concat(builtinOptions)
    .map(
      o =>
        `${OptionUsageTag(o)}:${
          o.description.startsWith('\n') ? o.description.replace(/\n/g, indent) : indent + o.description
        }`
    )
  console.log(`ts-doctest accepts the following commandline options:\n\n    ${optionDetails.join('\n\n    ')}\n\n`)
})

const parsed = commander.parseOptions(process.argv.slice(2))
commander.args = parsed.args
if (parsed.unknown.length !== 0) {
  const parseArgs = commander.parseArgs as (args: string[], unknown: string[]) => void
  parseArgs([], parsed.unknown)
}
const argv = (commander.opts() as any) as IArgv

const outputStream: NodeJS.WritableStream = process.stdout
const log = (m: any) => outputStream.write(m)
const error = (m: any) => process.stderr.write(m)

const logger: ILogger = { log, error }

run(
  {
    doctestConfig: argv.doctestConfig,
    jestConfig: argv.jestConfig,
    format: argv.format
  },
  logger
)
  .then((rc: any) => {
    process.exitCode = rc
  })
  .catch((e: any) => {
    console.error(e)
    process.exitCode = 1
  })

function OptionUsageTag({ short, name }: IOption) {
  return short !== undefined ? `-${short}, --${name}` : `--${name}`
}

function OptionParam(option: IOption) {
  switch (option.type) {
    case 'string':
      return ` [${option.name}]`
    case 'array':
      return ` <${option.name}>`
    case 'boolean':
      return ''
  }
}

function Collect(val: string, memo: string[]) {
  memo.push(val)
  return memo
}
