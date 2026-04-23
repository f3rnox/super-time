# super-time -- A CLI Time Tracker

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]
![CI GitHub Workflow Status](https://github.com/f3rnox/super-time/actions/workflows/ci.yml/badge.svg)

[**super-time**](https://npmjs.com/package/super-time) is a Node.JS CLI
utility for tracking tasks in time sheets, inspired by ruby's
[**timetrap**](https://github.com/samg/timetrap) (sadly not maintained).

It supports natural language specification of entry start and end times,
allowing you to check out of entries retroactively, or check in after already
starting a task without leaving any time untracked. The database is a JSON file
stored in your home folder, at `~/.super-time/db.json`.

## Example Usage

Below are a few example commands to illustrate the usual workflow for managing
and viewing time sheet entries.

```bash
tt sheet work
tt in --at '2 hours and 24 minutes ago' crafting something
tt out
tt list --since '4 hours ago'
tt today
tt week
```

## Installation

**super-time** is available as an [**NPM**](https://npmjs.com/package/super-time)
package; install it with your package manager of choice. For example, if you
use npm, run `npm i -g super-time`.

Once installed, it will be available as the **tt** command.

## Commands

**super-time** provides commands for both managing time sheet entries, and
viewing historical activity in a variety of ways. To see a full list, run
**`tt --help`**.

### Managing Time Sheets and Entries

The examples listed below use the shorthand command aliases (i.e. **`e`** is
the alias for the **`edit`** command). To view all command aliases, consult
**`tt --help`**.

- **`tt ss`** -- view a list of all time sheets.
- **`tt s <sheet name>`** -- switch to a sheet by name. It will be automatically
created if it does not already exist.

- **`tt i <description>`** -- start a new entry with the given description.
- **`tt i --at '<natural language time>'`** -- start a new entry at a custom
time.

- **`tt o --at '<natural language time>'`** -- check out of the current entry at
a specified time.

- **`tt e <description>`** -- edit the active entry's description.
- **`tt e --entry 32 --delete`** -- delete an entry by ID (retrieve the ID
with **`tt list`**).

- **`tt e --sheet <sheet name> --name <new sheet name>`** -- change the name
of a time sheet

- **`tt r`** -- starts (resumes) an entry with the same description as the
previous one.

### View Historical Activity

Several commands are available to consult the database, either per-sheet or for
all sheets together.

- **`tt l`** -- list sheet entries for the previous 24 hours; provide
`--all-sheets` to view entries for all sheets at once.
Passing `--since <natural language time>` will set the start date from which to
list entries, while passing `--all` will list sheets from the start of time.
This command has many arguments, for a full list see **`tt l --help`**.
- **`tt w`** -- view a breakdown of activity for the past week.
- **`tt t`** -- view a list of entries from today.
- **`tt y`** -- view a list of entries from yesterday.
- **`tt b`** -- view a breakdown of activity by day, weekday and hour.

### Useful Flags

Nearly all commands allow durations to be displayed in a human-readable format
with the **`-h`** flag (for example, rendering *1:36:18* as
*1 hour, 36 minutes*), and dates and times to be shown as relative to the
current time with the **`-r`** flag (converting *2/5/2024, 5:49:44 PM* to
*3 hours ago*).

## Help Reference

For reference, the full output of **`tt --help`** is reproduced below:

```text
super-time now

Display all active time sheet entries

Commands:
  super-time in <description..>    Check in to a time sheet     [aliases: i]
  super-time now                   Display all active time sheet entries
                                                                       [default]
  super-time out                   Check out of the active time sheet entry
                                                                    [aliases: o]
  super-time week [sheets..]       Display a summary of activity for the
                                       past week                    [aliases: w]
  super-time list [sheets..]       List all time sheet entries  [aliases: l]
  super-time edit [description..]  View, edit, or delete a time sheet entry
                                                                    [aliases: e]
  super-time today [sheets..]      Display a summary of activity for today
                                                                    [aliases: t]
  super-time sheet [name]          Switch to or delete a sheet by name
                                                                    [aliases: s]
  super-time sheets                List all sheets             [aliases: ss]
  super-time resume                Start a new entry with the same
                                       description as the previous one
                                                                    [aliases: r]
  super-time yesterday [sheets..]  Display a summary of activity for
                                       yesterday                    [aliases: y]
  super-time breakdown [sheets..]  Display total durations per day for one
                                       or more sheets               [aliases: b]

Options:
      --version   Show version number                                  [boolean]
  -h, --humanize  Print the total duration in human-readable format    [boolean]
      --help      Show help                                            [boolean]

Examples:
  tt in --at "20 minutes ago" fixing a bug  Check in at a custom time
  tt out --at "5 minutes ago"               Check out at a custom time
  tt list --today --all                     View all entries from today
  tt b                                      Show a breakdown of your activity
  tt today --all                            View activity for the current day
```

## Release History

See [*CHANGELOG.md*](/CHANGELOG.md) for more information.

## License

Distributed under the **MIT** license. See [*LICENSE.md*](/LICENSE.md)
for more information.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

[npm-image]: https://img.shields.io/npm/v/super-time.svg?style=flat-square
[npm-url]: https://npmjs.org/package/super-time
[npm-downloads]: https://img.shields.io/npm/dm/super-time.svg?style=flat-square
