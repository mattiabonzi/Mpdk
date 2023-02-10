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
* [`mpdk dns disable`](#mpdk-dns-disable)
* [`mpdk dns enable`](#mpdk-dns-enable)
* [`mpdk download-moodle [PATH]`](#mpdk-download-moodle-path)
* [`mpdk help [COMMANDS]`](#mpdk-help-commands)
* [`mpdk install [OPTION]`](#mpdk-install-option)
* [`mpdk instance down`](#mpdk-instance-down)
* [`mpdk instance exec COMMAND`](#mpdk-instance-exec-command)
* [`mpdk instance info`](#mpdk-instance-info)
* [`mpdk instance init`](#mpdk-instance-init)
* [`mpdk instance list`](#mpdk-instance-list)
* [`mpdk instance moosh COMMAND`](#mpdk-instance-moosh-command)
* [`mpdk instance new NAME [OPTION]`](#mpdk-instance-new-name-option)
* [`mpdk instance remove`](#mpdk-instance-remove)
* [`mpdk instance reset`](#mpdk-instance-reset)
* [`mpdk instance start`](#mpdk-instance-start)
* [`mpdk instance stop`](#mpdk-instance-stop)
* [`mpdk ls`](#mpdk-ls)
* [`mpdk new NAME [OPTION]`](#mpdk-new-name-option)
* [`mpdk plugin add NAME [OPTIONS]`](#mpdk-plugin-add-name-options)
* [`mpdk plugin install INSTANCES`](#mpdk-plugin-install-instances)
* [`mpdk plugin new [OPTION]`](#mpdk-plugin-new-option)
* [`mpdk plugin uninstall INSTANCES`](#mpdk-plugin-uninstall-instances)
* [`mpdk proxy disable`](#mpdk-proxy-disable)
* [`mpdk proxy enable`](#mpdk-proxy-enable)
* [`mpdk ps`](#mpdk-ps)
* [`mpdk start`](#mpdk-start)
* [`mpdk stop`](#mpdk-stop)
* [`mpdk update-cache`](#mpdk-update-cache)

## `mpdk dns disable`

Stop an instance (data will NOT be destroyed)

```
USAGE
  $ mpdk dns disable [--non-interactive]

FLAGS
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Stop an instance (data will NOT be destroyed)

EXAMPLES
  $ mpdk dns disable
```

## `mpdk dns enable`

Stop an instance (data will NOT be destroyed)

```
USAGE
  $ mpdk dns enable [--non-interactive]

FLAGS
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Stop an instance (data will NOT be destroyed)

EXAMPLES
  $ mpdk dns enable
```

## `mpdk download-moodle [PATH]`

Download Moodle specified or latest version

```
USAGE
  $ mpdk download-moodle [PATH] [--non-interactive] [-v <value>] [-u] [--no-cache]

ARGUMENTS
  PATH  path where to download moodle (a directory moodle-{version} will be cerated inside)

FLAGS
  -u, --url              Return url instead of download
  -v, --version=<value>  Version to download
  --no-cache             Do not use cache
  --non-interactive      Use non-interative mode, output in json format

DESCRIPTION
  Download Moodle specified or latest version

ALIASES
  $ mpdk download-moodle

EXAMPLES
  $ mpdk download-moodle
```

_See code: [dist/commands/download-moodle.ts](https://github.com/mattiabonzi/mpdk2/blob/v0.0.0/dist/commands/download-moodle.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.4/src/commands/help.ts)_

## `mpdk install [OPTION]`

describe the command here

```
USAGE
  $ mpdk install [OPTION] [--non-interactive] [-v <value>]

ARGUMENTS
  OPTION  Default options in JSON format (required if non-interactive)

FLAGS
  -v, --version=<value>  Moodle version to install, use form x.x.x or x.x or x
  --non-interactive      Use non-interative mode, output in json format

DESCRIPTION
  describe the command here

EXAMPLES
  $ mpdk install
```

_See code: [dist/commands/install.ts](https://github.com/mattiabonzi/mpdk2/blob/v0.0.0/dist/commands/install.ts)_

## `mpdk instance down`

Stop an instance (data will be destroyed!)

```
USAGE
  $ mpdk instance down [--non-interactive] [-f] [-a] [-i <value>]

FLAGS
  -a, --all               Stop all running instances
  -f, --force             Do not ask confirmation
  -i, --instance=<value>  Provide a path to an instance to use
  --non-interactive       Use non-interative mode, output in json format

DESCRIPTION
  Stop an instance (data will be destroyed!)

EXAMPLES
  $ mpdk instance down
```

## `mpdk instance exec COMMAND`

Execute a command inside the instance container, CWD is defualt to /var/www/html

```
USAGE
  $ mpdk instance exec [COMMAND] [--non-interactive] [-d <value>]

ARGUMENTS
  COMMAND  Command to run, will be quoted with "'" (single quote)

FLAGS
  -d, --cwd=<value>  Set CWD (Current Working Directory)
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Execute a command inside the instance container, CWD is defualt to /var/www/html

EXAMPLES
  $ mpdk instance exec
```

## `mpdk instance info`

Print info about an instance

```
USAGE
  $ mpdk instance info [--non-interactive]

FLAGS
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Print info about an instance

EXAMPLES
  $ mpdk instance info
```

## `mpdk instance init`

Init an instance as specified (as no effect if already initialized per type)

```
USAGE
  $ mpdk instance init [--non-interactive] [-d] [-u] [-b] [-i <value>]

FLAGS
  -b, --behat             Start in Behat test mode (can be combined with --dev --phpunit)
  -d, --dev               Start in dev mode (can be combined with --behat and --phpunit)
  -i, --instance=<value>  Provide a path to an instance to use
  -u, --phpunit           Start in PhpUnit test mode (can be combined with --dev and --behat)
  --non-interactive       Use non-interative mode, output in json format

DESCRIPTION
  Init an instance as specified (as no effect if already initialized per type)

EXAMPLES
  $ mpdk instance init
```

## `mpdk instance list`

Show a list of instances and their status

```
USAGE
  $ mpdk instance list [--non-interactive] [--sort <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv
    | --no-truncate]] [--no-header | ]

FLAGS
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --non-interactive  Use non-interative mode, output in json format
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)

DESCRIPTION
  Show a list of instances and their status

ALIASES
  $ mpdk ls
  $ mpdk ps

EXAMPLES
  $ mpdk instance list
```

## `mpdk instance moosh COMMAND`

Execute Moosh inside the instance container (see https://moosh-online.com/)

```
USAGE
  $ mpdk instance moosh [COMMAND] [--non-interactive]

ARGUMENTS
  COMMAND  Moosh command to run, will be quoted with "'" (single quote)

FLAGS
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Execute Moosh inside the instance container (see https://moosh-online.com/)

EXAMPLES
  $ mpdk instance moosh
```

## `mpdk instance new NAME [OPTION]`

Create a new instance

```
USAGE
  $ mpdk instance new [NAME] [OPTION] [--non-interactive] [-v <value>]

ARGUMENTS
  NAME    Name of the new instance
  OPTION  Default options in JSON format (required if non-interactive)

FLAGS
  -v, --version=<value>  Moodle version to install, use form x.x.x or x.x or x
  --non-interactive      Use non-interative mode, output in json format

DESCRIPTION
  Create a new instance

ALIASES
  $ mpdk new

EXAMPLES
  $ mpdk instance new
```

## `mpdk instance remove`

Stop an instance (data will be destroyed!)

```
USAGE
  $ mpdk instance remove [--non-interactive] [-f] [-a] [-i <value>]

FLAGS
  -a, --all               Stop all running instances
  -f, --force             Do not ask confirmation
  -i, --instance=<value>  Provide a path to an instance to use
  --non-interactive       Use non-interative mode, output in json format

DESCRIPTION
  Stop an instance (data will be destroyed!)

EXAMPLES
  $ mpdk instance remove
```

## `mpdk instance reset`

Reset an instance (data will be destroyed!))

```
USAGE
  $ mpdk instance reset [--non-interactive] [-f]

FLAGS
  -f, --force        Do not ask confirmation
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Reset an instance (data will be destroyed!))

EXAMPLES
  $ mpdk instance reset
```

## `mpdk instance start`

Start an instance

```
USAGE
  $ mpdk instance start [--non-interactive] [-d] [-u] [-b] [-i <value>]

FLAGS
  -b, --behat             Start in Behat test mode (can be combined with --dev --phpunit)
  -d, --dev               Start in dev mode (can be combined with --behat and --phpunit)
  -i, --instance=<value>  Provide a path to an instance to use
  -u, --phpunit           Start in PhpUnit test mode (can be combined with --dev and --behat)
  --non-interactive       Use non-interative mode, output in json format

DESCRIPTION
  Start an instance

ALIASES
  $ mpdk start

EXAMPLES
  $ mpdk instance start
```

## `mpdk instance stop`

Stop an instance (data will NOT be destroyed)

```
USAGE
  $ mpdk instance stop [--non-interactive] [-a] [-i <value>]

FLAGS
  -a, --all               Stop all running instances
  -i, --instance=<value>  Provide a path to an instance to use
  --non-interactive       Use non-interative mode, output in json format

DESCRIPTION
  Stop an instance (data will NOT be destroyed)

ALIASES
  $ mpdk stop

EXAMPLES
  $ mpdk instance stop
```

## `mpdk ls`

Show a list of instances and their status

```
USAGE
  $ mpdk ls [--non-interactive] [--sort <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv
    | --no-truncate]] [--no-header | ]

FLAGS
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --non-interactive  Use non-interative mode, output in json format
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)

DESCRIPTION
  Show a list of instances and their status

ALIASES
  $ mpdk ls
  $ mpdk ps

EXAMPLES
  $ mpdk ls
```

## `mpdk new NAME [OPTION]`

Create a new instance

```
USAGE
  $ mpdk new [NAME] [OPTION] [--non-interactive] [-v <value>]

ARGUMENTS
  NAME    Name of the new instance
  OPTION  Default options in JSON format (required if non-interactive)

FLAGS
  -v, --version=<value>  Moodle version to install, use form x.x.x or x.x or x
  --non-interactive      Use non-interative mode, output in json format

DESCRIPTION
  Create a new instance

ALIASES
  $ mpdk new

EXAMPLES
  $ mpdk new
```

## `mpdk plugin add NAME [OPTIONS]`

Add an exist plugin to mpdk

```
USAGE
  $ mpdk plugin add [NAME] [OPTIONS] [--non-interactive]

ARGUMENTS
  NAME     Name of the plugin to add (component name {type}_{shortname})
  OPTIONS  Non interactive json options

FLAGS
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Add an exist plugin to mpdk

EXAMPLES
  $ mpdk plugin add
```

## `mpdk plugin install INSTANCES`

install a plugin on an instance

```
USAGE
  $ mpdk plugin install [INSTANCES] [--non-interactive] [-a]

ARGUMENTS
  INSTANCES  Comma or space separate list of isntance

FLAGS
  -a, --all          Install the plugin on all running instances
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  install a plugin on an instance

EXAMPLES
  $ mpdk plugin install
```

## `mpdk plugin new [OPTION]`

Create a new plugin (from scratch))

```
USAGE
  $ mpdk plugin new [OPTION] [--non-interactive] [-m]

ARGUMENTS
  OPTION  Default options in JSON format (required if non-interactive)

FLAGS
  -m, --manual       Write the recipe file, and stop the process (so you can edit it manually)
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Create a new plugin (from scratch))

EXAMPLES
  $ mpdk plugin new
```

## `mpdk plugin uninstall INSTANCES`

Uninstall a plugin on an instance

```
USAGE
  $ mpdk plugin uninstall [INSTANCES] [--non-interactive] [-a]

ARGUMENTS
  INSTANCES  Comma or space separate list of isntance

FLAGS
  -a, --all          Uninstall the plugin on all running instances
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Uninstall a plugin on an instance

EXAMPLES
  $ mpdk plugin uninstall
```

## `mpdk proxy disable`

Stop an instance (data will NOT be destroyed)

```
USAGE
  $ mpdk proxy disable [--non-interactive]

FLAGS
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Stop an instance (data will NOT be destroyed)

EXAMPLES
  $ mpdk proxy disable
```

## `mpdk proxy enable`

Stop an instance (data will NOT be destroyed)

```
USAGE
  $ mpdk proxy enable [--non-interactive]

FLAGS
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Stop an instance (data will NOT be destroyed)

EXAMPLES
  $ mpdk proxy enable
```

## `mpdk ps`

Show a list of instances and their status

```
USAGE
  $ mpdk ps [--non-interactive] [--sort <value>] [--filter <value>] [--output csv|json|yaml |  | [--csv
    | --no-truncate]] [--no-header | ]

FLAGS
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --non-interactive  Use non-interative mode, output in json format
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)

DESCRIPTION
  Show a list of instances and their status

ALIASES
  $ mpdk ls
  $ mpdk ps

EXAMPLES
  $ mpdk ps
```

## `mpdk start`

Start an instance

```
USAGE
  $ mpdk start [--non-interactive] [-d] [-u] [-b] [-i <value>]

FLAGS
  -b, --behat             Start in Behat test mode (can be combined with --dev --phpunit)
  -d, --dev               Start in dev mode (can be combined with --behat and --phpunit)
  -i, --instance=<value>  Provide a path to an instance to use
  -u, --phpunit           Start in PhpUnit test mode (can be combined with --dev and --behat)
  --non-interactive       Use non-interative mode, output in json format

DESCRIPTION
  Start an instance

ALIASES
  $ mpdk start

EXAMPLES
  $ mpdk start
```

## `mpdk stop`

Stop an instance (data will NOT be destroyed)

```
USAGE
  $ mpdk stop [--non-interactive] [-a] [-i <value>]

FLAGS
  -a, --all               Stop all running instances
  -i, --instance=<value>  Provide a path to an instance to use
  --non-interactive       Use non-interative mode, output in json format

DESCRIPTION
  Stop an instance (data will NOT be destroyed)

ALIASES
  $ mpdk stop

EXAMPLES
  $ mpdk stop
```

## `mpdk update-cache`

Force update moodle and plugins cached version list

```
USAGE
  $ mpdk update-cache [--non-interactive]

FLAGS
  --non-interactive  Use non-interative mode, output in json format

DESCRIPTION
  Force update moodle and plugins cached version list

ALIASES
  $ mpdk update-cache

EXAMPLES
  $ mpdk update-cache
```

_See code: [dist/commands/update-cache.ts](https://github.com/mattiabonzi/mpdk2/blob/v0.0.0/dist/commands/update-cache.ts)_
<!-- commandsstop -->
