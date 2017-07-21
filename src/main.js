#!/usr/bin/env node
"use strict";
import fs from 'fs';
import program from 'commander';
import {version} from '../package.json';
import runDashboard from './dashboard.js';
import { init, migrate } from './migrations.js';

program
  .version(version)
  .option('-e, --env <path>', 'specify the env file path')

program
  .command('dashboard')
  .description('Open dashboard')
  .option('-e, --env <path>', 'specify the env file path')
  .action(() => runDashboard(program.env));

program
  .command('init-migrations')
  .description('Setup sqitch config for migrations')
  .action(() => init());

program
  .command('migrations <name>')
  .option("-n, --note [note]", "Add sqitch migration note")
  .description('Create a new sqitch migration')
  .action((name, options) => migrate(name, options.note));

program.parse(process.argv);

//If no command specified
if(program.args.length == 0){
  runDashboard(program.env);
}
