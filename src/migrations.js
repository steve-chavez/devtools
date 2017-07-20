"use strict"; 
import proc from 'child_process';
import {config} from 'dotenv';
import fs from 'fs';

config();

const DB_NAME = process.env.DB_NAME;
const SUPER_USER = process.env.SUPER_USER;
const COMPOSE_PROJECT_NAME = process.env.COMPOSE_PROJECT_NAME;
const MIGRATIONS_DIR = "./db/migrations";

const init = () => {
  const INITIAL_FILE_NAME = "initial";
  initSqitch();
  migrateSqitch(INITIAL_FILE_NAME);
  pgDumpToFile(`${MIGRATIONS_DIR}/deploy/${INITIAL_FILE_NAME}.sql`);
  apgdiffToFile(`${MIGRATIONS_DIR}/deploy/${INITIAL_FILE_NAME}.sql`, 
                `${MIGRATIONS_DIR}/revert/${INITIAL_FILE_NAME}.sql`, 
                `${MIGRATIONS_DIR}/revert/${INITIAL_FILE_NAME}.sql`);
};

const migrate = name => {
  migrateSqitch(name);
  //Temporarily write to deploy file for apgdiff diffing
  pgDumpToFile(`${MIGRATIONS_DIR}/deploy/${name}.sql`);
  //Need to obtain PREVIOUS_MIGRATION_FILE_NAME
  const PREVIOUS_MIGRATION_FILE_NAME = "initial";
  apgdiffToFile(`${MIGRATIONS_DIR}/deploy/${PREVIOUS_MIGRATION_FILE_NAME}.sql`, 
                `${MIGRATIONS_DIR}/deploy/${name}.sql`, 
                `${MIGRATIONS_DIR}/deploy/${name}.sql`);
};

const initSqitch = () => {
  let p = proc.spawnSync('sqitch',["init", DB_NAME, "--engine", "pg", "--top-dir", MIGRATIONS_DIR]);
  if(p.stdout)
    console.log(p.stdout.toString());
  if(p.stderr)
    console.log(p.stderr.toString());
};

const migrateSqitch = name => {
  let p = proc.spawnSync('sqitch',["add", name, "-n", "Add migration"]);
  if(p.stdout)
    console.log(p.stdout.toString());
  if(p.stderr)
    console.log(p.stderr.toString());
};

const pgDumpToFile = file => {
  let p = proc.spawnSync('docker', ['exec', `${COMPOSE_PROJECT_NAME}_db_1`, 'pg_dump', DB_NAME, '-U', SUPER_USER]);
  if(p.stdout)
    fs.writeFileSync(file, p.stdout.toString());
  if(p.stderr)
    console.log(p.stderr.toString());
};

const apgdiffToFile = (file1, file2, destFile) => {
  let p = proc.spawnSync('apgdiff', [file1, file2]);
  if(p.stdout)
    fs.writeFileSync(destFile, p.stdout.toString());
  if(p.stderr)
    console.log(p.stderr.toString());
}

export { init, migrate };
