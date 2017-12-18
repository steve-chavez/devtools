#!/usr/bin/env node
"use strict";

import fs from 'fs';
import program from 'commander';
import inquirer from 'inquirer';
import colors from 'colors';
import {highlight} from 'cli-highlight';
import {
  checkOpenrestyInitiated,
  fileExists,
  notEmptyString,
  checkIsAppDir,
  checkMigrationsInitiated,
  checkPostgresConnection
} from './common.js';

const SUBZERO_APP_FILE = "./subzero-app.json";

const readSubzeroAppConfig = () => {
  if(!fileExists(SUBZERO_APP_FILE)){
    console.log("Error: ".red + `Couldn't find a ${SUBZERO_APP_FILE} file`);
    process.exit(0);
  } else {
    try {
      return JSON.parse(fs.readFileSync(SUBZERO_APP_FILE, 'utf8'));
    } catch(e) {
      console.log("Error: ".red + `Invalid json in ${SUBZERO_APP_FILE}`);
      process.exit(0);
    }
  }
}

const deployApplication = (app_conf, db_admin, db_admin_pass) => {
  let pg_host = app_conf.host,
      pg_port = app_conf.port,
      pg_user = db_admin || app_conf.db_admin,
      pg_pass = db_admin_pass;

  checkPostgresConnection(`postgres://${pg_user}@${pg_host}:${pg_port}/${app_conf.db_name}`, pg_pass);

  console.log("Building and deploying openresty container");
  runCmd("docker", ["build", "-t", "openresty", "./openresty"]);
  runCmd("docker", ["tag", "openresty", `${app_conf.openresty_repo}:${app_conf.version}`]);
  runCmd("docker", ["push", `${app_conf.openresty_repo}:${app_conf.version}`]);

  console.log("Deploying migrations with sqitch");
  migrationsDeploy(pg_user, pg_pass, pg_host, pg_port, app_conf.db_name);
}

program.command('app-deploy')
  .option("-a, --dba [dba]", "Database administrator account")
  .option("-p, --password [password]", "Database administrator account password")
  .description('Deploy a subzero application to ECS')
  .action(options => {
    checkIsAppDir();
    const app_conf = readSubzeroAppConfig(),
          {dba, password} = options,
          noOptionsSpecified = !dba && !password;
    checkOpenrestyInitiated();
    checkMigrationsInitiated();
    if(noOptionsSpecified){
      inquirer.prompt([
        {
          type: 'input',
          name: 'db_admin',
          message: "Enter the database administrator account",
          validate: val => notEmptyString(val)?true:"Cannot be empty"
        },
        {
          type: 'password',
          name: 'db_admin_pass',
          message: 'Enter the database administrator account password',
          mask: '*',
          validate: val => notEmptyString(val)?true:"Cannot be empty"
        }
      ]).then(answers => {
        deployApplication(app_conf, answers.db_admin, answers.db_admin_pass);
      });
    }else{
      if(!notEmptyString(dba))
        console.log("dba: cannot be empty");

      if(!notEmptyString(password))
        console.log("password: cannot be empty");

      if(notEmptyString(dba) && notEmptyString(password))
        deployApplication(app_conf, dba, password);
    }
  });

program.parse(process.argv);
