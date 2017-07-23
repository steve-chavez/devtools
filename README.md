
# subZero DevTools

This tool is meant to be used with the Docker based starter kits for [PostgREST](https://github.com/subzerocloud/postgrest-starter-kit/) and [subZero](https://github.com/subzerocloud/subzero-starter-kit/).

After installing, executing the command in the root of your project will give you this interface.


![DevTools](/screenshot.png?raw=true "DevTools")


## Features

✓ Convenient interface to view the logs of all stack components<br>
✓ Live code reloading (for SQL/Lua/Nginx configs)<br>
✓ (soon) Database schema migration tools<br>
✓ Community support on [Slack](https://slack.subzero.cloud/)<br>


## Install binaries
Find the [latest release](https://github.com/subzerocloud/devtools/releases/) version.<br />
Download the binary and place it in your `$PATH`<br />
Sample commands for Mac with the release v0.0.2
```bash
  wget https://github.com/subzerocloud/devtools/releases/download/v0.0.2/subzero_devtools-macos-v0.0.2.gz
  gunzip subzero_devtools-macos-v0.0.2.gz
  chmod +x subzero_devtools-macos-v0.0.2
  mv subzero_devtools-macos-v0.0.2 /usr/local/bin/
  ln -s /usr/local/bin/subzero_devtools-macos-v0.0.2 /usr/local/bin/sz
```

## Migrations

Autogenerated migrations are done with a mix of [sqitch](http://sqitch.org/) and [apgdiff](https://github.com/fordfrog/apgdiff).

**Note:** Autogenerating roles is not supported now(must be done manually).

### Setup migrations

First you must have both ```sqitch``` and ```apgdiff``` installed, you can specify paths for both with ```APGDIFF_PATH```, ```SQITCH_PATH``` env vars.
Also you need to set ```PROD_PG_URI```(e.g. ```postgres://user:pass@host:5432/app```) env var this allows us to make a diff of your current 
development database with the production database.

Then to setup migrations you must run:

```bash
  subzero_devtools init-migrations
```

This will create sqitch configuration files(```sqitch.conf, sqitch.plan```) and also two files:

```bash
db/migrations/deploy/initial.sql # Sql script with a dump of the development database
db/migrations/revert/initial.sql # Sql script used to revert the database to an empty state
```

### Deploy migrations

You can now do:

```bash
  subzero_devtools deploy-migrations
```

This would deploy the ```initial.sql``` migration to the production database.

### Adding migrations

If you modify your development database, you can autogenerate a migration for the production database with:

```bash
  subzero_devtools add-migration new_migration # Additionally you can specify a sqitch note with -n or --note
```

This would make a diff of your production database with development database and generate:

```bash
db/migrations/deploy/new_migration.sql # Diff that will get your production database in the new state
db/migrations/revert/new_migration.sql # Diff that will get your production database reverted to the previous state
```

Then to synchronize the production database you would do ```subzero_devtools deploy-migrations``` as before.

## Installing from source

After cloning the repo, run these commands.

```bash
  npm install
  npm run build
  npm link
```

This will create a command available in your PATH called ```subzero_devtools```.

To rebuild and recreate the command do:

```bash
  npm run build && npm unlink subzero_devtools & npm link
```

To create a distributable binary download the module:

```bash
  npm install -g pkg
```

And then do:

```bash
  pkg package.json --out-dir ./bindist
```

## License

Copyright © 2017-present subZero Cloud, LLC.<br />
This source code is licensed under the [GPLv3](https://github.com/subzerocloud/devtools/blob/master/LICENSE.txt)<br />
The documentation to the project is licensed under the [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/) license.
