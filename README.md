oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g mpdk2
$ mpdk COMMAND
running command...
$ mpdk (--version)
mpdk2/0.0.0 darwin-arm64 node-v19.3.0
$ mpdk --help [COMMAND]
USAGE
  $ mpdk COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
- [oclif-hello-world](#oclif-hello-world)
- [Usage](#usage)
- [Commands](#commands)
  - [`mpdk help [COMMANDS]`](#mpdk-help-commands)
  - [`mpdk install [OPTION]`](#mpdk-install-option)
  - [`mpdk instance new NAME [OPTION]`](#mpdk-instance-new-name-option)
  - [`mpdk instance start`](#mpdk-instance-start)

## `mpdk help [COMMANDS]`

Display help for mpdk.

```
USAGE
  $ mpdk help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for mpdk.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.2/src/commands/help.ts)_

## `mpdk install [OPTION]`

describe the command here

```
USAGE
  $ mpdk install [OPTION] [--non-interactive] [-i <value>] [-v <value>]

ARGUMENTS
  OPTION  Default options in JSON format (required if non-interactive)

FLAGS
  -i, --instance=<value>  Provide a path to an instance to use
  -v, --version=<value>   Moodle version to install, use form x.x.x or x.x or x
  --non-interactive       Use non-interative mode

DESCRIPTION
  describe the command here

EXAMPLES
  $ mpdk install
```

_See code: [dist/commands/install.ts](https://github.com/mattiabonzi/mpdk2/blob/v0.0.0/dist/commands/install.ts)_

## `mpdk instance new NAME [OPTION]`

describe the command here

```
USAGE
  $ mpdk instance new [NAME] [OPTION] [--non-interactive] [-i <value>] [-v <value>]

ARGUMENTS
  NAME    Name of the new instance
  OPTION  Default options in JSON format (required if non-interactive)

FLAGS
  -i, --instance=<value>  Provide a path to an instance to use
  -v, --version=<value>   Moodle version to install, use form x.x.x or x.x or x
  --non-interactive       Use non-interative mode

DESCRIPTION
  describe the command here

EXAMPLES
  $ mpdk instance new
```

## `mpdk instance start`

describe the command here

```
USAGE
  $ mpdk instance start [--non-interactive] [-i <value>] [-d] [-t]

FLAGS
  -d, --dev               Moodle version to install, use form x.x.x or x.x or x
  -i, --instance=<value>  Provide a path to an instance to use
  -t, --test              Moodle version to install, use form x.x.x or x.x or x
  --non-interactive       Use non-interative mode

DESCRIPTION
  describe the command here

EXAMPLES
  $ mpdk instance start
```
<!-- commandsstop -->


