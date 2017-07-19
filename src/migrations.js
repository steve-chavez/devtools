"use strict"; 
import proc from 'child_process';
import {config} from 'dotenv';

config();

const DB_NAME = process.env.DB_NAME;

const initMigrations = () => {
  let p = proc.spawn('sqitch',["init", DB_NAME, "--engine", "pg", "--top-dir", "./db/migrations"]);
  p.stdout.on('data', data => console.log(data.toString()));
  p.stderr.on('data', data => console.log(data.toString()));
};

const migrate = name => {
  let p = proc.spawn('sqitch',["add", name, "-n", "Add migration"]);
  p.stdout.on('data', data => console.log(data.toString()));
  p.stderr.on('data', data => console.log(data.toString()));
};

export { initMigrations, migrate };
