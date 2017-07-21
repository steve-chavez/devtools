"use strict";
import proc from 'child_process';
import {config} from 'dotenv';
import fs from 'fs';

config();

const DEV_DB_NAME = process.env.DB_NAME;
const DEV_SUPER_USER = process.env.SUPER_USER;

const PROD_PG_URI = process.env.PROD_PG_URI;

const COMPOSE_PROJECT_NAME = process.env.COMPOSE_PROJECT_NAME;
const MIGRATIONS_DIR = "./db/migrations";

const init = () => {
  const INITIAL_FILE_NAME = "initial";
  initSqitch();
  migrateSqitch(INITIAL_FILE_NAME);
  devPgDumpToFile(`${MIGRATIONS_DIR}/deploy/${INITIAL_FILE_NAME}.sql`);
  apgdiffToFile(`${MIGRATIONS_DIR}/deploy/${INITIAL_FILE_NAME}.sql`,
                `${MIGRATIONS_DIR}/revert/${INITIAL_FILE_NAME}.sql`,
                `${MIGRATIONS_DIR}/revert/${INITIAL_FILE_NAME}.sql`);
};

const migrate = name => {

  const TMP_DIR = `${MIGRATIONS_DIR}/tmp`;

  const createTmpDir = () => {
    if (!fs.existsSync(TMP_DIR))
      fs.mkdirSync(TMP_DIR);
  };

  const removeTmpDir = () => {
    fs.unlinkSync(`${MIGRATIONS_DIR}/tmp/dev-${name}.sql`);
    fs.unlinkSync(`${MIGRATIONS_DIR}/tmp/prod-${name}.sql`);
    fs.rmdirSync(TMP_DIR);
  };

  const sqitchConfMustExist = () => {
    const CONF = "sqitch.conf";
    if (!fs.existsSync(CONF) || !fs.statSync(CONF).isFile()){
      console.log("\x1b[31mError:\x1b[0m the file '%s' does not exist", CONF);
      process.exit(0);
    }
  }

  sqitchConfMustExist();

  createTmpDir();
  devPgDumpToFile(`${TMP_DIR}/dev-${name}.sql`);
  prodPgDumpToFile(`${TMP_DIR}/prod-${name}.sql`);

  migrateSqitch(name);

  apgdiffToFile(`${TMP_DIR}/dev-${name}.sql`,
                `${TMP_DIR}/prod-${name}.sql`,
                `${MIGRATIONS_DIR}/deploy/${name}.sql`);

  apgdiffToFile(`${TMP_DIR}/prod-${name}.sql`,
                `${TMP_DIR}/dev-${name}.sql`,
                `${MIGRATIONS_DIR}/revert/${name}.sql`);

  removeTmpDir();
};

const initSqitch = () => {
  let p = proc.spawnSync('sqitch',["init", DEV_DB_NAME, "--engine", "pg", "--top-dir", MIGRATIONS_DIR]);
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

const devPgDumpToFile = file => {
  let p = proc.spawnSync('docker', ['exec', `${COMPOSE_PROJECT_NAME}_db_1`, 'pg_dump', DEV_DB_NAME, '-U', DEV_SUPER_USER]);
  if(p.stdout)
    fs.writeFileSync(file, p.stdout.toString());
  if(p.stderr)
    console.log(p.stderr.toString());
};

const prodPgDumpToFile = file => {
  console.log("Getting dump from production database...");
  let p = proc.spawnSync('pg_dump', [PROD_PG_URI]);
  if(p.stdout){
    fs.writeFileSync(file, p.stdout.toString());
    console.log("Done.");
  }
  if(p.stderr)
    console.log(p.stderr.toString());
};

const apgdiffToFile = (file1, file2, destFile) => {
  let p = proc.spawnSync('apgdiff', [file1, file2]);
  if(p.stdout)
    fs.writeFileSync(destFile, p.stdout.toString());
  if(p.stderr)
    console.log(p.stderr.toString());
};

export { init, migrate };
