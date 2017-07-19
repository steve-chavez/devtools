#!/usr/bin/env node
"use strict";
import fs from 'fs';
import program from 'commander';
import {version} from '../package.json';
import runDashboard from './dashboard.js';
import { initMigrations, migrate } from './migrations.js';

program
  .version(version)
  .option('-e, --env <path>', 'specify the env file path')

program
  .command('dashboard')
  .description('Open dashboard')
  .option('-e, --env <path>', 'specify the env file path')
  .action(() => runDashboard(program.env));

program
  .command('migrations')
  .description('Run migrations')
  .action(() => initMigrations());

program
  .command('migrate <name>')
  .description('Migrate')
  .action(name => migrate(name));

program.parse(process.argv);

//If no command specified
if(program.args.length == 0){
  runDashboard(program.env);
}
